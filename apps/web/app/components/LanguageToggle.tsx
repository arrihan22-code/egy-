'use client';

import { useDirection } from '../contexts/DirectionContext';

export default function LanguageToggle() {
  const { language, toggleDirection } = useDirection();

  return (
    <button
      onClick={toggleDirection}
      className="btn btn-sm btn-ghost"
      aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
      title={language === 'en' ? 'العربية' : 'English'}
      style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.02em' }}
    >
      {language === 'en' ? 'AR' : 'EN'}
    </button>
  );
}
