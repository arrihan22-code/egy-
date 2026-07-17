import { PrismaClient } from '@prisma/client';
import { SourceResolver } from '../source-resolver';
import { Validator } from '../pipeline/validator';
import { Normalizer } from '../pipeline/normalizer';
import { Deduplicator } from '../pipeline/deduplicator';
import { Differ } from '../pipeline/differ';
import { PrismaCurrentStore } from '../storage/prisma-current-store';
import { PrismaVersionStore } from '../storage/prisma-version-store';
import { PrismaAuditStore } from '../storage/prisma-audit-store';
import { DataSource, NormalizedRecord, DiffResult, SyncResult } from '@egypt/shared-types';
import { z } from 'zod';

export interface SyncConfig {
  domain: string;
  tableName: string;
  idField: string;
  matchFields: string[];
  trackedFields: string[];
  externalIdField?: string;
}

export abstract class BaseSyncService<T extends Record<string, unknown>> {
  protected prisma: PrismaClient;
  protected sourceResolver: SourceResolver;
  protected validator: Validator;
  protected normalizer: Normalizer;
  protected deduplicator: Deduplicator;
  protected differ: Differ;
  protected currentStore: PrismaCurrentStore;
  protected versionStore: PrismaVersionStore;
  protected auditStore: PrismaAuditStore;

  abstract readonly syncConfig: SyncConfig;
  abstract readonly schema: z.ZodSchema;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.sourceResolver = new SourceResolver();
    this.validator = new Validator();
    this.normalizer = new Normalizer();
    this.deduplicator = new Deduplicator();
    this.differ = new Differ();
    this.currentStore = new PrismaCurrentStore(prisma);
    this.versionStore = new PrismaVersionStore(prisma);
    this.auditStore = new PrismaAuditStore(prisma);
  }

  registerSources(sources: DataSource[]): void {
    this.sourceResolver.registerSources(sources);
  }

  init(): void {
    this.validator.registerSchema(this.syncConfig.domain, this.schema);
    this.deduplicator.registerConfig(this.syncConfig.domain, {
      matchFields: this.syncConfig.matchFields,
      externalIdField: this.syncConfig.externalIdField,
    });
    this.currentStore.registerConfig(this.syncConfig.domain, {
      tableName: this.syncConfig.tableName,
      idField: this.syncConfig.idField,
      uniqueFields: this.syncConfig.matchFields,
    });
  }

  async executeSync(triggeredBy: string = 'scheduled'): Promise<SyncResult> {
    const startTime = Date.now();
    const domain = this.syncConfig.domain;
    const importLogId = crypto.randomUUID();

    try {
      const importLog = await this.createImportLog(domain, '', '', 0, triggeredBy, importLogId);

      let source: DataSource;
      try {
        source = await this.sourceResolver.resolveBestSource(domain);
      } catch {
        return await this.completeImportLog(importLogId, domain, {
          status: 'failed', errorMessage: 'No available sources', durationMs: Date.now() - startTime,
        }, 0, 0, 0, 0, startTime);
      }

      await this.updateImportLog(importLogId, { sourceUrl: source.sourceUrl, sourceName: source.sourceName });

      const rawRecords = await this.fetchFromSource(source);

      const validated = this.validator.validate<T>(domain, rawRecords);
      if (validated.errors.length > 0) {
        await this.logValidationErrors(domain, validated.errors);
      }

      const normalized: NormalizedRecord<T>[] = validated.valid.map(r =>
        this.normalizer.normalize(r, source.sourceUrl, source.sourceName, source.priority),
      );

      const existing = await this.currentStore.findAll<T>(domain);
      const dedupResult = this.deduplicator.deduplicate(normalized, existing as any, domain);

      let inserted = 0, updated = 0, unchanged = 0;
      const now = new Date();

      for (const matched of dedupResult.matchedRecords) {
        const existingRecord = (existing as any[]).find(e => e.id === matched.existingId);
        if (!existingRecord) { inserted++; continue; }

        const diff = this.differ.diff(
          existingRecord as Record<string, unknown>,
          matched.newRecord.data as Record<string, unknown>,
          this.syncConfig.trackedFields,
        );

        if (diff.hasChanges) {
          await this.applyUpdate(domain, matched.existingId, matched.newRecord.data as T, diff, source, importLogId);
          updated++;
        } else {
          unchanged++;
        }
      }

      for (const newRecord of dedupResult.newRecords) {
        await this.applyInsert(domain, newRecord.data as T, source, importLogId);
        inserted++;
      }

      return await this.completeImportLog(importLogId, domain, {
        status: 'completed', durationMs: Date.now() - startTime,
      }, inserted, updated, unchanged, 0, startTime);

    } catch (error: any) {
      return await this.completeImportLog(importLogId, domain, {
        status: 'failed', errorMessage: error.message, durationMs: Date.now() - startTime,
      }, 0, 0, 0, 0, startTime);
    }
  }

  protected abstract fetchFromSource(source: DataSource): Promise<unknown[]>;

  protected async applyInsert(domain: string, data: T, source: DataSource, importLogId: string): Promise<void> {
    const table = this.prisma[this.syncConfig.tableName as keyof PrismaClient] as any;
    if (!table) return;
    await table.create({
      data: {
        ...data,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        lastSyncAt: new Date(),
        lastVerifiedAt: new Date(),
        validationStatus: 'verified',
      },
    });
  }

  protected async applyUpdate(domain: string, id: string, data: T, diff: DiffResult, source: DataSource, importLogId: string): Promise<void> {
    const table = this.prisma[this.syncConfig.tableName as keyof PrismaClient] as any;
    if (!table) return;
    await this.versionStore.createVersion(domain, id, data as any, diff.modified.map(m => m.field), source.sourceUrl, source.sourceName, importLogId);
    await table.update({
      where: { id },
      data: {
        ...data,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        lastSyncAt: new Date(),
        lastVerifiedAt: new Date(),
        dataVersion: { increment: 1 },
        validationStatus: 'verified',
      },
    });
    const changedFields: Record<string, { old: unknown; new: unknown }> = {};
    diff.modified.forEach(m => { changedFields[m.field] = { old: m.oldValue, new: m.newValue }; });
    await this.auditStore.log(domain, this.syncConfig.tableName, id, 'update', changedFields, source.sourceUrl, importLogId, 'system');
  }

  private async createImportLog(domain: string, sourceUrl: string, sourceName: string, priority: number, triggeredBy: string, id: string): Promise<any> {
    try {
      return await this.prisma.$executeRawUnsafe(
        `INSERT INTO import_logs (id, domain, source_config_id, triggered_by, status, started_at, created_at)
         VALUES ($1, $2, (SELECT id FROM source_configs WHERE domain = $3 LIMIT 1), $4, 'running', NOW(), NOW())`,
        id, domain, domain, triggeredBy,
      );
    } catch { return null; }
  }

  private async updateImportLog(id: string, updates: Record<string, any>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    if (setClauses.length === 0) return;
    values.push(id);
    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE import_logs SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        ...values,
      );
    } catch {}
  }

  private async completeImportLog(id: string, domain: string, base: any, inserted: number, updated: number, unchanged: number, failed: number, startTime: number): Promise<SyncResult> {
    const durationMs = Date.now() - startTime;
    await this.updateImportLog(id, {
      ...base,
      records_inserted: inserted,
      records_updated: updated,
      records_unchanged: unchanged,
      records_failed: failed,
      duration_ms: durationMs,
      completed_at: new Date(),
    });
    return {
      collectorId: domain,
      domain,
      sourceUrl: '',
      sourceName: '',
      status: base.status,
      recordsFetched: inserted + updated + unchanged + failed,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsUnchanged: unchanged,
      recordsFailed: failed,
      durationMs,
      errors: base.errorMessage ? [{ type: 'sync', message: base.errorMessage, recordIndex: undefined, recoverable: true }] : [],
      importLogId: id,
    };
  }

  private async logValidationErrors(domain: string, errors: any[]): Promise<void> {
    for (const err of errors) {
      console.warn(`[${domain}] Validation error at index ${err.index}:`, err.issues);
    }
  }
}