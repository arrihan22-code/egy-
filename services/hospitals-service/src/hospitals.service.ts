import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const where = search ? { nameAr: { contains: search }, isActive: true } : { isActive: true };
    const [records, total] = await Promise.all([
      this.prisma.hospital.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { nameAr: 'asc' }, include: { departments: true, doctors: true } }),
      this.prisma.hospital.count({ where: { isActive: true } }),
    ]);
    return { success: true, data: records, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT *, earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM hospitals
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusKm * 1000}
      ORDER BY distance LIMIT 20
    `;
    return { success: true, data: records };
  }

  async findEmergency() {
    const records = await this.prisma.hospital.findMany({ where: { hasEmergency: true, isActive: true }, take: 50 });
    return { success: true, data: records };
  }

  async findOne(id: string) {
    const record = await this.prisma.hospital.findUnique({ where: { id }, include: { departments: true, doctors: true } });
    if (!record) throw new NotFoundException();
    return { success: true, data: record };
  }

  async triggerSync() { return { success: true, message: 'Sync triggered for hospitals' }; }
}
