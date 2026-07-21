'use client';

import { useDirection } from '../../contexts/DirectionContext';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { CardGrid } from '../../components/CardGrid';
import { ListingCard } from '../../components/ListingCard';
import { Badge } from '../../components/Badge';

export default function PharmaciesPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'صيدلية العزبى', nameEn: 'El Ezaby Pharmacy', is24h: true, hasDelivery: true, phone: '+20 2 12345678' },
    { id: '2', nameAr: 'صيدلية شعبان', nameEn: 'Shaaban Pharmacy', is24h: false, hasDelivery: true, phone: '+20 2 23456789' },
    { id: '3', nameAr: 'صيدلية المنشاوى', nameEn: 'El Manshawy Pharmacy', is24h: true, hasDelivery: false, phone: '+20 2 34567890' },
  ];

  return (
    <PageSection>
      <ListingHeader
        titleKey="Pharmacies"
        titleAr="الصيدليات"
        subtitleKey="Find pharmacies, 24-hour outlets, and delivery services across Egypt"
        subtitleAr="اعثر على الصيدليات والفروع التي تعمل على مدار 24 ساعة وخدمات التوصيل في جميع أنحاء مصر"
      />

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

      <CardGrid>
        {items.map(p => (
          <ListingCard
            key={p.id}
            href={`/pharmacies/${p.id}`}
            icon={'\u{1F48A}'}
            iconBg="var(--accent-light)"
            nameAr={p.nameAr}
            nameEn={p.nameEn}
            phone={p.phone}
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {p.is24h && <Badge variant="info">{t('24 Hours', '24 ساعة')}</Badge>}
              {p.hasDelivery && <Badge variant="success">{t('Delivery', 'توصيل')}</Badge>}
            </div>
          </ListingCard>
        ))}
      </CardGrid>
    </PageSection>
  );
}
