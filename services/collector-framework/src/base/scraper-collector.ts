import { WebCrawler, CrawlerConfig } from './web-crawler';
import { CollectResult } from '@egypt/shared-types';

export interface ScraperConfig extends CrawlerConfig {
  renderJs: boolean;
  waitForSelector?: string;
  screenshotOnError?: boolean;
}

export abstract class ScraperCollector<T> extends WebCrawler<T> {
  protected abstract scraperConfig: ScraperConfig;

  protected async fetchPage(url: string): Promise<T[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8',
      },
    });

    const html = await response.text();
    return this.parseHtml(html, url);
  }

  protected abstract parseHtml(html: string, url: string): Promise<T[]>;
}
