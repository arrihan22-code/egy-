import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalBanks, totalPharmacies, totalHospitals, totalGovOffices, totalTransport, totalEmergency, totalUsers, totalReviews] = await Promise.all([
      this.prisma.bank.count({ where: { isActive: true } }),
      this.prisma.pharmacy.count({ where: { isActive: true } }),
      this.prisma.hospital.count({ where: { isActive: true } }),
      this.prisma.governmentOffice.count({ where: { isActive: true } }),
      this.prisma.transportStation.count({ where: { isActive: true } }),
      this.prisma.emergencyContact.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.review.count({ where: { isActive: true, isApproved: true } }),
    ]);

    return {
      success: true,
      data: {
        entities: {
          banks: totalBanks,
          pharmacies: totalPharmacies,
          hospitals: totalHospitals,
          governmentOffices: totalGovOffices,
          transportStations: totalTransport,
          emergencyContacts: totalEmergency,
          total: totalBanks + totalPharmacies + totalHospitals + totalGovOffices + totalTransport + totalEmergency,
        },
        users: { verified: totalUsers },
        reviews: { approved: totalReviews },
      },
    };
  }

  async getDailyActivity(days = 30) {
    const reviewsByDay = await this.prisma.$queryRaw`
      SELECT DATE(created_at) as day, COUNT(*) as count
      FROM reviews
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY day
    `;

    const searchesByDay = await this.prisma.$queryRaw`
      SELECT DATE(searched_at) as day, COUNT(*) as count
      FROM search_logs
      WHERE searched_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(searched_at)
      ORDER BY day
    `;

    return {
      success: true,
      data: {
        reviews: reviewsByDay,
        searches: searchesByDay,
      },
    };
  }

  async getEntityTypeDistribution() {
    const result = await this.prisma.$queryRaw`
      SELECT entity_type, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating
      FROM reviews
      WHERE is_active = true AND is_approved = true
      GROUP BY entity_type
      ORDER BY count DESC
    `;
    return { success: true, data: result };
  }

  async getTopRatedEntities(type: string, limit = 10) {
    const tableName = this.getTableName(type);
    if (!tableName) return { success: false, data: [], message: 'Invalid entity type' };

    const result = await this.prisma.$queryRawUnsafe(`
      SELECT e.id, e.name_ar, e.name_en,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM ${tableName} e
      LEFT JOIN (
        SELECT entity_id,
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE entity_type = '${type}' AND is_active = true AND is_approved = true
        GROUP BY entity_id
      ) r ON r.entity_id = e.id
      WHERE e.is_active = true
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT ${limit}
    `);

    return { success: true, data: result };
  }

  async getCollectorPerformance(days = 7) {
    const result = await this.prisma.$queryRaw`
      SELECT collector_id, source_name, source_url, source_priority,
        COUNT(*) as total_runs,
        SUM(records_fetched) as total_fetched,
        SUM(records_inserted) as total_inserted,
        SUM(records_updated) as total_updated,
        SUM(records_failed) as total_failed,
        ROUND(AVG(duration_ms) / 1000, 2) as avg_duration_sec,
        MAX(completed_at) as last_run
      FROM import_logs
      WHERE started_at > NOW() - INTERVAL '${days} days'
      GROUP BY collector_id, source_name, source_url, source_priority
      ORDER BY total_runs DESC
    `;

    return { success: true, data: result };
  }

  async getGovernorateStats() {
    const result = await this.prisma.$queryRaw`
      SELECT g.id, g.name_ar, g.name_en,
        COALESCE(b.bank_count, 0) as bank_count,
        COALESCE(p.pharmacy_count, 0) as pharmacy_count,
        COALESCE(h.hospital_count, 0) as hospital_count,
        COALESCE(go.gov_count, 0) as government_count,
        COALESCE(t.transport_count, 0) as transport_count
      FROM governorates g
      LEFT JOIN (SELECT governorate_id, COUNT(*) as bank_count FROM bank_branches WHERE is_active = true GROUP BY governorate_id) b ON b.governorate_id = g.id
      LEFT JOIN (SELECT governorate_id, COUNT(*) as pharmacy_count FROM pharmacies WHERE is_active = true GROUP BY governorate_id) p ON p.governorate_id = g.id
      LEFT JOIN (SELECT governorate_id, COUNT(*) as hospital_count FROM hospitals WHERE is_active = true GROUP BY governorate_id) h ON h.governorate_id = g.id
      LEFT JOIN (SELECT governorate_id, COUNT(*) as gov_count FROM government_offices WHERE is_active = true GROUP BY governorate_id) go ON go.governorate_id = g.id
      LEFT JOIN (SELECT governorate_id, COUNT(*) as transport_count FROM transport_stations WHERE is_active = true GROUP BY governorate_id) t ON t.governorate_id = g.id
      ORDER BY g.name_ar
    `;

    return { success: true, data: result };
  }

  async getSystemHealth() {
    const [totalSources, activeSources, pendingImports, failedImports, deadLetterCount] = await Promise.all([
      this.prisma.dataSource.count(),
      this.prisma.dataSource.count({ where: { isAvailable: true } }),
      this.prisma.importLog.count({ where: { status: 'running' } }),
      this.prisma.importLog.count({ where: { status: 'failed' } }),
      this.prisma.deadLetterRecord.count(),
    ]);

    return {
      success: true,
      data: {
        dataSources: { total: totalSources, active: activeSources },
        imports: { pending: pendingImports, failed: failedImports },
        deadLetters: deadLetterCount,
        status: failedImports > 0 || deadLetterCount > 0 ? 'warning' : 'healthy',
      },
    };
  }

  async exportData(params: { type: string; format: string; startDate?: string; endDate?: string }) {
    const { type, format, startDate, endDate } = params;
    const tableName = this.getTableName(type);
    if (!tableName) return { success: false, message: 'Invalid entity type' };

    let whereClause = 'WHERE is_active = true';
    if (startDate) whereClause += ` AND created_at >= '${startDate}'::timestamp`;
    if (endDate) whereClause += ` AND created_at <= '${endDate}'::timestamp`;

    const rows = await this.prisma.$queryRawUnsafe(`SELECT * FROM ${tableName} ${whereClause} ORDER BY created_at DESC`);

    if (format === 'csv') {
      const csv = this.toCsv(rows);
      return { success: true, data: csv, format: 'csv' };
    }

    return { success: true, data: rows, format: 'json' };
  }

  private getTableName(type: string): string | null {
    const map: Record<string, string> = {
      bank: 'bank_branches',
      pharmacy: 'pharmacies',
      hospital: 'hospitals',
      government: 'government_offices',
      transport: 'transport_stations',
      emergency: 'emergency_contacts',
      review: 'reviews',
    };
    return map[type] || null;
  }

  private toCsv(rows: any[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')),
    ];
    return csvRows.join('\n');
  }

  async getSearchTrends(days = 30) {
    const result = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', searched_at) as day,
        COUNT(*) as total_searches,
        COUNT(DISTINCT query) as unique_queries,
        COUNT(*) FILTER (WHERE result_count = 0) as zero_results
      FROM search_logs
      WHERE searched_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', searched_at)
      ORDER BY day
    `;

    return { success: true, data: result };
  }

  async getUserGrowth(days = 90) {
    const result = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) as new_users
      FROM users
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY day
    `;

    return { success: true, data: result };
  }

  async getImportStatus() {
    const result = await this.prisma.$queryRaw`
      SELECT
        source_name,
        source_priority,
        collector_id,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        MAX(completed_at) as last_completed_at
      FROM import_logs
      WHERE started_at > NOW() - INTERVAL '24 hours'
      GROUP BY source_name, source_priority, collector_id
      ORDER BY source_priority
    `;

    return { success: true, data: result };
  }
}
