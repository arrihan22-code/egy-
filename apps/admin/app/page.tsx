export default function AdminHome() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Sync Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">6</div>
          <div className="stat-label">Collectors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">142</div>
          <div className="stat-label">Syncs Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">98.5%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Failed Jobs</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Collector Status</h2>
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
            {[
              { id: 'banks-collector', domain: 'Banks', freq: 'Daily', time: '2h ago', status: 'success', records: 38 },
              { id: 'pharmacies-collector', domain: 'Pharmacies', freq: 'Daily', time: '3h ago', status: 'success', records: 4200 },
              { id: 'hospitals-collector', domain: 'Hospitals', freq: 'Daily', time: '4h ago', status: 'success', records: 850 },
              { id: 'government-collector', domain: 'Government', freq: 'Weekly', time: '1d ago', status: 'success', records: 120 },
              { id: 'transport-collector', domain: 'Transport', freq: 'Weekly', time: '2d ago', status: 'failed', records: 0 },
              { id: 'emergency-collector', domain: 'Emergency', freq: 'Weekly', time: '3d ago', status: 'success', records: 45 },
            ].map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.domain}</td>
                <td>{c.freq}</td>
                <td>{c.time}</td>
                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                <td>{c.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
