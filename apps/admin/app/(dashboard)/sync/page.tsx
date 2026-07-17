'use client';

import { useState, useEffect } from 'react';

const SYNC_API = process.env.NEXT_PUBLIC_SYNC_API || 'http://localhost:3120';
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3110/api/v1/auth';

const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem',
};
const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };
const btnStyle: React.CSSProperties = { padding: '0.375rem 0.75rem', fontSize: '0.8rem', borderRadius: 4, border: '1px solid #d1d5db', cursor: 'pointer', background: '#f9fafb' };

interface SyncStatus {
  domain: string;
  isSyncing: boolean;
  lastSync: string | null;
}

interface SyncStats {
  domain: string;
  total_syncs: string;
  successful: string;
  failed: string;
  avg_duration_ms: number;
  total_inserted: string;
  total_updated: string;
  last_sync: string;
}

export default function SyncPage() {
  const [statuses, setStatuses] = useState<SyncStatus[]>([]);
  const [stats, setStats] = useState<SyncStats[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'history' | 'sources'>('dashboard');
  const [sources, setSources] = useState<any[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${SYNC_API}/api/v1/sync/status`);
      const d = await res.json();
      if (d.success) setStatuses(d.data);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${SYNC_API}/api/v1/sync/stats`);
      const d = await res.json();
      if (d.success) setStats(d.data);
    } catch {}
  };

  const fetchHistory = async (p: number) => {
    try {
      const res = await fetch(`${SYNC_API}/api/v1/sync/history?page=${p}&limit=20`);
      const d = await res.json();
      if (d.success) { setHistory(d.data); setTotalHistory(d.meta?.total || 0); }
    } catch {}
  };

  const fetchSources = async () => {
    try {
      const res = await fetch(`${SYNC_API}/api/v1/sync/sources`);
      const d = await res.json();
      if (d.success) setSources(d.data);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    fetchStats();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === 'history') fetchHistory(page);
    if (tab === 'sources') fetchSources();
  }, [tab, page]);

  const triggerSync = async (domain: string) => {
    setSyncing(domain);
    try {
      await fetch(`${SYNC_API}/api/v1/sync/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, triggeredBy: 'manual' }),
      });
      await new Promise(r => setTimeout(r, 2000));
      fetchStatus();
      fetchStats();
    } finally { setSyncing(null); }
  };

  const triggerAll = async () => {
    setSyncing('all');
    try {
      await fetch(`${SYNC_API}/api/v1/sync/trigger-all`, { method: 'POST' });
      await new Promise(r => setTimeout(r, 2000));
      fetchStatus();
      fetchStats();
    } finally { setSyncing(null); }
  };

  const totalPages = Math.ceil(totalHistory / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Data Synchronization</h1>
        <button onClick={triggerAll} disabled={syncing === 'all'} style={{ ...btnStyle, background: syncing === 'all' ? '#e5e7eb' : '#2563eb', color: 'white', border: 'none' }}>
          {syncing === 'all' ? 'Syncing All...' : 'Sync All'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['dashboard', 'history', 'sources'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...btnStyle, background: tab === t ? '#2563eb' : '#f9fafb', color: tab === t ? 'white' : '#374151', border: tab === t ? 'none' : '1px solid #d1d5db' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statuses.map(s => {
              const stat = stats.find(st => st.domain === s.domain);
              return (
                <div key={s.domain} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, textTransform: 'capitalize' }}>{s.domain}</h3>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: s.isSyncing ? '#f59e0b' : s.lastSync ? '#16a34a' : '#9ca3af',
                      display: 'inline-block',
                    }} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0' }}>
                    Last sync: {s.lastSync ? new Date(s.lastSync).toLocaleString() : 'Never'}
                  </p>
                  {stat && (
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0' }}>
                      {stat.total_inserted} inserted · {stat.total_updated} updated · {stat.total_syncs} syncs
                    </p>
                  )}
                  <button
                    onClick={() => triggerSync(s.domain)}
                    disabled={syncing === s.domain || s.isSyncing}
                    style={{ ...btnStyle, marginTop: '0.5rem', width: '100%', opacity: syncing === s.domain ? 0.6 : 1 }}
                  >
                    {syncing === s.domain ? 'Syncing...' : s.isSyncing ? 'In Progress...' : 'Sync Now'}
                  </button>
                </div>
              );
            })}
          </div>

          {stats.length > 0 && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>30-Day Sync Statistics</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Domain</th>
                    <th style={thStyle}>Syncs</th>
                    <th style={thStyle}>Success</th>
                    <th style={thStyle}>Failed</th>
                    <th style={thStyle}>Avg Duration</th>
                    <th style={thStyle}>Inserted</th>
                    <th style={thStyle}>Updated</th>
                    <th style={thStyle}>Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(s => (
                    <tr key={s.domain} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tdStyle}><strong>{s.domain}</strong></td>
                      <td style={tdStyle}>{s.total_syncs}</td>
                      <td style={{ ...tdStyle, color: '#16a34a' }}>{s.successful}</td>
                      <td style={{ ...tdStyle, color: parseInt(s.failed) > 0 ? '#dc2626' : undefined }}>{s.failed}</td>
                      <td style={tdStyle}>{(s.avg_duration_ms / 1000).toFixed(1)}s</td>
                      <td style={tdStyle}>{s.total_inserted}</td>
                      <td style={tdStyle}>{s.total_updated}</td>
                      <td style={tdStyle}>{s.last_sync ? new Date(s.last_sync).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Sync History</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Domain</th>
                <th style={thStyle}>Triggered By</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Inserted</th>
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Failed</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Started</th>
                <th style={thStyle}>Error</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: any) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{h.domain}</td>
                  <td style={tdStyle}>{h.triggered_by}</td>
                  <td style={{ ...tdStyle, color: h.status === 'completed' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {h.status}
                  </td>
                  <td style={tdStyle}>{h.records_inserted}</td>
                  <td style={tdStyle}>{h.records_updated}</td>
                  <td style={tdStyle}>{h.records_failed}</td>
                  <td style={tdStyle}>{h.duration_ms ? `${(h.duration_ms / 1000).toFixed(1)}s` : '-'}</td>
                  <td style={tdStyle}>{h.started_at ? new Date(h.started_at).toLocaleString() : '-'}</td>
                  <td style={{ ...tdStyle, color: '#dc2626', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.error_message || '-'}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No sync history yet</td></tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnStyle}>Previous</button>
              <span style={{ fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={btnStyle}>Next</button>
            </div>
          )}
        </div>
      )}

      {tab === 'sources' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Data Sources</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Domain</th>
                <th style={thStyle}>Source Name</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Update Freq.</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Sync</th>
                <th style={thStyle}>Failures</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}><strong>{s.domain}</strong></td>
                  <td style={tdStyle}>{s.source_name}</td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={s.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{s.source_url}</a>
                  </td>
                  <td style={tdStyle}>{s.source_type}</td>
                  <td style={tdStyle}>{s.priority}</td>
                  <td style={tdStyle}>{s.update_frequency}</td>
                  <td style={{ ...tdStyle, color: s.is_active ? '#16a34a' : '#dc2626' }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td style={tdStyle}>{s.last_sync_at ? new Date(s.last_sync_at).toLocaleString() : 'Never'}</td>
                  <td style={{ ...tdStyle, color: s.consecutive_failures > 0 ? '#dc2626' : undefined }}>
                    {s.consecutive_failures}
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No sources configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}