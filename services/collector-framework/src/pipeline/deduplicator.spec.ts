import { Deduplicator } from './deduplicator';

function makeRecord(data: any) {
  return {
    data,
    source: 'api',
    sourceUrl: 'https://example.com',
    sourceName: 'Test Source',
    sourcePriority: 1,
    fetchedAt: new Date(),
    collectedAt: new Date(),
    hash: 'hash',
  };
}

describe('Deduplicator', () => {
  let dedup: Deduplicator;

  beforeEach(() => { dedup = new Deduplicator(); });

  it('should return all records as new when no config registered', () => {
    const result = dedup.deduplicate([makeRecord({ name: 'Test' })], [], 'unknown');
    expect(result.newRecords).toHaveLength(1);
    expect(result.matchedRecords).toHaveLength(0);
  });

  it('should match by external ID', () => {
    dedup.registerConfig('banks', { matchFields: ['name'], externalIdField: 'externalId' });
    const records = [makeRecord({ id: '2', name: 'Bank B', externalId: 'ext-1' })];
    const existing = [makeRecord({ id: '1', name: 'Bank A', externalId: 'ext-1' })];
    const result = dedup.deduplicate(records, existing, 'banks');
    expect(result.matchedRecords).toHaveLength(1);
    expect(result.matchedRecords[0].existingId).toBe('1');
    expect(result.matchedRecords[0].confidence).toBe(1);
  });

  it('should match by match fields with threshold', () => {
    dedup.registerConfig('banks', { matchFields: ['name', 'phone', 'address'] });
    const records = [makeRecord({ name: 'Bank A', phone: '123', address: 'Street 1' })];
    const existing = [makeRecord({ id: '1', name: 'Bank A', phone: '123', address: 'Street 2' })];
    const result = dedup.deduplicate(records, existing, 'banks');
    expect(result.matchedRecords).toHaveLength(1);
    expect(result.matchedRecords[0].confidence).toBe(2 / 3);
  });

  it('should return new records when no match found', () => {
    dedup.registerConfig('banks', { matchFields: ['name'] });
    const records = [makeRecord({ name: 'New Bank' })];
    const existing = [makeRecord({ id: '1', name: 'Existing Bank' })];
    const result = dedup.deduplicate(records, existing, 'banks');
    expect(result.newRecords).toHaveLength(1);
    expect(result.matchedRecords).toHaveLength(0);
  });
});