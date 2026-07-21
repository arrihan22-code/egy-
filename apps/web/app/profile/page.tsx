'use client';

import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useDirection } from '../contexts/DirectionContext';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const { t, direction } = useDirection();

  if (loading) {
    return (
      <div className="page-section">
        <div className="container container-narrow" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{t('Loading...', 'جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-section">
        <div className="container container-narrow" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <p>{t('Please log in to view your profile.', 'يرجى تسجيل الدخول لعرض ملفك الشخصي.')}</p>
          <a href="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>{t('Login', 'تسجيل الدخول')}</a>
        </div>
      </div>
    );
  }

  const initial = (user.profile?.fullName || user.phone || 'U')[0].toUpperCase();

  return (
    <div className="page-section">
      <div className="container container-narrow">
        <div className="slide-up">
          <div style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: 120,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-36px',
                insetInlineStart: 'var(--space-8)',
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid var(--surface-elevated)',
                boxShadow: 'var(--shadow-md)',
              }}>
                {user.profile?.avatarUrl ? (
                  <Image src={user.profile.avatarUrl} alt="" width={80} height={80} style={{ borderRadius: 'var(--radius-xl)', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{initial}</span>
                )}
              </div>
            </div>

            <div style={{
              padding: 'var(--space-10) var(--space-8) var(--space-8)',
              paddingInlineStart: direction === 'rtl' ? 'var(--space-8)' : 'calc(var(--space-8) + 96px)',
            }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                {user.profile?.fullName || user.phone}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                {user.email || user.phone}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }} className="profile-grid">
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Phone', 'الهاتف')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }} dir="ltr">{user.phone}</div>
                </div>
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Email', 'البريد الإلكتروني')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{user.email || '-'}</div>
                </div>
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Status', 'الحالة')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: user.isVerified ? 'var(--accent-dark)' : 'var(--warning-dark)' }}>
                    {user.isVerified ? t('Verified', 'موثق') : t('Unverified', 'غير موثق')}
                  </div>
                </div>
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Roles', 'الأدوار')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                    {user.roles?.join(', ') || t('User', 'مستخدم')}
                  </div>
                </div>
                <div style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('Joined', 'تاريخ التسجيل')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                    {new Date(user.createdAt).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t('Logout', 'تسجيل الخروج')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:480px){.profile-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
