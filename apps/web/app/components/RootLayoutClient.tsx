'use client';

import { ReactNode } from 'react';
import Script from 'next/script';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DirectionProvider } from '../contexts/DirectionContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { JsonLd } from './JsonLd';

const THEME_STORAGE_KEY = 'egypt-services-theme';
const DIR_STORAGE_KEY = 'egypt-services-direction';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider>
      <ThemeProvider>
        <Script id="theme-and-dir-init" strategy="beforeInteractive">{`
          (function() {
            var theme = localStorage.getItem('${THEME_STORAGE_KEY}');
            if (theme) {
              document.documentElement.setAttribute('data-theme', theme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
            var dir = localStorage.getItem('${DIR_STORAGE_KEY}');
            if (dir) {
              document.documentElement.setAttribute('dir', dir);
              document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
            }
          })();
        `}</Script>
        <AuthProvider>
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Egypt Services Platform',
            url: 'https://egypt-services-web.vercel.app',
            description: 'Find banks, pharmacies, hospitals, government offices, transport, and emergency contacts across Egypt',
            inLanguage: ['en', 'ar'],
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </DirectionProvider>
  );
}
