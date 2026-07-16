const hotlines = [
  { type: 'police', nameAr: 'الشرطة', nameEn: 'Police', hotline: '122', isNational: true },
  { type: 'ambulance', nameAr: 'الإسعاف', nameEn: 'Ambulance', hotline: '123', isNational: true },
  { type: 'fire', nameAr: 'المطافئ', nameEn: 'Fire Department', hotline: '180', isNational: true },
  { type: 'civil_defense', nameAr: 'الدفاع المدنى', nameEn: 'Civil Defense', hotline: '160', isNational: true },
];

const alerts = [
  { titleAr: 'تحذير من طقس سيء', titleEn: 'Severe Weather Warning', severity: 'warning', desc: 'Heavy rainfall expected in Alexandria and Delta regions' },
];

export default function EmergencyPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Emergency Services</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>National hotlines, emergency contacts, and active alerts</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>National Hotlines</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {hotlines.map(h => (
            <a key={h.type} href={`tel:${h.hotline}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.125rem' }}>
              <div style={{ fontSize: '2rem' }}>{h.type === 'police' ? '🚔' : h.type === 'ambulance' ? '🚑' : h.type === 'fire' ? '🚒' : '🛡️'}</div>
              <div>
                <strong>{h.nameAr}</strong>
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.25rem' }}>{h.hotline}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {alerts.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Active Alerts</h2>
          {alerts.map((a, i) => (
            <div key={i} className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span>⚠️</span>
                <strong>{a.titleAr}</strong>
              </div>
              <p style={{ fontSize: '0.875rem' }}>{a.desc}</p>
              <span style={{ background: '#f59e0b', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', marginTop: '0.5rem' }}>{a.severity}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
