import { RetryQueue } from './retry-queue';

describe('RetryQueue', () => {
  let queue: RetryQueue;

  beforeEach(() => { queue = new RetryQueue(); });

  it('should enqueue a job for retry', async () => {
    await queue.enqueue('collector-1', 'log-1', new Error('Network error'));
    const result = await queue['queue'].get('log-1');
    expect(result).toBeDefined();
    expect(result!.collectorId).toBe('collector-1');
    expect(result!.attempts).toBe(1);
    expect(result!.lastError).toBe('Network error');
  });

  it('should increment attempts on re-enqueue', async () => {
    await queue.enqueue('collector-1', 'log-1', new Error('First error'));
    await queue.enqueue('collector-1', 'log-1', new Error('Second error'));
    const result = await queue['queue'].get('log-1');
    expect(result!.attempts).toBe(2);
    expect(result!.lastError).toBe('Second error');
  });

  it('should send to dead letter queue after max attempts', async () => {
    for (let i = 0; i < 3; i++) {
      await queue.enqueue('collector-1', 'log-1', new Error(`Error ${i + 1}`));
    }
    expect(queue['queue'].has('log-1')).toBe(false);
    expect(queue['deadLetterQueue']).toHaveLength(1);
    expect(queue['deadLetterQueue'][0].attempts).toBe(3);
  });

  it('should use custom policy when registered', () => {
    queue.registerPolicy('custom-collector', { maxAttempts: 1, backoffDelays: [1000], maxDelay: 5000, jitter: false, deadLetterAfter: 1 });
    queue.enqueue('custom-collector', 'log-1', new Error('fail'));
    expect(queue['queue'].has('log-1')).toBe(false);
    expect(queue['deadLetterQueue']).toHaveLength(1);
  });
});