import { BaseSyncService, SyncConfig } from './base-sync-service';
import { TransportStationSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';

export class TransportCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'transport',
    tableName: 'transportStation',
    idField: 'id',
    matchFields: ['nameAr', 'code'],
    externalIdField: 'code',
    trackedFields: ['nameAr', 'nameEn', 'type', 'lineName', 'latitude', 'longitude', 'hasParking', 'hasAccessibility'],
  };
  readonly schema = TransportStationSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/stations`, {
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