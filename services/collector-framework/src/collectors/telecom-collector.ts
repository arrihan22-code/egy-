import { BaseSyncService, SyncConfig } from './base-sync-service';
import { DataSource } from '@egypt/shared-types';
import { z } from 'zod';

const TelecomCompanySchema = z.object({
  nameAr: z.string(),
  nameEn: z.string().optional(),
  brandName: z.string().optional(),
  type: z.enum(['mobile', 'fixed', 'internet', 'broadband']).optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  customerService: z.string().optional(),
  coverage: z.array(z.object({
    governorateId: z.string(),
    technology: z.enum(['2G', '3G', '4G', '5G', 'fibre', 'ADSL']).optional(),
    status: z.string().optional(),
  })).optional(),
  plans: z.array(z.object({
    name: z.string(),
    price: z.number().optional(),
    data: z.string().optional(),
    minutes: z.string().optional(),
    validity: z.string().optional(),
  })).optional(),
});

export class TelecomCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'telecom',
    tableName: 'telecomCompany',
    idField: 'id',
    matchFields: ['nameAr'],
    trackedFields: ['nameAr', 'nameEn', 'brandName', 'type', 'website', 'phone', 'customerService', 'coverage', 'plans'],
  };
  readonly schema = TelecomCompanySchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/providers`, {
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