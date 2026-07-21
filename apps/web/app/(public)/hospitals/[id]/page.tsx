'use client';

import { use } from 'react';
import { useDirection } from '../../../contexts/DirectionContext';
import { PageSection } from '../../../components/PageSection';
import { BackButton } from '../../../components/BackButton';
import { Badge } from '../../../components/Badge';

const data = { nameAr: 'مستشفى 57357', nameEn: 'Children Cancer Hospital 57357', type: 'hospital', hasEmergency: true, phone: '+20 2 12345678', email: 'info@57357.org', website: 'https://www.57357.org', street: '1 Sekket El Imam', governorate: 'Cairo', departments: ['Oncology', 'Pediatrics', 'Radiology', 'Pharmacy'], doctors: [{ name: 'Dr. Ahmed Ali', specialty: 'Pediatric Oncology' }, { name: 'Dr. Sara Mahmoud', specialty: 'Radiology' }] };

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { t } = useDirection();
  const h = data;

  return (
    <PageSection>
      <BackButton href="/hospitals" labelKey="Back to Hospitals" labelAr="العودة إلى المستشفيات" />
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{h.nameAr}</h1>
        {h.nameEn && <p style={{ color: 'var(--text-secondary)' }}>{h.nameEn}</p>}
      </div>
      {h.hasEmergency && <Badge variant="danger" style={{ marginTop: '0.5rem' }}>🚨 {t('24/7 Emergency Services Available', 'خدمات الطوارئ متاحة 24/7')}</Badge>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>{t('Phone', 'هاتف')}</strong><p>{h.phone}</p></div>
        {h.email && <div className="card"><strong>{t('Email', 'بريد إلكتروني')}</strong><p>{h.email}</p></div>}
        {h.website && <div className="card"><strong>{t('Website', 'موقع إلكتروني')}</strong><p><a href={h.website} target="_blank" rel="noopener noreferrer">{h.website}</a></p></div>}
        <div className="card"><strong>{t('Address', 'عنوان')}</strong><p>{h.street}, {h.governorate}</p></div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>{t('Departments', 'الأقسام')} ({h.departments.length})</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {h.departments.map((d, i) => <Badge key={i} variant="neutral">{d}</Badge>)}
        </div>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>{t('Doctors', 'الأطباء')} ({h.doctors.length})</h2>
        <div className="grid">
          {h.doctors.map((d, i) => <div key={i} className="card"><h3>{d.name}</h3><p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{d.specialty}</p></div>)}
        </div>
      </section>
    </PageSection>
  );
}
