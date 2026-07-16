import { CollectResult, CollectError } from '@egypt/shared-types';

export interface ExtractionRule {
  field: string;
  selector: string;
  attribute?: string;
  transform?: (value: string) => unknown;
  required?: boolean;
  defaultValue?: unknown;
}

export class Extractor {
  extractFromHtml(html: string, rules: ExtractionRule[]): Record<string, unknown>[] {
    const results: Record<string, unknown>[] = [];
    return results;
  }

  extractFromJson(data: Record<string, unknown>, mapping: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [targetField, sourcePath] of Object.entries(mapping)) {
      result[targetField] = this.getNestedValue(data, sourcePath);
    }
    return result;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
  }
}
