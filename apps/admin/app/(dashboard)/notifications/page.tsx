'use client';

import { useState, useEffect } from 'react';

const NOTIF_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API || 'http://localhost:3090/api/v1/notifications';

const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };

export default function NotificationsAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [channel, setChannel] = useState('in_app');
  const [sendResult, setSendResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`${NOTIF_API}/stats`).then(r => r.json()).then(d => setStats(d.data)).catch(() => {});
  }, []);

  const handleBroadcast = async () => {
    setSending(true);
    try {
      const res = await fetch(`${NOTIF_API}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, type: notifType, channel }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch { setSendResult({ success: false, message: 'Failed to send' }); }
    setSending(false);
  };

  return (
    <div>
      <h1>Notifications</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total (7 days)</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.summary?.total || '-'}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Unread</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{(stats?.summary?.total || 0) - (stats?.summary?.read_count || 0)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Last 24h</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.summary?.last_24h || '-'}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>In-App</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats?.summary?.in_app_count || 0}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2>Broadcast Notification</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              placeholder="Notification title..."
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '80px' }}
              placeholder="Notification body..."
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Type</label>
              <select value={notifType} onChange={e => setNotifType(e.target.value)} style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                <option value="info">Info</option>
                <option value="alert">Alert</option>
                <option value="promo">Promo</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Channel</label>
              <select value={channel} onChange={e => setChannel(e.target.value)} style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleBroadcast}
            disabled={sending || !title}
            style={{
              padding: '0.5rem 1rem',
              background: sending || !title ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: sending || !title ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {sending ? 'Sending...' : 'Broadcast to All Users'}
          </button>
          {sendResult && (
            <div style={{ padding: '0.75rem', background: sendResult.success ? '#f0fdf4' : '#fef2f2', borderRadius: '0.375rem', color: sendResult.success ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>
              {sendResult.success ? `Sent to ${sendResult.data?.totalSent} users` : sendResult.message || 'Failed'}
            </div>
          )}
        </div>
      </div>

      {stats?.byType && (
        <div>
          <h2>By Type</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Count</th>
              </tr>
            </thead>
            <tbody>
              {(stats.byType as any[]).map((b: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{b.type}</td>
                  <td style={tdStyle}>{b.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
