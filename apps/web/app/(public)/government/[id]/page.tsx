export default async function GovernmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = { nameAr: 'مكتب سجل مدنى', nameEn: 'Civil Registry Office', type: 'civil_id', phone: '+20 2 12345678', email: 'civil@moi.gov.eg', street: '5 El Tahrir Street', governorate: 'Cairo', services: [{ name: 'Issuance of Birth Certificate', fee: '25 EGP', time: 'Same day' }, { name: 'Issuance of Death Certificate', fee: '15 EGP', time: 'Same day' }, { name: 'Family Record Extract', fee: '30 EGP', time: '3 days' }] };

  return (
    <div>
      <a href="/government" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to Government Offices</a>
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{g.nameAr}</h1>
        {g.nameEn && <p style={{ color: '#6b7280' }}>{g.nameEn}</p>}
        <span style={{ background: '#e0e7ff', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.25rem', display: 'inline-block' }}>{g.type.replace('_', ' ')}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>Phone</strong><p>📞 {g.phone}</p></div>
        {g.email && <div className="card"><strong>Email</strong><p>{g.email}</p></div>}
        <div className="card"><strong>Address</strong><p>{g.street}, {g.governorate}</p></div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Services ({g.services.length})</h2>
        <div className="grid">
          {g.services.map((s, i) => (
            <div key={i} className="card">
              <h3>{s.name}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fee: {s.fee}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Processing: {s.time}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
