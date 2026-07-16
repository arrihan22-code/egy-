import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  async list(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.list(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, unreadOnly === 'true');
  }

  @Post('send')
  async send(@Body() body: { userId: string; type?: string; title: string; body?: string; metadata?: Record<string, unknown>; channel?: string }) {
    return this.notificationsService.send(body);
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string, @Body('userId') userId: string) {
    return this.notificationsService.markRead(id, userId);
  }

  @Put(':userId/read-all')
  async markAllRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Get(':userId/preferences')
  async getPreferences(@Param('userId') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put(':userId/preferences')
  async updatePreferences(@Param('userId') userId: string, @Body() body: { push?: boolean; email?: boolean; sms?: boolean }) {
    return this.notificationsService.updatePreferences(userId, body);
  }

  @Post('broadcast')
  async broadcast(@Body() body: { type?: string; title: string; body?: string; metadata?: Record<string, unknown>; channel?: string; userIds?: string[] }) {
    return this.notificationsService.broadcast(body);
  }

  @Get('stats')
  async getStats(@Query('days') days?: string) {
    return this.notificationsService.getStats(days ? parseInt(days) : 7);
  }
}
