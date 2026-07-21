import type { Metadata, Viewport } from 'next';
import './globals.css';
import RootLayoutClient from './components/RootLayoutClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b1e' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Egypt Services Platform',
    template: '%s | Egypt Services Platform',
  },
  description: 'Find banks, pharmacies, hospitals, government offices, transport, emergency contacts, and more across Egypt',
  metadataBase: new URL('https://eg-ahmed-mokhtar-s-projects.vercel.app'),
  openGraph: {
    title: 'Egypt Services Platform',
    description: 'Find banks, pharmacies, hospitals, government offices, transport, emergency contacts, and more across Egypt',
    url: 'https://eg-ahmed-mokhtar-s-projects.vercel.app',
    siteName: 'Egypt Services Platform',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Egypt Services Platform',
    description: 'Find banks, pharmacies, hospitals, government offices, transport, emergency contacts, and more across Egypt',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient children={children} />;
}
