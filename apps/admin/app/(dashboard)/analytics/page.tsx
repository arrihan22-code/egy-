'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:3100/api/v1/analytics';

const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };

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

  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <h2>Entity Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <StatCard label="Banks" value={overview?.entities?.banks} color="#2563eb" />
        <StatCard label="Pharmacies" value={overview?.entities?.pharmacies} color="#16a34a" />
        <StatCard label="Hospitals" value={overview?.entities?.hospitals} color="#dc2626" />
        <StatCard label="Government" value={overview?.entities?.governmentOffices} color="#9333ea" />
        <StatCard label="Transport" value={overview?.entities?.transportStations} color="#ca8a04" />
        <StatCard label="Emergency" value={overview?.entities?.emergencyContacts} color="#dc2626" />
        <StatCard label="Reviews" value={overview?.reviews?.approved} color="#0891b2" />
        <StatCard label="Users" value={overview?.users?.verified} color="#6b7280" />
      </div>

      <h2>System Health</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Data Sources</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{health?.dataSources?.active}/{health?.dataSources?.total}</div>
          <div style={{ fontSize: '0.8rem', color: health?.status === 'healthy' ? '#16a34a' : '#dc2626' }}>
            {health?.status === 'healthy' ? 'Healthy' : 'Warning'}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Pending Imports</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{health?.imports?.pending}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Failed Imports</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: (health?.imports?.failed || 0) > 0 ? '#dc2626' : 'inherit' }}>{health?.imports?.failed}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Dead Letters</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: (health?.deadLetters || 0) > 0 ? '#dc2626' : 'inherit' }}>{health?.deadLetters}</div>
        </div>
      </div>

      <h2>Governorate Distribution</h2>
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Governorate</th>
              <th style={thStyle}>Banks</th>
              <th style={thStyle}>Pharmacies</th>
              <th style={thStyle}>Hospitals</th>
              <th style={thStyle}>Government</th>
              <th style={thStyle}>Transport</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {governorates.map((g: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}><strong>{g.nameAr}</strong></td>
                <td style={tdStyle}>{g.bankCount}</td>
                <td style={tdStyle}>{g.pharmacyCount}</td>
                <td style={tdStyle}>{g.hospitalCount}</td>
                <td style={tdStyle}>{g.governmentCount}</td>
                <td style={tdStyle}>{g.transportCount}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {Number(g.bankCount) + Number(g.pharmacyCount) + Number(g.hospitalCount) + Number(g.governmentCount) + Number(g.transportCount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Collector Performance (7 days)</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Runs</th>
              <th style={thStyle}>Fetched</th>
              <th style={thStyle}>Inserted</th>
              <th style={thStyle}>Updated</th>
              <th style={thStyle}>Failed</th>
              <th style={thStyle}>Avg Duration</th>
              <th style={thStyle}>Last Run</th>
            </tr>
          </thead>
          <tbody>
            {collectors.map((c: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{c.sourceName || c.collectorId}</td>
                <td style={tdStyle}>{c.sourcePriority}</td>
                <td style={tdStyle}>{c.totalRuns}</td>
                <td style={tdStyle}>{c.totalFetched}</td>
                <td style={tdStyle}>{c.totalInserted}</td>
                <td style={tdStyle}>{c.totalUpdated}</td>
                <td style={{ ...tdStyle, color: c.totalFailed > 0 ? '#dc2626' : 'inherit' }}>{c.totalFailed}</td>
                <td style={tdStyle}>{c.avgDurationSec}s</td>
                <td style={tdStyle}>{c.lastRun ? new Date(c.lastRun).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value ?? '-'}</div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}
