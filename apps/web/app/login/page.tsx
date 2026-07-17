'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Phone or Email</label>
          <input
            value={phoneOrEmail}
            onChange={e => setPhoneOrEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            required
          />
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem', background: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
