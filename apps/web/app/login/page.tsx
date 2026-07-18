'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useDirection } from '../contexts/DirectionContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, direction } = useDirection();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phoneOrEmail, password);
      router.push('/');
    } catch (err: any) { setError(err.message || 'Login failed'); }
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
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              color: 'var(--primary)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {t('Welcome Back', 'مرحبًا بعودتك')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              {t('Sign in to access your saved services and preferences', 'سجل الدخول للوصول إلى خدماتك المفضلة وإعداداتك')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {t('Phone or Email', 'الهاتف أو البريد الإلكتروني')}
              </label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={e => setPhoneOrEmail(e.target.value)}
                className="input"
                placeholder={t('Enter your phone or email', 'أدخل هاتفك أو بريدك الإلكتروني')}
                required
                autoComplete="username"
                dir={direction}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {t('Password', 'كلمة المرور')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="········"
                required
                autoComplete="current-password"
              />
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
              style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-3)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="animate-spin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                    </svg>
                  </span>
                  {t('Signing in...', 'جاري تسجيل الدخول...')}
                </span>
              ) : t('Sign In', 'تسجيل الدخول')}
            </button>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
              <a href="/signup" style={{ fontWeight: 600, color: 'var(--primary)' }}>{t('Sign up', 'إنشاء حساب')}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
