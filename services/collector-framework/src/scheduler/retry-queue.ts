import { RetryPolicy, FailedJob, DeadLetterRecord } from '@egypt/shared-types';

export class RetryQueue {
  private queue: Map<string, FailedJob> = new Map();
  private deadLetterQueue: DeadLetterRecord[] = [];
  private policies: Map<string, RetryPolicy> = new Map();
  private defaultPolicy: RetryPolicy = {
    maxAttempts: 3,
    backoffDelays: [60_000, 300_000, 900_000],
    maxDelay: 3_600_000,
    jitter: true,
    deadLetterAfter: 3,
  };

  registerPolicy(collectorId: string, policy: RetryPolicy): void {
    this.policies.set(collectorId, policy);
  }

  async enqueue(collectorId: string, importLogId: string, error: Error): Promise<void> {
    const policy = this.policies.get(collectorId) || this.defaultPolicy;
    const existing = this.queue.get(importLogId);
    const attempts = existing ? existing.attempts + 1 : 1;

    if (attempts >= policy.maxAttempts) {
      await this.sendToDeadLetter(collectorId, importLogId, error, attempts);
      this.queue.delete(importLogId);
      return;
    }

    const delay = this.calculateBackoff(attempts, policy);
    const failedJob: FailedJob = {
      collectorId,
      importLogId,
      attempts,
      lastError: error.message,
      nextRetryAt: new Date(Date.now() + delay),
      createdAt: new Date(),
    };

    this.queue.set(importLogId, failedJob);
  }

  private calculateBackoff(attempt: number, policy: RetryPolicy): number {
    const index = Math.min(attempt - 1, policy.backoffDelays.length - 1);
    const baseDelay = policy.backoffDelays[index] || policy.maxDelay;
    const jitter = policy.jitter ? Math.random() * 1000 : 0;
    return Math.min(baseDelay + jitter, policy.maxDelay);
  }

  private async sendToDeadLetter(
    collectorId: string,
    importLogId: string,
    error: Error,
    attempts: number
  ): Promise<void> {
    this.deadLetterQueue.push({
      collectorId,
      importLogId,
      error: error.message,
      attempts,
      failedAt: new Date(),
      payload: null,
    });
  }
}
