'use client';

import { useState } from 'react';

export default function ReviewsAdminPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const reviews = [
    { id: 1, user: 'Ahmed M.', entity: 'National Bank of Egypt', rating: 5, text: 'Great service and fast processing.', status: 'pending', date: '2024-01-15' },
    { id: 2, user: 'Sara K.', entity: 'El Ezaby Pharmacy', rating: 4, text: 'Quick delivery, fair prices.', status: 'approved', date: '2024-01-14' },
    { id: 3, user: 'Mohamed A.', entity: 'Qasr El Ainy Hospital', rating: 3, text: 'Decent care but long waiting times.', status: 'pending', date: '2024-01-13' },
  ];

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'pending' as const, label: 'Pending' },
    { id: 'approved' as const, label: 'Approved' },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Review Moderation</h1>

      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', background: 'var(--surface-secondary)', padding: 'var(--space-1)', borderRadius: 'var(--radius-lg)', maxWidth: 350 }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: filter === f.id ? 'var(--surface-elevated)' : 'transparent',
              color: filter === f.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: filter === f.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              boxShadow: filter === f.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Entity</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.user}</td>
                <td>{r.entity}</td>
                <td>
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.rating ? 'var(--warning)' : 'var(--border)'}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </span>
                </td>
                <td style={{ maxWidth: 250 }} className="truncate">{r.text}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{r.date}</td>
                <td><span className={`badge badge-${r.status === 'approved' ? 'success' : 'warning'}`}>{r.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="btn btn-sm btn-ghost" title="Approve">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                    <button className="btn btn-sm btn-ghost" title="Reject">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
