'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f8f9fa', color: '#1a1b1e',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              fontSize: '4rem', fontWeight: 800, color: '#ef4444',
              lineHeight: 1, marginBottom: '16px', opacity: 0.8,
            }}>!</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
              Critical Error
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button onClick={() => reset()} style={{
              padding: '12px 24px', background: '#0a66c2', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '1rem',
              cursor: 'pointer', fontWeight: 500,
            }}>
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
