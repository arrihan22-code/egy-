'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import AuthHeaderClient from './AuthHeaderClient';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <header style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
        <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ fontWeight: 700, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Egypt Services</a>
          <SearchBar />
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
            <a href="/banks">Banks</a>
            <a href="/pharmacies">Pharmacies</a>
            <a href="/hospitals">Hospitals</a>
            <a href="/government">Government</a>
            <a href="/transport">Transport</a>
            <a href="/emergency" style={{ color: '#dc2626' }}>Emergency</a>
          </div>
          <NotificationBell />
          <AuthHeaderClient />
        </nav>
      </header>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {children}
      </main>
    </AuthProvider>
  );
}
