'use client';

import { useState } from 'react';

export default function SearchAdminPage() {
  const [tab, setTab] = useState<'stats' | 'queries' | 'rebuild'>('stats');

  const tabs = [
    { id: 'stats' as const, label: 'Index Stats' },
    { id: 'queries' as const, label: 'Popular Queries' },
    { id: 'rebuild' as const, label: 'Rebuild Index' },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Search Analytics</h1>

      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', background: 'var(--surface-secondary)', padding: 'var(--space-1)', borderRadius: 'var(--radius-lg)', maxWidth: 450 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: tab === t.id ? 'var(--surface-elevated)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="stats-grid">
          {[
            { label: 'Total Documents', value: '45,283' },
            { label: 'Index Size', value: '128 MB' },
            { label: 'Avg Query Time', value: '43ms' },
            { label: 'Queries Today', value: '2,847' },
          ].map(s => (
            <div key={s.label} className="stat-card slide-up">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'queries' && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Count</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { q: 'ATM near me', c: 1234, trend: 'up' },
                { q: '24 hour pharmacy', c: 987, trend: 'up' },
                { q: 'metro map', c: 756, trend: 'stable' },
                { q: 'civil id office', c: 543, trend: 'down' },
                { q: 'emergency numbers', c: 432, trend: 'up' },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.q}</td>
                  <td>{r.c}</td>
                  <td>
                    <span className={`badge ${r.trend === 'up' ? 'badge-success' : r.trend === 'down' ? 'badge-failed' : 'badge-neutral'}`}>
                      {r.trend === 'up' ? '\u2191' : r.trend === 'down' ? '\u2193' : '\u2192'} {r.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'rebuild' && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Rebuild Search Index</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
            This will rebuild the entire search index from all data sources. This operation may take several minutes.
          </p>
          <button className="btn btn-primary" style={{ margin: '0 auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            Rebuild Index
          </button>
        </div>
      )}
    </div>
  );
}
