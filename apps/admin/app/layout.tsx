import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin - Egypt Services Platform',
  description: 'Administration panel for Egypt Services Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ background: '#1e293b', color: 'white', padding: '1rem' }}>
          <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" style={{ color: 'white', fontWeight: 700 }}>Admin Panel</a>
            <a href="/sync" style={{ color: '#93c5fd' }}>Sync</a>
            <a href="/logs" style={{ color: '#93c5fd' }}>Logs</a>
            <a href="/collectors" style={{ color: '#93c5fd' }}>Collectors</a>
            <a href="/search" style={{ color: '#93c5fd' }}>Search</a>
            <a href="/maps" style={{ color: '#93c5fd' }}>Maps</a>
            <a href="/reviews" style={{ color: '#93c5fd' }}>Reviews</a>
            <a href="/notifications" style={{ color: '#93c5fd' }}>Notifications</a>
          </nav>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>{children}</main>
      </body>
    </html>
  );
}
