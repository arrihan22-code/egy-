import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchIndexer } from './search.indexer';
import { SearchAnalyticsService } from './search-analytics.service';
import { ElasticsearchService } from './elasticsearch.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchIndexer,
    SearchAnalyticsService,
    ElasticsearchService,
    PrismaService,
  ],
})
export class AppModule {}
