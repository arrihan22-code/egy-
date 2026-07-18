import type { Metadata } from 'next';
import './globals.css';
import AdminShell from './AdminShell';

export const metadata: Metadata = {
  title: 'Admin - Egypt Services Platform',
  description: 'Administration panel for Egypt Services Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
