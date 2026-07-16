export default async function PharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = { id, nameAr: 'صيدلية العزبى', nameEn: 'El Ezaby Pharmacy', is24h: true, hasDelivery: true, phone: '+20 2 12345678', whatsapp: '+20 2 12345678', street: '12 Tahrir Street', governorate: 'Cairo', city: 'Downtown', workingHours: [{ day: 'Saturday - Thursday', hours: '08:00 - 23:00' }, { day: 'Friday', hours: '10:00 - 22:00' }] };

  return (
    <div>
      <a href="/pharmacies" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to Pharmacies</a>
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{p.nameAr}</h1>
        {p.nameEn && <p style={{ color: '#6b7280' }}>{p.nameEn}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>Phone</strong><p>📞 {p.phone}</p></div>
        {p.whatsapp && <div className="card"><strong>WhatsApp</strong><p>{p.whatsapp}</p></div>}
        <div className="card"><strong>Address</strong><p>{p.street}, {p.city}</p></div>
        <div className="card">
          <strong>Hours</strong>
          {p.workingHours.map((w, i) => <p key={i} style={{ fontSize: '0.875rem' }}>{w.day}: {w.hours}</p>)}
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {p.is24h && <span style={{ background: '#dbeafe', padding: '0.25rem 1rem', borderRadius: '4px' }}>24 Hours</span>}
        {p.hasDelivery && <span style={{ background: '#d1fae5', padding: '0.25rem 1rem', borderRadius: '4px' }}>Delivery Available</span>}
      </div>
    </div>
  );
}
