import { NormalizedRecord, DedupResult, DedupMatch } from '@egypt/shared-types';

export interface DedupConfig {
  matchFields: string[];
  fuzzyFields?: string[];
  fuzzyThreshold?: number;
  externalIdField?: string;
}

export class Deduplicator {
  private configs: Map<string, DedupConfig> = new Map();

  registerConfig(domain: string, config: DedupConfig): void {
    this.configs.set(domain, config);
  }

  deduplicate<T>(
    records: NormalizedRecord<T>[],
    existingRecords: NormalizedRecord<T>[],
    domain: string
  ): {
    newRecords: NormalizedRecord<T>[];
    matchedRecords: Array<{ existingId: string; newRecord: NormalizedRecord<T>; confidence: number }>;
    duplicates: Array<{ record: NormalizedRecord<T>; reason: string }>;
  } {
    const config = this.configs.get(domain);
    if (!config) {
      return { newRecords: records, matchedRecords: [], duplicates: [] };
    }

    const newRecords: NormalizedRecord<T>[] = [];
    const matchedRecords: Array<{ existingId: string; newRecord: NormalizedRecord<T>; confidence: number }> = [];
    const duplicates: Array<{ record: NormalizedRecord<T>; reason: string }> = [];

    for (const newRecord of records) {
      const match = this.findMatch(newRecord, existingRecords, config);
      if (match) {
        matchedRecords.push({ existingId: match.existingId, newRecord, confidence: match.confidence });
      } else {
        newRecords.push(newRecord);
      }
    }

    return { newRecords, matchedRecords, duplicates };
  }

  private findMatch(
    record: NormalizedRecord<unknown>,
    existing: NormalizedRecord<unknown>[],
    config: DedupConfig
  ): { existingId: string; confidence: number } | null {
    const data = record.data as Record<string, unknown>;

    for (const existing of existing) {
      const existingData = existing.data as Record<string, unknown>;

      if (config.externalIdField && data[config.externalIdField] && existingData[config.externalIdField]) {
        if (data[config.externalIdField] === existingData[config.externalIdField]) {
          return { existingId: existing.data.id as string, confidence: 1 };
        }
      }

      const matchFields = config.matchFields || [];
      let matches = 0;
      for (const field of matchFields) {
        if (data[field] && existingData[field] && data[field] === existingData[field]) {
          matches++;
        }
      }

      if (matchFields.length > 0 && matches >= Math.ceil(matchFields.length / 2)) {
        return {
          existingId: existing.data.id as string,
          confidence: matches / matchFields.length,
        };
      }
    }

    return null;
  }
}

interface DedupConfig {
  matchFields: string[];
  fuzzyFields?: string[];
  fuzzyThreshold?: number;
  externalIdField?: string;
}
