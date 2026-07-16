import { BaseCollector } from './base-collector';
import { CollectResult } from '@egypt/shared-types';

export interface CrawlerConfig {
  entryUrls: string[];
  selectors: Record<string, string>;
  pagination: {
    type: 'url_pattern' | 'next_button' | 'infinite_scroll';
    pattern?: string;
    selector?: string;
    maxPages: number;
  };
  rateLimit: {
    requestsPerSecond: number;
    maxConcurrency: number;
  };
  antiBlocking: {
    useStealth: boolean;
    rotateUserAgents: boolean;
    respectRobotsTxt: boolean;
  };
}

export abstract class WebCrawler<T> extends BaseCollector<T> {
  protected abstract config: CrawlerConfig;

  protected async crawlUrls(urls: string[]): Promise<T[]> {
    const results: T[] = [];
    const concurrency = this.config.rateLimit.maxConcurrency || 5;
    const queue = [...urls];

    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;
        try {
          const data = await this.fetchPage(url);
          results.push(...data);
        } catch (error) {
          console.error(`Failed to crawl ${url}:`, error);
        }
      }
    });

    await Promise.all(workers);
    return results;
  }

  protected abstract fetchPage(url: string): Promise<T[]>;
}
