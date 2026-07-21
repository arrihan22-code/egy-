import { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
  columns?: 'auto' | '2';
  stagger?: boolean;
}

export function CardGrid({ children, columns = 'auto', stagger = true }: CardGridProps) {
  return (
    <div className={`grid grid-${columns}${stagger ? ' stagger' : ''}`}>
      {children}
    </div>
  );
}
