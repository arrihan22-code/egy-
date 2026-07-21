export interface PipelineConfig {
  validate: boolean;
  normalize: boolean;
  deduplicate: boolean;
  diff: boolean;
  versionHistory: boolean;
  auditLog: boolean;
}

export interface NormalizedRecord<T = Record<string, unknown>> {
  data: T;
  source: string;
  sourceUrl: string;
  sourceName: string;
  sourcePriority: number;
  fetchedAt: Date;
  collectedAt: Date;
  hash: string;
}

export interface DedupMatch {
  existingId: string;
  confidence: number;
  matchedBy: string[];
}

export interface DedupResult {
  newRecords: NormalizedRecord[];
  matchedRecords: Array<{
    existingId: string;
    newRecord: NormalizedRecord;
    confidence: number;
  }>;
  duplicates: Array<{ record: NormalizedRecord; reason: string }>;
}

export interface VersionRecord {
  id: string;
  version: number;
  recordData: Record<string, unknown>;
  changedFields: string[];
  sourceUrl: string;
  sourceName: string;
  importId: string;
  validFrom: Date;
  validTo: Date | null;
  isCurrent: boolean;
}
