import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  async findAllContacts() {
    const records = await this.prisma.emergencyContact.findMany({ where: { isActive: true }, orderBy: { type: 'asc' } });
    return { success: true, data: records, total: records.length };
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT *, earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM emergency_contacts
      WHERE latitude IS NOT NULL AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusKm * 1000}
      ORDER BY distance LIMIT 20
    `;
    return { success: true, data: records };
  }

  async findContact(id: string) {
    const record = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!record) throw new NotFoundException();
    return { success: true, data: record };
  }

  async findActiveAlerts() {
    const records = await this.prisma.emergencyAlert.findMany({ where: { isActive: true, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'desc' } });
    return { success: true, data: records };
  }

  async findNationalHotlines() {
    const records = await this.prisma.emergencyContact.findMany({ where: { isNational: true, isActive: true } });
    return { success: true, data: records };
  }

  async triggerSync() { return { success: true, message: 'Sync triggered for emergency contacts' }; }
}
