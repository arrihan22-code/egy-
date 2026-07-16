export default function GovernmentPage() {
  const items = [
    { id: '1', nameAr: 'مكتب سجل مدنى', nameEn: 'Civil Registry Office', type: 'civil_id', phone: '+20 2 12345678', services: 12 },
    { id: '2', nameAr: 'مكتب جوازات', nameEn: 'Passport Office', type: 'passport', phone: '+20 2 23456789', services: 8 },
    { id: '3', nameAr: 'مكتب مرور', nameEn: 'Traffic Office', type: 'traffic', phone: '+20 2 34567890', services: 15 },
    { id: '4', nameAr: 'مكتب بريد', nameEn: 'Post Office', type: 'post_office', phone: '+20 2 45678901', services: 20 },
  ];
  const types = ['all', 'civil_id', 'passport', 'traffic', 'post_office', 'license'];
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Government Offices</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Find civil ID, passport, traffic, and post offices across Egypt</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {types.map(t => <a key={t} href={`/government?type=${t}`} style={{ padding: '0.25rem 0.75rem', background: '#f3f4f6', borderRadius: '4px', fontSize: '0.875rem' }}>{t.replace('_', ' ')}</a>)}
      </div>
      <div className="grid">
        {items.map(g => (
          <a key={g.id} href={`/government/${g.id}`} className="card" style={{ display: 'block' }}>
            <h3>{g.nameAr}</h3>
            {g.nameEn && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{g.nameEn}</p>}
            {g.phone && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>📞 {g.phone}</p>}
            <p style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>{g.services} services</p>
          </a>
        ))}
      </div>
    </div>
  );
}
