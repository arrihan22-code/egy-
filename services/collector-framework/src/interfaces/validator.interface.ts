import { ValidationResult } from '@egypt/shared-types';
import { z } from 'zod';

export interface IValidator {
  registerSchema(domain: string, schema: z.ZodSchema): void;
  validate<T>(domain: string, records: unknown[]): ValidationResult<T>;
  getSchema(domain: string): z.ZodSchema | undefined;
}
