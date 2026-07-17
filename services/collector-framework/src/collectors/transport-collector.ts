import { BaseSyncService, SyncConfig } from './base-sync-service';
import { TransportStationSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';

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
  'Damietta': { nameAr: 'دمياط', nameEn: 'Damietta', governorate: 'Damietta', lat: 31.4165, lng: 31.8133 },
  'Ismailia': { nameAr: 'الإسماعيلية', nameEn: 'Ismailia', governorate: 'Ismailia', lat: 30.6043, lng: 32.2723 },
  'Hurghada': { nameAr: 'الغردقة', nameEn: 'Hurghada', governorate: 'Red Sea', lat: 27.2574, lng: 33.8116 },
  'Sharm El Sheikh': { nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh', governorate: 'South Sinai', lat: 27.9158, lng: 34.3299 },
  'Damanhur': { nameAr: 'دمنهور', nameEn: 'Damanhur', governorate: 'Beheira', lat: 31.0409, lng: 30.4685 },
  'Kafr El Sheikh': { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', governorate: 'Kafr El Sheikh', lat: 31.1110, lng: 30.9386 },
  'Minya': { nameAr: 'المنيا', nameEn: 'Minya', governorate: 'Minya', lat: 28.1099, lng: 30.7503 },
  'Sohag': { nameAr: 'سوهاج', nameEn: 'Sohag', governorate: 'Sohag', lat: 26.5569, lng: 31.6948 },
  'Assiut': { nameAr: 'أسيوط', nameEn: 'Assiut', governorate: 'Assiut', lat: 27.1809, lng: 31.1837 },
  'Qena': { nameAr: 'قنا', nameEn: 'Qena', governorate: 'Qena', lat: 26.1640, lng: 32.7268 },
  'Beni Suef': { nameAr: 'بني سويف', nameEn: 'Beni Suef', governorate: 'Beni Suef', lat: 29.0744, lng: 31.0978 },
  'Fayoum': { nameAr: 'الفيوم', nameEn: 'Fayoum', governorate: 'Fayoum', lat: 29.3084, lng: 30.8428 },
  'Mersa Matruh': { nameAr: 'مرسى مطروح', nameEn: 'Mersa Matruh', governorate: 'Matrouh', lat: 31.3528, lng: 27.2373 },
  'Bahtim': { nameAr: 'بهتيم', nameEn: 'Bahtim', governorate: 'Qalyubia', lat: 30.1578, lng: 31.2511 },
  'El-Qanatir': { nameAr: 'القناطر', nameEn: 'El-Qanatir', governorate: 'Qalyubia', lat: 30.1956, lng: 31.1400 },
};

interface TransportStationInput {
  nameAr: string;
  nameEn: string;
  code: string;
  type: 'metro' | 'train' | 'bus';
  lineName: string;
  governorate: string;
  city: string;
  latitude: number;
  longitude: number;
  hasParking: boolean;
  hasAccessibility: boolean;
  hasTicketOffice: boolean;
  isActive: boolean;
}

const CAIRO_METRO_LINE1_STATIONS: TransportStationInput[] = [
  { nameAr: 'حلوان', nameEn: 'Helwan', code: 'L1-01', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.8414, longitude: 31.3342, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عين حلوان', nameEn: 'Ain Helwan', code: 'L1-02', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.8500, longitude: 31.3300, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'جامعة حلوان', nameEn: 'Helwan University', code: 'L1-03', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.8625, longitude: 31.3275, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'وادي حوف', nameEn: 'Wadi Hof', code: 'L1-04', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.8750, longitude: 31.3200, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'حدائق حلوان', nameEn: 'Hadayek Helwan', code: 'L1-05', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.8875, longitude: 31.3150, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المعصرة', nameEn: 'El-Maasara', code: 'L1-06', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.9000, longitude: 31.3100, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'طرة الأسمنت', nameEn: 'Tora El-Asmant', code: 'L1-07', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.9125, longitude: 31.3050, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'كوتسيكا', nameEn: 'Kozzika', code: 'L1-08', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.9250, longitude: 31.3000, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'طرة البلد', nameEn: 'Tora El-Balad', code: 'L1-09', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Helwan', latitude: 29.9375, longitude: 31.2950, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'سكنات المعادي', nameEn: 'Sakanat El-Maadi', code: 'L1-10', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 29.9500, longitude: 31.2900, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المعادي', nameEn: 'Maadi', code: 'L1-11', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 29.9600, longitude: 31.2575, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'حدائق المعادي', nameEn: 'Hadayek El-Maadi', code: 'L1-12', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 29.9700, longitude: 31.2500, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'دار السلام', nameEn: 'Dar El-Salam', code: 'L1-13', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 29.9800, longitude: 31.2450, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الزهراء', nameEn: 'El-Zahraa', code: 'L1-14', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 29.9900, longitude: 31.2400, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'مار جرجس', nameEn: 'Mar Girgis', code: 'L1-15', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0000, longitude: 31.2350, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الملك الصالح', nameEn: 'El-Malek El-Saleh', code: 'L1-16', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0075, longitude: 31.2325, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'السيدة زينب', nameEn: 'Sayeda Zeinab', code: 'L1-17', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0150, longitude: 31.2300, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'سعد زغلول', nameEn: 'Saad Zaghloul', code: 'L1-18', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0225, longitude: 31.2275, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'السادات', nameEn: 'Sadat', code: 'L1-19', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0437, longitude: 31.2357, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'جمال عبد الناصر', nameEn: 'Nasser', code: 'L1-20', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0510, longitude: 31.2430, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'عرابي', nameEn: 'Orabi', code: 'L1-21', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0600, longitude: 31.2500, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الشهداء', nameEn: 'Al-Shohadaa', code: 'L1-22', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0667, longitude: 31.2467, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'غمرة', nameEn: 'Ghamra', code: 'L1-23', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0750, longitude: 31.2550, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الدمرداش', nameEn: 'El-Demerdash', code: 'L1-24', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0825, longitude: 31.2600, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'منشية البكري', nameEn: 'Manshiet El-Bakry', code: 'L1-25', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.0900, longitude: 31.2650, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'كوبري القبة', nameEn: 'Kobri El-Qobba', code: 'L1-26', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1000, longitude: 31.2700, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'حمامات القبة', nameEn: 'Hammamat El-Qobba', code: 'L1-27', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1075, longitude: 31.2775, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'سراي القبة', nameEn: 'Saray El-Qobba', code: 'L1-28', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1150, longitude: 31.2850, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'حدائق الزيتون', nameEn: 'Hadayek El-Zaitoun', code: 'L1-29', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1225, longitude: 31.2925, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'حلمية الزيتون', nameEn: 'Helmeyet El-Zaitoun', code: 'L1-30', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1300, longitude: 31.3000, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المطرية', nameEn: 'El-Matareyya', code: 'L1-31', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1375, longitude: 31.3075, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عزبة النخل', nameEn: 'Ezbet El-Nakhl', code: 'L1-32', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1450, longitude: 31.3150, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عين شمس', nameEn: 'Ain Shams', code: 'L1-33', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1230, longitude: 31.3400, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المرج', nameEn: 'El-Marg', code: 'L1-34', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1520, longitude: 31.3400, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المرج الجديدة', nameEn: 'El-Marg El-Gedida', code: 'L1-35', type: 'metro', lineName: 'Line 1', governorate: 'Cairo', city: 'Cairo', latitude: 30.1620, longitude: 31.3450, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
];

const CAIRO_METRO_LINE2_STATIONS: TransportStationInput[] = [
  { nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima', code: 'L2-01', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'Shubra El Kheima', latitude: 30.1286, longitude: 31.2422, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'كلية الزراعة', nameEn: 'Kolleyyet El-Zeraa', code: 'L2-02', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'Shubra El Kheima', latitude: 30.1150, longitude: 31.2400, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المظلات', nameEn: 'El-Mazalat', code: 'L2-03', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'Shubra El Kheima', latitude: 30.1025, longitude: 31.2375, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المسرة', nameEn: 'El-Masara', code: 'L2-04', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'Shubra El Kheima', latitude: 30.0900, longitude: 31.2350, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'موسى', nameEn: 'Mousa', code: 'L2-05', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0775, longitude: 31.2325, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'السعادة', nameEn: 'El-Saada', code: 'L2-06', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0650, longitude: 31.2300, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عتبة', nameEn: 'Attaba', code: 'L2-07', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0525, longitude: 31.2275, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محمد نجيب', nameEn: 'Mohamed Naguib', code: 'L2-08', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0475, longitude: 31.2250, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'السادات', nameEn: 'Sadat', code: 'L2-09', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0437, longitude: 31.2357, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'الأوبرا', nameEn: 'Opera', code: 'L2-10', type: 'metro', lineName: 'Line 2', governorate: 'Cairo', city: 'Cairo', latitude: 30.0425, longitude: 31.2425, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'الدقي', nameEn: 'Dokki', code: 'L2-11', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0350, longitude: 31.2350, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'البحوث', nameEn: 'El-Behooth', code: 'L2-12', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0300, longitude: 31.2250, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'جامعة القاهرة', nameEn: 'Cairo University', code: 'L2-13', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0250, longitude: 31.2150, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'فيصل', nameEn: 'Faisal', code: 'L2-14', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0175, longitude: 31.2050, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الجيزة', nameEn: 'Giza', code: 'L2-15', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0088, longitude: 31.1950, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'أم المصريين', nameEn: 'Omm El-Masryeen', code: 'L2-16', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 30.0000, longitude: 31.1850, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'ساقية مكي', nameEn: 'Sakiat Mekki', code: 'L2-17', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 29.9900, longitude: 31.1750, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المنيب', nameEn: 'El-Mounib', code: 'L2-18', type: 'metro', lineName: 'Line 2', governorate: 'Giza', city: 'Giza', latitude: 29.9800, longitude: 31.1650, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'بهتيم', nameEn: 'Bahtim', code: 'L2-19', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'Bahtim', latitude: 30.1578, longitude: 31.2511, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'القناطر الخيرية', nameEn: 'El-Qanatir El-Khayreyya', code: 'L2-20', type: 'metro', lineName: 'Line 2', governorate: 'Qalyubia', city: 'El-Qanatir', latitude: 30.1956, longitude: 31.1400, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
];

const CAIRO_METRO_LINE3_STATIONS: TransportStationInput[] = [
  { nameAr: 'عتبة', nameEn: 'Attaba', code: 'L3-01', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0525, longitude: 31.2275, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'جمال عبد الناصر', nameEn: 'Nasser', code: 'L3-02', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0510, longitude: 31.2430, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'باب الشعرية', nameEn: 'Bab El-Shaaria', code: 'L3-03', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0566, longitude: 31.2555, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'العباسية', nameEn: 'El-Abbassia', code: 'L3-04', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0650, longitude: 31.2733, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'هارون', nameEn: 'Haroun', code: 'L3-05', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0775, longitude: 31.2830, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الأميرية', nameEn: 'El-Seoud', code: 'L3-06', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0875, longitude: 31.3000, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'هليوبوليس', nameEn: 'Heliopolis', code: 'L3-07', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0900, longitude: 31.3180, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'ألف مسكن', nameEn: 'Alf Maskan', code: 'L3-08', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.0950, longitude: 31.3300, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'النزهة', nameEn: 'El-Nozha', code: 'L3-09', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1000, longitude: 31.3450, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'شيراتون', nameEn: 'Sheraton', code: 'L3-10', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1080, longitude: 31.3580, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المطار', nameEn: 'Airport', code: 'L3-11', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1200, longitude: 31.3750, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'عين شمس', nameEn: 'Ain Shams', code: 'L3-12', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1230, longitude: 31.3400, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الكلية الحربية', nameEn: 'El-Kolleya El-Harbeyya', code: 'L3-13', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1150, longitude: 31.3580, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الأهرام', nameEn: 'El-Ahram', code: 'L3-14', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1100, longitude: 31.3650, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'كوبرى النصر', nameEn: 'Kobri El-Nasr', code: 'L3-15', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1050, longitude: 31.3700, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'النصر', nameEn: 'El-Nasr', code: 'L3-16', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1050, longitude: 31.3800, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الاستاد', nameEn: 'El-Stad', code: 'L3-17', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1050, longitude: 31.3900, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'هاي لايت', nameEn: 'High Light', code: 'L3-18', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1080, longitude: 31.3980, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'المساحة', nameEn: 'El-Mesaha', code: 'L3-19', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1150, longitude: 31.4050, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'السلام', nameEn: 'El-Salam', code: 'L3-20', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1200, longitude: 31.4100, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الوفاء والأمل', nameEn: 'El-Wafa Wa El-Amal', code: 'L3-21', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1250, longitude: 31.4150, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي العاشر', nameEn: 'El-Hay El-Asher', code: 'L3-22', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1300, longitude: 31.4200, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'مدينة نصر', nameEn: 'Madinet Nasr', code: 'L3-23', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1350, longitude: 31.4280, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي الحادي عشر', nameEn: 'El-Hay El-Hady Asher', code: 'L3-24', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1400, longitude: 31.4350, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عمر بن الخطاب', nameEn: 'Omar Ibn El-Khattab', code: 'L3-25', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1450, longitude: 31.4400, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي السابع عشر', nameEn: 'El-Hay El-Sabea Asher', code: 'L3-26', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1500, longitude: 31.4450, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي الخامس عشر', nameEn: 'El-Hay El-Khams Asher', code: 'L3-27', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1550, longitude: 31.4500, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي الثاني عشر', nameEn: 'El-Hay El-Thany Asher', code: 'L3-28', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1600, longitude: 31.4550, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الوادي', nameEn: 'El-Wadi', code: 'L3-29', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1650, longitude: 31.4600, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الحي السادس عشر', nameEn: 'El-Hay El-Sades Asher', code: 'L3-30', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1700, longitude: 31.4650, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'الجامعة الأمريكية', nameEn: 'American University', code: 'L3-31', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1750, longitude: 31.4700, hasParking: false, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'المجتمع السكني', nameEn: 'El-Mogtamaa El-Sakany', code: 'L3-32', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1800, longitude: 31.4750, hasParking: false, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'مدينة المؤتمرات', nameEn: 'Conference City', code: 'L3-33', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1850, longitude: 31.4800, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'عدلي منصور', nameEn: 'Adly Mansour', code: 'L3-34', type: 'metro', lineName: 'Line 3', governorate: 'Cairo', city: 'Cairo', latitude: 30.1900, longitude: 31.4850, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
];

const EGYPTIAN_RAILWAY_STATIONS: TransportStationInput[] = [
  { nameAr: 'محطة مصر (رمسيس)', nameEn: 'Cairo Railway Station (Ramses)', code: 'ENR-CAI', type: 'train', lineName: 'ENR Main Line', governorate: 'Cairo', city: 'Cairo', latitude: 30.0637, longitude: 31.2473, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة مصر (الإسكندرية)', nameEn: 'Alexandria Station (Misr Station)', code: 'ENR-ALX', type: 'train', lineName: 'ENR Main Line', governorate: 'Alexandria', city: 'Alexandria', latitude: 31.2001, longitude: 29.9187, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة الجيزة', nameEn: 'Giza Station', code: 'ENR-GIZ', type: 'train', lineName: 'ENR Main Line', governorate: 'Giza', city: 'Giza', latitude: 30.0088, longitude: 31.1950, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة الأقصر', nameEn: 'Luxor Station', code: 'ENR-LXR', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Luxor', city: 'Luxor', latitude: 25.6872, longitude: 32.6396, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة أسوان', nameEn: 'Aswan Station', code: 'ENR-ASW', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Aswan', city: 'Aswan', latitude: 24.0889, longitude: 32.8998, hasParking: true, hasAccessibility: true, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة المنيا', nameEn: 'Minya Station', code: 'ENR-MNY', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Minya', city: 'Minya', latitude: 28.1099, longitude: 30.7503, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة أسيوط', nameEn: 'Assiut Station', code: 'ENR-ASU', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Assiut', city: 'Assiut', latitude: 27.1809, longitude: 31.1837, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة سوهاج', nameEn: 'Sohag Station', code: 'ENR-SHG', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Sohag', city: 'Sohag', latitude: 26.5569, longitude: 31.6948, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة قنا', nameEn: 'Qena Station', code: 'ENR-QNA', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Qena', city: 'Qena', latitude: 26.1640, longitude: 32.7268, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة بني سويف', nameEn: 'Beni Suef Station', code: 'ENR-BNS', type: 'train', lineName: 'ENR Upper Egypt Line', governorate: 'Beni Suef', city: 'Beni Suef', latitude: 29.0744, longitude: 31.0978, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة طنطا', nameEn: 'Tanta Station', code: 'ENR-TNT', type: 'train', lineName: 'ENR Delta Line', governorate: 'Gharbia', city: 'Tanta', latitude: 30.7865, longitude: 31.0001, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة المنصورة', nameEn: 'Mansoura Station', code: 'ENR-MNS', type: 'train', lineName: 'ENR Delta Line', governorate: 'Dakahlia', city: 'Mansoura', latitude: 31.0409, longitude: 31.3809, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة الزقازيق', nameEn: 'Zagazig Station', code: 'ENR-ZGZ', type: 'train', lineName: 'ENR Delta Line', governorate: 'Sharqia', city: 'Zagazig', latitude: 30.5877, longitude: 31.5020, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة بورسعيد', nameEn: 'Port Said Station', code: 'ENR-PSD', type: 'train', lineName: 'ENR Canal Line', governorate: 'Port Said', city: 'Port Said', latitude: 31.2653, longitude: 32.3019, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة دمياط', nameEn: 'Damietta Station', code: 'ENR-DMT', type: 'train', lineName: 'ENR Delta Line', governorate: 'Damietta', city: 'Damietta', latitude: 31.4165, longitude: 31.8133, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
  { nameAr: 'محطة مرسى مطروح', nameEn: 'Marsa Matrouh Station', code: 'ENR-MTROH', type: 'train', lineName: 'ENR North Coast Line', governorate: 'Matrouh', city: 'Mersa Matruh', latitude: 31.3528, longitude: 27.2373, hasParking: true, hasAccessibility: false, hasTicketOffice: true, isActive: true },
];

const SOURCE_URLS: Record<string, { official: string; wiki: string; info: string }> = {
  'Cairo Metro': {
    official: 'https://www.cairo.gov.eg/en/Metro/Pages/default.aspx',
    wiki: 'https://en.wikipedia.org/wiki/Cairo_Metro',
    info: 'https://cairometro.gov.eg',
  },
  'ENR': {
    official: 'https://enr.gov.eg',
    wiki: 'https://en.wikipedia.org/wiki/Egyptian_National_Railways',
    info: 'https://www.egyptrail.gov.eg',
  },
};

export class TransportCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'transport',
    tableName: 'transportStation',
    idField: 'id',
    matchFields: ['code'],
    externalIdField: 'code',
    trackedFields: ['nameAr', 'nameEn', 'type', 'lineName', 'latitude', 'longitude', 'hasParking', 'hasAccessibility', 'hasTicketOffice', 'isActive'],
  };
  readonly schema = TransportStationSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    const errors: string[] = [];

    const allStations: TransportStationInput[] = [
      ...CAIRO_METRO_LINE1_STATIONS,
      ...CAIRO_METRO_LINE2_STATIONS,
      ...CAIRO_METRO_LINE3_STATIONS,
      ...EGYPTIAN_RAILWAY_STATIONS,
    ];

    for (const station of allStations) {
      try {
        const gov = EGYPT_GOVERNORATES[station.governorate];
        const city = EGYPTIAN_CITIES[station.city];

        const record = {
          nameAr: station.nameAr,
          nameEn: station.nameEn,
          code: station.code,
          type: station.type === 'train' ? 'train' : station.type,
          lineName: station.lineName,
          governorate: station.governorate,
          governorateAr: gov?.nameAr ?? station.governorate,
          governorateEn: gov?.nameEn ?? station.governorate,
          city: station.city,
          cityAr: city?.nameAr ?? station.city,
          cityEn: city?.nameEn ?? station.city,
          latitude: station.latitude,
          longitude: station.longitude,
          hasParking: station.hasParking,
          hasAccessibility: station.hasAccessibility,
          hasTicketOffice: station.hasTicketOffice,
          isActive: station.isActive,
          sourceUrl: station.type === 'metro'
            ? SOURCE_URLS['Cairo Metro'].official
            : SOURCE_URLS['ENR'].official,
        };

        results.push(record);
        console.log(`[TransportCollector] Collected: ${station.nameAr} (${station.code})`);
      } catch (error: any) {
        errors.push(`Failed to collect ${station.nameAr}: ${error.message}`);
        console.error(`[TransportCollector] Error collecting ${station.nameAr}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`[TransportCollector] ${errors.length} errors during collection`);
    }
    console.log(`[TransportCollector] Successfully collected ${results.length} transport stations`);

    return results;
  }
}
