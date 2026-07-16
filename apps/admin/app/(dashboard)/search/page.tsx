'use client';

import { useState, useEffect } from 'react';

const SEARCH_API = process.env.NEXT_PUBLIC_SEARCH_API || 'http://localhost:3060/api/v1/search';

export default function SearchAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [indexStats, setIndexStats] = useState<any>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildResult, setRebuildResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${SEARCH_API}/stats`).then(r => r.json()).then(setIndexStats).catch(() => {});
    fetch(`${SEARCH_API}/popular`).then(r => r.json()).then(d => setPopular(d.data || [])).catch(() => {});
    fetch(`${SEARCH_API}/trending`).then(r => r.json()).then(d => setTrending(d.data || [])).catch(() => {});
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      const res = await fetch(`${SEARCH_API}/rebuild`, { method: 'POST' });
      const data = await res.json();
      setRebuildResult(data);
    } catch { setRebuildResult({ error: 'Failed to rebuild' }); }
    setRebuilding(false);
  };

  return (
    <div>
      <h1>Search Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Indexed</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{indexStats?.total ?? '-'}</div>
        </div>
        {indexStats?.byType && Object.entries(indexStats.byType).map(([type, count]) => (
          <div key={type} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{type}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{count as number}</div>
          </div>
        ))}
      </div>

      <h2>Popular Searches (30 days)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={thStyle}>Query</th>
            <th style={thStyle}>Count</th>
            <th style={thStyle}>Last Searched</th>
          </tr>
        </thead>
        <tbody>
          {popular.map((p: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>{p.query}</td>
              <td style={tdStyle}>{p.count}</td>
              <td style={tdStyle}>{new Date(p.last_searched).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Trending (24h)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={thStyle}>Query</th>
            <th style={thStyle}>Searches</th>
          </tr>
        </thead>
        <tbody>
          {trending.map((t: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>{t.query}</td>
              <td style={tdStyle}>{t.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Index Management</h2>
      <button
        onClick={handleRebuild}
        disabled={rebuilding}
        style={{
          padding: '0.5rem 1rem',
          background: rebuilding ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: rebuilding ? 'not-allowed' : 'pointer',
        }}
      >
        {rebuilding ? 'Rebuilding...' : 'Rebuild Search Index'}
      </button>
      {rebuildResult && (
        <pre style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.375rem', overflow: 'auto' }}>
          {JSON.stringify(rebuildResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
