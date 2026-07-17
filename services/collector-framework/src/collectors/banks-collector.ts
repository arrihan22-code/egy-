import { BaseSyncService, SyncConfig } from './base-sync-service';
import { BankSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';
import { ScraperUtils } from './scraper-utils';

const EGYPTIAN_BANKS = [
  {
    nameAr: 'البنك الأهلي المصري',
    nameEn: 'National Bank of Egypt',
    code: 'NBE',
    website: 'https://www.nbe.com.eg',
    phone: '19623',
    email: 'info@nbe.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.nbe.com.eg/branches',
    atmsUrl: 'https://www.nbe.com.eg/atms',
  },
  {
    nameAr: 'بنك مصر',
    nameEn: 'Banque Misr',
    code: 'BM',
    website: 'https://www.banquemisr.com',
    phone: '19888',
    email: 'info@banquemisr.com',
    type: 'commercial',
    branchesUrl: 'https://www.banquemisr.com/branches',
    atmsUrl: 'https://www.banquemisr.com/atms',
  },
  {
    nameAr: 'البنك التجاري الدولي',
    nameEn: 'Commercial International Bank',
    code: 'CIB',
    website: 'https://www.cibeg.com',
    phone: '19666',
    email: 'info@cibeg.com',
    type: 'commercial',
    branchesUrl: 'https://www.cibeg.com/branches',
    atmsUrl: 'https://www.cibeg.com/atms',
  },
  {
    nameAr: 'بنك القاهرة',
    nameEn: 'Banque du Caire',
    code: 'BDC',
    website: 'https://www.bdc.com.eg',
    phone: '19028',
    email: 'info@bdc.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.bdc.com.eg/branches',
    atmsUrl: 'https://www.bdc.com.eg/atms',
  },
  {
    nameAr: 'بنك الإسكندرية',
    nameEn: 'Bank of Alexandria',
    code: 'ALEX',
    website: 'https://www.alexbank.com',
    phone: '19033',
    email: 'info@alexbank.com',
    type: 'commercial',
    branchesUrl: 'https://www.alexbank.com/branches',
    atmsUrl: 'https://www.alexbank.com/atms',
  },
  {
    nameAr: 'بنك قطر الوطني الأهلي',
    nameEn: 'QNB Alahli',
    code: 'QNB',
    website: 'https://www.qnb.com.eg',
    phone: '19090',
    email: 'info@qnb.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.qnb.com.eg/branches',
    atmsUrl: 'https://www.qnb.com.eg/atms',
  },
  {
    nameAr: 'بنك HSBC مصر',
    nameEn: 'HSBC Egypt',
    code: 'HSBC',
    website: 'https://www.hsbc.com.eg',
    phone: '19007',
    email: 'info@hsbc.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.hsbc.com.eg/branches',
    atmsUrl: 'https://www.hsbc.com.eg/atms',
  },
  {
    nameAr: 'البنك العربي الأفريقي الدولي',
    nameEn: 'Arab African International Bank',
    code: 'AAIB',
    website: 'https://www.aaib.com',
    phone: '19011',
    email: 'info@aaib.com',
    type: 'commercial',
    branchesUrl: 'https://www.aaib.com/branches',
    atmsUrl: 'https://www.aaib.com/atms',
  },
  {
    nameAr: 'بنك أبوظبي الأول مصر',
    nameEn: 'First Abu Dhabi Bank Egypt',
    code: 'FAB',
    website: 'https://www.bankfab.com/eg',
    phone: '19077',
    email: 'info@bankfab.com',
    type: 'commercial',
    branchesUrl: 'https://www.bankfab.com/eg/branches',
    atmsUrl: 'https://www.bankfab.com/eg/atms',
  },
  {
    nameAr: 'بنك البركة مصر',
    nameEn: 'Al Baraka Bank Egypt',
    code: 'BARAKA',
    website: 'https://www.albaraka.com.eg',
    phone: '19007',
    email: 'info@albaraka.com.eg',
    type: 'islamic',
    branchesUrl: 'https://www.albaraka.com.eg/branches',
    atmsUrl: 'https://www.albaraka.com.eg/atms',
  },
  {
    nameAr: 'بنك أبو ظبي التجاري',
    nameEn: 'Abu Dhabi Commercial Bank',
    code: 'ADCB',
    website: 'https://www.adcb.com.eg',
    phone: '19077',
    email: 'info@adcb.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.adcb.com.eg/branches',
    atmsUrl: 'https://www.adcb.com.eg/atms',
  },
  {
    nameAr: 'بنك مصر إيران للتنمية',
    nameEn: 'Egypt Iran Development Bank',
    code: 'EIDB',
    website: 'https://www.eidb.eg',
    phone: '16800',
    email: 'info@eidb.eg',
    type: 'development',
    branchesUrl: 'https://www.eidb.eg/branches',
    atmsUrl: 'https://www.eidb.eg/atms',
  },
  {
    nameAr: 'المصرف المتحد',
    nameEn: 'United Bank',
    code: 'UB',
    website: 'https://www.theubk.com.eg',
    phone: '19600',
    email: 'info@theubk.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.theubk.com.eg/branches',
    atmsUrl: 'https://www.theubk.com.eg/atms',
  },
  {
    nameAr: 'بنك التعمير والإسكان',
    nameEn: 'Housing and Development Bank',
    code: 'HDB',
    website: 'https://www.hdb.com.eg',
    phone: '19670',
    email: 'info@hdb.com.eg',
    type: 'real_estate',
    branchesUrl: 'https://www.hdb.com.eg/branches',
    atmsUrl: 'https://www.hdb.com.eg/atms',
  },
  {
    nameAr: 'البنك الزراعي المصري',
    nameEn: 'Agricultural Bank of Egypt',
    code: 'ABE',
    website: 'https://www.abe.com.eg',
    phone: '19680',
    email: 'info@abe.com.eg',
    type: 'agricultural',
    branchesUrl: 'https://www.abe.com.eg/branches',
    atmsUrl: 'https://www.abe.com.eg/atms',
  },
  {
    nameAr: 'بنك الشركة المصرفية العربية الدولية',
    nameEn: 'Arab International Bank',
    code: 'AIB',
    website: 'https://www.aib.com.eg',
    phone: '19660',
    email: 'info@aib.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.aib.com.eg/branches',
    atmsUrl: 'https://www.aib.com.eg/atms',
  },
  {
    nameAr: 'بنك الاستثمار العربي',
    nameEn: 'Arab Investment Bank',
    code: 'AIBank',
    website: 'https://www.aibank.eg',
    phone: '19650',
    email: 'info@aibank.eg',
    type: 'investment',
    branchesUrl: 'https://www.aibank.eg/branches',
    atmsUrl: 'https://www.aibank.eg/atms',
  },
  {
    nameAr: 'البنك المصري الخليجي',
    nameEn: 'Egyptian Gulf Bank',
    code: 'EGB',
    website: 'https://www.egbank.com',
    phone: '19090',
    email: 'info@egbank.com',
    type: 'commercial',
    branchesUrl: 'https://www.egbank.com/branches',
    atmsUrl: 'https://www.egbank.com/atms',
  },
  {
    nameAr: 'بنك أبو ظبي الأول',
    nameEn: 'First Abu Dhabi Bank',
    code: 'FAB_MISR',
    website: 'https://www.bankfab.com/eg',
    phone: '19077',
    email: 'info@bankfab.com',
    type: 'commercial',
    branchesUrl: 'https://www.bankfab.com/eg/branches',
    atmsUrl: 'https://www.bankfab.com/eg/atms',
  },
  {
    nameAr: 'بنك الكويت الوطني',
    nameEn: 'National Bank of Kuwait - Egypt',
    code: 'NBK',
    website: 'https://www.nbkegypt.com',
    phone: '19033',
    email: 'info@nbkegypt.com',
    type: 'commercial',
    branchesUrl: 'https://www.nbkegypt.com/branches',
    atmsUrl: 'https://www.nbkegypt.com/atms',
  },
  {
    nameAr: 'بنك المشرق',
    nameEn: 'Mashreq Egypt',
    code: 'MASHREQ',
    website: 'https://www.mashreq.com/eg',
    phone: '19031',
    email: 'info@mashreq.com',
    type: 'commercial',
    branchesUrl: 'https://www.mashreq.com/eg/branches',
    atmsUrl: 'https://www.mashreq.com/eg/atms',
  },
  {
    nameAr: 'بنك كريدي أجريكول مصر',
    nameEn: 'Credit Agricole Egypt',
    code: 'CAE',
    website: 'https://www.creditagricole.com.eg',
    phone: '19019',
    email: 'info@creditagricole.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.creditagricole.com.eg/branches',
    atmsUrl: 'https://www.creditagricole.com.eg/atms',
  },
  {
    nameAr: 'بنك saib',
    nameEn: 'SAIB Bank',
    code: 'SAIB',
    website: 'https://www.saib.com.eg',
    phone: '19600',
    email: 'info@saib.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.saib.com.eg/branches',
    atmsUrl: 'https://www.saib.com.eg/atms',
  },
  {
    nameAr: 'بنك المصرف العربي الدولي',
    nameEn: 'Arab International Bank',
    code: 'AIB_EG',
    website: 'https://www.aib.eg',
    phone: '19660',
    email: 'info@aib.eg',
    type: 'commercial',
    branchesUrl: 'https://www.aib.eg/branches',
    atmsUrl: 'https://www.aib.eg/atms',
  },
  {
    nameAr: 'بنك الاستثمار القومي',
    nameEn: 'National Investment Bank',
    code: 'NIB',
    website: 'https://www.nib.gov.eg',
    phone: '19680',
    email: 'info@nib.gov.eg',
    type: 'investment',
    branchesUrl: 'https://www.nib.gov.eg/branches',
    atmsUrl: 'https://www.nib.gov.eg/atms',
  },
  {
    nameAr: 'بنك التنمية الصناعية',
    nameEn: 'Industrial Development Bank',
    code: 'IDB',
    website: 'https://www.idb.eg',
    phone: '19670',
    email: 'info@idb.eg',
    type: 'development',
    branchesUrl: 'https://www.idb.eg/branches',
    atmsUrl: 'https://www.idb.eg/atms',
  },
  {
    nameAr: 'بنك التنمية والائتمان الزراعي',
    nameEn: 'Principal Bank for Development and Agricultural Credit',
    code: 'PBDAC',
    website: 'https://www.pbdac.eg',
    phone: '19680',
    email: 'info@pbdac.eg',
    type: 'agricultural',
    branchesUrl: 'https://www.pbdac.eg/branches',
    atmsUrl: 'https://www.pbdac.eg/atms',
  },
  {
    nameAr: 'بنك سوسيتيه جنرال',
    nameEn: 'Societe Generale Egypt',
    code: 'SG',
    website: 'https://www.societegenerale.com.eg',
    phone: '19033',
    email: 'info@societegenerale.com.eg',
    type: 'commercial',
    branchesUrl: 'https://www.societegenerale.com.eg/branches',
    atmsUrl: 'https://www.societegenerale.com.eg/atms',
  },
];

const EGYPT_GOVERNORATES: Record<string, { nameAr: string; nameEn: string; lat: number; lng: number }> = {
  'Cairo': { nameAr: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lng: 31.2357 },
  'Giza': { nameAr: 'الجيزة', nameEn: 'Giza', lat: 30.0131, lng: 31.2089 },
  'Alexandria': { nameAr: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  'Dakahlia': { nameAr: 'الدقهلية', nameEn: 'Dakahlia', lat: 31.0413, lng: 31.3809 },
  'Sharqia': { nameAr: 'الشرقية', nameEn: 'Sharqia', lat: 30.6183, lng: 31.7241 },
  'Qalyubia': { nameAr: 'القليوبية', nameEn: 'Qalyubia', lat: 30.3292, lng: 31.2168 },
  'Gharbia': { nameAr: 'الغربية', nameEn: 'Gharbia', lat: 30.8754, lng: 31.0409 },
  'Monufia': { nameAr: 'المنوفية', nameEn: 'Monufia', lat: 30.4602, lng: 30.9350 },
  'Beheira': { nameAr: 'البحيرة', nameEn: 'Beheira', lat: 30.8481, lng: 30.6056 },
  'Port Said': { nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lng: 32.3019 },
  'Ismailia': { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', lat: 30.6043, lng: 32.2723 },
  'Suez': { nameAr: 'السويس', nameEn: 'Suez', lat: 29.9668, lng: 32.5498 },
  'Damietta': { nameAr: 'دمياط', nameEn: 'Damietta', lat: 31.4165, lng: 31.8133 },
  'Luxor': { nameAr: 'الأقصر', nameEn: 'Luxor', lat: 25.6872, lng: 32.6396 },
  'Aswan': { nameAr: 'أسوان', nameEn: 'Aswan', lat: 24.0889, lng: 32.8998 },
  'Minya': { nameAr: 'المنيا', nameEn: 'Minya', lat: 28.1099, lng: 30.7503 },
  'Sohag': { nameAr: 'سوهاج', nameEn: 'Sohag', lat: 26.5569, lng: 31.6948 },
  'Assiut': { nameAr: 'أسيوط', nameEn: 'Assiut', lat: 27.1809, lng: 31.1837 },
  'Beni Suef': { nameAr: 'بني سويف', nameEn: 'Beni Suef', lat: 29.0744, lng: 31.0978 },
  'Fayoum': { nameAr: 'الفيوم', nameEn: 'Fayoum', lat: 29.3084, lng: 30.8428 },
  'Qena': { nameAr: 'قنا', nameEn: 'Qena', lat: 26.1640, lng: 32.7268 },
  'Red Sea': { nameAr: 'البحر الأحمر', nameEn: 'Red Sea', lat: 27.2574, lng: 33.8116 },
  'New Valley': { nameAr: 'الوادي الجديد', nameEn: 'New Valley', lat: 24.5456, lng: 27.1731 },
  'Matrouh': { nameAr: 'مطروح', nameEn: 'Matrouh', lat: 31.3528, lng: 27.2373 },
  'North Sinai': { nameAr: 'شمال سيناء', nameEn: 'North Sinai', lat: 30.9995, lng: 33.5904 },
  'South Sinai': { nameAr: 'جنوب سيناء', nameEn: 'South Sinai', lat: 29.0000, lng: 33.5000 },
  'Kafr El Sheikh': { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', lat: 31.1110, lng: 30.9386 },
  'Helwan': { nameAr: 'حلوان', nameEn: 'Helwan', lat: 29.8414, lng: 31.3342 },
  '6th of October': { nameAr: '6 أكتوبر', nameEn: '6th of October', lat: 29.9369, lng: 30.9167 },
};

const EGYPTIAN_CITIES: Record<string, { nameAr: string; nameEn: string; governorate: string; lat: number; lng: number }> = {
  'Cairo': { nameAr: 'القاهرة', nameEn: 'Cairo', governorate: 'Cairo', lat: 30.0444, lng: 31.2357 },
  'Giza': { nameAr: 'الجيزة', nameEn: 'Giza', governorate: 'Giza', lat: 30.0131, lng: 31.2089 },
  'Alexandria': { nameAr: 'الإسكندرية', nameEn: 'Alexandria', governorate: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  'Shubra El Kheima': { nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima', governorate: 'Qalyubia', lat: 30.1286, lng: 31.2422 },
  'Helwan': { nameAr: 'حلوان', nameEn: 'Helwan', governorate: 'Cairo', lat: 29.8414, lng: 31.3342 },
  'Mansoura': { nameAr: 'المنصورة', nameEn: 'Mansoura', governorate: 'Dakahlia', lat: 31.0409, lng: 31.3809 },
  'Tanta': { nameAr: 'طنطا', nameEn: 'Tanta', governorate: 'Gharbia', lat: 30.7865, lng: 31.0001 },
  'Zagazig': { nameAr: 'الزقازيق', nameEn: 'Zagazig', governorate: 'Sharqia', lat: 30.5877, lng: 31.5020 },
  'Port Said': { nameAr: 'بورسعيد', nameEn: 'Port Said', governorate: 'Port Said', lat: 31.2653, lng: 32.3019 },
  'Suez': { nameAr: 'السويس', nameEn: 'Suez', governorate: 'Suez', lat: 29.9668, lng: 32.5498 },
  'Luxor': { nameAr: 'الأقصر', nameEn: 'Luxor', governorate: 'Luxor', lat: 25.6872, lng: 32.6396 },
  'Aswan': { nameAr: 'أسوان', nameEn: 'Aswan', governorate: 'Aswan', lat: 24.0889, lng: 32.8998 },
  'Benha': { nameAr: 'بنها', nameEn: 'Benha', governorate: 'Qalyubia', lat: 30.4602, lng: 31.1840 },
  'Mersa Matruh': { nameAr: 'مرسى مطروح', nameEn: 'Mersa Matruh', governorate: 'Matrouh', lat: 31.3528, lng: 27.2373 },
};

export class BanksCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'banks',
    tableName: 'bank',
    idField: 'id',
    matchFields: ['code'],
    trackedFields: ['nameAr', 'nameEn', 'website', 'phone', 'email'],
  };
  readonly schema = BankSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    const errors: string[] = [];

    for (const bank of EGYPTIAN_BANKS) {
      try {
        const record = {
          nameAr: bank.nameAr,
          nameEn: bank.nameEn,
          code: bank.code,
          website: bank.website,
          phone: bank.phone,
          email: bank.email,
          type: bank.type,
          isActive: true,
          branches: await this.scrapeBankBranches(bank),
          atms: await this.scrapeBankAtms(bank),
        };
        results.push(record);
        console.log(`[BanksCollector] Collected: ${bank.nameAr} (${bank.code})`);
      } catch (error: any) {
        errors.push(`Failed to collect ${bank.nameAr}: ${error.message}`);
        console.error(`[BanksCollector] Error collecting ${bank.nameAr}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`[BanksCollector] ${errors.length} errors during collection`);
    }

    return results;
  }

  private async scrapeBankBranches(bank: typeof EGYPTIAN_BANKS[0]): Promise<any[]> {
    const branches: any[] = [];
    try {
      const html = await ScraperUtils.rateLimitedFetch(bank.branchesUrl).then(r => r.text());
      const branchElements = ScraperUtils.extractAllBetween(html, '<div class="branch', '</div>');
      for (const el of branchElements.slice(0, 20)) {
        const nameAr = ScraperUtils.extractNameFromHtml(el, 'ar');
        const nameEn = ScraperUtils.extractNameFromHtml(el, 'en');
        const address = ScraperUtils.extractAddressFromHtml(el);
        const phone = ScraperUtils.extractPhoneFromHtml(el);
        const coords = ScraperUtils.extractCoordinates(el);
        const governorate = ScraperUtils.extractGovernorateFromHtml(el);
        const city = ScraperUtils.extractCityFromHtml(el);
        const workingHours = ScraperUtils.extractWorkingHoursFromHtml(el);
        const services = ScraperUtils.extractServicesFromHtml(el);

        if (nameAr || address) {
          branches.push({
            nameAr: nameAr || `فرع ${bank.nameAr} - ${city || governorate || 'غير محدد'}`,
            nameEn: nameEn || `${bank.nameEn} Branch`,
            governorate,
            city,
            street: address,
            phone,
            latitude: coords?.lat || EGYPT_GOVERNORATES[governorate]?.lat || 30.0444,
            longitude: coords?.lng || EGYPT_GOVERNORATES[governorate]?.lng || 31.2357,
            hasAtm: true,
            isActive: true,
            workingHours: workingHours || '8:00 AM - 4:00 PM',
            services: services,
          });
        }
      }
    } catch (error: any) {
      console.warn(`[BanksCollector] Could not scrape branches for ${bank.nameAr}: ${error.message}`);
    }
    return branches;
  }

  private async scrapeBankAtms(bank: typeof EGYPTIAN_BANKS[0]): Promise<any[]> {
    const atms: any[] = [];
    try {
      const html = await ScraperUtils.rateLimitedFetch(bank.atmsUrl).then(r => r.text());
      const atmElements = ScraperUtils.extractAllBetween(html, '<div class="atm', '</div>');
      for (const el of atmElements.slice(0, 30)) {
        const nameAr = ScraperUtils.extractNameFromHtml(el, 'ar');
        const address = ScraperUtils.extractAddressFromHtml(el);
        const coords = ScraperUtils.extractCoordinates(el);
        const governorate = ScraperUtils.extractGovernorateFromHtml(el);
        const city = ScraperUtils.extractCityFromHtml(el);

        if (address) {
          atms.push({
            nameAr: nameAr || `صراف آلي ${bank.nameAr} - ${city || governorate || 'غير محدد'}`,
            nameEn: `${bank.nameEn} ATM`,
            type: 'atm',
            governorate,
            city,
            street: address,
            latitude: coords?.lat || EGYPT_GOVERNORATES[governorate]?.lat || 30.0444,
            longitude: coords?.lng || EGYPT_GOVERNORATES[governorate]?.lng || 31.2357,
            is24h: true,
            hasDeposit: true,
            isActive: true,
          });
        }
      }
    } catch (error: any) {
      console.warn(`[BanksCollector] Could not scrape ATMs for ${bank.nameAr}: ${error.message}`);
    }
    return atms;
  }
}