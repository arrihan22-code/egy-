'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useDirection } from '../contexts/DirectionContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import NotificationBell from './NotificationBell';

const navLinks = [
  { href: '/banks', en: 'Banks', ar: 'البنوك' },
  { href: '/pharmacies', en: 'Pharmacies', ar: 'الصيدليات' },
  { href: '/hospitals', en: 'Hospitals', ar: 'المستشفيات' },
  { href: '/government', en: 'Government', ar: 'الحكومة' },
  { href: '/transport', en: 'Transport', ar: 'المواصلات' },
  { href: '/emergency', en: 'Emergency', ar: 'الطوارئ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t } = useDirection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled
          ? 'var(--surface-elevated)'
          : 'var(--surface)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all var(--transition-base)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <nav className="container" style={{
        display: 'flex',
        alignItems: 'center',
        height: 'var(--nav-height)',
        gap: 'var(--space-4)',
      }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{t('Egypt Services', 'خدمات مصر')}</span>
        </a>

        <div className="nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          marginInlineStart: 'auto',
        }}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="btn btn-sm btn-ghost"
              style={{
                fontWeight: isActive(link.href) ? 600 : 400,
                color: isActive(link.href) ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive(link.href) ? 'var(--primary-light)' : 'transparent',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {t(link.en, link.ar)}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
          <LanguageToggle />
          <ThemeToggle />
          {user && <NotificationBell />}
          <AuthSection user={user} loading={loading} />

          <button
            className="btn btn-icon btn-ghost nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('Toggle menu', 'القائمة')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className="backdrop-overlay" onClick={() => setMobileOpen(false)} />
          <div
            ref={menuRef}
            className="slide-down"
            style={{
              position: 'fixed',
              top: 'var(--nav-height)',
              insetInline: 0,
              background: 'var(--surface-elevated)',
              borderBottom: '1px solid var(--border)',
              padding: 'var(--space-4)',
              zIndex: 45,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: 'calc(100vh - var(--nav-height))',
              overflow: 'auto',
            }}
          >
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive(link.href) ? 'var(--primary-light)' : 'transparent',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {t(link.en, link.ar)}
              </a>
            ))}
            <hr style={{ margin: 'var(--space-2) 0' }} />
            {!user && !loading && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <a href="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  {t('Login', 'تسجيل الدخول')}
                </a>
                <a href="/signup" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {t('Sign Up', 'إنشاء حساب')}
                </a>
              </div>
            )}
            {user && (
              <a
                href="/profile"
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}
              >
                {t('Profile', 'الملف الشخصي')}
              </a>
            )}
          </div>
        </>
      )}

      <style>{`
        .nav-hamburger { display: none !important; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

function AuthSection({ user, loading }: { user: any; loading: boolean }) {
  const { t } = useDirection();
  if (loading) return null;
  if (user) {
    return (
      <a
        href="/profile"
        className="btn btn-sm btn-ghost"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          paddingInline: 'var(--space-3)',
          fontWeight: 500,
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-secondary)',
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {(user.profile?.fullName || user.phone || 'U')[0].toUpperCase()}
        </div>
        <span className="nav-user-name">{user.profile?.fullName || user.phone}</span>
      </a>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <a href="/login" className="btn btn-sm btn-ghost">{t('Login', 'تسجيل الدخول')}</a>
      <a href="/signup" className="btn btn-sm btn-primary">{t('Sign Up', 'إنشاء حساب')}</a>
    </div>
  );
}
