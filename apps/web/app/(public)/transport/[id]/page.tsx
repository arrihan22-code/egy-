export default async function TransportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = { nameAr: 'محطة مترو السادات', nameEn: 'Sadat Metro Station', type: 'metro', line: 'Line 1 & 2', zone: 'Central Cairo', hasParking: false, hasAccessibility: true, routes: [{ from: 'El Marg', to: 'Helwan', duration: '45 min', fare: '5 EGP' }, { from: 'Shobra El Kheima', to: 'El Monib', duration: '35 min', fare: '5 EGP' }] };

  return (
    <div>
      <a href="/transport" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to Transport</a>
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{s.nameAr}</h1>
        {s.nameEn && <p style={{ color: '#6b7280' }}>{s.nameEn}</p>}
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
          <span style={{ background: '#e0e7ff', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{s.line}</span>
          {s.hasParking && <span style={{ background: '#d1fae5', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Parking</span>}
          {s.hasAccessibility && <span style={{ background: '#dbeafe', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Accessible</span>}
        </div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Routes from this station</h2>
        <div className="grid">
          {s.routes.map((r, i) => (
            <div key={i} className="card">
              <p><strong>From:</strong> {r.from}</p>
              <p><strong>To:</strong> {r.to}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>⏱ {r.duration} | 💰 {r.fare}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
