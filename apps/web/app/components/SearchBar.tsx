'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDirection } from '../contexts/DirectionContext';

interface AutocompleteResult {
  text: string;
  type: string;
  id: string;
}

const TYPE_ICONS: Record<string, string> = {
  bank: '\u{1F3E6}',
  pharmacy: '\u{1F48A}',
  hospital: '\u{1F3E5}',
  government: '\u{1F3DB}',
  transport: '\u{1F687}',
  emergency: '\u{1F6A8}',
};

const TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  bank: { en: 'Bank', ar: 'بنك' },
  pharmacy: { en: 'Pharmacy', ar: 'صيدلية' },
  hospital: { en: 'Hospital', ar: 'مستشفى' },
  government: { en: 'Government', ar: 'حكومة' },
  transport: { en: 'Transport', ar: 'مواصلات' },
  emergency: { en: 'Emergency', ar: 'طوارئ' },
};

export default function SearchBar() {
  const router = useRouter();
  const { t, language } = useDirection();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value });
        if (selectedType) params.set('type', selectedType);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SEARCH_API || 'http://localhost:3060/api/v1/search'}/autocomplete?${params}`);
        const json = await res.json();
        setSuggestions(json.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }, [selectedType]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (selectedType) params.set('type', selectedType);
    router.push(`/search?${params}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const s = suggestions[activeIndex];
        router.push(`/search?q=${encodeURIComponent(s.text)}`);
        setShowSuggestions(false);
        inputRef.current?.blur();
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
      <form onSubmit={handleSearch}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: `1.5px solid ${isFocused ? 'var(--border-focus)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-full)',
          transition: 'all var(--transition-fast)',
          boxShadow: isFocused ? '0 0 0 3px rgba(var(--primary-rgb), 0.1)' : 'none',
        }}>
          <button
            type="submit"
            style={{
              border: 'none',
              background: 'none',
              padding: 'var(--space-2) var(--space-3)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => { setIsFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={t('Search services...', 'ابحث عن خدمات...')}
            aria-label={t('Search', 'بحث')}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            role="combobox"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: 'var(--space-2) 0',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              minWidth: '120px',
            }}
          />
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            aria-label={t('Filter by type', 'تصفية حسب النوع')}
            style={{
              border: 'none',
              borderInlineStart: '1px solid var(--border)',
              padding: 'var(--space-2) var(--space-2)',
              fontSize: 'var(--text-xs)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '90px',
            }}
          >
            <option value="">{t('All', 'الكل')}</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{language === 'ar' ? v.ar : v.en}</option>
            ))}
          </select>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="scale-in"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInline: 0,
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={`${s.type}_${s.id}_${i}`}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(s.text)}`);
                setShowSuggestions(false);
              }}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                background: i === activeIndex ? 'var(--surface-hover)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_ICONS[s.type] || '\u{1F4CD}'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', ...(language === 'ar' ? { fontFamily: 'var(--font-arabic)' } : {}) }}>
                  {s.text}
                </div>
              </div>
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-secondary)',
                flexShrink: 0,
              }}>
                {TYPE_LABELS[s.type]?.[language === 'ar' ? 'ar' : 'en'] || s.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
