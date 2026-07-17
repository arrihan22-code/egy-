'use client';

import { useAuth } from '../contexts/AuthContext';

export default function AuthHeaderClient() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <a
        href="/profile"
        style={{
          fontSize: '0.875rem',
          padding: '0.25rem 0.75rem',
          background: '#f3f4f6',
          borderRadius: '999px',
          textDecoration: 'none',
          color: '#374151',
          whiteSpace: 'nowrap',
        }}
      >
        {user.profile?.fullName || user.phone}
      </a>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
      <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Login</a>
      <a
        href="/signup"
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
        }}
      >
        Sign Up
      </a>
    </div>
  );
}
