import { PrismaClient } from '@prisma/client';
import { CollectorRegistry } from './collector-registry';
import { SourceResolver } from './source-resolver';
import { RetryQueue } from './scheduler/retry-queue';
import { MetricsCollector } from './monitoring/metrics';
import { AlertManager } from './monitoring/alerts';
import { OFFICIAL_SOURCES, DOMAINS } from './sources/official-sources';
import { DataSource, SyncResult, SyncSchedule } from '@egypt/shared-types';
import { BaseSyncService } from './collectors/base-sync-service';
import { BanksCollector } from './collectors/banks-collector';
import { PharmaciesCollector } from './collectors/pharmacies-collector';
import { HospitalsCollector } from './collectors/hospitals-collector';
import { GovernmentCollector } from './collectors/government-collector';
import { TransportCollector } from './collectors/transport-collector';
import { EmergencyCollector } from './collectors/emergency-collector';
import { TelecomCollector } from './collectors/telecom-collector';
import { SupermarketsCollector } from './collectors/supermarkets-collector';

export class SynchronizationEngine {
  private prisma: PrismaClient;
  private registry: CollectorRegistry;
  private sourceResolver: SourceResolver;
  private retryQueue: RetryQueue;
  private metrics: MetricsCollector;
  private alertManager: AlertManager;
  private collectors: Map<string, BaseSyncService<any>> = new Map();
  private activeSyncs: Map<string, boolean> = new Map();
  private schedules: Map<string, NodeJS.Timeout> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.registry = new CollectorRegistry();
    this.sourceResolver = new SourceResolver();
    this.retryQueue = new RetryQueue();
    this.metrics = new MetricsCollector();
    this.alertManager = new AlertManager();

    this.registerAlertRules();
  }

  private registerAlertRules(): void {
    this.alertManager.registerRule({
      name: 'sync_failure_rate',
      description: 'High sync failure rate detected',
      severity: 'warning',
      condition: (metrics) => (metrics.sync_failures || 0) > 3,
      cooldownMs: 3600000,
    });
    this.alertManager.registerRule({
      name: 'source_unavailable',
      description: 'Primary data source unavailable for extended period',
      severity: 'critical',
      condition: (metrics) => (metrics.source_unavailable || 0) > 0,
      cooldownMs: 7200000,
    });
    this.alertManager.registerRule({
      name: 'stale_data',
      description: 'Data not synchronized for over 48 hours',
      severity: 'warning',
      condition: (metrics) => (metrics.stale_collectors || 0) > 0,
      cooldownMs: 86400000,
    });
  }

  async init(): Promise<void> {
    this.sourceResolver.registerSources(OFFICIAL_SOURCES);
    await this.seedSourceConfigs();

    this.registerCollector('banks', new BanksCollector(this.prisma));
    this.registerCollector('pharmacies', new PharmaciesCollector(this.prisma));
    this.registerCollector('hospitals', new HospitalsCollector(this.prisma));
    this.registerCollector('government', new GovernmentCollector(this.prisma));
    this.registerCollector('transport', new TransportCollector(this.prisma));
    this.registerCollector('emergency', new EmergencyCollector(this.prisma));
    this.registerCollector('telecom', new TelecomCollector(this.prisma));
    this.registerCollector('supermarkets', new SupermarketsCollector(this.prisma));

    console.log(`[SyncEngine] Initialized with ${this.collectors.size} collectors`);
  }

  private registerCollector(domain: string, collector: BaseSyncService<any>): void {
    const sources = this.sourceResolver.getSourcesByDomain(domain);
    collector.registerSources(sources);
    collector.init();
    this.collectors.set(domain, collector);
  }

  private async seedSourceConfigs(): Promise<void> {
    for (const source of OFFICIAL_SOURCES) {
      try {
        const existing = await this.prisma.$queryRawUnsafe(
          `SELECT id FROM source_configs WHERE domain = $1 AND source_name = $2 LIMIT 1`,
          source.domain, source.sourceName,
        );
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO source_configs (id, domain, source_name, source_url, source_type, priority, update_frequency, health_endpoint, is_active)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true)`,
            source.domain, source.sourceName, source.sourceUrl,
            source.type || 'website', source.priority,
            source.updateFrequency || 'daily', source.healthEndpoint || source.sourceUrl,
          );
        }
      } catch {}
    }
  }

  getCollectors(): string[] { return Array.from(this.collectors.keys()); }

  getCollector(domain: string): BaseSyncService<any> | undefined {
    return this.collectors.get(domain);
  }

  isSyncing(domain: string): boolean {
    return this.activeSyncs.get(domain) || false;
  }

  async syncDomain(domain: string, triggeredBy: string = 'manual'): Promise<SyncResult> {
    const collector = this.collectors.get(domain);
    if (!collector) {
      return {
        collectorId: domain, domain, sourceUrl: '', sourceName: '',
        status: 'failed', recordsFetched: 0, recordsInserted: 0, recordsUpdated: 0,
        recordsUnchanged: 0, recordsFailed: 0, durationMs: 0,
        errors: [{ type: 'validation', message: `No collector for domain: ${domain}`, recordIndex: undefined, recoverable: false }],
        importLogId: '',
      };
    }

    if (this.activeSyncs.get(domain)) {
      return {
        collectorId: domain, domain, sourceUrl: '', sourceName: '',
        status: 'failed', recordsFetched: 0, recordsInserted: 0, recordsUpdated: 0,
        recordsUnchanged: 0, recordsFailed: 0, durationMs: 0,
        errors: [{ type: 'validation', message: `Sync already in progress for domain: ${domain}`, recordIndex: undefined, recoverable: false }],
        importLogId: '',
      };
    }

    this.activeSyncs.set(domain, true);
    this.metrics.increment('sync_started', { domain });

    try {
      const result = await collector.executeSync(triggeredBy);
      this.metrics.increment('sync_completed', { domain, status: result.status });
      if (result.status === 'failed') {
        this.metrics.increment('sync_failures', { domain });
        await this.handleSyncFailure(domain, result);
      }
      return result;
    } catch (error: any) {
      this.metrics.increment('sync_failures', { domain });
      const errorResult: SyncResult = {
        collectorId: domain, domain, sourceUrl: '', sourceName: '',
        status: 'failed', recordsFetched: 0, recordsInserted: 0, recordsUpdated: 0,
        recordsUnchanged: 0, recordsFailed: 0, durationMs: 0,
        errors: [{ type: 'network', message: error.message, recordIndex: undefined, recoverable: true }],
        importLogId: '',
      };
      await this.handleSyncFailure(domain, errorResult);
      return errorResult;
    } finally {
      this.activeSyncs.set(domain, false);
    }
  }

  async syncAll(triggeredBy: string = 'manual'): Promise<Record<string, SyncResult>> {
    const results: Record<string, SyncResult> = {};
    const domains = this.getCollectors();
    for (const domain of domains) {
      results[domain] = await this.syncDomain(domain, triggeredBy);
    }
    return results;
  }

  private async handleSyncFailure(domain: string, result: SyncResult): Promise<void> {
    const error = result.errors?.[0];
    if (!error) return;
    await this.retryQueue.enqueue(domain, result.importLogId, new Error(error.message));
    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE source_configs SET last_sync_status = 'failed', consecutive_failures = consecutive_failures + 1, last_sync_at = NOW()
         WHERE domain = $1`,
        domain,
      );
    } catch {}
    this.evaluateAlerts();
  }

  private evaluateAlerts(): void {
    const metrics = {
      sync_failures: this.metrics['counters'].get('sync_failures{domain=all}') || 0,
      source_unavailable: 0,
      stale_collectors: 0,
    };
    const alerts = this.alertManager.evaluate(metrics);
    for (const alert of alerts) {
      console.warn(`[Alert][${alert.severity}] ${alert.name}: ${alert.description}`);
    }
  }

  startScheduledSyncs(): void {
    const cronIntervals: Record<string, number> = {
      banks: 24 * 60 * 60 * 1000,
      pharmacies: 24 * 60 * 60 * 1000,
      hospitals: 24 * 60 * 60 * 1000,
      government: 24 * 60 * 60 * 1000,
      transport: 24 * 60 * 60 * 1000,
      emergency: 12 * 60 * 60 * 1000,
      telecom: 7 * 24 * 60 * 60 * 1000,
      supermarkets: 7 * 24 * 60 * 60 * 1000,
    };

    for (const [domain, intervalMs] of Object.entries(cronIntervals)) {
      const schedule = setInterval(async () => {
        if (!this.activeSyncs.get(domain)) {
          console.log(`[Scheduler] Running scheduled sync for ${domain}`);
          await this.syncDomain(domain, 'scheduled');
        }
      }, intervalMs);
      this.schedules.set(domain, schedule);
    }
    console.log(`[Scheduler] Started ${Object.keys(cronIntervals).length} scheduled syncs`);

    this.runInitialSyncs();
  }

  private async runInitialSyncs(): Promise<void> {
    for (const domain of this.getCollectors()) {
      try {
        const lastSync = await this.prisma.$queryRawUnsafe(
          `SELECT MAX(completed_at) as last_sync FROM import_logs WHERE domain = $1 AND status = 'completed'`,
          domain,
        );
        const lastSyncTime = Array.isArray(lastSync) ? (lastSync[0] as any)?.last_sync : null;
        if (!lastSyncTime) {
          console.log(`[Scheduler] No previous sync for ${domain}, triggering initial sync`);
          this.syncDomain(domain, 'scheduled').catch(() => {});
        }
      } catch {}
    }
  }

  stopScheduledSyncs(): void {
    for (const [domain, interval] of this.schedules) {
      clearInterval(interval);
    }
    this.schedules.clear();
    console.log('[Scheduler] All scheduled syncs stopped');
  }

  getSyncStatus(): Array<{ domain: string; isSyncing: boolean; lastSync: string | null }> {
    return this.getCollectors().map(domain => ({
      domain,
      isSyncing: this.isSyncing(domain),
      lastSync: null,
    }));
  }
}