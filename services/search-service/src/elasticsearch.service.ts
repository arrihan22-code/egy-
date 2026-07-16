import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

export interface SearchDocument {
  id: string;
  type: 'bank' | 'pharmacy' | 'hospital' | 'government' | 'transport' | 'emergency';
  nameAr: string;
  nameEn?: string;
  description?: string;
  phone?: string;
  address?: string;
  governorateId?: string;
  governorateNameAr?: string;
  cityId?: string;
  cityNameAr?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  sourceUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  id: string;
  type: string;
  score: number;
  nameAr: string;
  nameEn?: string;
  description?: string;
  phone?: string;
  address?: string;
  governorateNameAr?: string;
  cityNameAr?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  sourceUrl?: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query: string;
    type?: string;
    governorateId?: string;
  };
}

export interface AutocompleteResult {
  text: string;
  type: string;
  id: string;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client!: Client;
  private readonly indexName = 'egypt_services';

  async onModuleInit() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
    await this.ensureIndex();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                arabic_analyzer: {
                  type: 'standard',
                  filter: ['lowercase', 'arabic_normalization', 'arabic_stop'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              type: { type: 'keyword' },
              nameAr: { type: 'text', analyzer: 'arabic_analyzer', fields: { keyword: { type: 'keyword' } } },
              nameEn: { type: 'text' },
              description: { type: 'text', analyzer: 'arabic_analyzer' },
              phone: { type: 'keyword' },
              address: { type: 'text', analyzer: 'arabic_analyzer' },
              governorateId: { type: 'keyword' },
              governorateNameAr: { type: 'text', analyzer: 'arabic_analyzer' },
              cityId: { type: 'keyword' },
              cityNameAr: { type: 'text', analyzer: 'arabic_analyzer' },
              latitude: { type: 'float' },
              longitude: { type: 'float' },
              tags: { type: 'keyword' },
              sourceUrl: { type: 'keyword' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              location: { type: 'geo_point' },
            },
          },
        },
      });
    }
  }

  async indexDocument(doc: SearchDocument) {
    await this.client.index({
      index: this.indexName,
      id: `${doc.type}_${doc.id}`,
      body: {
        ...doc,
        location: doc.latitude && doc.longitude
          ? { lat: doc.latitude, lon: doc.longitude }
          : undefined,
      },
      refresh: 'wait_for',
    });
  }

  async bulkIndex(docs: SearchDocument[]) {
    const body = docs.flatMap(doc => [
      { index: { _index: this.indexName, _id: `${doc.type}_${doc.id}` } },
      {
        ...doc,
        location: doc.latitude && doc.longitude
          ? { lat: doc.latitude, lon: doc.longitude }
          : undefined,
      },
    ]);
    if (body.length > 0) {
      const result = await this.client.bulk({ body, refresh: 'wait_for' });
      if (result.errors) {
        this.logger.warn('Bulk index had errors', result.items?.filter(i => i.index?.error));
      }
    }
  }

  async search(params: {
    query: string;
    type?: string;
    governorateId?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    page: number;
    limit: number;
  }): Promise<{ hits: SearchResult[]; total: number }> {
    const { query, type, governorateId, latitude, longitude, radiusKm, page, limit } = params;
    const must: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['nameAr^3', 'nameEn^2', 'description', 'address', 'tags', 'phone'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    const filter: any[] = [{ term: { isActive: true } }];
    if (type) filter.push({ term: { type } });
    if (governorateId) filter.push({ term: { governorateId } });

    const body: any = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter,
        },
      },
      from: (page - 1) * limit,
      size: limit,
      sort: [{ _score: { order: 'desc' } }],
    };

    if (latitude && longitude && radiusKm) {
      body.query.bool.filter.push({
        geo_distance: {
          distance: `${radiusKm}km`,
          location: { lat: latitude, lon: longitude },
        },
      });
    }

    const result = await this.client.search({
      index: this.indexName,
      body,
    });

    const hits = result.hits.hits.map(h => ({
      id: (h._source as any).id,
      type: (h._source as any).type,
      score: h._score || 0,
      nameAr: (h._source as any).nameAr,
      nameEn: (h._source as any).nameEn,
      description: (h._source as any).description,
      phone: (h._source as any).phone,
      address: (h._source as any).address,
      governorateNameAr: (h._source as any).governorateNameAr,
      cityNameAr: (h._source as any).cityNameAr,
      latitude: (h._source as any).latitude,
      longitude: (h._source as any).longitude,
      tags: (h._source as any).tags || [],
      sourceUrl: (h._source as any).sourceUrl,
    }));

    return {
      hits,
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
    };
  }

  async autocomplete(query: string, type?: string): Promise<AutocompleteResult[]> {
    const body: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['nameAr^3', 'nameEn^2'],
                type: 'phrase_prefix',
                max_expansions: 10,
              },
            },
          ],
          filter: [{ term: { isActive: true } }],
        },
      },
      from: 0,
      size: 8,
      _source: ['id', 'type', 'nameAr', 'nameEn'],
    };

    if (type) body.query.bool.filter.push({ term: { type } });

    const result = await this.client.search({ index: this.indexName, body });
    return result.hits.hits.map(h => ({
      text: (h._source as any).nameAr,
      type: (h._source as any).type,
      id: (h._source as any).id,
    }));
  }

  async deleteDocument(type: string, id: string) {
    await this.client.delete({
      index: this.indexName,
      id: `${type}_${id}`,
      refresh: 'wait_for',
    });
  }

  async clearIndex() {
    await this.client.deleteByQuery({
      index: this.indexName,
      body: { query: { match_all: {} } },
      refresh: true,
    });
  }

  async getIndexStats() {
    const result = await this.client.count({ index: this.indexName });
    const aggResult = await this.client.search({
      index: this.indexName,
      body: {
        size: 0,
        aggs: {
          by_type: { terms: { field: 'type' } },
        },
      },
    });
    const buckets = (aggResult.aggregations as any)?.by_type?.buckets || [];
    const byType: Record<string, number> = {};
    for (const b of buckets) byType[b.key] = b.doc_count;
    return { total: result.count, byType };
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
