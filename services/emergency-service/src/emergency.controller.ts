import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly svc: EmergencyService) {}

  @Get('contacts')
  async findAllContacts() { return this.svc.findAllContacts(); }

  @Get('contacts/nearby')
  async findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.svc.findNearby(parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : 10);
  }

  @Get('contacts/:id')
  async findContact(@Param('id') id: string) { return this.svc.findContact(id); }

  @Get('alerts')
  async findActiveAlerts() { return this.svc.findActiveAlerts(); }

  @Get('hotlines')
  async findNationalHotlines() { return this.svc.findNationalHotlines(); }

  @Post('sync')
  async triggerSync() { return this.svc.triggerSync(); }
}
