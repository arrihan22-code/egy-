import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async findAllStations(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const [records, total] = await Promise.all([
      this.prisma.transportStation.findMany({ where: { isActive: true }, skip: (page - 1) * limit, take: limit, orderBy: { nameAr: 'asc' } }),
      this.prisma.transportStation.count({ where: { isActive: true } }),
    ]);
    return { success: true, data: records, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findStationsNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT *, earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM transport_stations
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusKm * 1000}
      ORDER BY distance LIMIT 20
    `;
    return { success: true, data: records };
  }

  async findStation(id: string) {
    const record = await this.prisma.transportStation.findUnique({
      where: { id },
      include: { routesFrom: true, routesTo: true },
    });
    if (!record) throw new NotFoundException();
    return { success: true, data: record };
  }

  async findAllRoutes() {
    const records = await this.prisma.transportRoute.findMany({ where: { isActive: true } });
    return { success: true, data: records };
  }

  async triggerSync() { return { success: true, message: 'Sync triggered for transport stations' }; }
}
