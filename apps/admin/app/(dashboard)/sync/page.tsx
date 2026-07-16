'use client';

const collectors = [
  { id: 'banks-collector', name: 'Banks Collector', lastSync: '2 hours ago', records: 38 },
  { id: 'pharmacies-collector', name: 'Pharmacies Collector', lastSync: '3 hours ago', records: 4200 },
  { id: 'hospitals-collector', name: 'Hospitals Collector', lastSync: '4 hours ago', records: 850 },
  { id: 'government-collector', name: 'Government Collector', lastSync: '1 day ago', records: 120 },
  { id: 'transport-collector', name: 'Transport Collector', lastSync: '2 days ago', records: 0 },
  { id: 'emergency-collector', name: 'Emergency Collector', lastSync: '3 days ago', records: 45 },
];

export default function SyncPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Manual Sync</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Trigger manual data synchronization for any collector</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {collectors.map(c => (
          <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{c.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Last sync: {c.lastSync}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Records: {c.records}</p>
            <button onClick={() => alert('Sync triggered: ' + c.id)}>Sync Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
