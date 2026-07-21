import { useDirection } from '../contexts/DirectionContext';

interface BackButtonProps {
  href: string;
  labelKey: string;
  labelAr: string;
}

export function BackButton({ href, labelKey, labelAr }: BackButtonProps) {
  const { t } = useDirection();

  return (
    <a href={href} style={{ color: 'var(--text-secondary, #6b7280)', fontSize: 'var(--text-sm, 0.875rem)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12L6 8L10 4" />
      </svg>
      {t(labelKey, labelAr)}
    </a>
  );
}
