import {
  CollectorMetadata,
  CollectResult,
  CollectError,
  SyncResult,
  SourcePriority,
} from '@egypt/shared-types';

export interface ICollector<T> {
  readonly metadata: CollectorMetadata;
  collect(): Promise<CollectResult<T>>;
  validate(record: unknown): T;
  normalize(record: T): Record<string, unknown>;
}


