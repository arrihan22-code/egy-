import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Egypt Services Platform',
  description: 'Find banks, pharmacies, hospitals, government offices, and more across Egypt',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Egypt Services</a>
            <a href="/banks">Banks</a>
            <a href="/pharmacies">Pharmacies</a>
            <a href="/hospitals">Hospitals</a>
          </nav>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>{children}</main>
      </body>
    </html>
  );
}
