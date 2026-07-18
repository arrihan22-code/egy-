'use client';

import { useDirection } from '../../contexts/DirectionContext';

export default function GovernmentPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'مكتب سجل مدنى', nameEn: 'Civil Registry Office', type: 'civil_id', phone: '+20 2 12345678', services: 12 },
    { id: '2', nameAr: 'مكتب جوازات', nameEn: 'Passport Office', type: 'passport', phone: '+20 2 23456789', services: 8 },
    { id: '3', nameAr: 'مكتب مرور', nameEn: 'Traffic Office', type: 'traffic', phone: '+20 2 34567890', services: 15 },
    { id: '4', nameAr: 'مكتب بريد', nameEn: 'Post Office', type: 'post_office', phone: '+20 2 45678901', services: 20 },
  ];
  const types = ['all', 'civil_id', 'passport', 'traffic', 'post_office', 'license'];
  const typeLabels: Record<string, { en: string; ar: string }> = {
    all: { en: 'All', ar: 'الكل' },
    civil_id: { en: 'Civil ID', ar: 'سجل مدني' },
    passport: { en: 'Passport', ar: 'جوازات' },
    traffic: { en: 'Traffic', ar: 'مرور' },
    post_office: { en: 'Post Office', ar: 'بريد' },
    license: { en: 'License', ar: 'رخص' },
  };

  return (
    <div className="page-section">
      <div className="container">
        <div className="slide-up" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            {t('Government Offices', 'المكاتب الحكومية')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('Find civil ID, passport, traffic, and post offices across Egypt', 'اعثر على مكاتب السجل المدني وجوازات السفر والمرور والبريد في جميع أنحاء مصر')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {types.map(tp => (
            <a
              key={tp}
              href={`/government?type=${tp}`}
              className="btn btn-sm btn-secondary"
              style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
            >
              {typeLabels[tp]?.[direction === 'rtl' ? 'ar' : 'en'] || tp.replace('_', ' ')}
            </a>
          ))}
        </div>

        <div className="grid grid-auto stagger">
          {items.map(g => (
            <a key={g.id} href={`/government/${g.id}`} className="card card-hover" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  {'\u{1F3DB}'}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{g.nameAr}</h3>
                  {g.nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{g.nameEn}</p>}
                </div>
              </div>
              {g.phone && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }} dir="ltr">{'\u{1F4DE}'} {g.phone}</p>}
              <span className="badge badge-primary">{g.services} {t('services', 'خدمة')}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
