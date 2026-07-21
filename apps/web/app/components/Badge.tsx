import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  style?: React.CSSProperties;
  children: ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--primary-light, #e0e7ff)', color: 'var(--primary, #4f46e5)' },
  success: { background: 'var(--success-light, #d1fae5)', color: 'var(--success, #059669)' },
  warning: { background: 'var(--warning-light, #fef3c7)', color: 'var(--warning, #d97706)' },
  danger: { background: 'var(--danger-light, #fee2e2)', color: 'var(--danger, #dc2626)' },
  info: { background: 'var(--info-light, #dbeafe)', color: 'var(--info, #2563eb)' },
  neutral: { background: 'var(--surface-secondary, #f3f4f6)', color: 'var(--text-secondary, #6b7280)' },
};

export function Badge({ variant = 'neutral', style, children }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm, 4px)',
      fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 500, lineHeight: 1.5,
      ...variantStyles[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}
