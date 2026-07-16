import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly svc: HospitalsService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.svc.findAll({ page: page || 1, limit: limit || 20, search });
  }

  @Get('nearby')
  async findByNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.svc.findNearby(parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 5);
  }

  @Get('emergency')
  async findEmergency() { return this.svc.findEmergency(); }

  @Get(':id')
  async findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post('sync')
  async triggerSync() { return this.svc.triggerSync(); }
}
