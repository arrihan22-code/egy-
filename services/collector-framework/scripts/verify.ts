import { OFFICIAL_SOURCES } from '../src/sources/official-sources';
import { BanksCollector } from '../src/collectors/banks-collector';
import { PharmaciesCollector } from '../src/collectors/pharmacies-collector';
import { HospitalsCollector } from '../src/collectors/hospitals-collector';
import { GovernmentCollector } from '../src/collectors/government-collector';
import { TransportCollector } from '../src/collectors/transport-collector';
import { EmergencyCollector } from '../src/collectors/emergency-collector';
import { TelecomCollector } from '../src/collectors/telecom-collector';
import { SupermarketsCollector } from '../src/collectors/supermarkets-collector';

async function main() {
  const domains: any = {
    'banks': BanksCollector,
    'pharmacies': PharmaciesCollector,
    'hospitals': HospitalsCollector,
    'government': GovernmentCollector,
    'transport': TransportCollector,
    'emergency': EmergencyCollector,
    'telecom': TelecomCollector,
    'supermarkets': SupermarketsCollector,
  };

  let grandTotal = 0;
  for (const [domain, CollectorClass] of Object.entries(domains)) {
    const sources = OFFICIAL_SOURCES.filter(s => s.domain === domain);
    if (sources.length === 0) {
      console.log(`[${domain}] No sources found`);
      continue;
    }
    const source = sources[0];
    const collector = new (CollectorClass as any)();
    console.log(`\n[${domain}] Source: ${source.name} (${source.url})`);
    try {
      const records = await collector.fetchFromSource(source);
      console.log(`[${domain}] Records collected: ${records.length}`);
      grandTotal += records.length;
      if (records.length > 0) {
        const sample = records[0];
        console.log(`[${domain}] Sample: ${sample.nameAr || sample.nameEn || JSON.stringify(sample).substring(0, 80)}`);
        if (sample.branches) {
          console.log(`[${domain}] Branches in sample: ${sample.branches.length}`);
        }
        const errors = records.filter((r: any) => r.status === 'error');
        if (errors.length > 0) {
          console.log(`[${domain}] Errors: ${errors.length}`);
        }
      }
    } catch (err: any) {
      console.error(`[${domain}] FAILED: ${err.message}`);
    }
  }
  console.log(`\n========================================`);
  console.log(`Total records across all domains: ${grandTotal}`);
  console.log(`========================================`);
}

main().catch(console.error);