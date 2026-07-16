import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { GovernmentService } from './government.service';

@Controller('government')
export class GovernmentController {
  constructor(private readonly svc: GovernmentService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('type') type?: string) {
    return this.svc.findAll({ page: page || 1, limit: limit || 20, type });
  }

  @Get('nearby')
  async findByNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.svc.findNearby(parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 5);
  }

  @Get('types/:type')
  async findByType(@Param('type') type: string) { return this.svc.findByType(type); }

  @Get(':id')
  async findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post('sync')
  async triggerSync() { return this.svc.triggerSync(); }
}
