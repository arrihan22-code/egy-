'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:3100/api/v1/analytics';

export default function AnalyticsAdminPage() {
  const [overview, setOverview] = useState<any>(null);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [collectors, setCollectors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/overview`).then(r => r.json()),
      fetch(`${API}/governorates`).then(r => r.json()),
      fetch(`${API}/health`).then(r => r.json()),
      fetch(`${API}/collectors`).then(r => r.json()),
    ]).then(([o, g, h, c]) => {
      setOverview(o.data);
      setGovernorates(g.data || []);
      setHealth(h.data);
      setCollectors(c.data || []);
    }).catch(() => {});
  }, []);

  const entityTypes = [
    { key: 'banks', label: 'Banks', color: '#0A66C2', value: overview?.entities?.banks },
    { key: 'pharmacies', label: 'Pharmacies', color: '#10B981', value: overview?.entities?.pharmacies },
    { key: 'hospitals', label: 'Hospitals', color: '#EF4444', value: overview?.entities?.hospitals },
    { key: 'government', label: 'Government', color: '#8B5CF6', value: overview?.entities?.governmentOffices },
    { key: 'transport', label: 'Transport', color: '#F59E0B', value: overview?.entities?.transportStations },
    { key: 'emergency', label: 'Emergency', color: '#DC2626', value: overview?.entities?.emergencyContacts },
    { key: 'reviews', label: 'Reviews', color: '#0891B2', value: overview?.reviews?.approved },
    { key: 'users', label: 'Users', color: '#6B7280', value: overview?.users?.verified },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Analytics Dashboard</h1>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Entity Overview</h2>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {entityTypes.map(e => (
            <div key={e.key} className="stat-card slide-up">
              <div className="stat-value" style={{ color: e.color }}>{e.value ?? '-'}</div>
              <div className="stat-label">{e.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>System Health</h2>
        <div className="grid grid-4" style={{ gap: 'var(--space-4)' }}>
          {[
            { label: 'Data Sources', value: health ? `${health?.dataSources?.active}/${health?.dataSources?.total}` : '-', sub: health?.status === 'healthy' ? 'Healthy' : 'Warning', subColor: health?.status === 'healthy' ? 'var(--accent-dark)' : 'var(--error)' },
            { label: 'Pending Imports', value: health?.imports?.pending ?? '-', sub: '' },
            { label: 'Failed Imports', value: health?.imports?.failed ?? '-', sub: '', accent: (health?.imports?.failed || 0) > 0 },
            { label: 'Dead Letters', value: health?.deadLetters ?? '-', sub: '', accent: (health?.deadLetters || 0) > 0 },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: s.accent ? 'var(--error)' : 'var(--text-primary)' }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 'var(--text-xs)', color: s.subColor, marginTop: 'var(--space-1)' }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Governorate Distribution</h2>
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Governorate</th>
                <th>Banks</th>
                <th>Pharmacies</th>
                <th>Hospitals</th>
                <th>Government</th>
                <th>Transport</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {governorates.map((g: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{g.nameAr}</td>
                  <td>{g.bankCount ?? 0}</td>
                  <td>{g.pharmacyCount ?? 0}</td>
                  <td>{g.hospitalCount ?? 0}</td>
                  <td>{g.governmentCount ?? 0}</td>
                  <td>{g.transportCount ?? 0}</td>
                  <td style={{ fontWeight: 600 }}>
                    {[g.bankCount, g.pharmacyCount, g.hospitalCount, g.governmentCount, g.transportCount].reduce((a: number, b: string) => a + (Number(b) || 0), 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Collector Performance (7 days)</h2>
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Priority</th>
                <th>Runs</th>
                <th>Fetched</th>
                <th>Inserted</th>
                <th>Updated</th>
                <th>Failed</th>
                <th>Avg Duration</th>
                <th>Last Run</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map((c: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{c.sourceName || c.collectorId}</td>
                  <td>{c.sourcePriority}</td>
                  <td>{c.totalRuns}</td>
                  <td>{c.totalFetched}</td>
                  <td>{c.totalInserted}</td>
                  <td>{c.totalUpdated}</td>
                  <td style={{ color: (c.totalFailed || 0) > 0 ? 'var(--error)' : 'inherit', fontWeight: (c.totalFailed || 0) > 0 ? 600 : 400 }}>{c.totalFailed ?? 0}</td>
                  <td>{c.avgDurationSec || '-'}s</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{c.lastRun ? new Date(c.lastRun).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
