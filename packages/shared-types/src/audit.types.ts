export interface ImportLog {
  id: string;
  collectorId: string;
  sourceUrl: string;
  sourceName: string;
  sourcePriority: number;
  status: 'running' | 'completed' | 'failed' | 'partial';
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsUnchanged: number;
  recordsFailed: number;
  errors: unknown[];
  durationMs: number;
  dataVersion: string;
  startedAt: Date;
  completedAt: Date | null;
  triggeredBy: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  domain: string;
  entityType: string;
  entityId: string;
  action: 'insert' | 'update' | 'delete';
  changedFields: Record<string, { old: unknown; new: unknown }>;
  sourceUrl: string;
  importId: string;
  performedBy: string;
  createdAt: Date;
}
