'use client';

import { use } from 'react';
import { useDirection } from '../../../contexts/DirectionContext';
import { PageSection } from '../../../components/PageSection';
import { BackButton } from '../../../components/BackButton';
import { Badge } from '../../../components/Badge';

const data = { nameAr: 'صيدلية العزبى', nameEn: 'El Ezaby Pharmacy', is24h: true, hasDelivery: true, phone: '+20 2 12345678', whatsapp: '+20 2 12345678', street: '12 Tahrir Street', governorate: 'Cairo', city: 'Downtown', workingHours: [{ day: 'Saturday - Thursday', hours: '08:00 - 23:00' }, { day: 'Friday', hours: '10:00 - 22:00' }] };

export default function PharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { t } = useDirection();
  const p = data;

  return (
    <PageSection>
      <BackButton href="/pharmacies" labelKey="Back to Pharmacies" labelAr="العودة إلى الصيدليات" />
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{p.nameAr}</h1>
        {p.nameEn && <p style={{ color: 'var(--text-secondary)' }}>{p.nameEn}</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card"><strong>{t('Phone', 'هاتف')}</strong><p>{p.phone}</p></div>
        {p.whatsapp && <div className="card"><strong>{t('WhatsApp', 'واتساب')}</strong><p>{p.whatsapp}</p></div>}
        <div className="card"><strong>{t('Address', 'عنوان')}</strong><p>{p.street}, {p.city}</p></div>
        <div className="card">
          <strong>{t('Hours', 'ساعات العمل')}</strong>
          {p.workingHours.map((w, i) => <p key={i} style={{ fontSize: 'var(--text-sm)' }}>{w.day}: {w.hours}</p>)}
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {p.is24h && <Badge variant="info">{t('24 Hours', '24 ساعة')}</Badge>}
        {p.hasDelivery && <Badge variant="success">{t('Delivery Available', 'توصيل متاح')}</Badge>}
      </div>
    </PageSection>
  );
}
