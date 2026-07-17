import { PrismaClient } from '@prisma/client';
import { SynchronizationEngine, createSyncRoutes } from '@egypt/collector-framework';

async function bootstrap() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const engine = new SynchronizationEngine(prisma);
  await engine.init();

  const port = process.env.PORT || 3120;

  const http = require('http');
  const server = http.createServer(async (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname.replace(/\/+$/, '');
    const syncRoutes = createSyncRoutes({ engine, prisma });

    const sendJson = (data: any, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    const readBody = (): Promise<any> => {
      return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk: string) => body += chunk);
        req.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch { resolve({}); }
        });
      });
    };

    try {
      if (req.method === 'POST' && (path === '/api/v1/sync/trigger' || path === '/sync/trigger')) {
        const body = await readBody();
        const result = await syncRoutes.triggerSync(body);
        return sendJson(result);
      }

      if (req.method === 'POST' && (path === '/api/v1/sync/trigger-all' || path === '/sync/trigger-all')) {
        const result = await syncRoutes.triggerSyncAll();
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/api/v1/sync/status' || path === '/sync/status')) {
        const result = await syncRoutes.getSyncStatus();
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/api/v1/sync/history' || path === '/sync/history')) {
        const domain = url.searchParams.get('domain') || undefined;
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const result = await syncRoutes.getSyncHistory({ domain, page, limit });
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/api/v1/sync/sources' || path === '/sync/sources')) {
        const domain = url.searchParams.get('domain') || undefined;
        const result = await syncRoutes.getSourceConfigs({ domain });
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/api/v1/sync/stats' || path === '/sync/stats')) {
        const result = await syncRoutes.getSyncStats();
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/api/v1/sync/collectors' || path === '/sync/collectors')) {
        const result = await syncRoutes.getCollectorInfo();
        return sendJson(result);
      }

      if (req.method === 'GET' && (path === '/health' || path === '/api/v1/sync/health')) {
        return sendJson({ status: 'ok', uptime: process.uptime() });
      }

      sendJson({ error: 'Not found' }, 404);
    } catch (error: any) {
      sendJson({ error: error.message }, 500);
    }
  });

  engine.startScheduledSyncs();

  server.listen(port, () => {
    console.log(`[Sync Service] Running on port ${port}`);
  });
}

bootstrap().catch(console.error);