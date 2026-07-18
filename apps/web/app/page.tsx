'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDirection } from './contexts/DirectionContext';

const services = [
  {
    titleEn: 'Banks & ATMs', titleAr: 'البنوك وأجهزة الصراف',
    descEn: 'Find banks, branches, ATMs near you with locations and hours',
    descAr: 'اعثر على البنوك والفروع وأجهزة الصراف الآلي القريبة منك',
    href: '/banks', color: '#0A66C2',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    titleEn: 'Pharmacies', titleAr: 'الصيدليات',
    descEn: '24-hour pharmacies, delivery services, and medication search',
    descAr: 'صيدليات على مدار 24 ساعة وخدمات التوصيل والبحث عن الأدوية',
    href: '/pharmacies', color: '#10B981',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    titleEn: 'Hospitals', titleAr: 'المستشفيات',
    descEn: 'Hospitals, clinics, emergency rooms, and specialist doctors',
    descAr: 'المستشفيات والعيادات وغرف الطوارئ والأطباء المتخصصين',
    href: '/hospitals', color: '#EF4444',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    titleEn: 'Government Offices', titleAr: 'المكاتب الحكومية',
    descEn: 'Civil ID, passport, traffic, and post offices across Egypt',
    descAr: 'مكاتب السجل المدني وجوازات السفر والمرور والبريد في جميع أنحاء مصر',
    href: '/government', color: '#8B5CF6',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    titleEn: 'Transport', titleAr: 'المواصلات',
    descEn: 'Metro, trains, routes, schedules, and station information',
    descAr: 'مترو الأنفاق والقطارات والطرق والجداول ومعلومات المحطات',
    href: '/transport', color: '#F59E0B',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h18" /><path d="M3 15h18" />
      </svg>
    ),
  },
  {
    titleEn: 'Emergency', titleAr: 'الطوارئ',
    descEn: 'Police, fire, ambulance hotlines and emergency alerts',
    descAr: 'خطوط الشرطة والمطافئ والإسعاف الساخنة والتنبيهات الطارئة',
    href: '/emergency', color: '#DC2626',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const quickSearches = [
  { en: 'Nearby ATMs', ar: 'أجهزة صراف قريبة', icon: '💳' },
  { en: '24h Pharmacies', ar: 'صيدليات 24 ساعة', icon: '💊' },
  { en: 'Metro Lines', ar: 'خطوط المترو', icon: '🚇' },
  { en: 'Emergency Hotlines', ar: 'خطوط الطوارئ', icon: '🆘' },
];

export default function Home() {
  const router = useRouter();
  const { direction, language, t } = useDirection();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    inputRef.current?.blur();
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div>
      <section style={{
        position: 'relative',
        padding: 'var(--space-16) 0 var(--space-12)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, var(--primary-light) 0%, transparent 60%)',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 80% 100%, var(--accent-light) 0%, transparent 50%)',
          opacity: 0.3,
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="slide-up" style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-4)',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: 'var(--space-6)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {t('Comprehensive Egypt Services Directory', 'دليل الخدمات الشامل في مصر')}
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, var(--text-5xl))',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-4)',
              color: 'var(--text-primary)',
            }}>
              {t('Find Every Service in ', 'اعثر على كل الخدمات في ')}
              <span style={{ color: 'var(--primary)' }}>
                {t('Egypt', 'مصر')}
              </span>
            </h1>

            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto var(--space-8)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {t(
                'One platform for banks, pharmacies, hospitals, government offices, transport, and emergency services across all governorates.',
                'منصة واحدة للبنوك والصيدليات والمستشفيات والمكاتب الحكومية والمواصلات وخدمات الطوارئ في جميع المحافظات.'
              )}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            style={{
              maxWidth: '680px',
              margin: '0 auto var(--space-6)',
              position: 'relative',
              animation: 'slideUp 0.4s ease-out 0.1s both',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface-elevated)',
              border: `2px solid ${isFocused ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-1)',
              boxShadow: isFocused
                ? '0 0 0 4px rgba(var(--primary-rgb), 0.12), var(--shadow-lg)'
                : 'var(--shadow-md)',
              transition: 'all var(--transition-base)',
            }}>
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--text-tertiary)',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t('Search for services, locations, or keywords...', 'ابحث عن الخدمات أو المواقع أو الكلمات المفتاحية...')}
                aria-label={t('Search services', 'بحث الخدمات')}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: 'var(--space-3) 0',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                  width: '100%',
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  paddingInline: 'var(--space-6)',
                  marginInlineEnd: 'var(--space-1)',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: 'var(--space-1)' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {t('Search', 'بحث')}
              </button>
            </div>
          </form>

          <div className="slide-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-2)', maxWidth: '600px', margin: '0 auto' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', padding: 'var(--space-1) 0', alignSelf: 'center' }}>
              {t('Popular:', 'الأكثر بحثًا:')}
            </span>
            {quickSearches.map(q => (
              <button
                key={q.en}
                onClick={() => handleQuickSearch(q.en)}
                className="btn btn-sm btn-secondary"
                style={{ borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)' }}
              >
                {q.icon} {t(q.en, q.ar)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" style={{ background: 'var(--surface-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              marginBottom: 'var(--space-3)',
              color: 'var(--text-primary)',
            }}>
              {t('Browse by Service', 'تصفح حسب الخدمة')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              {t(
                'Select a category to find detailed information, locations, and contacts.',
                'اختر فئة للعثور على معلومات مفصلة ومواقع وجهات اتصال.'
              )}
            </p>
          </div>

          <div className="grid grid-auto stagger">
            {services.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-xl)',
                  border: 'none',
                  background: 'var(--surface)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: s.color,
                  opacity: 0.8,
                }} />
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: `${s.color}15`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {s.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 600,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}>
                    {t(s.titleEn, s.titleAr)}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}>
                    {t(s.descEn, s.descAr)}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: s.color,
                  marginTop: 'auto',
                }}>
                  {t('Explore', 'استكشف')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-12) var(--space-8)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              marginBottom: 'var(--space-3)',
            }}>
              {t('Why Egypt Services?', 'لماذا خدمات مصر؟')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
              {t(
                'We aggregate data from official sources to provide you with accurate, up-to-date information.',
                'نجمع البيانات من المصادر الرسمية لنقدم لك معلومات دقيقة ومحدثة.'
              )}
            </p>
            <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
              {[
                { en: 'Real-time Data', ar: 'بيانات محدثة', descEn: 'Information synced from official government sources', descAr: 'معلومات متزامنة من المصادر الحكومية الرسمية', icon: '🔄' },
                { en: 'Comprehensive', ar: 'شامل', descEn: 'Thousands of listings across 27 governorates', descAr: 'آلاف القوائم في 27 محافظة', icon: '🗺️' },
                { en: 'Always Free', ar: 'مجاني دائمًا', descEn: 'No registration required to access essential info', descAr: 'لا حاجة للتسجيل للوصول إلى المعلومات الأساسية', icon: '✅' },
              ].map((f, i) => (
                <div key={i} style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>{t(f.en, f.ar)}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    {t(f.descEn, f.descAr)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
