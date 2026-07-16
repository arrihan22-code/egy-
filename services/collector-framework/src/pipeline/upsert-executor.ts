import { DiffResult, NormalizedRecord } from '@egypt/shared-types';
import { Differ } from './differ';
import { VersionStore } from '../storage/version-store';
import { AuditStore } from '../storage/audit-store';
import { ImportLogStore } from '../storage/import-log-store';

export interface UpsertConfig {
  domain: string;
  tableName: string;
  idField: string;
  trackedFields: string[];
  externalIdField?: string;
  matchFields: string[];
  versionHistory: boolean;
  auditLog: boolean;
}

export interface UpsertDeps {
  prisma: {
    $queryRaw: (query: TemplateStringsArray, ...params: any[]) => Promise<any[]>;
    $executeRaw: (query: TemplateStringsArray, ...params: any[]) => Promise<number>;
  };
  versionStore: VersionStore;
  auditStore: AuditStore;
  importLogStore: ImportLogStore;
}

export class UpsertExecutor {
  private differ: Differ;
  private deps!: UpsertDeps;

  constructor() {
    this.differ = new Differ();
  }

  setDeps(deps: UpsertDeps) {
    this.deps = deps;
  }

  async execute<T extends Record<string, unknown>>(
    records: NormalizedRecord<T>[],
    existingRecords: Array<{ id: string; data: Record<string, unknown> }>,
    config: UpsertConfig
  ): Promise<{ inserted: number; updated: number; unchanged: number; failed: number; changes: Array<{ id: string; diff: DiffResult }> }> {
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    const changes: Array<{ id: string; diff: DiffResult }> = [];

    for (const record of records) {
      const existing = this.findExisting(record, existingRecords, config);
      if (!existing) {
        await this.deps.prisma.$executeRaw`
          INSERT INTO ${config.tableName} (id, ...)
          VALUES (gen_random_uuid(), ...)
        `;
        inserted++;
      } else {
        const diff = this.differ.diff(existing.data as Record<string, unknown>, record.data as Record<string, unknown>, config.trackedFields);
        if (diff.hasChanges) {
          const changedFields = diff.modified.map(m => m.field);
          await this.deps.prisma.$executeRaw`
            UPDATE ${config.tableName}
            SET ${diff.modified.map(m => `${m.field} = ${m.newValue}`).join(', ')}, updated_at = NOW()
            WHERE id = ${existing.id}
          `;
          if (config.versionHistory) {
            await this.deps.versionStore.createVersion(config.domain, existing.id, record.data as Record<string, unknown>, changedFields, record.sourceUrl, record.sourceName, '');
          }
          if (config.auditLog) {
            const changedFieldsMap: Record<string, { old: unknown; new: unknown }> = {};
            diff.modified.forEach(m => { changedFieldsMap[m.field] = { old: m.oldValue, new: m.newValue }; });
            await this.deps.auditStore.log(config.domain, config.tableName, existing.id, 'update', changedFieldsMap, record.sourceUrl, '', 'system');
          }
          updated++;
          changes.push({ id: existing.id, diff });
        } else {
          unchanged++;
        }
      }
    }
    return { inserted, updated, unchanged, failed: 0, changes };
  }

  private findExisting(record: NormalizedRecord<unknown>, existing: Array<{ id: string; data: Record<string, unknown> }>, config: UpsertConfig): { id: string; data: Record<string, unknown> } | null {
    const data = record.data as Record<string, unknown>;
    for (const ex of existing) {
      if (config.externalIdField && data[config.externalIdField] && ex.data[config.externalIdField]) {
        if (data[config.externalIdField] === ex.data[config.externalIdField]) return ex;
      }
      const matchFields = config.matchFields || [];
      let matches = 0;
      for (const field of matchFields) {
        if (data[field] && ex.data[field] && data[field] === ex.data[field]) matches++;
      }
      if (matchFields.length > 0 && matches >= Math.ceil(matchFields.length / 2)) return ex;
    }
    return null;
  }
}
