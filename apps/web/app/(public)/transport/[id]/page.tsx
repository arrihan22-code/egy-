'use client';

import { use } from 'react';
import { useDirection } from '../../../contexts/DirectionContext';
import { PageSection } from '../../../components/PageSection';
import { BackButton } from '../../../components/BackButton';
import { Badge } from '../../../components/Badge';

const data = { nameAr: 'محطة مترو السادات', nameEn: 'Sadat Metro Station', type: 'metro', line: 'Line 1 & 2', zone: 'Central Cairo', hasParking: false, hasAccessibility: true, routes: [{ from: 'El Marg', to: 'Helwan', duration: '45 min', fare: '5 EGP' }, { from: 'Shobra El Kheima', to: 'El Monib', duration: '35 min', fare: '5 EGP' }] };

export default function TransportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { t } = useDirection();
  const s = data;

  return (
    <PageSection>
      <BackButton href="/transport" labelKey="Back to Transport" labelAr="العودة إلى النقل" />
      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{s.nameAr}</h1>
        {s.nameEn && <p style={{ color: 'var(--text-secondary)' }}>{s.nameEn}</p>}
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
          <Badge variant="primary">{s.line}</Badge>
          {s.hasParking && <Badge variant="success">{t('Parking', 'موقف سيارات')}</Badge>}
          {s.hasAccessibility && <Badge variant="info">{t('Accessible', 'يمكن الوصول')}</Badge>}
        </div>
      </div>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('Routes from this station', 'خطوط من هذه المحطة')}</h2>
        <div className="grid">
          {s.routes.map((r, i) => (
            <div key={i} className="card">
              <p><strong>{t('From', 'من')}:</strong> {r.from}</p>
              <p><strong>{t('To', 'إلى')}:</strong> {r.to}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>⏱ {r.duration} | 💰 {r.fare}</p>
            </div>
          ))}
        </div>
      </section>
    </PageSection>
  );
}
