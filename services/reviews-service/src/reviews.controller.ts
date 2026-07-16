import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() body: {
    userId: string;
    entityType: string;
    entityId: string;
    rating: number;
    title?: string;
    comment?: string;
    photos?: { url: string; caption?: string }[];
  }) {
    return this.reviewsService.create(body);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByEntity(entityType, entityId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Get('entity/:entityType/:entityId/summary')
  async getRatingSummary(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.reviewsService.getRatingSummary(entityType, entityId);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByUser(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { userId: string; rating?: number; title?: string; comment?: string; photos?: { url: string; caption?: string }[] },
  ) {
    return this.reviewsService.update(id, body.userId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.reviewsService.remove(id, userId);
  }

  @Post(':id/moderate')
  async moderate(@Param('id') reviewId: string, @Body('approve') approve: boolean) {
    return this.reviewsService.moderate({ reviewId, approve });
  }

  @Get('admin/all')
  async listAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isApproved') isApproved?: string,
    @Query('entityType') entityType?: string,
  ) {
    const filter: any = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (entityType) filter.entityType = entityType;
    return this.reviewsService.listAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, filter);
  }
}
