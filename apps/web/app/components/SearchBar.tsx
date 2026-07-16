'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AutocompleteResult {
  text: string;
  type: string;
  id: string;
}

const SEARCH_API = process.env.NEXT_PUBLIC_SEARCH_API || 'http://localhost:3060/api/v1/search';

const TYPE_ICONS: Record<string, string> = {
  bank: '🏦',
  pharmacy: '💊',
  hospital: '🏥',
  government: '🏛️',
  transport: '🚇',
  emergency: '🆘',
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value });
        if (selectedType) params.set('type', selectedType);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SEARCH_API || 'http://localhost:3060/api/v1/search'}/autocomplete?${params}`);
        const json = await res.json();
        setSuggestions(json.data || []);
      } catch { setSuggestions([]); }
    }, 300);
  }, [selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (selectedType) params.set('type', selectedType);
    router.push(`/search?${params}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.25rem' }}>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{
            padding: '0.375rem 0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem 0 0 0.375rem',
            fontSize: '0.8rem',
            background: '#f9fafb',
            cursor: 'pointer',
          }}
        >
          <option value="">All</option>
          <option value="bank">Banks</option>
          <option value="pharmacy">Pharmacies</option>
          <option value="hospital">Hospitals</option>
          <option value="government">Government</option>
          <option value="transport">Transport</option>
          <option value="emergency">Emergency</option>
        </select>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
          placeholder="Search services..."
          style={{
            flex: 1,
            padding: '0.375rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0 0.375rem 0.375rem 0',
            fontSize: '0.875rem',
            minWidth: '150px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.375rem 0.75rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Search
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 50,
            marginTop: '0.25rem',
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={`${s.type}_${s.id}_${i}`}
              onClick={() => {
                const params = new URLSearchParams({ q: s.text });
                router.push(`/search?${params}`);
                setShowSuggestions(false);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              <span>{TYPE_ICONS[s.type] || '📌'}</span>
              <span>{s.text}</span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: 'auto' }}>{s.type}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
