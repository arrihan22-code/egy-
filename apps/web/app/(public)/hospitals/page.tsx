'use client';

import { useDirection } from '../../contexts/DirectionContext';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { CardGrid } from '../../components/CardGrid';
import { ListingCard } from '../../components/ListingCard';
import { Badge } from '../../components/Badge';

export default function HospitalsPage() {
  const { t, direction } = useDirection();
  const items = [
    { id: '1', nameAr: 'مستشفى 57357', nameEn: 'Children Cancer Hospital 57357', type: 'hospital', hasEmergency: true, phone: '+20 2 12345678', specialties: 'Oncology, Pediatrics' },
    { id: '2', nameAr: 'مستشفى القصر العيني', nameEn: 'Qasr El Ainy Hospital', type: 'hospital', hasEmergency: true, phone: '+20 2 23456789', specialties: 'General, Surgery, Cardiology' },
    { id: '3', nameAr: 'المعهد القومى للقلب', nameEn: 'National Heart Institute', type: 'hospital', hasEmergency: true, phone: '+20 2 34567890', specialties: 'Cardiology, Cardiac Surgery' },
  ];

  return (
    <PageSection>
      <ListingHeader
        titleKey="Hospitals & Clinics"
        titleAr="المستشفيات والعيادات"
        subtitleKey="Find hospitals, clinics, emergency rooms, and specialists across Egypt"
        subtitleAr="اعثر على المستشفيات والعيادات وغرف الطوارئ والأطباء المتخصصين في جميع أنحاء مصر"
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" className="input" placeholder={t('Search hospitals...', 'ابحث عن المستشفيات...')} style={{ maxWidth: 280 }} dir={direction} />
        <select className="input" style={{ maxWidth: 160 }}><option>{t('All Governorates', 'جميع المحافظات')}</option></select>
        <select className="input" style={{ maxWidth: 160 }}><option>{t('All Specialties', 'جميع التخصصات')}</option></select>
        <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer', gap: 'var(--space-2)' }}>
          <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t('Emergency', 'طوارئ')}
        </label>
      </div>

      <CardGrid>
        {items.map(h => (
          <ListingCard
            key={h.id}
            href={`/hospitals/${h.id}`}
            icon={'\u{1F3E5}'}
            iconBg="var(--error-light)"
            nameAr={h.nameAr}
            nameEn={h.nameEn}
            phone={h.phone}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 'var(--space-2) 0' }}>{h.specialties}</p>
            {h.hasEmergency && <Badge variant="danger">{t('Emergency', 'طوارئ')}</Badge>}
          </ListingCard>
        ))}
      </CardGrid>
    </PageSection>
  );
}
