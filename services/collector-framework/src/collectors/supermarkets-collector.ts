import { BaseSyncService, SyncConfig } from './base-sync-service';
import { DataSource } from '@egypt/shared-types';
import { z } from 'zod';

const SupermarketSchema = z.object({
  nameAr: z.string(),
  nameEn: z.string().optional(),
  brandName: z.string().optional(),
  type: z.enum(['hypermarket', 'supermarket', 'mini', 'co-op']).optional(),
  governorateId: z.string(),
  cityId: z.string(),
  areaId: z.string().optional(),
  street: z.string().optional(),
  latitude: z.number().min(22).max(32).optional(),
  longitude: z.number().min(25).max(37).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  hasDelivery: z.boolean().optional(),
  hasOnlineOrdering: z.boolean().optional(),
  workingHours: z.string().optional(),
});

export class SupermarketsCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'supermarkets',
    tableName: 'supermarket',
    idField: 'id',
    matchFields: ['nameAr', 'phone'],
    trackedFields: ['nameAr', 'nameEn', 'brandName', 'type', 'phone', 'website', 'latitude', 'longitude', 'street', 'hasDelivery', 'hasOnlineOrdering', 'workingHours'],
  };
  readonly schema = SupermarketSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/stores`, {
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