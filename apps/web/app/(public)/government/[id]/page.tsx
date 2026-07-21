'use client';

import { use } from 'react';
import { useDirection } from '../../../contexts/DirectionContext';
import { PageSection } from '../../../components/PageSection';
import { BackButton } from '../../../components/BackButton';
import { Badge } from '../../../components/Badge';

const data = { nameAr: 'مكتب سجل مدنى', nameEn: 'Civil Registry Office', type: 'civil_id', phone: '+20 2 12345678', email: 'civil@moi.gov.eg', street: '5 El Tahrir Street', governorate: 'Cairo', services: [{ name: 'Issuance of Birth Certificate', fee: '25 EGP', time: 'Same day' }, { name: 'Issuance of Death Certificate', fee: '15 EGP', time: 'Same day' }, { name: 'Family Record Extract', fee: '30 EGP', time: '3 days' }] };

export default function GovernmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { t } = useDirection();
  const g = data;

  return (
    <PageSection>
      <BackButton href="/government" labelKey="Back to Government Offices" labelAr="العودة إلى المكاتب الحكومية" />
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{g.nameAr}</h1>
        {g.nameEn && <p style={{ color: 'var(--text-secondary)' }}>{g.nameEn}</p>}
        <Badge variant="primary" style={{ marginTop: '0.25rem' }}>{g.type.replace('_', ' ')}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>{t('Phone', 'هاتف')}</strong><p>{g.phone}</p></div>
        {g.email && <div className="card"><strong>{t('Email', 'بريد إلكتروني')}</strong><p>{g.email}</p></div>}
        <div className="card"><strong>{t('Address', 'عنوان')}</strong><p>{g.street}, {g.governorate}</p></div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('Services', 'الخدمات')} ({g.services.length})</h2>
        <div className="grid">
          {g.services.map((s, i) => (
            <div key={i} className="card">
              <h3>{s.name}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Fee', 'الرسوم')}: {s.fee}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Processing', 'المعالجة')}: {s.time}</p>
            </div>
          ))}
        </div>
      </section>
    </PageSection>
  );
}
