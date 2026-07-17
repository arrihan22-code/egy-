'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
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
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1 style={{ textAlign: 'center' }}>Sign Up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Phone *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Full Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Password *</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} required />
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem', background: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
