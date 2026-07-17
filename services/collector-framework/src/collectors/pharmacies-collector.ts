import { BaseSyncService, SyncConfig } from './base-sync-service';
import { PharmacySchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';

export class PharmaciesCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'pharmacies',
    tableName: 'pharmacy',
    idField: 'id',
    matchFields: ['licenseNumber'],
    externalIdField: 'licenseNumber',
    trackedFields: ['nameAr', 'nameEn', 'phone', 'whatsapp', 'is24h', 'hasDelivery', 'latitude', 'longitude', 'street'],
  };
  readonly schema = PharmacySchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/pharmacies`, {
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