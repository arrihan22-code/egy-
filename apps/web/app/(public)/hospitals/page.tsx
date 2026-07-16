export default function HospitalsPage() {
  const items = [
    { id: '1', nameAr: 'مستشفى 57357', nameEn: 'Children Cancer Hospital 57357', type: 'hospital', hasEmergency: true, phone: '+20 2 12345678', specialties: 'Oncology, Pediatrics' },
    { id: '2', nameAr: 'مستشفى القصر العيني', nameEn: 'Qasr El Ainy Hospital', type: 'hospital', hasEmergency: true, phone: '+20 2 23456789', specialties: 'General, Surgery, Cardiology' },
    { id: '3', nameAr: 'المعهد القومى للقلب', nameEn: 'National Heart Institute', type: 'hospital', hasEmergency: true, phone: '+20 2 34567890', specialties: 'Cardiology, Cardiac Surgery' },
  ];
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Hospitals & Clinics</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Find hospitals, clinics, emergency rooms, and specialists across Egypt</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input placeholder="Search hospitals..." style={{ flex: 1 }} />
        <select><option>All Governorates</option></select>
        <select><option>All Specialties</option></select>
        <label><input type="checkbox" /> Emergency</label>
        <button>Search</button>
      </div>
      <div className="grid">
        {items.map(h => (
          <a key={h.id} href={`/hospitals/${h.id}`} className="card" style={{ display: 'block' }}>
            <h3>{h.nameAr}</h3>
            {h.nameEn && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{h.nameEn}</p>}
            {h.phone && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>📞 {h.phone}</p>}
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{h.specialties}</p>
            <div style={{ marginTop: '0.5rem' }}>
              {h.hasEmergency && <span style={{ background: '#fee2e2', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Emergency</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
