export default function PublicLoading() {
  return (
    <div className="page-section">
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 'var(--space-4)' }}>
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Loading services...</p>
        </div>
      </div>
    </div>
  );
}
