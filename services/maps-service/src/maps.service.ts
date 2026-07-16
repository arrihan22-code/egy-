import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface NearbyResult {
  id: string;
  type: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  governorateId?: string;
  cityId?: string;
  tags: string[];
}

export interface BoundsResult {
  id: string;
  type: string;
  nameAr: string;
  latitude: number;
  longitude: number;
}

export interface ClusterResult {
  latitude: number;
  longitude: number;
  count: number;
  type: string;
}

@Injectable()
export class MapsService {
  constructor(private prisma: PrismaService) {}

  async findNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    type?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: NearbyResult[] }> {
    const { latitude, longitude, radiusKm, type, limit = 50 } = params;
    const results: NearbyResult[] = [];
    const types = type ? [type] : ['bank', 'pharmacy', 'hospital', 'government', 'transport', 'emergency'];

    for (const t of types) {
      const rows = await this.queryByType(t, latitude, longitude, radiusKm, limit);
      results.push(...rows);
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return { success: true, data: results.slice(0, limit) };
  }

  private async queryByType(type: string, lat: number, lng: number, radiusKm: number, limit: number): Promise<NearbyResult[]> {
    const radiusMeters = radiusKm * 1000;
    switch (type) {
      case 'bank': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT br.id, 'bank' as type, b.name_ar, b.name_en, br.street as address,
            br.latitude, br.longitude, br.phone,
            earth_distance(ll_to_earth(br.latitude, br.longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM bank_branches br
          JOIN banks b ON b.id = br.bank_id
          WHERE br.is_active = true
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(br.latitude, br.longitude)
            AND earth_distance(ll_to_earth(br.latitude, br.longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      case 'pharmacy': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'pharmacy' as type, name_ar, name_en, street as address, latitude, longitude, phone,
            earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM pharmacies
          WHERE is_active = true
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
            AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      case 'hospital': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'hospital' as type, name_ar, name_en, street as address, latitude, longitude, phone,
            earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM hospitals
          WHERE is_active = true
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
            AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      case 'government': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'government' as type, name_ar, name_en, street as address, latitude, longitude, phone,
            earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM government_offices
          WHERE is_active = true
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
            AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      case 'transport': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'transport' as type, name_ar, name_en, line_name as address, latitude, longitude, null as phone,
            earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM transport_stations
          WHERE is_active = true
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
            AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      case 'emergency': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'emergency' as type, name_ar, name_en, hotline as phone, null as address, latitude, longitude,
            earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) as distance
          FROM emergency_contacts
          WHERE is_active = true AND latitude IS NOT NULL
            AND earth_box(ll_to_earth(${lat}, ${lng}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
            AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng})) < ${radiusMeters}
          ORDER BY distance
          LIMIT ${limit}
        `;
        return rows.map(r => ({ ...r, distanceKm: Number(r.distance) / 1000 }));
      }
      default:
        return [];
    }
  }

  async getDistance(params: { lat1: number; lng1: number; lat2: number; lng2: number }): Promise<{ success: boolean; data: { distanceKm: number; bearing: number } }> {
    const { lat1, lng1, lat2, lng2 } = params;
    const result: any[] = await this.prisma.$queryRaw`
      SELECT
        earth_distance(ll_to_earth(${lat1}, ${lng1}), ll_to_earth(${lat2}, ${lng2})) as distance_meters,
        degrees(atan2(
          sin(radians(${lng2} - ${lng1})) * cos(radians(${lat2})),
          cos(radians(${lat1})) * sin(radians(${lat2})) - sin(radians(${lat1})) * cos(radians(${lat2})) * cos(radians(${lng2} - ${lng1}))
        )) as bearing
    `;
    const row = result[0];
    return {
      success: true,
      data: {
        distanceKm: Number(row.distance_meters) / 1000,
        bearing: Number(row.bearing),
        from: { latitude: lat1, longitude: lng1 },
        to: { latitude: lat2, longitude: lng2 },
      },
    };
  }

  async getBounds(params: {
    southWest: { lat: number; lng: number };
    northEast: { lat: number; lng: number };
    type?: string;
  }): Promise<{ success: boolean; data: BoundsResult[] }> {
    const { southWest, northEast, type } = params;
    const results: BoundsResult[] = [];

    const types = type ? [type] : ['bank', 'pharmacy', 'hospital', 'government', 'transport', 'emergency'];

    for (const t of types) {
      const rows = await this.queryBounds(t, southWest.lat, southWest.lng, northEast.lat, northEast.lng);
      results.push(...rows);
    }

    return { success: true, data: results };
  }

  private async queryBounds(type: string, swLat: number, swLng: number, neLat: number, neLng: number): Promise<BoundsResult[]> {
    switch (type) {
      case 'bank': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT br.id, 'bank' as type, b.name_ar, br.latitude, br.longitude
          FROM bank_branches br
          JOIN banks b ON b.id = br.bank_id
          WHERE br.is_active = true
            AND br.latitude BETWEEN ${swLat} AND ${neLat}
            AND br.longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      case 'pharmacy': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'pharmacy' as type, name_ar, latitude, longitude
          FROM pharmacies
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      case 'hospital': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'hospital' as type, name_ar, latitude, longitude
          FROM hospitals
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      case 'government': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'government' as type, name_ar, latitude, longitude
          FROM government_offices
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      case 'transport': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'transport' as type, name_ar, latitude, longitude
          FROM transport_stations
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      case 'emergency': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT id, 'emergency' as type, name_ar, latitude, longitude
          FROM emergency_contacts
          WHERE is_active = true AND latitude IS NOT NULL
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          LIMIT 200
        `;
        return rows;
      }
      default:
        return [];
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<{ success: boolean; data: any }> {
    const governorate = await this.prisma.$queryRaw`
      SELECT id, name_ar, name_en, code
      FROM governorates
      ORDER BY earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng}))
      LIMIT 1
    `;
    const city = await this.prisma.$queryRaw`
      SELECT id, name_ar, name_en
      FROM cities
      ORDER BY earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lng}))
      LIMIT 1
    `;
    return {
      success: true,
      data: {
        latitude: lat,
        longitude: lng,
        governorate: governorate[0] || null,
        city: city[0] || null,
      },
    };
  }

  async getClusters(params: {
    southWest: { lat: number; lng: number };
    northEast: { lat: number; lng: number };
    zoom: number;
    type?: string;
  }): Promise<{ success: boolean; data: ClusterResult[] }> {
    const { southWest, northEast, type } = params;
    const gridSize = Math.max(1, Math.floor(10 / (params.zoom || 10)));
    const results: ClusterResult[] = [];

    const types = type ? [type] : ['bank', 'pharmacy', 'hospital', 'government', 'transport', 'emergency'];

    for (const t of types) {
      const rows = await this.queryClusters(t, southWest.lat, southWest.lng, northEast.lat, northEast.lng, gridSize);
      results.push(...rows);
    }

    return { success: true, data: results };
  }

  private async queryClusters(type: string, swLat: number, swLng: number, neLat: number, neLng: number, gridSize: number): Promise<ClusterResult[]> {
    const gridLon = (neLng - swLng) / Math.max(1, gridSize);
    const gridLat = (neLat - swLat) / Math.max(1, gridSize);

    switch (type) {
      case 'bank': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'bank' as type
          FROM bank_branches
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      case 'pharmacy': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'pharmacy' as type
          FROM pharmacies
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      case 'hospital': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'hospital' as type
          FROM hospitals
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      case 'government': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'government' as type
          FROM government_offices
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      case 'transport': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'transport' as type
          FROM transport_stations
          WHERE is_active = true
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      case 'emergency': {
        const rows: any[] = await this.prisma.$queryRaw`
          SELECT
            ROUND(CAST(latitude / ${gridLat} AS numeric), 0) * ${gridLat} + ${gridLat}/2 as lat,
            ROUND(CAST(longitude / ${gridLon} AS numeric), 0) * ${gridLon} + ${gridLon}/2 as lng,
            COUNT(*) as count, 'emergency' as type
          FROM emergency_contacts
          WHERE is_active = true AND latitude IS NOT NULL
            AND latitude BETWEEN ${swLat} AND ${neLat}
            AND longitude BETWEEN ${swLng} AND ${neLng}
          GROUP BY ROUND(CAST(latitude / ${gridLat} AS numeric), 0), ROUND(CAST(longitude / ${gridLon} AS numeric), 0)
          LIMIT 100
        `;
        return rows.map(r => ({ latitude: Number(r.lat), longitude: Number(r.lng), count: Number(r.count), type: r.type }));
      }
      default:
        return [];
    }
  }

  async estimateRoute(params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
  }): Promise<{ success: boolean; data: any }> {
    const { fromLat, fromLng, toLat, toLng } = params;
    const result: any[] = await this.prisma.$queryRaw`
      SELECT
        earth_distance(ll_to_earth(${fromLat}, ${fromLng}), ll_to_earth(${toLat}, ${toLng})) as distance_meters,
        degrees(atan2(
          sin(radians(${toLng} - ${fromLng})) * cos(radians(${toLat})),
          cos(radians(${fromLat})) * sin(radians(${toLat})) - sin(radians(${fromLat})) * cos(radians(${toLat})) * cos(radians(${toLng} - ${fromLng}))
        )) as bearing
    `;
    const row = result[0];
    const distanceKm = Number(row.distance_meters) / 1000;
    const avgSpeedKmh = 40;
    const durationMin = Math.round((distanceKm / avgSpeedKmh) * 60);

    return {
      success: true,
      data: {
        distanceKm: Math.round(distanceKm * 100) / 100,
        durationMin,
        bearing: Math.round(Number(row.bearing) * 100) / 100,
        from: { latitude: fromLat, longitude: fromLng },
        to: { latitude: toLat, longitude: toLng },
      },
    };
  }

  async getEntityLocation(entityType: string, entityId: string): Promise<{ success: boolean; data: any }> {
    switch (entityType) {
      case 'bank': {
        const branch: any[] = await this.prisma.$queryRaw`
          SELECT br.id, b.name_ar as bank_name, br.name_ar as branch_name, br.latitude, br.longitude, br.street, br.phone
          FROM bank_branches br
          JOIN banks b ON b.id = br.bank_id
          WHERE br.id = ${entityId}::uuid
        `;
        return { success: true, data: branch[0] || null };
      }
      case 'pharmacy': {
        const pharmacy: any[] = await this.prisma.$queryRaw`
          SELECT id, name_ar, name_en, street, latitude, longitude, phone
          FROM pharmacies WHERE id = ${entityId}::uuid
        `;
        return { success: true, data: pharmacy[0] || null };
      }
      case 'hospital': {
        const hospital: any[] = await this.prisma.$queryRaw`
          SELECT id, name_ar, name_en, street, latitude, longitude, phone
          FROM hospitals WHERE id = ${entityId}::uuid
        `;
        return { success: true, data: hospital[0] || null };
      }
      case 'government': {
        const office: any[] = await this.prisma.$queryRaw`
          SELECT id, name_ar, name_en, street, latitude, longitude, phone
          FROM government_offices WHERE id = ${entityId}::uuid
        `;
        return { success: true, data: office[0] || null };
      }
      case 'transport': {
        const station: any[] = await this.prisma.$queryRaw`
          SELECT id, name_ar, name_en, line_name as street, latitude, longitude
          FROM transport_stations WHERE id = ${entityId}::uuid
        `;
        return { success: true, data: station[0] || null };
      }
      case 'emergency': {
        const contact: any[] = await this.prisma.$queryRaw`
          SELECT id, name_ar, name_en, hotline as phone, latitude, longitude
          FROM emergency_contacts WHERE id = ${entityId}::uuid
        `;
        return { success: true, data: contact[0] || null };
      }
      default:
        return { success: false, data: null };
    }
  }
}
