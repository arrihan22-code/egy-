import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError } from '@egypt/shared-types';
import { PharmacySchema } from '@egypt/shared-schemas';

interface PharmacyRecord {
  nameAr: string;
  nameEn?: string;
  licenseNumber?: string;
  governorateId: string;
  cityId: string;
  areaId?: string;
  street?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  is24h: boolean;
  hasDelivery: boolean;
  isActive: boolean;
  workingHours?: Array<{
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
    is24h?: boolean;
  }>;
  contacts?: Array<{
    type: 'phone' | 'whatsapp' | 'email';
    value: string;
    isPrimary: boolean;
  }>;
  sourceMetadata: {
    sourceUrl: string;
    sourceName: string;
    sourcePriority: number;
    lastUpdatedAt: Date | null;
    importedAt: Date;
    validationStatus: 'valid' | 'invalid' | 'pending';
    dataVersion: string;
  };
}

export class PharmaciesCollector extends BaseCollector<PharmacyRecord> {
  readonly metadata = {
    id: 'pharmacies-collector',
    domain: 'pharmacies',
    sourcePriority: 1 as const,
    updateFrequency: 'daily' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'Egyptian Drug Authority API',
      url: 'https://api.eda.gov.eg/v1/pharmacies',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Pharmacists Syndicate',
      url: 'https://www.egyptpharmacy.org/pharmacies',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<PharmacyRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.eda.gov.eg/v1/pharmacies', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.pharmacies || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.eda.gov.eg/v1/pharmacies',
          sourceName: 'Egyptian Drug Authority API',
          fetchedAt: new Date(),
          recordCount: records.length,
          durationMs: Date.now() - startTime,
          errors: [],
        },
      };
    } catch (error) {
      return {
        records: [],
        metadata: {
          sourceUrl: 'https://api.eda.gov.eg/v1/pharmacies',
          sourceName: 'Egyptian Drug Authority API',
          fetchedAt: new Date(),
          recordCount: 0,
          durationMs: Date.now() - startTime,
          errors: [{
            type: 'network',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: true,
          }],
        },
      };
    }
  }

  validate(record: unknown): PharmacyRecord {
    return PharmacySchema.parse(record) as unknown as PharmacyRecord;
  }

  normalize(record: PharmacyRecord): Record<string, unknown> {
    return {
      ...record,
      phone: record.phone?.replace(/^0/, '+20'),
      whatsapp: record.whatsapp?.replace(/^0/, '+20'),
    };
  }
}
