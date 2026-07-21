'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 'var(--space-8)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          fontSize: '4rem', fontWeight: 800, color: 'var(--error)',
          lineHeight: 1, marginBottom: 'var(--space-4)', opacity: 0.8,
        }}>!</div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="btn btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
