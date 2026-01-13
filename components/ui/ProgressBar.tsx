'use client';

import type { IndicatorStatus } from '@/lib/types';

interface ProgressBarProps {
  value: number;
  max?: number;
  status?: IndicatorStatus;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  animated?: boolean;
}

const statusColors: Record<IndicatorStatus, string> = {
  optimal: 'bg-success',
  good: 'bg-efficiency',
  warning: 'bg-warning',
  critical: 'bg-critical',
};

const statusGlow: Record<IndicatorStatus, string> = {
  optimal: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  good: 'shadow-[0_0_8px_rgba(20,184,166,0.4)]',
  warning: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
  critical: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
};

const sizeHeights = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  status = 'optimal',
  showValue = false,
  size = 'md',
  label,
  className = '',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-foreground-muted">{label}</span>}
          {showValue && (
            <span className={`text-sm font-mono font-medium ${statusColors[status].replace('bg-', 'text-')}`}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-elevated rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <div
          className={`
            ${sizeHeights[size]} rounded-full
            ${statusColors[status]}
            ${statusGlow[status]}
            ${animated ? 'transition-all duration-700 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Indicator bar with label
interface IndicatorBarProps {
  label: string;
  value: number;
  status: IndicatorStatus;
  note?: string;
}

export function IndicatorBar({ label, value, status, note }: IndicatorBarProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`text-sm font-mono font-semibold ${
          status === 'optimal' ? 'text-success' :
          status === 'good' ? 'text-efficiency' :
          status === 'warning' ? 'text-warning' : 'text-critical'
        }`}>
          {value}%
        </span>
      </div>
      <ProgressBar value={value} status={status} size="md" />
      {note && (
        <p className="text-xs text-foreground-subtle mt-1.5">{note}</p>
      )}
    </div>
  );
}
