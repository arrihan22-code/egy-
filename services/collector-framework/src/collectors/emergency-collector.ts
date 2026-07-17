import { BaseSyncService, SyncConfig } from './base-sync-service';
import { EmergencyContactSchema, EmergencyAlertSchema } from '@egypt/shared-schemas';
import { DataSource } from '@egypt/shared-types';
import { z } from 'zod';

export class EmergencyCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'emergency',
    tableName: 'emergencyContact',
    idField: 'id',
    matchFields: ['hotline', 'type'],
    trackedFields: ['nameAr', 'nameEn', 'hotline', 'alternatePhone', 'latitude', 'longitude', 'isNational'],
  };
  readonly schema = EmergencyContactSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/emergency`, {
        headers: { ...source.headers },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) results.push(...data);
        else if (data.data && Array.isArray(data.data)) results.push(...data.data);
      }
    } catch {}
    return results;
  }
}

export class EmergencyAlertCollector extends BaseSyncService<any> {
  readonly syncConfig: SyncConfig = {
    domain: 'emergency',
    tableName: 'emergencyAlert',
    idField: 'id',
    matchFields: ['titleAr'],
    trackedFields: ['titleAr', 'titleEn', 'description', 'severity', 'affectedAreas', 'expiresAt'],
  };
  readonly schema = EmergencyAlertSchema;

  protected async fetchFromSource(source: DataSource): Promise<unknown[]> {
    const results: any[] = [];
    try {
      const response = await fetch(`${source.sourceUrl}/api/alerts`, {
        headers: { ...source.headers },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) results.push(...data);
        else if (data.data && Array.isArray(data.data)) results.push(...data.data);
      }
    } catch {}
    return results;
  }
}