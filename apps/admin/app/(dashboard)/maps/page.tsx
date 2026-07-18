'use client';

import { useState } from 'react';

export default function MapsAdminPage() {
  const [testType, setTestType] = useState('nearby');
  const [results, setResults] = useState<any>(null);

  const testTypes = [
    { id: 'nearby', label: 'Nearby Search' },
    { id: 'reverse', label: 'Reverse Geocode' },
    { id: 'distance', label: 'Distance Matrix' },
  ];

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Maps & Geocoding Tools</h1>

      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', background: 'var(--surface-secondary)', padding: 'var(--space-1)', borderRadius: 'var(--radius-lg)', maxWidth: 400 }}>
        {testTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setTestType(t.id)}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: testType === t.id ? 'var(--surface-elevated)' : 'transparent',
              color: testType === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: testType === t.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              boxShadow: testType === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>Latitude</label>
            <input className="input" defaultValue="30.0444" style={{ width: 160 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>Longitude</label>
            <input className="input" defaultValue="31.2357" style={{ width: 160 }} />
          </div>
          {testType === 'nearby' && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>Type</label>
              <select className="input" style={{ width: 140 }}>
                <option>All</option>
                <option>Bank</option>
                <option>Pharmacy</option>
                <option>Hospital</option>
              </select>
            </div>
          )}
          {testType === 'distance' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>Lat 2</label>
                <input className="input" defaultValue="30.0444" style={{ width: 160 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>Lng 2</label>
                <input className="input" defaultValue="31.2357" style={{ width: 160 }} />
              </div>
            </>
          )}
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Test</button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)' }}>
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }}>
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <p>Click &ldquo;Test&rdquo; to run a geocoding query. Results will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
