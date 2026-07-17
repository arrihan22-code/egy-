import { SourcePriority, SourceType, AuthType } from './collector.types';

export interface DataSource {
  id: string;
  domain: string;
  type: SourceType;
  priority: SourcePriority;
  url: string;
  name: string;
  sourceUrl: string;
  sourceName: string;
  authType: AuthType;
  rateLimit: { requests: number; perMs: number };
  isAvailable: boolean;
  lastChecked: Date | null;
  healthEndpoint?: string;
  updateFrequency?: string;
  headers?: Record<string, string>;
  pagination?: {
    type: 'url_pattern' | 'next_button' | 'infinite_scroll' | 'cursor';
    pattern?: string;
    selector?: string;
    maxPages: number;
  };
}

export interface DataSourceConfig {
  id: string;
  domain: string;
  type: SourceType;
  priority: SourcePriority;
  url: string;
  name: string;
  authType: AuthType;
  rateLimit: { requests: number; perMs: number };
  isAvailable: boolean;
  lastChecked: Date | null;
  healthEndpoint?: string;
  headers?: Record<string, string>;
  pagination?: {
    type: 'url_pattern' | 'next_button' | 'infinite_scroll' | 'cursor';
    pattern?: string;
    selector?: string;
    maxPages: number;
  };
}
