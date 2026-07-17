import { OFFICIAL_SOURCES } from '../dist/sources/official-sources.js';
import { BanksCollector } from '../dist/collectors/banks-collector.js';
import { PharmaciesCollector } from '../dist/collectors/pharmacies-collector.js';
import { HospitalsCollector } from '../dist/collectors/hospitals-collector.js';
import { GovernmentCollector } from '../dist/collectors/government-collector.js';
import { TransportCollector } from '../dist/collectors/transport-collector.js';
import { EmergencyCollector } from '../dist/collectors/emergency-collector.js';
import { TelecomCollector } from '../dist/collectors/telecom-collector.js';
import { SupermarketsCollector } from '../dist/collectors/supermarkets-collector.js';

async function main() {
  const domains = {
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
    const collector = new CollectorClass();
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
    } catch (err) {
      console.error(`[${domain}] FAILED: ${err.message}`);
    }
  }
  console.log(`\n========================================`);
  console.log(`Total records across all domains: ${grandTotal}`);
  console.log(`========================================`);
}

main().catch(console.error);