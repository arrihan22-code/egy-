import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly svc: TransportService) {}

  @Get('stations')
  async findAllStations(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.svc.findAllStations({ page: page || 1, limit: limit || 20 });
  }

  @Get('stations/nearby')
  async findStationsNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.svc.findStationsNearby(parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 5);
  }

  @Get('stations/:id')
  async findStation(@Param('id') id: string) { return this.svc.findStation(id); }

  @Get('routes')
  async findAllRoutes() { return this.svc.findAllRoutes(); }

  @Post('sync')
  async triggerSync() { return this.svc.triggerSync(); }
}
