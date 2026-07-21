'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDirection } from '../../contexts/DirectionContext';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { CardGrid } from '../../components/CardGrid';
import { ListingCard } from '../../components/ListingCard';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false });

interface Bank {
  id: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  website?: string;
  branches?: { id: string; nameAr: string; latitude: number; longitude: number }[];
}

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, direction } = useDirection();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/banks`, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setBanks(j.data || []))
      .catch(() => {});
  }, []);

  const filtered = banks.filter(b =>
    !searchQuery || b.nameAr.includes(searchQuery) || (b.nameEn && b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const markers = banks.flatMap(b =>
    (b.branches || []).map(br => ({
      id: br.id,
      name: `${b.nameAr} - ${br.nameAr}`,
      type: 'bank' as const,
      latitude: Number(br.latitude),
      longitude: Number(br.longitude),
    }))
  );

  return (
    <PageSection>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <ListingHeader
          titleKey="Banks & ATMs"
          titleAr="البنوك وأجهزة الصراف الآلي"
          subtitleKey="Find banks, branches, and ATMs across Egypt"
          subtitleAr="اعثر على البنوك والفروع وأجهزة الصراف الآلي في جميع أنحاء مصر"
        />
        <button
          onClick={() => setShowMap(!showMap)}
          className={`btn ${showMap ? 'btn-secondary' : 'btn-primary'}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {showMap ? (
              <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>
            ) : (
              <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>
            )}
          </svg>
          {showMap ? t('List View', 'عرض القائمة') : t('Map View', 'عرض الخريطة')}
        </button>
      </div>

      {!showMap && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ maxWidth: 400 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              placeholder={t('Search banks...', 'ابحث عن البنوك...')}
              aria-label={t('Search', 'بحث')}
              dir={direction}
            />
          </div>
        </div>
      )}

      {showMap ? (
        <div className="slide-up">
          <MapView markers={markers} height="600px" />
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-secondary)' }}>
              {banks.length === 0
                ? <p>{t('Loading banks...', 'جاري تحميل البنوك...')}</p>
                : <p>{t('No banks match your search.', 'لا توجد بنوك تطابق بحثك.')}</p>
              }
            </div>
          ) : (
            <CardGrid>
              {filtered.map(bank => (
                <ListingCard
                  key={bank.id}
                  href={`/banks/${bank.id}`}
                  icon={'\u{1F3E6}'}
                  iconBg="var(--primary-light)"
                  nameAr={bank.nameAr}
                  nameEn={bank.nameEn}
                  phone={bank.phone}
                >
                  {bank.branches && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--primary)', marginTop: 'var(--space-2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {bank.branches.length} {t('branches', 'فرع')}
                    </div>
                  )}
                </ListingCard>
              ))}
            </CardGrid>
          )}
        </>
      )}
    </PageSection>
  );
}
