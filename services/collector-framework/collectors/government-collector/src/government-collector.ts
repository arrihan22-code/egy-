import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError } from '@egypt/shared-types';
import { GovernmentOfficeSchema } from '@egypt/shared-schemas';

interface GovernmentRecord {
  type: 'civil_id' | 'passport' | 'traffic' | 'post_office' | 'license' | 'other';
  nameAr: string;
  nameEn?: string;
  officeCode?: string;
  governorateId: string;
  cityId: string;
  areaId?: string;
  street?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  services?: Array<{
    serviceNameAr: string;
    serviceNameEn?: string;
    description?: string;
    fee?: number;
    processingTime?: string;
    requiredDocs?: string[];
    isOnline: boolean;
    isActive: boolean;
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

export class GovernmentCollector extends BaseCollector<GovernmentRecord> {
  readonly metadata = {
    id: 'government-collector',
    domain: 'government',
    sourcePriority: 1 as const,
    updateFrequency: 'weekly' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'MCIT Digital Egypt API',
      url: 'https://api.digital.gov.eg/v1/offices',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Ministry Websites',
      url: 'https://www.mcit.gov.eg/services',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<GovernmentRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.digital.gov.eg/v1/offices', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.offices || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.digital.gov.eg/v1/offices',
          sourceName: 'MCIT Digital Egypt API',
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
          sourceUrl: 'https://api.digital.gov.eg/v1/offices',
          sourceName: 'MCIT Digital Egypt API',
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

  validate(record: unknown): GovernmentRecord {
    return GovernmentOfficeSchema.parse(record) as unknown as GovernmentRecord;
  }

  normalize(record: GovernmentRecord): Record<string, unknown> {
    return {
      ...record,
      phone: record.phone?.replace(/^0/, '+20'),
    };
  }
}
