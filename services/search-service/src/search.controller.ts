import { Controller, Get, Post, Query, Param, Body, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { Request } from 'express';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('governorateId') governorateId?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    return this.searchService.search({
      query: query || '',
      type,
      governorateId,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      radiusKm: radius ? parseFloat(radius) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      ip: req?.ip,
    });
  }

  @Get('autocomplete')
  async autocomplete(
    @Query('q') query: string,
    @Query('type') type?: string,
  ) {
    return this.searchService.autocomplete(query || '', type);
  }

  @Post('rebuild')
  async rebuildIndex() {
    return this.searchService.rebuildIndex();
  }

  @Get('stats')
  async getIndexStats() {
    return this.searchService.getIndexStats();
  }

  @Get('popular')
  async getPopularSearches(@Query('limit') limit?: string) {
    return this.searchService.getPopularSearches(limit ? parseInt(limit) : 20);
  }

  @Get('trending')
  async getTrending() {
    return this.searchService.getTrending();
  }

  @Get('analytics')
  async getSearchStats(@Query('days') days?: string) {
    return this.searchService.getSearchStats(days ? parseInt(days) : 7);
  }
}
