export default function PharmaciesPage() {
  const items = [
    { id: '1', nameAr: 'صيدلية العزبى', nameEn: 'El Ezaby Pharmacy', is24h: true, hasDelivery: true, phone: '+20 2 12345678' },
    { id: '2', nameAr: 'صيدلية شعبان', nameEn: 'Shaaban Pharmacy', is24h: false, hasDelivery: true, phone: '+20 2 23456789' },
    { id: '3', nameAr: 'صيدلية المنشاوى', nameEn: 'El Manshawy Pharmacy', is24h: true, hasDelivery: false, phone: '+20 2 34567890' },
  ];
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Pharmacies</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Find pharmacies, 24-hour outlets, and delivery services across Egypt</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input placeholder="Search pharmacies..." style={{ flex: 1 }} />
        <select><option>All Governorates</option></select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" /> 24 Hours</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="checkbox" /> Delivery</label>
        <button>Search</button>
      </div>
      <div className="grid">
        {items.map(p => (
          <a key={p.id} href={`/pharmacies/${p.id}`} className="card" style={{ display: 'block' }}>
            <h3>{p.nameAr}</h3>
            {p.nameEn && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{p.nameEn}</p>}
            {p.phone && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>📞 {p.phone}</p>}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
              {p.is24h && <span style={{ background: '#dbeafe', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>24 Hours</span>}
              {p.hasDelivery && <span style={{ background: '#d1fae5', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Delivery</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
