import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

const SERVICES: Record<string, string> = {
  '/api/v1/banks': process.env.BANKS_SERVICE_URL || 'http://localhost:3000',
  '/api/v1/pharmacies': process.env.PHARMACIES_SERVICE_URL || 'http://localhost:3010',
  '/api/v1/hospitals': process.env.HOSPITALS_SERVICE_URL || 'http://localhost:3020',
  '/api/v1/government': process.env.GOVERNMENT_SERVICE_URL || 'http://localhost:3030',
  '/api/v1/transport': process.env.TRANSPORT_SERVICE_URL || 'http://localhost:3040',
  '/api/v1/emergency': process.env.EMERGENCY_SERVICE_URL || 'http://localhost:3050',
  '/api/v1/search': process.env.SEARCH_SERVICE_URL || 'http://localhost:3060',
  '/api/v1/maps': process.env.MAPS_SERVICE_URL || 'http://localhost:3070',
};

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    for (const [prefix, target] of Object.entries(SERVICES)) {
      consumer.apply(createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${prefix}`]: '/api/v1' },
      })).forRoutes(prefix);
    }
  }
}
