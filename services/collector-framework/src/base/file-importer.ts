import { BaseCollector } from './base-collector';
import { CollectResult } from '@egypt/shared-types';

export interface FileImportConfig {
  format: 'csv' | 'json' | 'xml';
  delimiter?: string;
  encoding?: string;
  hasHeader?: boolean;
  schema?: Record<string, string>;
}

export abstract class FileImporter<T> extends BaseCollector<T> {
  protected abstract importConfig: FileImportConfig;

  protected async parseFile(content: string, format: string): Promise<T[]> {
    switch (format) {
      case 'json':
        return this.parseJson(content);
      case 'csv':
        return this.parseCsv(content);
      case 'xml':
        return this.parseXml(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private parseJson(content: string): T[] {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  }

  private parseCsv(content: string): T[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      return record as unknown as T;
    });
  }

  private parseXml(_content: string): T[] {
    throw new Error('XML parsing not implemented');
  }
}
