'use client';

import { useDirection } from '../../contexts/DirectionContext';

export default function HospitalsPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'مستشفى 57357', nameEn: 'Children Cancer Hospital 57357', type: 'hospital', hasEmergency: true, phone: '+20 2 12345678', specialties: 'Oncology, Pediatrics' },
    { id: '2', nameAr: 'مستشفى القصر العيني', nameEn: 'Qasr El Ainy Hospital', type: 'hospital', hasEmergency: true, phone: '+20 2 23456789', specialties: 'General, Surgery, Cardiology' },
    { id: '3', nameAr: 'المعهد القومى للقلب', nameEn: 'National Heart Institute', type: 'hospital', hasEmergency: true, phone: '+20 2 34567890', specialties: 'Cardiology, Cardiac Surgery' },
  ];

  return (
    <div className="page-section">
      <div className="container">
        <div className="slide-up" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            {t('Hospitals & Clinics', 'المستشفيات والعيادات')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('Find hospitals, clinics, emergency rooms, and specialists across Egypt', 'اعثر على المستشفيات والعيادات وغرف الطوارئ والأطباء المتخصصين في جميع أنحاء مصر')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" className="input" placeholder={t('Search hospitals...', 'ابحث عن المستشفيات...')} style={{ maxWidth: 280 }} dir={direction} />
          <select className="input" style={{ maxWidth: 160 }}><option>{t('All Governorates', 'جميع المحافظات')}</option></select>
          <select className="input" style={{ maxWidth: 160 }}><option>{t('All Specialties', 'جميع التخصصات')}</option></select>
          <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer', gap: 'var(--space-2)' }}>
            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t('Emergency', 'طوارئ')}
          </label>
        </div>

        <div className="grid grid-auto stagger">
          {items.map(h => (
            <a key={h.id} href={`/hospitals/${h.id}`} className="card card-hover" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  {'\u{1F3E5}'}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{h.nameAr}</h3>
                  {h.nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{h.nameEn}</p>}
                </div>
              </div>
              {h.phone && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }} dir="ltr">{'\u{1F4DE}'} {h.phone}</p>}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>{h.specialties}</p>
              {h.hasEmergency && <span className="badge badge-danger">{t('Emergency', 'طوارئ')}</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
