import { SyncSchedule, SyncResult, CollectError } from '@egypt/shared-types';
import { RetryQueue } from './retry-queue';

export class SchedulerService {
  private schedules: Map<string, SyncSchedule> = new Map();
  private activeJobs: Map<string, boolean> = new Map();
  private retryQueue: RetryQueue;

  constructor() {
    this.retryQueue = new RetryQueue();
  }

  registerSchedule(collectorId: string, schedule: SyncSchedule): void {
    this.schedules.set(collectorId, schedule);
  }

  async executeSync(
    collectorId: string,
    trigger: 'scheduled' | 'manual' | 'webhook'
  ): Promise<SyncResult> {
    const schedule = this.schedules.get(collectorId);
    if (!schedule) {
      throw new Error(`No schedule registered for collector: ${collectorId}`);
    }

    if (this.activeJobs.get(collectorId)) {
      throw new Error(`Sync already in progress for collector: ${collectorId}`);
    }

    this.activeJobs.set(collectorId, true);
    const startTime = Date.now();

    try {
      const result: SyncResult = {
        collectorId,
        domain: schedule.domain,
        sourceUrl: '',
        sourceName: '',
        status: 'completed',
        recordsFetched: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        recordsUnchanged: 0,
        recordsFailed: 0,
        durationMs: 0,
        errors: [],
        importLogId: '',
      };
      return result;
    } finally {
      this.activeJobs.set(collectorId, false);
    }
  }

  getSchedule(collectorId: string): SyncSchedule | undefined {
    return this.schedules.get(collectorId);
  }

  pauseSchedule(collectorId: string): void {
    const schedule = this.schedules.get(collectorId);
    if (schedule) {
      schedule.enabled = false;
    }
  }

  resumeSchedule(collectorId: string): void {
    const schedule = this.schedules.get(collectorId);
    if (schedule) {
      schedule.enabled = true;
    }
  }
}

interface SyncSchedule {
  collectorId: string;
  domain: string;
  cronExpression: string;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  enabled: boolean;
}

interface SyncResult {
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
  errors: unknown[];
  importLogId: string;
}
