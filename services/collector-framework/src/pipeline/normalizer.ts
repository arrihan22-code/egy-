import { NormalizedRecord } from '@egypt/shared-types';
import { createHash } from 'crypto';

export interface NormalizationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'phone' | 'coordinate';
  transform?: (value: unknown) => unknown;
  defaultValue?: unknown;
}

export class Normalizer {
  private rules: Map<string, NormalizationRule[]> = new Map();

  registerRules(domain: string, rules: NormalizationRule[]): void {
    this.rules.set(domain, rules);
  }

  normalize<T>(
    record: T,
    sourceUrl: string,
    sourceName: string,
    sourcePriority: number
  ): NormalizedRecord<T> {
    const data = record as Record<string, unknown>;
    const normalized = { ...data };

    const domain = (record as any).__domain || 'default';
    const rules = this.rules.get(domain) || [];

    for (const rule of rules) {
      if (rule.field in normalized) {
        normalized[rule.field] = this.applyRule(normalized[rule.field], rule);
      } else if (rule.defaultValue !== undefined) {
        normalized[rule.field] = rule.defaultValue;
      }
    }

    const hash = this.computeHash(normalized);

    return {
      data: normalized,
      sourceUrl,
      sourceName,
      sourcePriority,
      fetchedAt: new Date(),
      hash,
    };
  }

  private applyRule(value: unknown, rule: NormalizationRule): unknown {
    if (value === null || value === undefined) {
      return rule.defaultValue;
    }
    if (rule.transform) {
      return rule.transform(value);
    }
    return value;
  }

  private computeHash(data: Record<string, unknown>): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data, Object.keys(data).sort()));
    return hash.digest('hex');
  }
}

interface NormalizationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'phone' | 'coordinate';
  transform?: (value: unknown) => unknown;
  defaultValue?: unknown;
}

interface NormalizedRecord<T> {
  data: T;
  sourceUrl: string;
  sourceName: string;
  sourcePriority: number;
  fetchedAt: Date;
  hash: string;
}
