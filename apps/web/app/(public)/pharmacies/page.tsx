'use client';

import { useDirection } from '../../contexts/DirectionContext';

export default function PharmaciesPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'صيدلية العزبى', nameEn: 'El Ezaby Pharmacy', is24h: true, hasDelivery: true, phone: '+20 2 12345678' },
    { id: '2', nameAr: 'صيدلية شعبان', nameEn: 'Shaaban Pharmacy', is24h: false, hasDelivery: true, phone: '+20 2 23456789' },
    { id: '3', nameAr: 'صيدلية المنشاوى', nameEn: 'El Manshawy Pharmacy', is24h: true, hasDelivery: false, phone: '+20 2 34567890' },
  ];

  return (
    <div className="page-section">
      <div className="container">
        <div className="slide-up" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            {t('Pharmacies', 'الصيدليات')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('Find pharmacies, 24-hour outlets, and delivery services across Egypt', 'اعثر على الصيدليات والفروع التي تعمل على مدار 24 ساعة وخدمات التوصيل في جميع أنحاء مصر')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" className="input" placeholder={t('Search pharmacies...', 'ابحث عن الصيدليات...')} style={{ maxWidth: 320 }} dir={direction} />
          <select className="input" style={{ maxWidth: 180 }}><option>{t('All Governorates', 'جميع المحافظات')}</option></select>
          <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer', gap: 'var(--space-2)' }}>
            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t('24 Hours', '24 ساعة')}
          </label>
          <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer', gap: 'var(--space-2)' }}>
            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t('Delivery', 'توصيل')}
          </label>
        </div>

        <div className="grid grid-auto stagger">
          {items.map(p => (
            <a key={p.id} href={`/pharmacies/${p.id}`} className="card card-hover" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  {'\u{1F48A}'}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{p.nameAr}</h3>
                  {p.nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{p.nameEn}</p>}
                </div>
              </div>
              {p.phone && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }} dir="ltr">{'\u{1F4DE}'} {p.phone}</p>}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {p.is24h && <span className="badge badge-info">{t('24 Hours', '24 ساعة')}</span>}
                {p.hasDelivery && <span className="badge badge-success">{t('Delivery', 'توصيل')}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
