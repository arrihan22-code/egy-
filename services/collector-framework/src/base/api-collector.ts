import { BaseCollector } from './base-collector';
import { CollectResult, DataSource } from '@egypt/shared-types';

export interface ApiCollectorConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  pagination?: {
    type: 'page' | 'cursor' | 'offset';
    pageParam?: string;
    limitParam?: string;
    limit?: number;
    maxPages?: number;
  };
}

export abstract class ApiCollector<T> extends BaseCollector<T> {
  protected abstract config: ApiCollectorConfig;
  protected abstract source: DataSource;

  protected async fetch(endpoint: string, options?: RequestInit): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'EgyptServicesPlatform/1.0',
      ...this.source.headers,
    };

    if (this.source.authType === 'api_key' && this.source.headers?.['X-API-Key']) {
      headers['X-API-Key'] = this.source.headers['X-API-Key'];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout || 30000);

    try {
      const response = await fetch(url.toString(), {
        method: options?.method || 'GET',
        headers: { ...headers, ...options?.headers },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  protected async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries: number = 3
  ): Promise<Response> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.fetch(url, options);
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await this.delay(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
