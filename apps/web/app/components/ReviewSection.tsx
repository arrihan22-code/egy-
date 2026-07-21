'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDirection } from '../contexts/DirectionContext';

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
  5: 'var(--accent-dark)',
  4: 'var(--accent)',
  3: 'var(--warning-dark)',
  2: 'var(--warning)',
  1: 'var(--error)',
};

export default function ReviewSection({ entityType, entityId }: ReviewSectionProps) {
  const { t, direction } = useDirection();
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

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6) 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        <div className="animate-spin" style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', margin: '0 auto var(--space-3)' }} />
        {t('Loading reviews...', 'جاري تحميل التقييمات...')}
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 'var(--space-8)',
      paddingTop: 'var(--space-8)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: 0 }}>
          {t('Reviews', 'التقييمات')}
        </h2>
        {meta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {meta.averageRating}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={s <= Math.round(meta.averageRating) ? 'var(--warning)' : 'var(--border)'} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {meta.totalRatings} {t('review(s)', 'تقييم')}
              </div>
            </div>
          </div>
        )}
      </div>

      {meta?.distribution && meta.distribution.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', maxWidth: 400 }}>
          {[5, 4, 3, 2, 1].map(star => {
            const item = meta.distribution.find(d => d.rating === star);
            const count = item?.count || 0;
            const maxCount = Math.max(...meta.distribution.map(d => d.count), 1);
            const pct = (count / maxCount) * 100;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <span style={{ width: '2rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {star}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--warning)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <div style={{ flex: 1, height: 8, background: 'var(--surface-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: STAR_COLORS[star] || 'var(--warning)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ width: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: direction === 'rtl' ? 'left' : 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-xl)',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t('No reviews yet.', 'لا توجد تقييمات بعد.')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map(review => (
            <div key={review.id} className="card" style={{ border: 'none', background: 'var(--surface-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= review.rating ? 'var(--warning)' : 'var(--border)'} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {new Date(review.createdAt).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {review.title && <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>{review.title}</h4>}
              {review.comment && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{review.comment}</p>}
              {review.photos && review.photos.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                  {review.photos.map(p => (
                    <Image key={p.url} src={p.url} alt={p.caption || ''} width={64} height={64} style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
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
