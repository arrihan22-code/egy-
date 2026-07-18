'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useDirection } from '../contexts/DirectionContext';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, direction } = useDirection();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(phone, password, fullName || undefined, email || undefined);
      router.push('/');
    } catch (err: any) { setError(err.message || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div className="page-section">
      <div className="container container-narrow">
        <div className="slide-up" style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-10) var(--space-8)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              color: 'var(--accent-dark)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {t('Create Account', 'إنشاء حساب')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              {t('Join to save favorites and get personalized recommendations', 'انضم لحفظ المفضلات والحصول على توصيات مخصصة')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="signup-grid">
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  {t('Full Name', 'الاسم الكامل')}
                </label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" placeholder={t('Your name', 'اسمك')} dir={direction} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  {t('Email', 'البريد الإلكتروني')}
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="email@example.com" dir={direction} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {t('Phone *', 'الهاتف *')}
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+20 1XX XXX XXXX" required dir={direction} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {t('Password *', 'كلمة المرور *')}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder={t('Min. 8 characters', '8 أحرف على الأقل')} required />
            </div>
            {error && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--error-light)',
                color: 'var(--error-dark)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-3)', marginTop: 'var(--space-2)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="animate-spin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                    </svg>
                  </span>
                  {t('Creating account...', 'جاري إنشاء الحساب...')}
                </span>
              ) : t('Create Account', 'إنشاء حساب')}
            </button>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
              <a href="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>{t('Sign in', 'تسجيل الدخول')}</a>
            </p>
          </form>
        </div>
      </div>
      <style>{`@media(max-width:480px){.signup-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
