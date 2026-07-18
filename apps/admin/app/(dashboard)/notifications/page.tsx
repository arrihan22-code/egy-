'use client';

import { useState } from 'react';

export default function NotificationsAdminPage() {
  const [type, setType] = useState('info');

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Notifications</h1>

      <div className="stats-grid">
        {[
          { label: 'Total Sent', value: '12,847' },
          { label: 'Pending', value: '234' },
          { label: 'Failed', value: '12', accent: true },
          { label: 'Open Rate', value: '68%' },
        ].map(s => (
          <div key={s.label} className="stat-card slide-up">
            <div className="stat-value" style={{ color: s.accent ? 'var(--error)' : 'var(--primary)' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card slide-up">
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Broadcast Notification</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Notification Type</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {[
                { id: 'info', label: 'Info', color: 'var(--info)' },
                { id: 'alert', label: 'Alert', color: 'var(--warning)' },
                { id: 'promo', label: 'Promo', color: 'var(--accent)' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className="btn btn-sm"
                  style={{
                    background: type === t.id ? t.color : 'var(--surface-secondary)',
                    color: type === t.id ? 'white' : 'var(--text-secondary)',
                    border: type === t.id ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Title</label>
            <input className="input" placeholder="Notification title" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Body</label>
            <textarea className="input" rows={4} placeholder="Notification body text..." style={{ resize: 'vertical' }} />
          </div>
          <div>
            <button className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
