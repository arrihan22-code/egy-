'use client';

import { useDirection } from '../../contexts/DirectionContext';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { CardGrid } from '../../components/CardGrid';
import { ListingCard } from '../../components/ListingCard';
import { Badge } from '../../components/Badge';

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
    <PageSection>
      <ListingHeader
        titleKey="Government Offices"
        titleAr="المكاتب الحكومية"
        subtitleKey="Find civil ID, passport, traffic, and post offices across Egypt"
        subtitleAr="اعثر على مكاتب السجل المدني وجوازات السفر والمرور والبريد في جميع أنحاء مصر"
      />

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

      <CardGrid>
        {items.map(g => (
          <ListingCard
            key={g.id}
            href={`/government/${g.id}`}
            icon={'\u{1F3DB}'}
            iconBg="var(--primary-light)"
            nameAr={g.nameAr}
            nameEn={g.nameEn}
            phone={g.phone}
          >
            <Badge variant="primary">{g.services} {t('services', 'خدمة')}</Badge>
          </ListingCard>
        ))}
      </CardGrid>
    </PageSection>
  );
}
