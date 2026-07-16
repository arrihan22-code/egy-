import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PharmaciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const where = search ? { nameAr: { contains: search }, isActive: true } : { isActive: true };
    const [records, total] = await Promise.all([
      this.prisma.pharmacy.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { nameAr: 'asc' }, include: { workingHours: true } }),
      this.prisma.pharmacy.count({ where: { isActive: true } }),
    ]);
    return { success: true, data: records, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT *, earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM pharmacies
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusKm * 1000}
      ORDER BY distance LIMIT 20
    `;
    return { success: true, data: records };
  }

  async find24h() {
    const records = await this.prisma.pharmacy.findMany({ where: { is24h: true, isActive: true }, include: { workingHours: true } });
    return { success: true, data: records, total: records.length };
  }

  async findOne(id: string) {
    const record = await this.prisma.pharmacy.findUnique({ where: { id }, include: { workingHours: true } });
    if (!record) throw new NotFoundException();
    return { success: true, data: record };
  }

  async triggerSync() { return { success: true, message: 'Sync triggered for pharmacies' }; }
}
