import { ReactNode } from 'react';

interface ListingCardProps {
  href: string;
  icon: string;
  iconBg: string;
  nameAr: string;
  nameEn?: string | null;
  phone?: string | null;
  children?: ReactNode;
}

const PHONE_ICON = '\u{1F4DE}';

export function ListingCard({ href, icon, iconBg, nameAr, nameEn, phone, children }: ListingCardProps) {
  return (
    <a key={href} href={href} className="card card-hover" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>{nameAr}</h3>
          {nameEn && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: '0.125rem 0 0' }}>{nameEn}</p>}
          {phone && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 'var(--space-2) 0 0' }} dir="ltr">{PHONE_ICON} {phone}</p>}
        </div>
      </div>
      {children}
    </a>
  );
}
