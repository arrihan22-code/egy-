import { DataSource, NoSourceAvailableError } from './interfaces/source-adapter.interface';

export class SourceResolver {
  private sources: Map<string, DataSource[]> = new Map();
  private healthCache: Map<string, { available: boolean; checkedAt: Date }> = new Map();

  registerSource(source: DataSource): void {
    const domain = source.domain;
    if (!this.sources.has(domain)) {
      this.sources.set(domain, []);
    }
    this.sources.get(domain)!.push(source);
    this.sources.get(domain)!.sort((a, b) => a.priority - b.priority);
  }

  registerSources(sources: DataSource[]): void {
    for (const source of sources) {
      this.registerSource(source);
    }
  }

  async resolveBestSource(domain: string): Promise<DataSource> {
    const candidates = this.sources.get(domain);
    if (!candidates || candidates.length === 0) {
      throw new NoSourceAvailableError(domain);
    }

    for (const source of candidates) {
      const isAvailable = await this.checkHealth(source);
      if (isAvailable) {
        return source;
      }
    }

    throw new NoSourceAvailableError(domain);
  }

  private async checkHealth(source: DataSource): Promise<boolean> {
    const cached = this.healthCache.get(source.url);
    if (cached && (Date.now() - cached.checkedAt.getTime()) < 60_000) {
      return cached.available;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(source.healthEndpoint || source.url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const available = response.ok || response.status < 500;

      this.healthCache.set(source.url, {
        available,
        checkedAt: new Date(),
      });

      return available;
    } catch {
      this.healthCache.set(source.url, {
        available: false,
        checkedAt: new Date(),
      });
      return false;
    }
  }

  getSourcesByDomain(domain: string): DataSource[] {
    return this.sources.get(domain) || [];
  }

  getAllSources(): DataSource[] {
    return Array.from(this.sources.values()).flat();
  }
}
