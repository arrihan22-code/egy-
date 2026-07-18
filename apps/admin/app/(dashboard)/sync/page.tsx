'use client';

import { useState } from 'react';

export default function SyncPage() {
  const [tab, setTab] = useState<'dashboard' | 'history' | 'sources'>('dashboard');

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'history' as const, label: 'History' },
    { id: 'sources' as const, label: 'Data Sources' },
  ];

  const stats = [
    { label: 'Active Syncs', value: '4' },
    { label: 'Queued', value: '12' },
    { label: 'Completed Today', value: '142' },
    { label: 'Failed Today', value: '3', accent: true },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Sync Management</h1>

      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', background: 'var(--surface-secondary)', padding: 'var(--space-1)', borderRadius: 'var(--radius-lg)', maxWidth: 400 }}>
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

      {tab === 'dashboard' && (
        <>
          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label} className="stat-card slide-up">
                <div className="stat-value" style={{ color: s.accent ? 'var(--error)' : 'var(--primary)' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card slide-up" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Real-time Sync Dashboard</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Live sync status and metrics will appear here when data collectors are active.</p>
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>30-Day Sync History</h2>
          <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Sync history chart will be displayed here.
          </div>
        </div>
      )}

      {tab === 'sources' && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {['Banks', 'Pharmacies', 'Hospitals', 'Government', 'Transport', 'Emergency'].map(s => (
                <tr key={s}>
                  <td style={{ fontWeight: 500 }}>{s}</td>
                  <td>Web Scraper</td>
                  <td>{s === 'Banks' ? 'High' : 'Normal'}</td>
                  <td><span className="badge badge-success">Active</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Today, 2h ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
