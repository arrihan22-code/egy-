'use client';

import { useDirection } from '../../contexts/DirectionContext';
import { JsonLd } from '../../components/JsonLd';
import { PageSection } from '../../components/PageSection';
import { ListingHeader } from '../../components/ListingHeader';
import { Badge } from '../../components/Badge';
import { CardGrid } from '../../components/CardGrid';

const hotlines = [
  { type: 'police', nameAr: 'الشرطة', nameEn: 'Police', hotline: '122', isNational: true, color: '#2563EB' },
  { type: 'ambulance', nameAr: 'الإسعاف', nameEn: 'Ambulance', hotline: '123', isNational: true, color: '#10B981' },
  { type: 'fire', nameAr: 'المطافئ', nameEn: 'Fire Department', hotline: '180', isNational: true, color: '#EF4444' },
  { type: 'civil_defense', nameAr: 'الدفاع المدنى', nameEn: 'Civil Defense', hotline: '160', isNational: true, color: '#F59E0B' },
];

const alerts = [
  { titleAr: 'تحذير من طقس سيء', titleEn: 'Severe Weather Warning', severity: 'warning', desc: 'Heavy rainfall expected in Alexandria and Delta regions' },
];

const hotlineIcons: Record<string, string> = {
  police: '\u{1F694}',
  ambulance: '\u{1F691}',
  fire: '\u{1F692}',
  civil_defense: '\u{1F6E1}\uFE0F',
};

export default function EmergencyPage() {
  const { t, direction } = useDirection();

  return (
    <PageSection>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'EmergencyService',
        name: 'Egypt Emergency Services',
        description: 'National emergency hotlines for police, ambulance, fire, and civil defense across Egypt',
        areaServed: { '@type': 'Country', name: 'Egypt' },
        availableLanguage: ['English', 'Arabic'],
        contactPoint: hotlines.map(h => ({
          '@type': 'ContactPoint',
          contactType: h.type,
          telephone: h.hotline,
          name: h.nameEn,
          areaServed: 'EG',
        })),
      }} />
      <ListingHeader
        titleKey="Emergency Services"
        titleAr="خدمات الطوارئ"
        subtitleKey="National hotlines, emergency contacts, and active alerts"
        subtitleAr="الأرقام الساخنة الوطنية وجهات اتصال الطوارئ والتنبيهات النشطة"
      />

      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
          {t('National Hotlines', 'الأرقام الساخنة الوطنية')}
        </h2>
        <CardGrid columns="2">
          {hotlines.map(h => (
            <a
              key={h.type}
              href={`tel:${h.hotline}`}
              className="card card-hover"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-6)', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: `${h.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                {hotlineIcons[h.type] || '\u{1F6A8}'}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>{h.nameAr}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{h.nameEn}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: h.color, letterSpacing: '0.05em' }} dir="ltr">{h.hotline}</div>
              </div>
              <div style={{ marginInlineStart: 'auto', color: 'var(--text-tertiary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </a>
          ))}
        </CardGrid>
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {t('Active Alerts', 'التنبيهات النشطة')}
            </span>
          </h2>
          {alerts.map((a, i) => (
            <div key={i} style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{'\u26A0\uFE0F'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
                  {direction === 'rtl' ? a.titleAr : a.titleEn}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{a.desc}</p>
                <Badge variant="warning">{a.severity}</Badge>
              </div>
            </div>
          ))}
        </section>
      )}
    </PageSection>
  );
}
