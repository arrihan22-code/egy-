import { z } from 'zod';
import { EgyptianPhoneSchema, UrlSchema, WorkingHoursSchema, SourceMetadataSchema } from './common.schema';

export const BankBranchSchema = z.object({
  bankId: z.string().uuid(),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  branchCode: z.string().optional(),
  governorateId: z.string().uuid(),
  cityId: z.string().uuid(),
  areaId: z.string().uuid().optional(),
  street: z.string().optional(),
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
  phone: EgyptianPhoneSchema.optional(),
  hasAtm: z.boolean().default(false),
  isActive: z.boolean().default(true),
  workingHours: z.array(WorkingHoursSchema).optional(),
  services: z.array(z.string()).optional(),
  sourceMetadata: SourceMetadataSchema,
});

export const BankSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  code: z.string().min(3).max(10),
  logoUrl: UrlSchema.optional(),
  website: UrlSchema.optional(),
  phone: EgyptianPhoneSchema.optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
  branches: z.array(BankBranchSchema).optional(),
  sourceMetadata: SourceMetadataSchema,
});
