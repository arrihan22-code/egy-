import { BaseSyncService, SyncConfig } from './base-sync-service';
import { BankSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';
import { z } from 'zod';

export class BanksCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'banks',
    tableName: 'bank',
    idField: 'id',
    matchFields: ['code'],
    trackedFields: ['nameAr', 'nameEn', 'website', 'phone', 'email'],
  };
  readonly schema = BankSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/banks`, {
        headers: { ...source.headers },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) results.push(...data);
        else if (data.data && Array.isArray(data.data)) results.push(...data.data);
      }
    } catch {}
    return results;
  }
}