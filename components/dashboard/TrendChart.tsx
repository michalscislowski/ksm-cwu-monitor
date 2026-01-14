'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { HistoryEntry } from '@/lib/types';

interface TrendChartProps {
  data: HistoryEntry[];
  title?: string;
}

// Helper to get color based on SE value
const getSeColor = (value: number): string => {
  if (value >= 80) return '#22c55e'; // success - Category A
  if (value >= 70) return '#eab308'; // warning - Category B
  return '#ef4444'; // critical - Category C
};

export function TrendChart({ data, title = 'Trend SE (ostatnie 30 dni)' }: TrendChartProps) {
  // Format data for recharts - iez field contains SE value (same calculation)
  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    }),
    se: entry.iez, // Using iez field which contains SE value
    category: entry.category,
  }));

  // Custom dot that renders at each data point with category color
  const CustomDot = (props: { cx?: number; cy?: number; payload?: { se: number } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload) return null;
    const color = getSeColor(payload.se);
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    );
  };

  // Custom active dot (larger, on hover)
  const CustomActiveDot = (props: { cx?: number; cy?: number; payload?: { se: number } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload) return null;
    const color = getSeColor(payload.se);
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="#0c0e12"
        strokeWidth={2}
      />
    );
  };

  // Helper to get category from SE value
  const getCategory = (value: number): { letter: string; color: string } => {
    if (value >= 80) return { letter: 'A', color: '#22c55e' };
    if (value >= 70) return { letter: 'B', color: '#eab308' };
    return { letter: 'C', color: '#ef4444' };
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;
    const category = getCategory(value);

    return (
      <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground-muted text-xs mb-1">{label}</p>
        <p className="text-lg font-mono font-bold" style={{ color: category.color }}>
          SE: {value}%
        </p>
        <p className="text-xs mt-1">
          Kategoria:{' '}
          <span className="font-semibold" style={{ color: category.color }}>
            {category.letter}
          </span>
        </p>
      </div>
    );
  };

  return (
    <Card className="animate-in stagger-4">
      <CardHeader
        action={
          <div className="flex items-center gap-4 text-xs text-foreground-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>A ≥80%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span>B ≥70%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-critical" />
              <span>C &lt;70%</span>
            </span>
          </div>
        }
      >
        <span className="flex items-center gap-2">
          {title}
          <InfoTooltip content={
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Trend Sprawności Energetycznej</p>
              <p className="text-foreground-muted text-sm">
                Wykres pokazuje zmiany średniej Sprawności Energetycznej (SE) wszystkich węzłów w czasie.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-medium text-foreground">Interpretacja kolorów:</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-success" />
                  <span className="text-foreground-muted">Kategoria A — SE ≥80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-warning" />
                  <span className="text-foreground-muted">Kategoria B — SE 70-79%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-critical" />
                  <span className="text-foreground-muted">Kategoria C — SE &lt;70%</span>
                </div>
              </div>
              <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border">
                Linie przerywane oznaczają progi kategorii
              </p>
            </div>
          } />
        </span>
      </CardHeader>
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {/* Gradient aligned to Y-axis domain [50, 100] */}
                {/* Green (A): ≥80% = top 40% of chart */}
                {/* Yellow (B): 70-79% = next 20% */}
                {/* Red (C): <70% = bottom 40% */}
                <linearGradient id="colorSeFill" x1="0" y1="0%" x2="0" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="39.9%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="40%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="59.9%" stopColor="#eab308" stopOpacity={0.25} />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 11 }}
                dy={10}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 11 }}
                dx={-10}
              />

              {/* Reference lines for category thresholds */}
              <ReferenceLine
                y={80}
                stroke="#22c55e"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={70}
                stroke="#eab308"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="se"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                fill="url(#colorSeFill)"
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}

// Daily profile chart
interface DailyProfileChartProps {
  hours: Array<{
    hour: number;
    iez: number; // Field name kept for compatibility, contains SE value
    load: string;
  }>;
}

export function DailyProfileChart({ hours }: DailyProfileChartProps) {
  const loadColors: Record<string, string> = {
    low: '#10b981',
    medium: '#14b8a6',
    high: '#f59e0b',
    peak: '#ef4444',
  };

  const chartData = hours.map((h) => ({
    hour: `${h.hour}:00`,
    se: h.iez, // Using iez field for SE value
    load: h.load,
    fill: loadColors[h.load] || '#14b8a6',
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { load: string } }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const loadLabels: Record<string, string> = {
      low: 'Niskie',
      medium: 'Średnie',
      high: 'Wysokie',
      peak: 'Szczytowe',
    };

    return (
      <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground-muted text-xs mb-1">{label}</p>
        <p className="text-lg font-mono font-bold text-efficiency">
          SE: {payload[0].value}%
        </p>
        <p className="text-xs mt-1 text-foreground-muted">
          Obciążenie: {loadLabels[payload[0].payload.load]}
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader
        dataSource="mec"
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" /> Niskie
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-efficiency" /> Średnie
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning" /> Wysokie
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-critical" /> Szczytowe
            </span>
          </div>
        }
      >
        Profil dobowy sprawności
      </CardHeader>
      <CardBody>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 10 }}
                interval={3}
              />

              <YAxis
                domain={[50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 10 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="se"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#colorProfile)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#14b8a6',
                  stroke: '#0c0e12',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Worst/Best hours summary */}
        <div className="mt-4 p-3 bg-surface-elevated rounded-lg text-sm">
          <p className="text-foreground-muted">
            <span className="text-critical font-medium">Najgorsza sprawność:</span>{' '}
            7:00-9:00 i 17:00-20:00 (szczyty użycia CWU)
          </p>
          <p className="text-foreground-muted mt-1">
            <span className="text-success font-medium">Najlepsza sprawność:</span>{' '}
            2:00-4:00 (niska konsumpcja)
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
