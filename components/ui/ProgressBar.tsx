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

const statusTextColors: Record<IndicatorStatus, string> = {
  optimal: 'text-success',
  good: 'text-efficiency',
  warning: 'text-warning',
  critical: 'text-critical',
};

const sizeHeights = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
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
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-foreground-muted">{label}</span>}
          {showValue && (
            <span className={`text-sm font-mono font-semibold tabular-nums ${statusTextColors[status]}`}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-hover rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <div
          className={`
            ${sizeHeights[size]} rounded-full
            ${statusColors[status]}
            ${animated ? 'transition-all duration-700 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Indicator bar with label and note
interface IndicatorBarProps {
  label: string;
  value: number;
  status: IndicatorStatus;
  note?: string;
  suffix?: string;
}

export function IndicatorBar({ label, value, status, note, suffix = '%' }: IndicatorBarProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`text-sm font-mono font-semibold tabular-nums ${statusTextColors[status]}`}>
          {value}{suffix}
        </span>
      </div>
      <ProgressBar value={value} status={status} size="md" />
      {note && (
        <p className="text-xs text-foreground-subtle mt-1.5">{note}</p>
      )}
    </div>
  );
}

// Gauge-style circular progress
interface CircularProgressProps {
  value: number;
  max?: number;
  status?: IndicatorStatus;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

const circularSizes = {
  sm: 40,
  md: 56,
  lg: 80,
};

export function CircularProgress({
  value,
  max = 100,
  status = 'optimal',
  size = 'md',
  strokeWidth = 4,
  showValue = true,
  className = '',
}: CircularProgressProps) {
  const dimension = circularSizes[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap: Record<IndicatorStatus, string> = {
    optimal: 'var(--color-success)',
    good: 'var(--color-efficiency)',
    warning: 'var(--color-warning)',
    critical: 'var(--color-critical)',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-hover)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={colorMap[status]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showValue && (
        <span
          className={`absolute font-mono font-semibold tabular-nums ${statusTextColors[status]}`}
          style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px' }}
        >
          {Math.round(value)}
        </span>
      )}
    </div>
  );
}
