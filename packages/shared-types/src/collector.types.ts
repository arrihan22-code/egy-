export type SourcePriority = 1 | 2 | 3 | 4 | 5 | 6;

export type UpdateFrequency = 'daily' | 'weekly' | 'monthly' | 'on_demand';

export type SourceType = 'api' | 'website' | 'open_data' | 'structured_file' | 'trusted_public';

export type AuthType = 'api_key' | 'oauth' | 'basic' | 'none';

export type SyncTrigger = 'scheduled' | 'manual' | 'webhook';

export type ImportStatus = 'running' | 'completed' | 'failed' | 'partial';

export type CollectorAction = 'inserted' | 'updated' | 'unchanged' | 'failed';

export type ErrorType = 'network' | 'parse' | 'validation' | 'timeout' | 'auth' | 'rate_limit';

export interface CollectorMetadata {
  id: string;
  domain: string;
  sourcePriority: SourcePriority;
  updateFrequency: UpdateFrequency;
  lastSyncAt: Date | null;
  isActive: boolean;
}

export interface CollectError {
  type: ErrorType;
  message: string;
  recordIndex?: number;
  recoverable: boolean;
}

export interface CollectResult<T> {
  records: T[];
  metadata: {
    sourceUrl: string;
    sourceName: string;
    fetchedAt: Date;
    recordCount: number;
    durationMs: number;
    errors: CollectError[];
  };
}

export interface ValidationResult<T> {
  valid: T[];
  errors: ValidationError[];
  total: number;
  validCount: number;
}

export interface ValidationError {
  index: number;
  issues: unknown[];
  raw: unknown;
}

export interface DiffResult {
  hasChanges: boolean;
  added: string[];
  removed: string[];
  modified: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  unchanged: string[];
}

export interface UpsertResult {
  inserted: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: Array<{ record: unknown; error: string }>;
}

export interface SyncResult {
  collectorId: string;
  domain: string;
  sourceUrl: string;
  sourceName: string;
  status: 'completed' | 'failed' | 'partial';
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsUnchanged: number;
  recordsFailed: number;
  durationMs: number;
  errors: CollectError[];
  importLogId: string;
}

export interface SourcePriority {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
}

export const SOURCE_PRIORITIES: Record<string, SourcePriority> = {
  OFFICIAL_GOV_API: { level: 1, label: 'Official Government API' },
  OFFICIAL_COMPANY_API: { level: 2, label: 'Official Company API' },
  OFFICIAL_WEBSITE: { level: 3, label: 'Official Website' },
  OPEN_DATA_PORTAL: { level: 4, label: 'Open Data Portal' },
  STRUCTURED_DATA: { level: 5, label: 'Structured Data (JSON/XML)' },
  TRUSTED_PUBLIC: { level: 6, label: 'Trusted Public Source' },
};
