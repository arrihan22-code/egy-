import { ValidationResult, ValidationError } from '@egypt/shared-types';
import { z } from 'zod';

export class Validator {
  private schemas: Map<string, z.ZodSchema> = new Map();

  registerSchema(domain: string, schema: z.ZodSchema): void {
    this.schemas.set(domain, schema);
  }

  validate<T>(domain: string, records: unknown[]): ValidationResult<T> {
    const schema = this.schemas.get(domain);
    if (!schema) {
      throw new Error(`No schema registered for domain: ${domain}`);
    }

    const valid: T[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const result = schema.safeParse(records[i]);
      if (result.success) {
        valid.push(result.data as T);
      } else {
        errors.push({
          index: i,
          issues: result.error.issues,
          raw: records[i],
        });
      }
    }

    return { valid, errors, total: records.length, validCount: valid.length };
  }
}
