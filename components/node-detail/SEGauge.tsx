'use client';

import { TrendBadge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/Tooltip';

interface SEGaugeProps {
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  trend_change: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const SETooltipContent = () => (
  <div className="space-y-3">
    <p className="font-semibold text-foreground">Sprawność Energetyczna (SE)</p>

    <div className="text-foreground-muted text-sm space-y-2">
      <p>
        <span className="font-medium text-foreground">Co to jest SE?</span><br />
        SE to główny wskaźnik efektywności węzła cieplnego pokazujący jaki procent
        kupowanej energii cieplnej dociera do mieszkańców jako ciepła woda użytkowa.
      </p>

      <p>
        <span className="font-medium text-foreground">Jak jest obliczany?</span><br />
        SE = (Q teoretyczne / Q rzeczywiste) × 100%<br />
        gdzie Q teoretyczne = energia minimalna potrzebna do podgrzania wody,<br />
        a Q rzeczywiste = energia faktycznie pobrana z sieci ciepłowniczej.
      </p>

      <p>
        <span className="font-medium text-foreground">Interpretacja:</span><br />
        • <span className="text-success">SE ≥80%</span> — bardzo dobra sprawność<br />
        • <span className="text-efficiency">SE 70-79%</span> — dobra sprawność<br />
        • <span className="text-warning">SE 60-69%</span> — wymaga optymalizacji<br />
        • <span className="text-critical">SE &lt;60%</span> — wymaga pilnej interwencji
      </p>

      <p>
        <span className="font-medium text-foreground">Co oznaczają straty?</span><br />
        Jeśli SE = 72%, to 28% energii jest tracone w systemie poprzez:<br />
        • Cyrkulację CWU (główne źródło strat)<br />
        • Straty na przewodach i izolacji<br />
        • Nieefektywną wymianę ciepła
      </p>

      <p>
        <span className="font-medium text-foreground">Powiązanie z innymi wskaźnikami:</span><br />
        SE = KW (Kondycja Wymiennika) − SS (Straty Systemowe)<br />
        Niska SE przy wysokim KW oznacza problem z cyrkulacją.<br />
        Niska SE przy niskim KW oznacza problem z wymiennikiem.
      </p>
    </div>
  </div>
);

export function SEGauge({ value, trend, trend_change, size = 'lg', showTooltip = true }: SEGaugeProps) {
  // Calculate the angle for the gauge (0-100 maps to 0-270 degrees)
  const angle = Math.min(Math.max((value / 100) * 270, 0), 270);

  // Determine color based on value - uses CSS variables for theme support
  const getColorConfig = (val: number) => {
    if (val >= 80) return { css: 'var(--color-success)', class: 'text-success' };
    if (val >= 70) return { css: 'var(--color-efficiency)', class: 'text-efficiency' };
    if (val >= 60) return { css: 'var(--color-warning)', class: 'text-warning' };
    return { css: 'var(--color-critical)', class: 'text-critical' };
  };

  const colorConfig = getColorConfig(value);

  const sizeConfig = {
    sm: { outer: 120, inner: 90, stroke: 8, fontSize: '1.75rem', labelSize: '0.75rem' },
    md: { outer: 160, inner: 120, stroke: 10, fontSize: '2.25rem', labelSize: '0.8125rem' },
    lg: { outer: 200, inner: 150, stroke: 12, fontSize: '3rem', labelSize: '0.875rem' },
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
            stroke="var(--color-surface-hover)"
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
                stroke="var(--color-border)"
                strokeWidth={2}
                strokeLinecap="round"
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
            stroke={colorConfig.css}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${(angle / 270) * circumference} ${circumference}`}
            style={{
              transition: 'stroke-dasharray 0.8s ease-out, stroke 0.2s ease',
            }}
          />
        </svg>

        {/* Center value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: size === 'lg' ? '10px' : '5px' }}
        >
          <span
            className={`font-mono font-bold tracking-tighter ${colorConfig.class}`}
            style={{
              fontSize: cfg.fontSize,
              lineHeight: 1,
            }}
          >
            {value}
            <span className="text-[0.5em] font-semibold opacity-70">%</span>
          </span>
          <span
            className="text-foreground-muted flex items-center gap-1 mt-1"
            style={{ fontSize: cfg.labelSize }}
          >
            sprawności
            {showTooltip && <InfoTooltip content={<SETooltipContent />} />}
          </span>
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

// Mini gauge for lists - shows SE percentage
interface MiniGaugeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function MiniGauge({ value, size = 'md' }: MiniGaugeProps) {
  const getColorConfig = (val: number) => {
    if (val >= 80) return { css: 'var(--color-success)', class: 'text-success' };
    if (val >= 70) return { css: 'var(--color-efficiency)', class: 'text-efficiency' };
    if (val >= 60) return { css: 'var(--color-warning)', class: 'text-warning' };
    return { css: 'var(--color-critical)', class: 'text-critical' };
  };

  const colorConfig = getColorConfig(value);
  const percentage = Math.min(Math.max(value, 0), 100);

  const dimensions = size === 'sm' ? 32 : 40;
  const strokeWidth = size === 'sm' ? 2.5 : 3;
  const fontSize = size === 'sm' ? '10px' : '12px';
  const radius = (dimensions - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: dimensions, height: dimensions }}>
      <svg
        viewBox={`0 0 ${dimensions} ${dimensions}`}
        style={{ width: dimensions, height: dimensions }}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-hover)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={colorConfig.css}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-mono font-semibold tabular-nums ${colorConfig.class}`}
        style={{ fontSize }}
      >
        {value}
      </span>
    </div>
  );
}

// Arc gauge for hierarchy panel
interface ArcGaugeProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ArcGauge({ value, label, size = 'md', showLabel = true }: ArcGaugeProps) {
  const getColorConfig = (val: number) => {
    if (val >= 80) return { css: 'var(--color-success)', class: 'text-success' };
    if (val >= 70) return { css: 'var(--color-efficiency)', class: 'text-efficiency' };
    if (val >= 60) return { css: 'var(--color-warning)', class: 'text-warning' };
    return { css: 'var(--color-critical)', class: 'text-critical' };
  };

  const colorConfig = getColorConfig(value);

  const sizeConfig = {
    sm: { dimension: 80, stroke: 6, fontSize: '1.25rem' },
    md: { dimension: 100, stroke: 7, fontSize: '1.5rem' },
    lg: { dimension: 120, stroke: 8, fontSize: '1.75rem' },
  };

  const cfg = sizeConfig[size];
  const radius = (cfg.dimension - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * radius * (270 / 360);
  const angle = Math.min(Math.max((value / 100) * 270, 0), 270);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: cfg.dimension, height: cfg.dimension }}>
        <svg
          width={cfg.dimension}
          height={cfg.dimension}
          viewBox={`0 0 ${cfg.dimension} ${cfg.dimension}`}
          className="transform -rotate-[135deg]"
        >
          {/* Background track */}
          <circle
            cx={cfg.dimension / 2}
            cy={cfg.dimension / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-hover)"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference * 0.33}`}
          />

          {/* Value arc */}
          <circle
            cx={cfg.dimension / 2}
            cy={cfg.dimension / 2}
            r={radius}
            fill="none"
            stroke={colorConfig.css}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${(angle / 270) * circumference} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-mono font-bold tracking-tight ${colorConfig.class}`}
            style={{ fontSize: cfg.fontSize }}
          >
            {value}
            <span className="text-[0.5em] opacity-60">%</span>
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="mt-2 text-xs font-medium text-foreground-muted uppercase tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
