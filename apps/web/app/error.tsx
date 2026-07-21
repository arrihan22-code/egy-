'use client';

import { useDirection } from './contexts/DirectionContext';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useDirection();

  return (
    <div className="page-section">
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: 800,
          color: 'var(--error)',
          lineHeight: 1,
          marginBottom: 'var(--space-4)',
          opacity: 0.8,
        }}>
          !
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          {t('Something went wrong', 'حدث خطأ ما')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
          {t('An unexpected error occurred. Please try again.', 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')}
        </p>
        <button onClick={reset} className="btn btn-primary btn-lg">
          {t('Try Again', 'حاول مرة أخرى')}
        </button>
      </div>
    </div>
  );
}
