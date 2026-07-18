'use client';

import { useDirection } from './contexts/DirectionContext';

export default function NotFound() {
  const { t } = useDirection();

  return (
    <div className="page-section">
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 800,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: 'var(--space-4)',
          opacity: 0.8,
        }}>
          404
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          {t('Page not found', 'الصفحة غير موجودة')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
          {t('The page you are looking for does not exist or has been moved.', 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
        </p>
        <a href="/" className="btn btn-primary btn-lg">
          {t('Go Home', 'العودة إلى الرئيسية')}
        </a>
      </div>
    </div>
  );
}
