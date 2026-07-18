'use client';

import { useDirection } from '../contexts/DirectionContext';

const serviceLinks = [
  { href: '/banks', en: 'Banks & ATMs', ar: 'البنوك وأجهزة الصراف الآلي' },
  { href: '/pharmacies', en: 'Pharmacies', ar: 'الصيدليات' },
  { href: '/hospitals', en: 'Hospitals', ar: 'المستشفيات' },
  { href: '/government', en: 'Government Offices', ar: 'المكاتب الحكومية' },
  { href: '/transport', en: 'Transport', ar: 'المواصلات' },
  { href: '/emergency', en: 'Emergency', ar: 'الطوارئ' },
];

export default function Footer() {
  const { t } = useDirection();

  return (
    <footer
      style={{
        background: 'var(--surface-secondary)',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
      }}
    >
      <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-10)',
        }}
        className="footer-grid"
        >
          <div>
            <a href="/" style={{ fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)', display: 'inline-block', marginBottom: 'var(--space-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }}>
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Egypt Services
            </a>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', maxWidth: '320px' }}>
              {t(
                'Your comprehensive platform for finding government services, banks, hospitals, pharmacies, transport, and emergency contacts across Egypt.',
                'منصتك الشاملة للعثور على الخدمات الحكومية والبنوك والمستشفيات والصيدليات والمواصلات واتصالات الطوارئ في جميع أنحاء مصر.'
              )}
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('Services', 'الخدمات')}
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {serviceLinks.map(s => (
                <a key={s.href} href={s.href} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
                  {t(s.en, s.ar)}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('Account', 'الحساب')}
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <a href="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Login', 'تسجيل الدخول')}</a>
              <a href="/signup" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Sign Up', 'إنشاء حساب')}</a>
              <a href="/profile" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Profile', 'الملف الشخصي')}</a>
            </nav>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('Support', 'الدعم')}
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Help Center', 'مركز المساعدة')}</a>
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Contact Us', 'اتصل بنا')}</a>
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Privacy Policy', 'سياسة الخصوصية')}</a>
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{t('Terms of Service', 'شروط الخدمة')}</a>
            </nav>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()} Egypt Services Platform. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {['twitter', 'facebook', 'linkedin'].map(s => (
              <a key={s} href="#" aria-label={s} className="btn btn-icon btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
                {s === 'twitter' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                ) : s === 'facebook' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
