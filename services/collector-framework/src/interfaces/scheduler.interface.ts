import { SyncSchedule, SyncResult } from '@egypt/shared-types';

export interface IScheduler {
  registerSchedule(collectorId: string, schedule: SyncSchedule): void;
  executeSync(collectorId: string, trigger: 'scheduled' | 'manual' | 'webhook'): Promise<SyncResult>;
  getSchedule(collectorId: string): SyncSchedule | undefined;
  pauseSchedule(collectorId: string): void;
  resumeSchedule(collectorId: string): void;
}

export interface IRetryQueue {
  enqueue(collectorId: string, importLogId: string, error: Error): Promise<void>;
  processNext(): Promise<void>;
  getQueueDepth(): Promise<number>;
  getDeadLetterCount(): Promise<number>;
}
