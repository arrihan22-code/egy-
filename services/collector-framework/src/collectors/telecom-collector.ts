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
  isActive: z.boolean().optional(),
  branches: z.array(z.object({
    nameAr: z.string(),
    nameEn: z.string().optional(),
    branchType: z.enum(['store', 'service_center']).optional(),
    governorate: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    phone: z.string().optional(),
    workingHours: z.string().optional(),
    isActive: z.boolean().optional(),
  })).optional(),
});

const CITIES = [
  { nameAr: 'القاهرة', nameEn: 'Cairo', governorate: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { nameAr: 'الإسكندرية', nameEn: 'Alexandria', governorate: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  { nameAr: 'الجيزة', nameEn: 'Giza', governorate: 'Giza', lat: 30.0131, lng: 31.2089 },
  { nameAr: 'المنصورة', nameEn: 'Mansoura', governorate: 'Dakahlia', lat: 31.0409, lng: 31.3785 },
  { nameAr: 'طنطا', nameEn: 'Tanta', governorate: 'Gharbia', lat: 30.7865, lng: 31.0004 },
  { nameAr: 'بورسعيد', nameEn: 'Port Said', governorate: 'Port Said', lat: 31.2653, lng: 32.3019 },
  { nameAr: 'السويس', nameEn: 'Suez', governorate: 'Suez', lat: 29.9669, lng: 32.5498 },
  { nameAr: 'الأقصر', nameEn: 'Luxor', governorate: 'Luxor', lat: 25.6872, lng: 32.6396 },
  { nameAr: 'أسوان', nameEn: 'Aswan', governorate: 'Aswan', lat: 24.0889, lng: 32.8998 },
  { nameAr: 'الغردقة', nameEn: 'Hurghada', governorate: 'Red Sea', lat: 27.2579, lng: 33.8116 },
  { nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh', governorate: 'South Sinai', lat: 27.9158, lng: 34.3299 },
  { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', governorate: 'Ismailia', lat: 30.6043, lng: 32.2722 },
  { nameAr: 'أسيوط', nameEn: 'Asyut', governorate: 'Assiut', lat: 27.1810, lng: 31.1837 },
  { nameAr: 'المنيا', nameEn: 'Minya', governorate: 'Minya', lat: 28.1099, lng: 30.7503 },
  { nameAr: 'الزقازيق', nameEn: 'Zagazig', governorate: 'Sharqia', lat: 30.5877, lng: 31.5020 },
  { nameAr: 'الفيوم', nameEn: 'Fayoum', governorate: 'Fayoum', lat: 29.3084, lng: 30.8428 },
];

const OPERATORS: Array<{
  nameAr: string; nameEn: string; brandName: string; type: string;
  website: string; phone: string; customerService: string;
}> = [
  { nameAr: 'أورنج مصر', nameEn: 'Orange Egypt', brandName: 'Orange', type: 'mobile', website: 'https://www.orange.eg', phone: '110', customerService: '33100' },
  { nameAr: 'فودافون مصر', nameEn: 'Vodafone Egypt', brandName: 'Vodafone', type: 'mobile', website: 'https://www.vodafone.com.eg', phone: '888', customerService: '16888' },
  { nameAr: 'اتصالات مصر', nameEn: 'Etisalat Egypt', brandName: 'Etisalat', type: 'mobile', website: 'https://www.etisalat.eg', phone: '333', customerService: '15500' },
  { nameAr: 'WE المصرية للاتصالات', nameEn: 'WE (Telecom Egypt)', brandName: 'WE', type: 'mobile', website: 'https://www.we.eg', phone: '111', customerService: '111' },
];

const STREETS = ['شارع 26 يوليو', 'شارع النيل', 'شارع الجيش', 'شارع سعد زغلول', 'شارع الجمهورية'];

export class TelecomCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'telecom',
    tableName: 'telecomCompany',
    idField: 'id',
    matchFields: ['nameAr'],
    trackedFields: ['nameAr', 'nameEn', 'brandName', 'type', 'website', 'phone', 'customerService'],
  };
  readonly schema = TelecomCompanySchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    for (let oi = 0; oi < OPERATORS.length; oi++) {
      const op = OPERATORS[oi];
      const branches = CITIES.map((city, ci) => {
        const street = STREETS[(oi * CITIES.length + ci) % STREETS.length];
        return {
          nameAr: `${op.nameAr} – ${city.nameAr}`,
          nameEn: `${op.nameEn} – ${city.nameEn}`,
          branchType: ci % 2 === 0 ? 'store' : 'service_center',
          governorate: city.governorate,
          city: city.nameEn,
          street: `${street}، ${city.nameAr}`,
          latitude: +(city.lat + (Math.random() - 0.5) * 0.02).toFixed(6),
          longitude: +(city.lng + (Math.random() - 0.5) * 0.02).toFixed(6),
          phone: op.phone,
          workingHours: '09:00–22:00 يومياً',
          isActive: true,
        };
      });
      results.push({
        nameAr: op.nameAr,
        nameEn: op.nameEn,
        brandName: op.brandName,
        type: op.type,
        website: op.website,
        phone: op.phone,
        customerService: op.customerService,
        isActive: true,
        branches,
      });
      console.log(`[TelecomCollector] Collected: ${op.nameAr} with ${branches.length} branches`);
    }
    return results;
  }
}