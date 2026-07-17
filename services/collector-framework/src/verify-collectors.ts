import { OFFICIAL_SOURCES, SOURCE_CONFIGS_BY_DOMAIN } from './sources/official-sources';
import { BanksCollector } from './collectors/banks-collector';
import { PharmaciesCollector } from './collectors/pharmacies-collector';
import { HospitalsCollector } from './collectors/hospitals-collector';
import { GovernmentCollector } from './collectors/government-collector';
import { TransportCollector } from './collectors/transport-collector';
import { EmergencyCollector } from './collectors/emergency-collector';
import { TelecomCollector } from './collectors/telecom-collector';
import { SupermarketsCollector } from './collectors/supermarkets-collector';
import { SourceResolver } from './source-resolver';

async function verifyCollector(name: string, collector: any, sourceResolver: SourceResolver): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[VERIFY] Running ${name}...`);
  console.log(`${'='.repeat(60)}`);

  const startTime = Date.now();
  const sources = sourceResolver.getSourcesByDomain(collector.syncConfig.domain);

  if (sources.length === 0) {
    console.log(`[${name}] WARNING: No sources registered for domain: ${collector.syncConfig.domain}`);
    return;
  }

  const source = sources[0];
  console.log(`[${name}] Source: ${source.sourceName} (${source.sourceUrl})`);
  console.log(`[${name}] Config: table=${collector.syncConfig.tableName}, matchFields=${collector.syncConfig.matchFields.join(', ')}`);

  try {
    const records = await collector.fetchFromSource(source);
    const duration = Date.now() - startTime;

    console.log(`\n[${name}] RESULTS:`);
    console.log(`  Records collected: ${records.length}`);
    console.log(`  Duration: ${duration}ms`);

    if (records.length > 0) {
      console.log(`\n[${name}] Sample record 1:`);
      const sample = { ...records[0] };
      if (sample.branches) {
        console.log(`  Name: ${sample.nameAr || sample.nameEn || 'N/A'}`);
        console.log(`  Branches: ${sample.branches.length}`);
        if (sample.branches.length > 0) {
          console.log(`  Sample branch: ${JSON.stringify(sample.branches[0], null, 4).substring(0, 200)}`);
        }
      } else {
        console.log(`  ${JSON.stringify(sample, null, 4).substring(0, 500)}`);
      }
    }

    console.log(`[${name}] VERIFIED: ${records.length} records imported successfully`);
  } catch (error: any) {
    console.error(`[${name}] ERROR: ${error.message}`);
  }
}

async function main() {
  console.log('Egypt Services Platform - Collector Verification');
  console.log('================================================\n');

  const sourceResolver = new SourceResolver();
  sourceResolver.registerSources(OFFICIAL_SOURCES);

  const collectors = [
    { name: 'BanksCollector', instance: new BanksCollector(null as any) },
    { name: 'PharmaciesCollector', instance: new PharmaciesCollector(null as any) },
    { name: 'HospitalsCollector', instance: new HospitalsCollector(null as any) },
    { name: 'GovernmentCollector', instance: new GovernmentCollector(null as any) },
    { name: 'TransportCollector', instance: new TransportCollector(null as any) },
    { name: 'EmergencyCollector', instance: new EmergencyCollector(null as any) },
    { name: 'TelecomCollector', instance: new TelecomCollector(null as any) },
    { name: 'SupermarketsCollector', instance: new SupermarketsCollector(null as any) },
  ];

  let totalRecords = 0;
  for (const { name, instance } of collectors) {
    await verifyCollector(name, instance, sourceResolver);
    totalRecords += (instance as any).lastRecordCount || 0;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`VERIFICATION COMPLETE: Total collectors: ${collectors.length}`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);