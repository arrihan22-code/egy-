export interface SyncSchedule {
  collectorId: string;
  domain: string;
  cronExpression: string;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  enabled: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffDelays: number[];
  maxDelay: number;
  jitter: boolean;
  deadLetterAfter: number;
}

export interface FailedJob {
  collectorId: string;
  importLogId: string;
  attempts: number;
  lastError: string;
  nextRetryAt: Date | null;
  createdAt: Date;
}

export interface DeadLetterRecord {
  collectorId: string;
  importLogId: string;
  error: string;
  attempts: number;
  failedAt: Date;
  payload: unknown;
}
