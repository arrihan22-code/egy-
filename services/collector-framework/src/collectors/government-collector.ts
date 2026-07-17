import { BaseSyncService, SyncConfig } from './base-sync-service';
import { GovernmentOfficeSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';

export class GovernmentCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'government',
    tableName: 'governmentOffice',
    idField: 'id',
    matchFields: ['nameAr', 'officeCode'],
    externalIdField: 'officeCode',
    trackedFields: ['nameAr', 'nameEn', 'type', 'phone', 'email', 'latitude', 'longitude', 'street'],
  };
  readonly schema = GovernmentOfficeSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/offices`, {
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