export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceMetadata {
  sourceUrl: string;
  sourceName: string;
  sourcePriority: number;
  lastUpdatedAt: Date | null;
  importedAt: Date;
  validationStatus: 'valid' | 'invalid' | 'pending';
  dataVersion: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  governorateId: string;
  cityId: string;
  areaId?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  latitude?: number;
  longitude?: number;
}

export interface WorkingHours {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
  is24h?: boolean;
}

export interface Contact {
  type: 'phone' | 'whatsapp' | 'email' | 'fax' | 'website';
  value: string;
  isPrimary: boolean;
}

export interface Bank {
  id: string;
  nameAr: string;
  nameEn?: string;
  code: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  branches?: BankBranch[];
  sourceMetadata: SourceMetadata;
}

export interface BankBranch {
  id: string;
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
  workingHours?: WorkingHours[];
  services?: string[];
  sourceMetadata: SourceMetadata;
}

export interface Pharmacy {
  id: string;
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
  workingHours?: WorkingHours[];
  contacts?: Contact[];
  sourceMetadata: SourceMetadata;
}

export interface Hospital {
  id: string;
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
  departments?: HospitalDepartment[];
  doctors?: Doctor[];
  sourceMetadata: SourceMetadata;
}

export interface HospitalDepartment {
  id: string;
  hospitalId: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  floor?: string;
  phone?: string;
}

export interface Doctor {
  id: string;
  hospitalId: string;
  departmentId?: string;
  nameAr: string;
  nameEn?: string;
  specialtyAr: string;
  specialtyEn?: string;
  title?: string;
  phone?: string;
  email?: string;
  consultationFee?: number;
  isActive: boolean;
}

export interface GovernmentOffice {
  id: string;
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
  services?: GovernmentService[];
  sourceMetadata: SourceMetadata;
}

export interface GovernmentService {
  id: string;
  officeId: string;
  serviceNameAr: string;
  serviceNameEn?: string;
  description?: string;
  fee?: number;
  processingTime?: string;
  requiredDocs?: string[];
  isOnline: boolean;
  isActive: boolean;
}

export interface TransportStation {
  id: string;
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
  sourceMetadata: SourceMetadata;
}

export interface TransportRoute {
  id: string;
  type: 'metro' | 'train' | 'bus';
  nameAr: string;
  nameEn?: string;
  fromStationId: string;
  toStationId: string;
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
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
  sourceMetadata: SourceMetadata;
}

export interface EmergencyAlert {
  id: string;
  titleAr: string;
  titleEn?: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affectedAreas: string[];
  isActive: boolean;
  expiresAt?: Date;
  sourceMetadata: SourceMetadata;
}

export interface WorkingHours {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
  is24h?: boolean;
}

export interface Contact {
  type: 'phone' | 'whatsapp' | 'email' | 'fax' | 'website';
  value: string;
  isPrimary: boolean;
}

export interface SourceMetadata {
  sourceUrl: string;
  sourceName: string;
  sourcePriority: number;
  lastUpdatedAt: Date | null;
  importedAt: Date;
  validationStatus: 'valid' | 'invalid' | 'pending';
  dataVersion: string;
}
