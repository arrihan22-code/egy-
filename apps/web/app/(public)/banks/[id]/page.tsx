'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useDirection } from '../../../contexts/DirectionContext';

const MapView = dynamic(() => import('../../../components/MapView'), { ssr: false });
const ReviewSection = dynamic(() => import('../../../components/ReviewSection'), { ssr: false });

interface BankBranch {
  id: string;
  nameAr: string;
  nameEn?: string;
  street?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  hasAtm: boolean;
  workingHours?: { dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean }[];
  services?: { serviceNameAr: string }[];
}

export default function BankDetailPage() {
  const params = useParams();
  const { t, direction } = useDirection();
  const [bank, setBank] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/banks/${params.id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setBank(j.data || null))
      .catch(() => {});
  }, [params.id]);

  if (!bank) {
    return (
      <div className="page-section">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{t('Loading...', 'جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  const markers = (bank.branches || []).map((br: BankBranch) => ({
    id: br.id,
    name: `${bank.nameAr} - ${br.nameAr}`,
    type: 'bank' as const,
    latitude: Number(br.latitude),
    longitude: Number(br.longitude),
  }));

  return (
    <div className="page-section">
      <div className="container">
        <a href="/banks" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('Back to Banks', 'العودة إلى البنوك')}
        </a>

        <div className="slide-up">
          <div style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
              }}>
                {'\u{1F3E6}'}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>{bank.nameAr}</h1>
                {bank.nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>{bank.nameEn}</p>}
              </div>
            </div>

            {(bank.phone || bank.website) && (
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                {bank.phone && (
                  <a href={`tel:${bank.phone}`} className="btn btn-secondary btn-sm" dir="ltr">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {bank.phone}
                  </a>
                )}
                {bank.website && (
                  <a href={bank.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    {t('Website', 'الموقع الإلكتروني')}
                  </a>
                )}
              </div>
            )}
          </div>

          {markers.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                {t('Locations', 'المواقع')}
              </h2>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapView markers={markers} height="350px" />
              </div>
            </div>
          )}

          {bank.branches && bank.branches.length > 0 && (
            <section style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                {t('Branches', 'الفروع')} ({bank.branches.length})
              </h2>
              <div className="grid grid-auto stagger">
                {bank.branches.map((branch: BankBranch) => (
                  <div key={branch.id} className="card" style={{ border: 'none', background: 'var(--surface-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {'\u{1F3E6}'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{branch.nameAr}</h3>
                        {branch.street && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{branch.street}</p>}
                      </div>
                    </div>
                    {branch.phone && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }} dir="ltr">
                        {'\u{1F4DE}'} {branch.phone}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {branch.hasAtm && <span className="badge badge-primary">{t('ATM', 'صراف آلي')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <ReviewSection entityType="bank" entityId={params.id as string} />
      </div>
    </div>
  );
}
