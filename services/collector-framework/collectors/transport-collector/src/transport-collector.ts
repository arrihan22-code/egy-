import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError } from '@egypt/shared-types';
import { TransportStationSchema } from '@egypt/shared-schemas';

interface TransportRecord {
  type: 'metro' | 'train' | 'bus';
  nameAr: string;
  nameEn?: string;
  code?: string;
  lineName?: string;
  governorateId: string;
  cityId: string;
  latitude: number;
  longitude: number;
  hasParking: boolean;
  hasAccessibility: boolean;
  isActive: boolean;
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

export class TransportCollector extends BaseCollector<TransportRecord> {
  readonly metadata = {
    id: 'transport-collector',
    domain: 'transport',
    sourcePriority: 1 as const,
    updateFrequency: 'weekly' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'Ministry of Transport API',
      url: 'https://api.mot.gov.eg/v1/stations',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Cairo Metro Website',
      url: 'https://www.cairometro.gov.eg/stations',
      type: 'website' as const,
      authType: 'none' as const,
    },
    {
      priority: 2,
      name: 'Egyptian Railway Authority',
      url: 'https://www.enr.gov.eg/stations',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<TransportRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.mot.gov.eg/v1/stations', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.stations || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.mot.gov.eg/v1/stations',
          sourceName: 'Ministry of Transport API',
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
          sourceUrl: 'https://api.mot.gov.eg/v1/stations',
          sourceName: 'Ministry of Transport API',
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

  validate(record: unknown): TransportRecord {
    return TransportStationSchema.parse(record) as unknown as TransportRecord;
  }

  normalize(record: TransportRecord): Record<string, unknown> {
    return { ...record };
  }
}
