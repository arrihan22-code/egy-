import { z } from 'zod';
import { EgyptianPhoneSchema, SourceMetadataSchema } from './common.schema';

export const EmergencyContactSchema = z.object({
  type: z.enum(['police', 'fire', 'ambulance', 'civil_defense']),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  hotline: z.string().min(3).max(20),
  alternatePhone: EgyptianPhoneSchema.optional(),
  governorateId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  latitude: z.number().min(22).max(32).optional(),
  longitude: z.number().min(25).max(37).optional(),
  isNational: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sourceMetadata: SourceMetadataSchema,
});

export const EmergencyAlertSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().optional(),
  description: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical']),
  affectedAreas: z.array(z.string().uuid()),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
  sourceMetadata: SourceMetadataSchema,
});
