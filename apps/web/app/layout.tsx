import type { Metadata } from 'next';
import './globals.css';
import SearchBar from './components/SearchBar';
import NotificationBell from './components/NotificationBell';

export const metadata: Metadata = {
  title: 'Egypt Services Platform',
  description: 'Find banks, pharmacies, hospitals, government offices, and more across Egypt',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
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
          </nav>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}