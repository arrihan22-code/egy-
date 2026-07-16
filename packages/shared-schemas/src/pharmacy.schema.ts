import { z } from 'zod';
import { EgyptianPhoneSchema, WorkingHoursSchema, ContactSchema, SourceMetadataSchema } from './common.schema';

export const PharmacySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  licenseNumber: z.string().optional(),
  governorateId: z.string().uuid(),
  cityId: z.string().uuid(),
  areaId: z.string().uuid().optional(),
  street: z.string().optional(),
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
  phone: EgyptianPhoneSchema.optional(),
  whatsapp: EgyptianPhoneSchema.optional(),
  is24h: z.boolean().default(false),
  hasDelivery: z.boolean().default(false),
  isActive: z.boolean().default(true),
  workingHours: z.array(WorkingHoursSchema).optional(),
  contacts: z.array(z.object({
    type: z.enum(['phone', 'whatsapp', 'email']),
    value: z.string().min(1),
    isPrimary: z.boolean().default(false),
  })).optional(),
  sourceMetadata: SourceMetadataSchema,
});
