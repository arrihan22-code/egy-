import { CollectorMetadata, CollectResult, CollectError } from '@egypt/shared-types';

export abstract class BaseCollector<T> {
  abstract readonly metadata: CollectorMetadata;

  abstract collect(): Promise<CollectResult<T>>;

  abstract validate(record: unknown): T;

  abstract normalize(record: T): Record<string, unknown>;

  protected createError(
    type: 'network' | 'parse' | 'validation' | 'timeout' | 'auth' | 'rate_limit',
    message: string,
    recoverable: boolean = true,
    recordIndex?: number
  ): CollectError {
    return { type, message, recordIndex, recoverable };
  }

  protected createResult(
    records: T[],
    sourceUrl: string,
    sourceName: string,
    errors: CollectError[] = []
  ): CollectResult<T> {
    return {
      records,
      metadata: {
        sourceUrl,
        sourceName,
        fetchedAt: new Date(),
        recordCount: records.length,
        durationMs: 0,
        errors,
      },
    };
  }
}
