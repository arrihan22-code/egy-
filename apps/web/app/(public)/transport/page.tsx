'use client';

import { useDirection } from '../../contexts/DirectionContext';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { CardGrid } from '../../components/CardGrid';
import { ListingCard } from '../../components/ListingCard';
import { Badge } from '../../components/Badge';

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
    <PageSection>
      <ListingHeader
        titleKey="Transport"
        titleAr="المواصلات"
        subtitleKey="Find metro, train, and bus stations with routes and schedules"
        subtitleAr="اعثر على محطات المترو والقطارات والحافلات مع المسارات والجداول"
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" className="input" placeholder={t('Search stations...', 'ابحث عن المحطات...')} style={{ maxWidth: 320 }} dir={direction} />
        <select className="input" style={{ maxWidth: 160 }}>
          <option>{t('All Types', 'جميع الأنواع')}</option>
          <option>{t('Metro', 'مترو')}</option>
          <option>{t('Train', 'قطار')}</option>
          <option>{t('Bus', 'حافلة')}</option>
        </select>
      </div>

      <CardGrid>
        {items.map(s => (
          <ListingCard
            key={s.id}
            href={`/transport/${s.id}`}
            icon={'\u{1F687}'}
            iconBg="var(--warning-light)"
            nameAr={s.nameAr}
            nameEn={s.nameEn}
          >
            <Badge variant="warning" style={{ marginTop: 'var(--space-2)' }}>{s.line}</Badge>
          </ListingCard>
        ))}
      </CardGrid>
    </PageSection>
  );
}
