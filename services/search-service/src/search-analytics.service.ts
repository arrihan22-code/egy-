import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async logSearch(params: {
    query: string;
    type?: string;
    governorateId?: string;
    resultCount: number;
    userId?: string;
    ip?: string;
  }) {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO search_logs (query, type, governorate_id, result_count, user_id, ip, searched_at)
        VALUES (${params.query}, ${params.type || null}, ${params.governorateId || null}, ${params.resultCount}, ${params.userId || null}, ${params.ip || null}, NOW())
      `;
    } catch (e) {
      this.logger.warn('Failed to log search', e);
    }
  }

  async getPopularSearches(limit = 20) {
    const result = await this.prisma.$queryRaw`
      SELECT query, COUNT(*) as count, MAX(searched_at) as last_searched
      FROM search_logs
      WHERE searched_at > NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return result;
  }

  async getTrending(limit = 10) {
    const result = await this.prisma.$queryRaw`
      SELECT query, COUNT(*) as count
      FROM search_logs
      WHERE searched_at > NOW() - INTERVAL '24 hours'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return result;
  }

  async getSearchStats(days = 7) {
    const result = await this.prisma.$queryRaw`
      SELECT
        COUNT(*) as total_searches,
        COUNT(DISTINCT query) as unique_queries,
        AVG(result_count) as avg_results,
        COUNT(*) FILTER (WHERE result_count = 0) as zero_results
      FROM search_logs
      WHERE searched_at > NOW() - INTERVAL '${days} days'
    `;
    return result;
  }
}
