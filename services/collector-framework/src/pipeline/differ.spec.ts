import { Differ } from './differ';

describe('Differ', () => {
  let differ: Differ;

  beforeEach(() => { differ = new Differ(); });

  it('should detect no changes for identical records', () => {
    const oldRecord = { name: 'Test', code: '123' };
    const newRecord = { name: 'Test', code: '123' };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(false);
    expect(result.unchanged).toContain('name');
    expect(result.unchanged).toContain('code');
  });

  it('should detect added fields', () => {
    const oldRecord = { name: 'Test' };
    const newRecord = { name: 'Test', code: '123' };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(true);
    expect(result.added).toContain('code');
  });

  it('should detect removed fields', () => {
    const oldRecord = { name: 'Test', code: '123' };
    const newRecord = { name: 'Test' };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(true);
    expect(result.removed).toContain('code');
  });

  it('should detect modified fields', () => {
    const oldRecord = { name: 'Old Name', code: '123' };
    const newRecord = { name: 'New Name', code: '123' };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(true);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].field).toBe('name');
    expect(result.modified[0].oldValue).toBe('Old Name');
    expect(result.modified[0].newValue).toBe('New Name');
  });

  it('should skip metadata fields', () => {
    const oldRecord = { name: 'Test', sourceMetadata: { source: 'api' }, id: '1', createdAt: new Date(), updatedAt: new Date() };
    const newRecord = { name: 'Test', sourceMetadata: { source: 'web' }, id: '1', createdAt: new Date(), updatedAt: new Date() };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(false);
  });

  it('should only check tracked fields when specified', () => {
    const oldRecord = { name: 'Old', code: '123', status: 'active' };
    const newRecord = { name: 'New', code: '456', status: 'active' };
    const result = differ.diff(oldRecord, newRecord, ['name']);
    expect(result.hasChanges).toBe(true);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].field).toBe('name');
    expect(result.unchanged).not.toContain('code');
  });

  it('should detect nested object changes', () => {
    const oldRecord = { address: { city: 'Cairo', street: 'Main St' } };
    const newRecord = { address: { city: 'Alexandria', street: 'Main St' } };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(true);
    expect(result.modified).toHaveLength(1);
  });

  it('should detect array changes', () => {
    const oldRecord = { tags: ['a', 'b'] };
    const newRecord = { tags: ['a', 'c'] };
    const result = differ.diff(oldRecord, newRecord);
    expect(result.hasChanges).toBe(true);
  });
});