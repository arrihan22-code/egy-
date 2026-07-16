import { z } from 'zod';

export const CoordinatesSchema = z.object({
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
});

export const EgyptianPhoneSchema = z.string().regex(
  /^(?:\+20|0020|0)?1[0-2,5]{1}[0-9]{8}$/,
  'Invalid Egyptian phone number format'
);

export const UrlSchema = z.string().url();

export const WorkingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean().default(false),
  is24h: z.boolean().optional(),
});

export const ContactSchema = z.object({
  type: z.enum(['phone', 'whatsapp', 'email', 'fax', 'website']),
  value: z.string().min(1),
  isPrimary: z.boolean().default(false),
});

export const SourceMetadataSchema = z.object({
  sourceUrl: z.string().url(),
  sourceName: z.string().min(1),
  sourcePriority: z.number().int().min(1).max(6),
  lastUpdatedAt: z.date().nullable(),
  importedAt: z.date(),
  validationStatus: z.enum(['valid', 'invalid', 'pending']),
  dataVersion: z.string(),
});
