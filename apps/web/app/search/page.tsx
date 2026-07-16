'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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

const TYPE_LINKS: Record<string, string> = {
  bank: '/banks',
  pharmacy: '/pharmacies',
  hospital: '/hospitals',
  government: '/government',
  transport: '/transport',
  emergency: '/emergency',
};

const TYPE_ICONS: Record<string, string> = {
  bank: '🏦',
  pharmacy: '💊',
  hospital: '🏥',
  government: '🏛️',
  transport: '🚇',
  emergency: '🆘',
};

const TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  pharmacy: 'Pharmacy',
  hospital: 'Hospital',
  government: 'Government',
  transport: 'Transport',
  emergency: 'Emergency',
};

export default function SearchPage() {
  return (
    <div>
      <h1>Search Results</h1>
      <SearchResults />
    </div>
  );
}

function SearchResults() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
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

  if (!query) return <p>Enter a search term to find services across Egypt.</p>;
  if (loading) return <p>Searching...</p>;
  if (!results) return <p>Search service unavailable.</p>;

  return (
    <div>
      <h1>Search: &quot;{query}&quot;</h1>
      {results.meta.total === 0 ? (
        <p>No results found. Try a different search term.</p>
      ) : (
        <>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Found {results.meta.total} result{results.meta.total !== 1 ? 's' : ''}
            {results.meta.type ? ` in ${results.meta.type}` : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.data.map((r, i) => (
              <a
                key={`${r.type}_${r.id}_${i}`}
                href={`/${r.type === 'bank' ? 'banks' : r.type === 'pharmacy' ? 'pharmacies' : r.type === 'government' ? 'government' : r.type === 'transport' ? 'transport' : r.type === 'emergency' ? 'emergency' : 'hospitals'}/${r.id}`}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{TYPE_ICONS[r.type] || '📌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{r.nameAr}</div>
                  {r.nameEn && <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{r.nameEn}</div>}
                  {r.description && <div style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>{r.description}</div>}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    <span>{TYPE_LABELS[r.type] || r.type}</span>
                    {r.governorateNameAr && <span>{r.governorateNameAr}</span>}
                    {r.phone && <span dir="ltr">{r.phone}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
          {results.meta.totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              {Array.from({ length: Math.min(results.meta.totalPages, 10) }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/search?q=${encodeURIComponent(results.meta.query)}${results.meta.type ? `&type=${results.meta.type}` : ''}&page=${p}`}
                  style={{
                    padding: '0.375rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    color: p === results.meta.page ? 'white' : '#374151',
                    background: p === results.meta.page ? '#2563eb' : 'white',
                    fontWeight: p === results.meta.page ? 600 : 400,
                  }}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
