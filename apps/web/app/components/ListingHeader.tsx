import { useDirection } from '../contexts/DirectionContext';

interface ListingHeaderProps {
  titleKey: string;
  titleAr: string;
  subtitleKey: string;
  subtitleAr: string;
}

export function ListingHeader({ titleKey, titleAr, subtitleKey, subtitleAr }: ListingHeaderProps) {
  const { t } = useDirection();

  return (
    <div className="slide-up" style={{ marginBottom: 'var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        {t(titleKey, titleAr)}
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        {t(subtitleKey, subtitleAr)}
      </p>
    </div>
  );
}
