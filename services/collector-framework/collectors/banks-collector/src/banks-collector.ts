import { BaseCollector } from '@egypt/collector-framework';
import { CollectResult, CollectError, CollectorMetadata } from '@egypt/shared-types';
import { BankSchema } from '@egypt/shared-schemas';

interface BankRecord {
  nameAr: string;
  nameEn?: string;
  code: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  branches?: BankBranchRecord[];
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

interface BankBranchRecord {
  bankId: string;
  nameAr: string;
  nameEn?: string;
  branchCode?: string;
  governorateId: string;
  cityId: string;
  areaId?: string;
  street?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hasAtm: boolean;
  isActive: boolean;
  workingHours?: Array<{
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }>;
  services?: string[];
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

export class BanksCollector extends BaseCollector<BankRecord> {
  readonly metadata = {
    id: 'banks-collector',
    domain: 'banks',
    sourcePriority: 1 as const,
    updateFrequency: 'daily' as const,
    lastSyncAt: null,
    isActive: true,
  };

  private sources = [
    {
      priority: 1,
      name: 'Central Bank of Egypt API',
      url: 'https://api.cbe.org.eg/v1/banks',
      type: 'api' as const,
      authType: 'api_key' as const,
    },
    {
      priority: 2,
      name: 'Egyptian Banking Institute',
      url: 'https://www.ebi.gov.eg/banks',
      type: 'website' as const,
      authType: 'none' as const,
    },
  ];

  async collect(): Promise<CollectResult<BankRecord>> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.cbe.org.eg/v1/banks', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EgyptServicesPlatform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.banks || [];

      return {
        records: records.map((r: any) => this.normalize(r)),
        metadata: {
          sourceUrl: 'https://api.cbe.org.eg/v1/banks',
          sourceName: 'Central Bank of Egypt API',
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
          sourceUrl: 'https://api.cbe.org.eg/v1/banks',
          sourceName: 'Central Bank of Egypt API',
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

  validate(record: unknown): BankRecord {
    return BankSchema.parse(record) as unknown as BankRecord;
  }

  normalize(record: BankRecord): Record<string, unknown> {
    return {
      ...record,
      phone: record.phone?.replace(/^0/, '+20'),
      branches: record.branches?.map(b => ({
        ...b,
        phone: b.phone?.replace(/^0/, '+20'),
      })),
    };
  }
}
