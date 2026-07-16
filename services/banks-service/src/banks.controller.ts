import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { BanksService } from './banks.service';

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.banksService.findAll({ page: page || 1, limit: limit || 20, search });
  }

  @Get('nearby')
  async findByNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.banksService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.banksService.findOne(id);
  }

  @Post(':id/sync')
  async sync(@Param('id') _id: string) {
    return this.banksService.triggerSync();
  }

  @Post('sync')
  async triggerSync() {
    return this.banksService.triggerSync();
  }
}
