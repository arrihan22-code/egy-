'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Direction = 'ltr' | 'rtl';
type Language = 'en' | 'ar';

interface DirectionContextType {
  direction: Direction;
  language: Language;
  toggleDirection: () => void;
  setDirection: (d: Direction) => void;
  setLanguage: (l: Language) => void;
  t: (en: string, ar: string) => string;
}

const DirectionContext = createContext<DirectionContextType>({
  direction: 'ltr',
  language: 'en',
  toggleDirection: () => {},
  setDirection: () => {},
  setLanguage: () => {},
  t: (en: string) => en,
});

const STORAGE_KEY = 'egypt-services-direction';

export function DirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirectionState] = useState<Direction>('ltr');
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Direction | null;
    if (stored) {
      setDirectionState(stored);
      setLanguageState(stored === 'rtl' ? 'ar' : 'en');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem(STORAGE_KEY, direction);
  }, [direction, language]);

  const toggleDirection = useCallback(() => {
    setDirectionState(prev => {
      const next = prev === 'ltr' ? 'rtl' : 'ltr';
      setLanguageState(next === 'rtl' ? 'ar' : 'en');
      return next;
    });
  }, []);

  const setDirection = useCallback((d: Direction) => {
    setDirectionState(d);
    setLanguageState(d === 'rtl' ? 'ar' : 'en');
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    setDirectionState(l === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const t = useCallback((en: string, ar: string) => {
    return language === 'ar' ? ar : en;
  }, [language]);

  return (
    <DirectionContext.Provider value={{ direction, language, toggleDirection, setDirection, setLanguage, t }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  return useContext(DirectionContext);
}
