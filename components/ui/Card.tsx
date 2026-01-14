'use client';

import { ReactNode } from 'react';
import { DataSourceBadge, type DataSource } from './Badge';

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
        relative
        bg-surface-elevated
        rounded-lg
        border border-border
        transition-all duration-200
        ${hover ? 'hover:border-foreground-subtle cursor-pointer' : ''}
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
  dataSource?: DataSource;
  icon?: ReactNode;
}

export function CardHeader({ children, className = '', action, dataSource, icon }: CardHeaderProps) {
  return (
    <div className={`px-5 py-3.5 border-b border-border flex items-center justify-between ${className}`}>
      <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
        {icon && (
          <span className="flex items-center justify-center w-5 h-5 text-foreground-muted">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {dataSource && <DataSourceBadge source={dataSource} />}
      </h3>
      {action && <div className="flex items-center gap-2">{action}</div>}
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

// Skeleton loader for cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-elevated rounded-xl border border-border-subtle overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="h-5 w-32 bg-surface-hover rounded animate-pulse" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 w-full bg-surface-hover rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-surface-hover rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-surface-hover rounded animate-pulse" />
      </div>
    </div>
  );
}
