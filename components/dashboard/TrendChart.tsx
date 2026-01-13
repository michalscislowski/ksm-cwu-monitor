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
import type { HistoryEntry } from '@/lib/types';

interface TrendChartProps {
  data: HistoryEntry[];
  title?: string;
}

export function TrendChart({ data, title = 'Trend IEZ (ostatnie 30 dni)' }: TrendChartProps) {
  // Format data for recharts
  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    }),
    iez: entry.iez,
    category: entry.category,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { category: string } }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;
    const category = payload[0].payload.category;

    const categoryColors: Record<string, string> = {
      A: '#10b981',
      B: '#f59e0b',
      C: '#ef4444',
    };

    return (
      <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground-muted text-xs mb-1">{label}</p>
        <p className="text-lg font-mono font-bold" style={{ color: categoryColors[category] }}>
          IEZ: {value}
        </p>
        <p className="text-xs mt-1">
          Kategoria:{' '}
          <span className="font-semibold" style={{ color: categoryColors[category] }}>
            {category}
          </span>
        </p>
      </div>
    );
  };

  return (
    <Card className="animate-in stagger-4">
      <CardHeader
        action={
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-success" /> Kat. A
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-warning" /> Kat. B
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-critical" /> Kat. C
            </span>
          </div>
        }
      >
        {title}
      </CardHeader>
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIez" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
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
                domain={[70, 110]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 11 }}
                dx={-10}
              />

              {/* Reference lines for categories */}
              <ReferenceLine
                y={95}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={85}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="iez"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#colorIez)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#14b8a6',
                  stroke: '#0c0e12',
                  strokeWidth: 2,
                }}
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
    iez: number;
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
    iez: h.iez,
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
          IEZ: {payload[0].value}
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
        Profil dobowy efektywności
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
                domain={[70, 105]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5c6370', fontSize: 10 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="iez"
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
            <span className="text-critical font-medium">Najgorsza efektywność:</span>{' '}
            7:00-9:00 i 17:00-20:00 (szczyty użycia CWU)
          </p>
          <p className="text-foreground-muted mt-1">
            <span className="text-success font-medium">Najlepsza efektywność:</span>{' '}
            2:00-4:00 (niska konsumpcja)
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
