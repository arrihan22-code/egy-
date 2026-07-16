import { z } from 'zod';
import { EgyptianPhoneSchema, SourceMetadataSchema } from './common.schema';

export const GovernmentServiceSchema = z.object({
  officeId: z.string().uuid(),
  serviceNameAr: z.string().min(1),
  serviceNameEn: z.string().optional(),
  description: z.string().optional(),
  fee: z.number().positive().optional(),
  processingTime: z.string().optional(),
  requiredDocs: z.array(z.string()).optional(),
  isOnline: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const GovernmentOfficeSchema = z.object({
  type: z.enum(['civil_id', 'passport', 'traffic', 'post_office', 'license', 'other']),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  officeCode: z.string().optional(),
  governorateId: z.string().uuid(),
  cityId: z.string().uuid(),
  areaId: z.string().uuid().optional(),
  street: z.string().optional(),
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
  phone: EgyptianPhoneSchema.optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
  services: z.array(z.object({
    serviceNameAr: z.string().min(1),
    serviceNameEn: z.string().optional(),
    description: z.string().optional(),
    fee: z.number().positive().optional(),
    processingTime: z.string().optional(),
    requiredDocs: z.array(z.string()).optional(),
    isOnline: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })).optional(),
  sourceMetadata: SourceMetadataSchema,
});
