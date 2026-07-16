export default function Home() {
  return (
    <div>
      <section style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Egypt Services Platform</h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Find banks, pharmacies, hospitals, government offices, transport stations, and emergency contacts across Egypt
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <input
            placeholder="Search for services..."
            style={{ width: '400px', padding: '0.75rem 1rem', fontSize: '1.125rem' }}
          />
          <button style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Search</button>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1.5rem' }}>Browse Services</h2>
        <div className="grid">
          {[
            { title: 'Banks & ATMs', desc: 'Find banks, branches, ATMs near you', href: '/banks', icon: '🏦' },
            { title: 'Pharmacies', desc: '24-hour pharmacies, delivery available', href: '/pharmacies', icon: '💊' },
            { title: 'Hospitals', desc: 'Hospitals, clinics, doctors, emergency', href: '/hospitals', icon: '🏥' },
            { title: 'Government', desc: 'Civil ID, passport, traffic offices', href: '/government', icon: '🏛️' },
            { title: 'Transport', desc: 'Metro, trains, routes & schedules', href: '/transport', icon: '🚇' },
            { title: 'Emergency', desc: 'Police, fire, ambulance hotlines', href: '/emergency', icon: '🆘' },
          ].map(s => (
            <a key={s.title} href={s.href} className="card" style={{ display: 'block' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <h3 style={{ marginBottom: '0.25rem' }}>{s.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{s.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
