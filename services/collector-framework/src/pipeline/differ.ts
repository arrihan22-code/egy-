import { DiffResult } from '@egypt/shared-types';

export class Differ {
  diff(
    oldRecord: Record<string, unknown>,
    newRecord: Record<string, unknown>,
    trackedFields: string[] = []
  ): DiffResult {
    const result: DiffResult = {
      hasChanges: false,
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
    };

    const fieldsToCheck = trackedFields.length > 0
      ? trackedFields
      : [...new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)])];

    for (const key of fieldsToCheck) {
      if (key === 'sourceMetadata' || key === 'id' || key === 'createdAt' || key === 'updatedAt') {
        continue;
      }

      if (!(key in oldRecord) && key in newRecord) {
        result.added.push(key);
        result.hasChanges = true;
      } else if (key in oldRecord && !(key in newRecord)) {
        result.removed.push(key);
        result.hasChanges = true;
      } else if (key in oldRecord && key in newRecord) {
        if (!this.deepEqual(oldRecord[key], newRecord[key])) {
          result.modified.push({
            field: key,
            oldValue: oldRecord[key],
            newValue: newRecord[key],
          });
          result.hasChanges = true;
        } else {
          result.unchanged.push(key);
        }
      }
    }

    return result;
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null || a === undefined || b === undefined) return a === b;
    if (typeof a !== typeof b) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => this.deepEqual(val, b[idx]));
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a as Record<string, unknown>);
      const keysB = Object.keys(b as Record<string, unknown>);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
    }
    return a === b;
  }
}
