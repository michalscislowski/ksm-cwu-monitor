'use client';

import { ReactNode } from 'react';
import type { Category } from '@/lib/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'critical' | 'info' | 'efficiency' | 'category-a' | 'category-b' | 'category-c';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-hover text-foreground-muted border-border',
  success: 'bg-success-muted text-success border-success/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  critical: 'bg-critical-muted text-critical border-critical/20',
  info: 'bg-info-muted text-info border-info/20',
  efficiency: 'bg-efficiency-muted text-efficiency border-efficiency/20',
  'category-a': 'bg-success-muted text-success border-success/25',
  'category-b': 'bg-warning-muted text-warning border-warning/25',
  'category-c': 'bg-critical-muted text-critical border-critical/25',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  pulse = false,
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md border
        transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Specialized category badge - clean, minimal design
interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const categoryConfig: Record<Category, { label: string; color: string; bg: string; border: string }> = {
  A: {
    label: 'Bardzo dobra',
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/25'
  },
  B: {
    label: 'Do optymalizacji',
    color: 'text-warning',
    bg: 'bg-warning/15',
    border: 'border-warning/25'
  },
  C: {
    label: 'Wymaga uwagi',
    color: 'text-critical',
    bg: 'bg-critical/15',
    border: 'border-critical/25'
  },
};

const categorySizeStyles = {
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-6 h-6 text-xs',
  lg: 'w-7 h-7 text-sm',
};

export function CategoryBadge({ category, size = 'md', showLabel = false }: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span className="inline-flex items-center gap-2">
      {/* Clean circular badge with just the letter */}
      <span
        className={`
          inline-flex items-center justify-center
          rounded-full font-bold font-mono
          border
          ${categorySizeStyles[size]}
          ${config.color}
          ${config.bg}
          ${config.border}
        `}
      >
        {category}
      </span>
      {showLabel && (
        <span className={`text-sm ${config.color}`}>
          {config.label}
        </span>
      )}
    </span>
  );
}

// Trend badge with arrow indicator
interface TrendBadgeProps {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
  showValue?: boolean;
}

export function TrendBadge({ trend, change, showValue = true }: TrendBadgeProps) {
  const config = {
    improving: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8l4-4 4 4" />
        </svg>
      ),
      variant: 'success' as const,
      prefix: '+',
    },
    declining: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l4 4 4-4" />
        </svg>
      ),
      variant: 'critical' as const,
      prefix: '',
    },
    stable: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h8" />
        </svg>
      ),
      variant: 'default' as const,
      prefix: change > 0 ? '+' : '',
    },
  };

  const { icon, variant, prefix } = config[trend];

  return (
    <Badge variant={variant} size="sm" icon={icon}>
      {showValue && (
        <span className="font-mono font-medium tabular-nums">
          {prefix}{Math.abs(change)}
        </span>
      )}
    </Badge>
  );
}

// Data source badge - indicates whether data comes from MEC or KSM
export type DataSource = 'mec' | 'ksm';

interface DataSourceBadgeProps {
  source: DataSource;
  showLabel?: boolean;
  className?: string;
}

export function DataSourceBadge({ source, showLabel = true, className = '' }: DataSourceBadgeProps) {
  const config = {
    mec: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v8M3 5l3-3 3 3" />
        </svg>
      ),
      label: 'MEC',
      description: 'Dane z MEC',
      bgClass: 'bg-info-muted text-info border-info/20',
    },
    ksm: {
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="3" height="8" rx="0.5" />
          <rect x="7" y="4" width="3" height="6" rx="0.5" />
        </svg>
      ),
      label: 'KSM',
      description: 'Dane KSM',
      bgClass: 'bg-efficiency-muted text-efficiency border-efficiency/20',
    },
  };

  const { icon, label, description, bgClass } = config[source];

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5
        text-[10px] font-semibold tracking-wide uppercase
        rounded border
        ${bgClass}
        ${className}
      `}
      title={description}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </span>
  );
}

// Status badge with dot indicator
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    online: { color: 'bg-success', textColor: 'text-success', defaultLabel: 'Online' },
    offline: { color: 'bg-foreground-subtle', textColor: 'text-foreground-muted', defaultLabel: 'Offline' },
    warning: { color: 'bg-warning', textColor: 'text-warning', defaultLabel: 'Ostrzeżenie' },
    error: { color: 'bg-critical', textColor: 'text-critical', defaultLabel: 'Błąd' },
  };

  const { color, textColor, defaultLabel } = statusConfig[status];
  const displayLabel = label || defaultLabel;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${size === 'sm' ? 'text-[10px]' : 'text-xs'}
        font-medium ${textColor}
      `}
    >
      <span className={`relative flex h-2 w-2`}>
        {status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
      </span>
      {displayLabel}
    </span>
  );
}
