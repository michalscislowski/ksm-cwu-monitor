'use client';

import { TrendBadge } from '@/components/ui/Badge';
import type { IEZ } from '@/lib/types';

interface IEZGaugeProps {
  iez: IEZ;
  size?: 'sm' | 'md' | 'lg';
}

export function IEZGauge({ iez, size = 'lg' }: IEZGaugeProps) {
  const { value, trend, trend_change } = iez;

  // Calculate the angle for the gauge (0-100 maps to 0-270 degrees)
  const angle = Math.min(Math.max((value / 100) * 270, 0), 270);

  // Determine color based on value
  const getColor = (val: number) => {
    if (val >= 95) return { main: '#10b981', glow: 'rgba(16,185,129,0.3)' }; // success
    if (val >= 85) return { main: '#14b8a6', glow: 'rgba(20,184,166,0.3)' }; // efficiency
    if (val >= 70) return { main: '#f59e0b', glow: 'rgba(245,158,11,0.3)' }; // warning
    return { main: '#ef4444', glow: 'rgba(239,68,68,0.3)' }; // critical
  };

  const color = getColor(value);

  const sizeConfig = {
    sm: { outer: 120, inner: 90, stroke: 8, fontSize: '2rem' },
    md: { outer: 160, inner: 120, stroke: 10, fontSize: '2.5rem' },
    lg: { outer: 200, inner: 150, stroke: 12, fontSize: '3.5rem' },
  };

  const cfg = sizeConfig[size];
  const radius = (cfg.outer - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * radius * (270 / 360);

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: cfg.outer, height: cfg.outer }}>
        <svg
          width={cfg.outer}
          height={cfg.outer}
          viewBox={`0 0 ${cfg.outer} ${cfg.outer}`}
          className="transform -rotate-[135deg]"
        >
          {/* Background track */}
          <circle
            cx={cfg.outer / 2}
            cy={cfg.outer / 2}
            r={radius}
            fill="none"
            stroke="#1a1e26"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference * 0.33}`}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick, i) => {
            const tickAngle = (tick / 100) * 270 - 135;
            const tickRadius = radius + cfg.stroke / 2 + 4;
            const x1 = cfg.outer / 2 + (tickRadius - 6) * Math.cos((tickAngle * Math.PI) / 180);
            const y1 = cfg.outer / 2 + (tickRadius - 6) * Math.sin((tickAngle * Math.PI) / 180);
            const x2 = cfg.outer / 2 + tickRadius * Math.cos((tickAngle * Math.PI) / 180);
            const y2 = cfg.outer / 2 + tickRadius * Math.sin((tickAngle * Math.PI) / 180);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3a404c"
                strokeWidth={2}
                className="transform rotate-[135deg] origin-center"
              />
            );
          })}

          {/* Value arc */}
          <circle
            cx={cfg.outer / 2}
            cy={cfg.outer / 2}
            r={radius}
            fill="none"
            stroke={color.main}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${(angle / 270) * circumference} ${circumference}`}
            style={{
              filter: `drop-shadow(0 0 6px ${color.glow})`,
              transition: 'stroke-dasharray 1s ease-out, stroke 0.3s ease',
            }}
          />

          {/* Glow effect */}
          <circle
            cx={cfg.outer / 2}
            cy={cfg.outer / 2}
            r={radius}
            fill="none"
            stroke={color.main}
            strokeWidth={cfg.stroke + 4}
            strokeLinecap="round"
            strokeDasharray={`${(angle / 270) * circumference} ${circumference}`}
            opacity={0.15}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>

        {/* Center value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: size === 'lg' ? '10px' : '5px' }}
        >
          <span
            className="font-mono font-bold tracking-tight"
            style={{
              fontSize: cfg.fontSize,
              color: color.main,
              textShadow: `0 0 20px ${color.glow}`,
            }}
          >
            {value}
          </span>
          <span className="text-foreground-muted text-sm -mt-1">ze 100</span>
        </div>
      </div>

      {/* Trend */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-foreground-muted text-sm">Trend:</span>
        <TrendBadge trend={trend} change={trend_change} />
      </div>
    </div>
  );
}

// Mini gauge for lists
interface MiniGaugeProps {
  value: number;
}

export function MiniGauge({ value }: MiniGaugeProps) {
  const getColor = (val: number) => {
    if (val >= 95) return '#10b981';
    if (val >= 85) return '#14b8a6';
    if (val >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(value);
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#1a1e26"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 0.94} 100`}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
