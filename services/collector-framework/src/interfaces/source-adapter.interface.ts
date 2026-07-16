import { DataSource } from '@egypt/shared-types';

export interface ISourceAdapter {
  fetch(url: string, options?: FetchOptions): Promise<FetchResponse>;
  healthCheck(source: DataSource): Promise<boolean>;
}

export interface FetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

export interface FetchResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
  durationMs: number;
}

export class NoSourceAvailableError extends Error {
  constructor(domain: string) {
    super(`No available source for domain: ${domain}`);
    this.name = 'NoSourceAvailableError';
  }
}

export interface ISourceResolver {
  resolveBestSource(domain: string): Promise<DataSource>;
  healthCheck(source: DataSource): Promise<boolean>;
  registerSource(source: DataSource): void;
}
