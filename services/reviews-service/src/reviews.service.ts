import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    userId: string;
    entityType: string;
    entityId: string;
    rating: number;
    title?: string;
    comment?: string;
    photos?: { url: string; caption?: string }[];
  }) {
    const { userId, entityType, entityId, rating, title, comment, photos } = params;

    const existing = await this.prisma.review.findUnique({
      where: { userId_entityType_entityId: { userId, entityType, entityId } },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this entity');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const validTypes = ['bank', 'pharmacy', 'hospital', 'government', 'transport', 'emergency'];
    if (!validTypes.includes(entityType)) {
      throw new Error(`Invalid entity type. Must be one of: ${validTypes.join(', ')}`);
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        entityType,
        entityId,
        rating,
        title,
        comment,
        photos: photos?.length
          ? { create: photos.map((p, i) => ({ url: p.url, caption: p.caption, sortOrder: i })) }
          : undefined,
      },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    });

    return { success: true, data: review };
  }

  async findByEntity(entityType: string, entityId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { entityType, entityId, isActive: true, isApproved: true };

    const [records, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: { photos: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    const aggregation = await this.prisma.review.aggregate({
      where: { entityType, entityId, isActive: true, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      success: true,
      data: records,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        averageRating: aggregation._avg.rating ? Math.round(Number(aggregation._avg.rating) * 10) / 10 : 0,
        totalRatings: aggregation._count.rating,
      },
    };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };

    const [records, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: { photos: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, userId: string, params: { rating?: number; title?: string; comment?: string; photos?: { url: string; caption?: string }[] }) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new Error('You can only edit your own reviews');

    if (params.rating !== undefined && (params.rating < 1 || params.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        ...(params.rating !== undefined && { rating: params.rating }),
        ...(params.title !== undefined && { title: params.title }),
        ...(params.comment !== undefined && { comment: params.comment }),
        ...(params.photos && {
          photos: {
            deleteMany: {},
            create: params.photos.map((p, i) => ({ url: p.url, caption: p.caption, sortOrder: i })),
          },
        }),
      },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    });

    return { success: true, data: updated };
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new Error('You can only delete your own reviews');

    await this.prisma.review.update({ where: { id }, data: { isActive: false } });
    return { success: true, message: 'Review deleted' };
  }

  async getRatingSummary(entityType: string, entityId: string) {
    const aggregation = await this.prisma.review.aggregate({
      where: { entityType, entityId, isActive: true, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const distribution = await this.prisma.$queryRaw`
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}::uuid
        AND is_active = true AND is_approved = true
      GROUP BY rating
      ORDER BY rating DESC
    `;

    return {
      success: true,
      data: {
        averageRating: aggregation._avg.rating ? Math.round(Number(aggregation._avg.rating) * 10) / 10 : 0,
        totalRatings: aggregation._count.rating,
        distribution: (distribution as any[]).map(r => ({
          rating: Number(r.rating),
          count: Number(r.count),
        })),
      },
    };
  }

  async moderate(params: { reviewId: string; approve: boolean }) {
    const { reviewId, approve } = params;
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: approve, isActive: approve },
    });

    return { success: true, data: updated };
  }

  async listAll(page = 1, limit = 50, filter?: { isApproved?: boolean; entityType?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filter?.isApproved !== undefined) where.isApproved = filter.isApproved;
    if (filter?.entityType) where.entityType = filter.entityType;

    const [records, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: { photos: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
