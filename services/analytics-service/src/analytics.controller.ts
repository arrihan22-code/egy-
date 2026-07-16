import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('daily-activity')
  async getDailyActivity(@Query('days') days?: string) {
    return this.analyticsService.getDailyActivity(days ? parseInt(days) : 30);
  }

  @Get('entity-distribution')
  async getEntityTypeDistribution() {
    return this.analyticsService.getEntityTypeDistribution();
  }

  @Get('top-rated')
  async getTopRated(@Query('type') type: string, @Query('limit') limit?: string) {
    return this.analyticsService.getTopRatedEntities(type, limit ? parseInt(limit) : 10);
  }

  @Get('collectors')
  async getCollectorPerformance(@Query('days') days?: string) {
    return this.analyticsService.getCollectorPerformance(days ? parseInt(days) : 7);
  }

  @Get('governorates')
  async getGovernorateStats() {
    return this.analyticsService.getGovernorateStats();
  }

  @Get('health')
  async getSystemHealth() {
    return this.analyticsService.getSystemHealth();
  }

  @Get('search-trends')
  async getSearchTrends(@Query('days') days?: string) {
    return this.analyticsService.getSearchTrends(days ? parseInt(days) : 30);
  }

  @Get('user-growth')
  async getUserGrowth(@Query('days') days?: string) {
    return this.analyticsService.getUserGrowth(days ? parseInt(days) : 90);
  }

  @Get('import-status')
  async getImportStatus() {
    return this.analyticsService.getImportStatus();
  }

  @Get('export')
  async exportData(
    @Query('type') type: string,
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const result = await this.analyticsService.exportData({ type, format: format || 'json', startDate, endDate });
    if (result.format === 'csv' && res) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      return res.send(result.data);
    }
    return result;
  }
}
