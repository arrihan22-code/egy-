import { z } from 'zod';
import { SourceMetadataSchema } from './common.schema';

export const TransportStationSchema = z.object({
  type: z.enum(['metro', 'train', 'bus']),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  code: z.string().optional(),
  lineName: z.string().optional(),
  governorateId: z.string().uuid(),
  cityId: z.string().uuid(),
  latitude: z.number().min(22).max(32),
  longitude: z.number().min(25).max(37),
  hasParking: z.boolean().default(false),
  hasAccessibility: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sourceMetadata: SourceMetadataSchema,
});

export const TransportRouteSchema = z.object({
  type: z.enum(['metro', 'train', 'bus']),
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  fromStationId: z.string().uuid(),
  toStationId: z.string().uuid(),
  distanceKm: z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  fare: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});
