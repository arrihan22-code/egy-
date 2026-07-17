import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from './components/RootLayoutClient';

export const metadata: Metadata = {
  title: 'Egypt Services Platform',
  description: 'Find banks, pharmacies, hospitals, government offices, and more across Egypt',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient children={children} />;
}
