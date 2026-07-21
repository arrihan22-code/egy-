import { ReactNode } from 'react';

export function PageSection({ children }: { children: ReactNode }) {
  return (
    <div className="page-section">
      <div className="container">{children}</div>
    </div>
  );
}
