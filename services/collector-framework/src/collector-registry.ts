import { BaseCollector } from './base/base-collector';

export class CollectorRegistry {
  private collectors: Map<string, BaseCollector<any>> = new Map();

  register(collector: BaseCollector<any>): void {
    const id = collector.metadata.id;
    this.collectors.set(id, collector);
    console.log(`Registered collector: ${id} (${collector.metadata.domain}, ${collector.metadata.updateFrequency})`);
  }

  get<T>(id: string): BaseCollector<T> | undefined {
    return this.collectors.get(id) as BaseCollector<T> | undefined;
  }

  getAll(): BaseCollector<any>[] {
    return Array.from(this.collectors.values());
  }

  getByDomain(domain: string): BaseCollector<any>[] {
    return this.getAll().filter(c => c.metadata.domain === domain);
  }

  async autoDiscover(): Promise<void> {
    const path = require('path');
    const fs = require('fs');
    const collectorsDir = path.join(__dirname, '..', 'collectors');

    if (!fs.existsSync(collectorsDir)) return;

    const entries = fs.readdirSync(collectorsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const collectorPath = path.join(collectorsDir, entry.name, 'src', `${entry.name}.ts`);
        if (fs.existsSync(collectorPath)) {
          try {
            const module = require(collectorPath);
            const CollectorClass = Object.values(module).find(
              (v: any) => v.prototype instanceof BaseCollector
            );
            if (CollectorClass) {
              this.register(new (CollectorClass as any)());
            }
          } catch (error) {
            console.error(`Failed to load collector ${entry.name}:`, error);
          }
        }
      }
    }
  }

  size(): number {
    return this.collectors.size;
  }
}
