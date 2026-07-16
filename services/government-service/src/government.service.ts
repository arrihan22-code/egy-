import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class GovernmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; limit: number; type?: string }) {
    const { page, limit, type } = params;
    const where: any = { isActive: true };
    if (type) where.type = type;

    const [records, total] = await Promise.all([
      this.prisma.governmentOffice.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { nameAr: 'asc' }, include: { services: true } }),
      this.prisma.governmentOffice.count({ where }),
    ]);
    return { success: true, data: records, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT *, earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM government_offices
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusKm * 1000}
      ORDER BY distance LIMIT 20
    `;
    return { success: true, data: records };
  }

  async findByType(type: string) {
    const records = await this.prisma.governmentOffice.findMany({ where: { type, isActive: true }, include: { services: true } });
    return { success: true, data: records };
  }

  async findOne(id: string) {
    const record = await this.prisma.governmentOffice.findUnique({ where: { id }, include: { services: true } });
    if (!record) throw new NotFoundException();
    return { success: true, data: record };
  }

  async triggerSync() { return { success: true, message: 'Sync triggered for government offices' }; }
}
