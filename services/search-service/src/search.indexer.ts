import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ElasticsearchService, SearchDocument } from './elasticsearch.service';

@Injectable()
export class SearchIndexer {
  private readonly logger = new Logger(SearchIndexer.name);

  constructor(
    private prisma: PrismaService,
    private es: ElasticsearchService,
  ) {}

  async rebuildAll() {
    this.logger.log('Starting full index rebuild...');
    await this.es.clearIndex();

    const results = await Promise.allSettled([
      this.indexBanks(),
      this.indexPharmacies(),
      this.indexHospitals(),
      this.indexGovernment(),
      this.indexTransport(),
      this.indexEmergency(),
    ]);

    const stats = await this.es.getIndexStats();
    this.logger.log(`Index rebuild complete: ${JSON.stringify(stats)}`);
    return stats;
  }

  async indexBanks() {
    const banks = await this.prisma.bank.findMany({
      where: { isActive: true },
      include: { branches: { include: { bank: true } } },
    });
    const docs: SearchDocument[] = [];
    for (const bank of banks) {
      for (const branch of bank.branches) {
        docs.push({
          id: branch.id,
          type: 'bank',
          nameAr: `${bank.nameAr} - ${branch.nameAr}`,
          nameEn: branch.nameEn ? `${bank.nameEn || ''} - ${branch.nameEn}` : undefined,
          phone: branch.phone,
          address: branch.street || undefined,
          governorateId: branch.governorateId,
          cityId: branch.cityId,
          latitude: Number(branch.latitude),
          longitude: Number(branch.longitude),
          tags: ['bank', 'branch', bank.code],
          isActive: branch.isActive,
          createdAt: branch.createdAt.toISOString(),
          updatedAt: branch.updatedAt.toISOString(),
          sourceUrl: undefined,
        };
      });
    }
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} bank branches`);
  }

  async indexPharmacies() {
    const pharmacies = await this.prisma.pharmacy.findMany({ where: { isActive: true } });
    const docs: SearchDocument[] = pharmacies.map(p => ({
      id: p.id,
      type: 'pharmacy',
      nameAr: p.nameAr,
      nameEn: p.nameEn || undefined,
      phone: p.phone || undefined,
      address: p.street || undefined,
      governorateId: p.governorateId,
      cityId: p.cityId,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      tags: ['pharmacy', p.is24h ? '24h' : '', p.hasDelivery ? 'delivery' : ''].filter(Boolean),
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} pharmacies`);
  }

  async indexHospitals() {
    const hospitals = await this.prisma.hospital.findMany({
      where: { isActive: true },
      include: { departments: true },
    });
    const docs: SearchDocument[] = hospitals.map(h => ({
      id: h.id,
      type: 'hospital',
      nameAr: h.nameAr,
      nameEn: h.nameEn || undefined,
      description: h.departments.map(d => d.nameAr).join(', ') || undefined,
      phone: h.phone || undefined,
      address: h.street || undefined,
      governorateId: h.governorateId,
      cityId: h.cityId,
      latitude: Number(h.latitude),
      longitude: Number(h.longitude),
      tags: ['hospital', h.type, h.ownership, h.hasEmergency ? 'emergency' : ''].filter(Boolean),
      isActive: h.isActive,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    });
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} hospitals`);
  }

  async indexGovernment() {
    const offices = await this.prisma.governmentOffice.findMany({
      where: { isActive: true },
      include: { services: true },
    });
    const docs: SearchDocument[] = offices.map(o => ({
      id: o.id,
      type: 'government',
      nameAr: o.nameAr,
      nameEn: o.nameEn || undefined,
      description: o.services.map(s => s.serviceNameAr).join(', ') || undefined,
      phone: o.phone || undefined,
      address: o.street || undefined,
      governorateId: o.governorateId,
      cityId: o.cityId,
      latitude: Number(o.latitude),
      longitude: Number(o.longitude),
      tags: ['government', o.type],
      isActive: o.isActive,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} government offices`);
  }

  async indexTransport() {
    const stations = await this.prisma.transportStation.findMany({ where: { isActive: true } });
    const docs: SearchDocument[] = stations.map(s => ({
      id: s.id,
      type: 'transport',
      nameAr: s.nameAr,
      nameEn: s.nameEn || undefined,
      phone: undefined,
      address: s.lineName || undefined,
      governorateId: s.governorateId,
      cityId: s.cityId,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      tags: ['transport', s.type, s.lineName || ''].filter(Boolean),
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} transport stations`);
  }

  async indexEmergency() {
    const contacts = await this.prisma.emergencyContact.findMany({ where: { isActive: true } });
    const docs: SearchDocument[] = contacts.map(c => ({
      id: c.id,
      type: 'emergency',
      nameAr: c.nameAr,
      nameEn: c.nameEn || undefined,
      phone: c.hotline,
      address: undefined,
      governorateId: c.governorateId || undefined,
      cityId: c.cityId || undefined,
      latitude: c.latitude ? Number(c.latitude) : undefined,
      longitude: c.longitude ? Number(c.longitude) : undefined,
      tags: ['emergency', c.type, c.isNational ? 'national' : 'local'].filter(Boolean),
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
    await this.es.bulkIndex(docs);
    this.logger.log(`Indexed ${docs.length} emergency contacts`);
  }
}
