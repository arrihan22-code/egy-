export default function TransportPage() {
  const items = [
    { id: '1', nameAr: 'محطة مترو السادات', nameEn: 'Sadat Metro Station', type: 'metro', line: 'Line 1 & 2' },
    { id: '2', nameAr: 'محطة مترو العتبة', nameEn: 'Ataba Metro Station', type: 'metro', line: 'Line 1 & 2' },
    { id: '3', nameAr: 'محطة مترو الجيزة', nameEn: 'Giza Metro Station', type: 'metro', line: 'Line 2' },
    { id: '4', nameAr: 'محطة سكة حديد مصر', nameEn: 'Ramses Railway Station', type: 'train', line: 'Main Lines' },
    { id: '5', nameAr: 'محطة مترو شبرا الخيمة', nameEn: 'Shobra El Kheima Station', type: 'metro', line: 'Line 2' },
  ];
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Transport</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Find metro, train, and bus stations with routes and schedules</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input placeholder="Search stations..." style={{ flex: 1 }} />
        <select><option>All Types</option><option>Metro</option><option>Train</option><option>Bus</option></select>
        <button>Search</button>
      </div>
      <div className="grid">
        {items.map(s => (
          <a key={s.id} href={`/transport/${s.id}`} className="card" style={{ display: 'block' }}>
            <h3>{s.nameAr}</h3>
            {s.nameEn && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{s.nameEn}</p>}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
              <span style={{ background: '#e0e7ff', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{s.line}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
