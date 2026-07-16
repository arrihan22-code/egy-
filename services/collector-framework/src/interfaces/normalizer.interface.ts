import { NormalizedRecord } from '@egypt/shared-types';

export interface INormalizer<T> {
  normalize(record: T, sourceUrl: string, sourceName: string, sourcePriority: number): NormalizedRecord<T>;
  normalizeBatch(records: T[], sourceUrl: string, sourceName: string, sourcePriority: number): NormalizedRecord<T>[];
}
