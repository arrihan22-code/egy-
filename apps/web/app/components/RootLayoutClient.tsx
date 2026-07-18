'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DirectionProvider } from '../contexts/DirectionContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider>
      <ThemeProvider>
        <AuthProvider>
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
