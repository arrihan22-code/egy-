'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Profile</h1>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e5e7eb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            {user.profile?.avatarUrl ? <img src={user.profile.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '\u{1F464}'}
          </div>
          <h2 style={{ margin: '0.5rem 0 0' }}>{user.profile?.fullName || user.phone}</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{user.email || user.phone}</p>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Phone</span>
            <span>{user.phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Email</span>
            <span>{user.email || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Verified</span>
            <span style={{ color: user.isVerified ? '#16a34a' : '#dc2626' }}>{user.isVerified ? 'Yes' : 'No'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>Roles</span>
            <span>{user.roles?.join(', ') || 'User'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ color: '#6b7280' }}>Joined</span>
            <span>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>

        <button
          onClick={() => { logout(); router.push('/'); }}
          style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', width: '100%' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
