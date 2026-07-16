import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? { nameAr: { contains: search }, isActive: true }
      : { isActive: true };

    const [records, total] = await Promise.all([
      this.prisma.bank.findMany({
        where,
        skip,
        take: limit,
        include: { branches: true },
        orderBy: { nameAr: 'asc' },
      }),
      this.prisma.bank.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.bank.findUnique({
      where: { id },
      include: {
        branches: {
          include: { workingHours: true, services: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Bank with id ${id} not found`);
    }

    return { success: true, data: record };
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const records = await this.prisma.$queryRaw`
      SELECT b.*, br.*,
        earth_distance(ll_to_earth(br.latitude, br.longitude), ll_to_earth(${lat}, ${lng})) as distance
      FROM bank_branches br
      JOIN banks b ON b.id = br.bank_id
      WHERE earth_distance(
        ll_to_earth(br.latitude, br.longitude),
        earth_ll_to_earth(${lat}, ${lng})
      ) < ${radiusKm * 1000}
      ORDER BY distance
      LIMIT 20
    `;

    return { success: true, data: records };
  }

  async triggerSync() {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const result = await execAsync('docker exec scheduler-service node /app/trigger-sync.js banks');
      return { success: true, message: 'Sync triggered', output: result.stdout };
    } catch {
      return { success: false, message: 'Sync service unavailable' };
    }
  }
}
