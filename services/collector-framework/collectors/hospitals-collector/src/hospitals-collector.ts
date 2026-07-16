import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError } from '@egypt/shared-types';
import { HospitalSchema } from '@egypt/shared-schemas';

interface HospitalRecord {
  nameAr: string;
  nameEn?: string;
  type: 'hospital' | 'clinic' | 'medical_center';
  ownership: 'public' | 'private' | 'university';
  governorateId: string;
  cityId: string;
  areaId?: string;
  street?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  hasEmergency: boolean;
  bedCount?: number;
  isActive: boolean;
  departments?: Array<{
    nameAr: string;
    nameEn?: string;
    description?: string;
    floor?: string;
    phone?: string;
  }>;
  doctors?: Array<{
    nameAr: string;
    nameEn?: string;
    specialtyAr: string;
    specialtyEn?: string;
    title?: string;
    phone?: string;
    email?: string;
    consultationFee?: number;
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

export class HospitalsCollector extends BaseCollector<HospitalRecord> {
  readonly metadata = {
    id: 'hospitals-collector',
    domain: 'hospitals',
    sourcePriority: 1 as const,
    updateFrequency: 'daily' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'Ministry of Health API',
      url: 'https://api.mohp.gov.eg/v1/hospitals',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Egyptian Medical Syndicate',
      url: 'https://www.ems.org.eg/hospitals',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<HospitalRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.mohp.gov.eg/v1/hospitals', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.hospitals || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.mohp.gov.eg/v1/hospitals',
          sourceName: 'Ministry of Health API',
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
          sourceUrl: 'https://api.mohp.gov.eg/v1/hospitals',
          sourceName: 'Ministry of Health API',
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

  validate(record: unknown): HospitalRecord {
    return HospitalSchema.parse(record) as unknown as HospitalRecord;
  }

  normalize(record: HospitalRecord): Record<string, unknown> {
    return {
      ...record,
      phone: record.phone?.replace(/^0/, '+20'),
    };
  }
}
