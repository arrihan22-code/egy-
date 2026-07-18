'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDirection } from '../contexts/DirectionContext';

interface SearchResult {
  id: string;
  type: string;
  score: number;
  nameAr: string;
  nameEn?: string;
  description?: string;
  phone?: string;
  address?: string;
  governorateNameAr?: string;
  cityNameAr?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  sourceUrl?: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: { total: number; page: number; limit: number; totalPages: number; query: string; type?: string; governorateId?: string };
}

const TYPE_ICONS: Record<string, string> = {
  bank: '\u{1F3E6}',
  pharmacy: '\u{1F48A}',
  hospital: '\u{1F3E5}',
  government: '\u{1F3DB}',
  transport: '\u{1F687}',
  emergency: '\u{1F6A8}',
};

const TYPE_SLUGS: Record<string, string> = {
  bank: 'banks',
  pharmacy: 'pharmacies',
  hospital: 'hospitals',
  government: 'government',
  transport: 'transport',
  emergency: 'emergency',
};

const TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  bank: { en: 'Bank', ar: 'بنك' },
  pharmacy: { en: 'Pharmacy', ar: 'صيدلية' },
  hospital: { en: 'Hospital', ar: 'مستشفى' },
  government: { en: 'Government', ar: 'حكومة' },
  transport: { en: 'Transport', ar: 'مواصلات' },
  emergency: { en: 'Emergency', ar: 'طوارئ' },
};

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="card" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 6, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="page-section">
      <div className="container">
        <Suspense fallback={
          <div>
            <div className="skeleton" style={{ width: '40%', height: 28, marginBottom: 8, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: '25%', height: 16, marginBottom: 24, borderRadius: 4 }} />
            <LoadingSkeleton />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}

function SearchResults() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language, direction } = useDirection();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || undefined;
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setLoading(true);
    const params = new URLSearchParams({ q: query, page: String(page) });
    if (type) params.set('type', type);
    fetch(`${process.env.NEXT_PUBLIC_SEARCH_API || 'http://localhost:3060/api/v1/search'}?${params}`)
      .then(r => r.json())
      .then(d => { setResults(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [query, type, page]);

  if (!query) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-4)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <h2 style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 'var(--text-lg)' }}>
          {t('Enter a search term to find services across Egypt.', 'أدخل مصطلح بحث للعثور على الخدمات في جميع أنحاء مصر.')}
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '40%', height: 28, marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '25%', height: 16, marginBottom: 24, borderRadius: 4 }} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
        <p style={{ color: 'var(--error)' }}>{t('Search service unavailable.', 'خدمة البحث غير متاحة.')}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          marginBottom: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}>
          {t('Results for', 'نتائج البحث عن')}
          <span style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
          }}>
            &ldquo;{query}&rdquo;
          </span>
        </h1>
        {results.meta.total > 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {t('Found', 'تم العثور على')} {results.meta.total} {t('result(s)', 'نتيجة')}
            {results.meta.type ? ` ${t('in', 'في')} ${TYPE_LABELS[results.meta.type]?.[language === 'ar' ? 'ar' : 'en'] || results.meta.type}` : ''}
          </p>
        )}
      </div>

      {results.meta.total === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-4)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="8" x2="14" y2="14" /><line x1="14" y1="8" x2="8" y2="14" />
          </svg>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            {t('No results found', 'لم يتم العثور على نتائج')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {t('Try a different search term or browse by category.', 'جرب مصطلح بحث مختلف أو تصفح حسب الفئة.')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            {Object.entries(TYPE_SLUGS).map(([k, v]) => (
              <a key={k} href={`/${v}`} className="btn btn-sm btn-secondary">
                {TYPE_ICONS[k]} {TYPE_LABELS[k]?.[language === 'ar' ? 'ar' : 'en'] || k}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {results.data.map((r, i) => {
              const slug = TYPE_SLUGS[r.type] || 'hospitals';
              return (
                <a
                  key={`${r.type}_${r.id}_${i}`}
                  href={`/${slug}/${r.id}`}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--surface-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}>
                    {TYPE_ICONS[r.type] || '\u{1F4CD}'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>{r.nameAr}</div>
                    {r.nameEn && <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{r.nameEn}</div>}
                    {r.description && <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-2)' }} className="line-clamp-2">{r.description}</div>}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      <span className="badge badge-neutral">{TYPE_LABELS[r.type]?.[language === 'ar' ? 'ar' : 'en'] || r.type}</span>
                      {r.governorateNameAr && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          {r.governorateNameAr}
                        </span>
                      )}
                      {r.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} dir="ltr">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {r.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>

          {results.meta.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-8)', flexWrap: 'wrap' }}>
              {page > 1 && (
                <a
                  href={`/search?q=${encodeURIComponent(results.meta.query)}${results.meta.type ? `&type=${results.meta.type}` : ''}&page=${page - 1}`}
                  className="btn btn-sm btn-secondary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {t('Previous', 'السابق')}
                </a>
              )}
              {Array.from({ length: Math.min(results.meta.totalPages, 7) }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/search?q=${encodeURIComponent(results.meta.query)}${results.meta.type ? `&type=${results.meta.type}` : ''}&page=${p}`}
                  className="btn btn-sm"
                  style={{
                    minWidth: 36,
                    justifyContent: 'center',
                    background: p === results.meta.page ? 'var(--primary)' : 'var(--surface-secondary)',
                    color: p === results.meta.page ? 'white' : 'var(--text-primary)',
                    border: p === results.meta.page ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {p}
                </a>
              ))}
              {page < results.meta.totalPages && (
                <a
                  href={`/search?q=${encodeURIComponent(results.meta.query)}${results.meta.type ? `&type=${results.meta.type}` : ''}&page=${page + 1}`}
                  className="btn btn-sm btn-secondary"
                >
                  {t('Next', 'التالي')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
