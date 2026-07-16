import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError } from '@egypt/shared-types';
import { EmergencyContactSchema, EmergencyAlertSchema } from '@egypt/shared-schemas';

interface EmergencyRecord {
  type: 'police' | 'fire' | 'ambulance' | 'civil_defense';
  nameAr: string;
  nameEn?: string;
  hotline: string;
  alternatePhone?: string;
  governorateId?: string;
  cityId?: string;
  latitude?: number;
  longitude?: number;
  isNational: boolean;
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

export class EmergencyCollector extends BaseCollector<EmergencyRecord> {
  readonly metadata = {
    id: 'emergency-collector',
    domain: 'emergency',
    sourcePriority: 1 as const,
    updateFrequency: 'weekly' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'Ministry of Interior API',
      url: 'https://api.moi.gov.eg/v1/emergency',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Civil Defense Website',
      url: 'https://www.civildefense.gov.eg/contacts',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<EmergencyRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.moi.gov.eg/v1/emergency', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.contacts || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.moi.gov.eg/v1/emergency',
          sourceName: 'Ministry of Interior API',
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
          sourceUrl: 'https://api.moi.gov.eg/v1/emergency',
          sourceName: 'Ministry of Interior API',
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

  validate(record: unknown): EmergencyRecord {
    return EmergencyContactSchema.parse(record) as unknown as EmergencyRecord;
  }

  normalize(record: EmergencyRecord): Record<string, unknown> {
    return {
      ...record,
      hotline: record.hotline.replace(/[^0-9]/g, ''),
    };
  }
}
