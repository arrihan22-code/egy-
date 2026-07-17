import { Validator } from './validator';
import { z } from 'zod';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => { validator = new Validator(); });

  it('should throw when no schema registered', () => {
    expect(() => validator.validate('unknown', [])).toThrow('No schema registered for domain: unknown');
  });

  it('should validate records against schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    validator.registerSchema('test', schema);
    const records = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 'invalid' },
      { name: 'Charlie', age: 25 },
    ];
    const result = validator.validate('test', records);
    expect(result.valid).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.validCount).toBe(2);
    expect(result.total).toBe(3);
  });

  it('should handle empty records', () => {
    const schema = z.object({ name: z.string() });
    validator.registerSchema('test', schema);
    const result = validator.validate('test', []);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});