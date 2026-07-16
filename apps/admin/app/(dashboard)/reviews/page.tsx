'use client';

import { useState, useEffect } from 'react';

const REVIEWS_API = process.env.NEXT_PUBLIC_REVIEWS_API || 'http://localhost:3080/api/v1/reviews';

const thStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', fontSize: '0.875rem' };

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [filterApproved, setFilterApproved] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (filterApproved !== 'all') params.set('isApproved', filterApproved);
    fetch(`${REVIEWS_API}/admin/all?${params}`)
      .then(r => r.json())
      .then(d => { setReviews(d.data || []); setMeta(d.meta); })
      .catch(() => {});
  }, [page, filterApproved]);

  const handleModerate = async (reviewId: string, approve: boolean) => {
    await fetch(`${REVIEWS_API}/${reviewId}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approve }),
    });
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  return (
    <div>
      <h1>Review Moderation</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setFilterApproved('all')}
          style={tabButton(filterApproved === 'all')}
        >
          All
        </button>
        <button
          onClick={() => setFilterApproved('false')}
          style={tabButton(filterApproved === 'false')}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterApproved('true')}
          style={tabButton(filterApproved === 'true')}
        >
          Approved
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={thStyle}>Entity</th>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Rating</th>
            <th style={thStyle}>Comment</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb', opacity: r.isApproved ? 1 : 0.6 }}>
              <td style={tdStyle}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.entityType}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{r.entityId.slice(0, 8)}...</div>
              </td>
              <td style={tdStyle}>{r.userId.slice(0, 8)}...</td>
              <td style={tdStyle}>
                <span style={{ color: '#eab308', fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </td>
              <td style={{ ...tdStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.title || '-'}</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{r.comment?.slice(0, 100) || '-'}</div>
              </td>
              <td style={tdStyle}>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td style={tdStyle}>
                {!r.isApproved && (
                  <button
                    onClick={() => handleModerate(r.id, true)}
                    style={{ padding: '0.25rem 0.5rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', marginRight: '0.25rem' }}
                  >
                    Approve
                  </button>
                )}
                {r.isApproved && (
                  <button
                    onClick={() => handleModerate(r.id, false)}
                    style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                background: p === page ? '#2563eb' : 'white',
                color: p === page ? 'white' : '#374151',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function tabButton(active: boolean): React.CSSProperties {
  return {
    padding: '0.375rem 0.75rem',
    border: active ? '2px solid #2563eb' : '1px solid #d1d5db',
    borderRadius: '0.25rem',
    background: active ? '#eff6ff' : 'white',
    color: active ? '#2563eb' : '#374151',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  };
}
