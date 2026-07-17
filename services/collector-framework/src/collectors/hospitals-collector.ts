import { BaseSyncService, SyncConfig } from './base-sync-service';
import { HospitalSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';

export class HospitalsCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'hospitals',
    tableName: 'hospital',
    idField: 'id',
    matchFields: ['nameAr', 'phone'],
    trackedFields: ['nameAr', 'nameEn', 'type', 'ownership', 'phone', 'email', 'website', 'hasEmergency', 'bedCount', 'latitude', 'longitude', 'street'],
  };
  readonly schema = HospitalSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/hospitals`, {
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