'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  photos?: { url: string; caption?: string }[];
}

interface ReviewMeta {
  total: number;
  averageRating: number;
  totalRatings: number;
  distribution: { rating: number; count: number }[];
}

interface ReviewSectionProps {
  entityType: string;
  entityId: string;
}

const REVIEWS_API = process.env.NEXT_PUBLIC_REVIEWS_API || 'http://localhost:3080/api/v1/reviews';

const STAR_COLORS: Record<number, string> = {
  5: '#16a34a',
  4: '#22c55e',
  3: '#eab308',
  2: '#f97316',
  1: '#dc2626',
};

const TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  pharmacy: 'Pharmacy',
  hospital: 'Hospital',
  government: 'Government Office',
  transport: 'Transport Station',
  emergency: 'Emergency Contact',
};

export default function ReviewSection({ entityType, entityId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${REVIEWS_API}/entity/${entityType}/${entityId}`).then(r => r.json()),
      fetch(`${REVIEWS_API}/entity/${entityType}/${entityId}/summary`).then(r => r.json()),
    ]).then(([reviewsRes, summaryRes]) => {
      setReviews(reviewsRes.data || []);
      setMeta(summaryRes.data || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) return <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Loading reviews...</div>;

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Reviews</h2>
        {meta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{meta.averageRating}</div>
            <div>
              <div style={{ display: 'flex', gap: '0.125rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ fontSize: '1.25rem', color: s <= Math.round(meta.averageRating) ? '#eab308' : '#d1d5db' }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{meta.totalRatings} review{meta.totalRatings !== 1 && 's'}</div>
            </div>
          </div>
        )}
      </div>

      {meta?.distribution && meta.distribution.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {[5, 4, 3, 2, 1].map(star => {
            const item = meta.distribution.find(d => d.rating === star);
            const count = item?.count || 0;
            const maxCount = Math.max(...meta.distribution.map(d => d.count), 1);
            const pct = (count / maxCount) * 100;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ width: '2rem', fontSize: '0.875rem' }}>{star}★</span>
                <div style={{ flex: 1, height: '0.625rem', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: STAR_COLORS[star] || '#eab308', borderRadius: '999px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ width: '2rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No reviews yet. Be the first to review this {TYPE_LABELS[entityType] || 'entity'}.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(review => (
            <div key={review.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.125rem' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: '1rem', color: s <= review.rating ? '#eab308' : '#d1d5db' }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              {review.title && <h4 style={{ margin: '0 0 0.25rem' }}>{review.title}</h4>}
              {review.comment && <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>{review.comment}</p>}
              {review.photos && review.photos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {review.photos.map(p => (
                    <img key={p.url} src={p.url} alt={p.caption || ''} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
