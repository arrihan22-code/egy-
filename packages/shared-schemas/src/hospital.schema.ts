import { z } from 'zod';
import { EgyptianPhoneSchema, UrlSchema, SourceMetadataSchema } from './common.schema';

export const DoctorSchema = z.object({
  hospitalId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  specialtyAr: z.string().min(1),
  specialtyEn: z.string().optional(),
  title: z.string().optional(),
  phone: EgyptianPhoneSchema.optional(),
  email: z.string().email().optional(),
  consultationFee: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export const HospitalDepartmentSchema = z.object({
  hospitalId: z.string().uuid(),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  floor: z.string().optional(),
  phone: EgyptianPhoneSchema.optional(),
});

export const HospitalSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  type: z.enum(['hospital', 'clinic', 'medical_center']),
  ownership: z.enum(['public', 'private', 'university']),
  governorateId: z.string().uuid(),
  cityId: z.string().uuid(),
  areaId: z.string().uuid().optional(),
  street: z.string().optional(),
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
  phone: EgyptianPhoneSchema.optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  hasEmergency: z.boolean().default(false),
  bedCount: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  departments: z.array(z.object({
    nameAr: z.string().min(1),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    floor: z.string().optional(),
    phone: EgyptianPhoneSchema.optional(),
  })).optional(),
  doctors: z.array(z.object({
    nameAr: z.string().min(1),
    nameEn: z.string().optional(),
    specialtyAr: z.string().min(1),
    specialtyEn: z.string().optional(),
    title: z.string().optional(),
    phone: EgyptianPhoneSchema.optional(),
    email: z.string().email().optional(),
    consultationFee: z.number().positive().optional(),
    isActive: z.boolean().default(true),
  })).optional(),
  sourceMetadata: SourceMetadataSchema,
});
