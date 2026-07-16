import { UpsertResult, DiffResult, NormalizedRecord } from '@egypt/shared-types';
import { Differ } from './differ';

export interface UpsertConfig {
  domain: string;
  tableName: string;
  idField: string;
  trackedFields: string[];
  versionHistory: boolean;
  auditLog: boolean;
}

export class UpsertExecutor {
  private differ: Differ;

  constructor() {
    this.differ = new Differ();
  }

  async execute<T extends Record<string, unknown>>(
    records: NormalizedRecord<T>[],
    existingRecords: Array<{ id: string; data: Record<string, unknown> }>,
    config: UpsertConfig
  ): Promise<{
    inserted: number;
    updated: number;
    unchanged: number;
    failed: number;
    changes: Array<{ id: string; diff: DiffResult }>;
  }> {
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    const changes: Array<{ id: string; diff: DiffResult }> = [];

    for (const record of records) {
      const existing = this.findExisting(record, existingRecords, config);
      if (!existing) {
        inserted++;
      } else {
        const diff = this.differ.diff(
          existing.data as Record<string, unknown>,
          record.data as Record<string, unknown>,
          config.trackedFields
        );
        if (diff.hasChanges) {
          updated++;
          changes.push({ id: existing.id, diff });
        } else {
          unchanged++;
        }
      }
    }

    return { inserted, updated, unchanged, changes };
  }

  private findExisting(
    record: NormalizedRecord<unknown>,
    existing: Array<{ id: string; data: Record<string, unknown> }>,
    config: UpsertConfig
  ): { id: string; data: Record<string, unknown> } | null {
    const data = record.data as Record<string, unknown>;

    for (const existing of existing) {
      if (config.externalIdField && data[config.externalIdField] && existing.data[config.externalIdField]) {
        if (data[config.externalIdField] === existing.data[config.externalIdField]) {
          return existing;
        }
      }

      const matchFields = config.matchFields || [];
      let matches = 0;
      for (const field of matchFields) {
        if (data[field] && existing.data[field] && data[field] === existing.data[field]) {
          matches++;
        }
      }

      if (matchFields.length > 0 && matches >= Math.ceil(matchFields.length / 2)) {
        return existing;
      }
    }

    return null;
  }
}

interface UpsertConfig {
  domain: string;
  tableName: string;
  idField: string;
  trackedFields: string[];
  externalIdField?: string;
  matchFields: string[];
  versionHistory: boolean;
  auditLog: boolean;
}
