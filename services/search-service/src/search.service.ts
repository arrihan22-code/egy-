import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService, SearchResponse, AutocompleteResult } from './elasticsearch.service';
import { SearchIndexer } from './search.indexer';
import { SearchAnalyticsService } from './search-analytics.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private es: ElasticsearchService,
    private indexer: SearchIndexer,
    private analytics: SearchAnalyticsService,
  ) {}

  async search(params: {
    query: string;
    type?: string;
    governorateId?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
    userId?: string;
    ip?: string;
  }): Promise<SearchResponse> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);

    const { hits, total } = await this.es.search({
      query: params.query,
      type: params.type,
      governorateId: params.governorateId,
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
      page,
      limit,
    });

    this.analytics.logSearch({
      query: params.query,
      type: params.type,
      governorateId: params.governorateId,
      resultCount: total,
      userId: params.userId,
      ip: params.ip,
    }).catch(() => {});

    return {
      success: true,
      data: hits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query: params.query,
        type: params.type,
        governorateId: params.governorateId,
      },
    };
  }

  async autocomplete(query: string, type?: string): Promise<{ success: boolean; data: AutocompleteResult[] }> {
    const results = await this.es.autocomplete(query, type);
    return { success: true, data: results };
  }

  async rebuildIndex() {
    return this.indexer.rebuildAll();
  }

  async getIndexStats() {
    return this.es.getIndexStats();
  }

  async getPopularSearches(limit = 20) {
    return this.analytics.getPopularSearches(limit);
  }

  async getTrending() {
    return this.analytics.getTrending();
  }

  async getSearchStats(days = 7) {
    return this.analytics.getSearchStats(days);
  }
}
