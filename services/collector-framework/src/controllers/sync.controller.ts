import { SynchronizationEngine } from '../sync-engine';

export interface SyncControllerOptions {
  engine: SynchronizationEngine;
  prisma: any;
}

export function createSyncRoutes(options: SyncControllerOptions) {
  const { engine, prisma } = options;

  return {
    async triggerSync(req: { domain: string; triggeredBy?: string }) {
      const result = await engine.syncDomain(req.domain, req.triggeredBy || 'manual');
      return { success: result.status === 'completed', data: result };
    },

    async triggerSyncAll() {
      const results = await engine.syncAll('manual');
      const allSuccess = Object.values(results).every(r => r.status === 'completed');
      return { success: allSuccess, data: results };
    },

    async getSyncStatus() {
      const status = engine.getSyncStatus();
      for (const s of status) {
        try {
          const lastLog: any[] = await prisma.$queryRawUnsafe(
            `SELECT completed_at::text FROM import_logs WHERE domain = $1 AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`,
            s.domain,
          );
          s.lastSync = lastLog[0]?.completed_at || null;
        } catch {}
      }
      return { success: true, data: status };
    },

    async getSyncHistory(req: { domain?: string; page?: number; limit?: number }) {
      const page = req.page || 1;
      const limit = Math.min(req.limit || 20, 100);
      const offset = (page - 1) * limit;
      let where = '';
      const params: any[] = [];
      if (req.domain) {
        where = 'WHERE domain = $1';
        params.push(req.domain);
      }
      params.push(limit, offset);
      try {
        const logs: any[] = await prisma.$queryRawUnsafe(
          `SELECT id, domain, source_config_id, triggered_by, status, records_fetched, records_inserted, records_updated, records_failed, records_unchanged, error_message, duration_ms, started_at::text, completed_at::text, created_at::text
           FROM import_logs ${where}
           ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
          ...params,
        );
        const countResult: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as total FROM import_logs ${where}`,
          ...(req.domain ? [req.domain] : []),
        );
        return {
          success: true,
          data: logs,
          meta: { page, limit, total: parseInt(countResult[0]?.total || '0') },
        };
      } catch {
        return { success: true, data: [], meta: { page, limit, total: 0 } };
      }
    },

    async getSourceConfigs(req: { domain?: string }) {
      let where = '';
      const params: any[] = [];
      if (req.domain) {
        where = 'WHERE domain = $1';
        params.push(req.domain);
      }
      try {
        const configs: any[] = await prisma.$queryRawUnsafe(
          `SELECT id, domain, source_name, source_url, source_type, priority, update_frequency, is_active, last_sync_at::text, last_sync_status, consecutive_failures, created_at::text
           FROM source_configs ${where} ORDER BY domain, priority`,
          ...params,
        );
        return { success: true, data: configs };
      } catch {
        return { success: true, data: [] };
      }
    },

    async updateSourceConfig(req: { id: string; updates: Record<string, any> }) {
      const { id, updates } = req;
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;
      const allowedFields = ['is_active', 'update_frequency', 'priority', 'health_endpoint'];
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = $${idx}`);
          values.push(value);
          idx++;
        }
      }
      if (setClauses.length === 0) return { success: false, message: 'No valid fields to update' };
      values.push(id);
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE source_configs SET ${setClauses.join(', ')} WHERE id = $${idx}`,
          ...values,
        );
        return { success: true, message: 'Source config updated' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    async getCollectorInfo() {
      const collectors = engine.getCollectors().map(domain => ({
        domain,
        isSyncing: engine.isSyncing(domain),
      }));
      return { success: true, data: collectors };
    },

    async getSyncStats() {
      try {
        const stats: any[] = await prisma.$queryRawUnsafe(
          `SELECT
             domain,
             COUNT(*) as total_syncs,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
             SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
             AVG(duration_ms)::int as avg_duration_ms,
             SUM(records_inserted) as total_inserted,
             SUM(records_updated) as total_updated,
             MAX(completed_at)::text as last_sync
           FROM import_logs
           WHERE created_at > NOW() - INTERVAL '30 days'
           GROUP BY domain
           ORDER BY domain`,
        );
        return { success: true, data: stats };
      } catch {
        return { success: true, data: [] };
      }
    },
  };
}