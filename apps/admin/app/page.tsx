'use client';

export default function AdminHome() {
  const collectors = [
    { id: 'banks-collector', domain: 'Banks', freq: 'Daily', time: '2h ago', status: 'success', records: 38 },
    { id: 'pharmacies-collector', domain: 'Pharmacies', freq: 'Daily', time: '3h ago', status: 'success', records: 4200 },
    { id: 'hospitals-collector', domain: 'Hospitals', freq: 'Daily', time: '4h ago', status: 'success', records: 850 },
    { id: 'government-collector', domain: 'Government', freq: 'Weekly', time: '1d ago', status: 'success', records: 120 },
    { id: 'transport-collector', domain: 'Transport', freq: 'Weekly', time: '2d ago', status: 'failed', records: 0 },
    { id: 'emergency-collector', domain: 'Emergency', freq: 'Weekly', time: '3d ago', status: 'success', records: 45 },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Sync Dashboard</h1>

      <div className="stats-grid">
        {[
          { value: '6', label: 'Collectors' },
          { value: '142', label: 'Syncs Today' },
          { value: '98.5%', label: 'Success Rate' },
          { value: '3', label: 'Failed Jobs', accent: true },
        ].map(s => (
          <div key={s.label} className="stat-card slide-up">
            <div className="stat-value" style={{ color: s.accent ? 'var(--error)' : 'var(--primary)' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card slide-up">
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Collector Status</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Collector</th>
                <th>Domain</th>
                <th>Frequency</th>
                <th>Last Sync</th>
                <th>Status</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{c.id}</td>
                  <td>{c.domain}</td>
                  <td>{c.freq}</td>
                  <td>{c.time}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.records.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
