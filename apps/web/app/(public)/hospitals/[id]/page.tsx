export default async function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = { nameAr: 'مستشفى 57357', nameEn: 'Children Cancer Hospital 57357', type: 'hospital', hasEmergency: true, phone: '+20 2 12345678', email: 'info@57357.org', website: 'https://www.57357.org', street: '1 Sekket El Imam', governorate: 'Cairo', departments: ['Oncology', 'Pediatrics', 'Radiology', 'Pharmacy'], doctors: [{ name: 'Dr. Ahmed Ali', specialty: 'Pediatric Oncology' }, { name: 'Dr. Sara Mahmoud', specialty: 'Radiology' }] };

  return (
    <div>
      <a href="/hospitals" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to Hospitals</a>
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{h.nameAr}</h1>
        {h.nameEn && <p style={{ color: '#6b7280' }}>{h.nameEn}</p>}
      </div>
      {h.hasEmergency && <div style={{ marginTop: '0.5rem', background: '#fee2e2', padding: '0.5rem 1rem', borderRadius: '6px' }}>🚨 24/7 Emergency Services Available</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>Phone</strong><p>📞 {h.phone}</p></div>
        {h.email && <div className="card"><strong>Email</strong><p>{h.email}</p></div>}
        {h.website && <div className="card"><strong>Website</strong><p><a href={h.website} target="_blank">{h.website}</a></p></div>}
        <div className="card"><strong>Address</strong><p>{h.street}, {h.governorate}</p></div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Departments ({h.departments.length})</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {h.departments.map((d, i) => <span key={i} style={{ background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>{d}</span>)}
        </div>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Doctors ({h.doctors.length})</h2>
        <div className="grid">
          {h.doctors.map((d, i) => <div key={i} className="card"><h3>{d.name}</h3><p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{d.specialty}</p></div>)}
        </div>
      </section>
    </div>
  );
}
