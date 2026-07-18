'use client';

import { useDirection } from '../../contexts/DirectionContext';

export default function TransportPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'محطة مترو السادات', nameEn: 'Sadat Metro Station', type: 'metro', line: 'Line 1 & 2' },
    { id: '2', nameAr: 'محطة مترو العتبة', nameEn: 'Ataba Metro Station', type: 'metro', line: 'Line 1 & 2' },
    { id: '3', nameAr: 'محطة مترو الجيزة', nameEn: 'Giza Metro Station', type: 'metro', line: 'Line 2' },
    { id: '4', nameAr: 'محطة سكة حديد مصر', nameEn: 'Ramses Railway Station', type: 'train', line: 'Main Lines' },
    { id: '5', nameAr: 'محطة مترو شبرا الخيمة', nameEn: 'Shobra El Kheima Station', type: 'metro', line: 'Line 2' },
  ];

  return (
    <div className="page-section">
      <div className="container">
        <div className="slide-up" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            {t('Transport', 'المواصلات')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('Find metro, train, and bus stations with routes and schedules', 'اعثر على محطات المترو والقطارات والحافلات مع المسارات والجداول')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" className="input" placeholder={t('Search stations...', 'ابحث عن المحطات...')} style={{ maxWidth: 320 }} dir={direction} />
          <select className="input" style={{ maxWidth: 160 }}>
            <option>{t('All Types', 'جميع الأنواع')}</option>
            <option>{t('Metro', 'مترو')}</option>
            <option>{t('Train', 'قطار')}</option>
            <option>{t('Bus', 'حافلة')}</option>
          </select>
        </div>

        <div className="grid grid-auto stagger">
          {items.map(s => (
            <a key={s.id} href={`/transport/${s.id}`} className="card card-hover" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  {'\u{1F687}'}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{s.nameAr}</h3>
                  {s.nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{s.nameEn}</p>}
                </div>
              </div>
              <span className="badge badge-warning">{s.line}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
