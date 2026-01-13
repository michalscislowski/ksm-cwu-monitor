'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`
        bg-surface rounded-xl border border-border-subtle
        shadow-card
        ${hover ? 'transition-all duration-300 hover:border-border hover:shadow-lg hover:bg-surface-elevated' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`px-5 py-4 border-b border-border-subtle flex items-center justify-between ${className}`}>
      <h3 className="font-semibold text-foreground flex items-center gap-2">{children}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardBody({ children, className = '', noPadding = false }: CardBodyProps) {
  return (
    <div className={`${noPadding ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
}
