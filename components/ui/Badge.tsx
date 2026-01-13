'use client';

import { ReactNode } from 'react';
import type { Category } from '@/lib/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'critical' | 'info' | 'category-a' | 'category-b' | 'category-c';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-foreground-muted border-border',
  success: 'bg-success-muted text-success border-success/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  critical: 'bg-critical-muted text-critical border-critical/20',
  info: 'bg-info-muted text-info border-info/20',
  'category-a': 'bg-success-muted text-success border-success/30',
  'category-b': 'bg-warning-muted text-warning border-warning/30',
  'category-c': 'bg-critical-muted text-critical border-critical/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-md border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Specialized category badge
interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CategoryBadge({ category, size = 'md', showLabel = false }: CategoryBadgeProps) {
  const labels: Record<Category, string> = {
    A: 'Bardzo dobra',
    B: 'Dobra',
    C: 'Wymaga uwagi',
  };

  return (
    <Badge variant={`category-${category.toLowerCase()}` as BadgeVariant} size={size}>
      <span className="font-bold">{category}</span>
      {showLabel && <span className="opacity-80">{labels[category]}</span>}
    </Badge>
  );
}

// Trend badge
interface TrendBadgeProps {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
}

export function TrendBadge({ trend, change }: TrendBadgeProps) {
  const config = {
    improving: { icon: '↗', variant: 'success' as const, prefix: '+' },
    declining: { icon: '↘', variant: 'critical' as const, prefix: '' },
    stable: { icon: '→', variant: 'default' as const, prefix: change > 0 ? '+' : '' },
  };

  const { icon, variant, prefix } = config[trend];

  return (
    <Badge variant={variant} size="sm">
      <span>{icon}</span>
      <span className="font-mono">{prefix}{Math.abs(change)}</span>
    </Badge>
  );
}
