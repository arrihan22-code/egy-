'use client';

import { Suspense, useState, useEffect } from 'react';
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
      <Suspense fallback={<p>Loading search...</p>}>
        <SearchResults />
      </Suspense>
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