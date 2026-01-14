'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MonthlyReading } from '@/lib/types';
import { formatMonth } from '@/lib/data';

interface HistoricalChartProps {
  readings: MonthlyReading[];
  nodeId: string;
}

type ViewMode = 'se' | 'wskaznik' | 'consumption';
type TimeRange = 'all' | '3y' | '1y';

const OPTIMAL_WSKAZNIK = 0.22;

function calculateSE(wskaznik: number): number {
  return Math.round((OPTIMAL_WSKAZNIK / wskaznik) * 100);
}

export function HistoricalChart({ readings, nodeId }: HistoricalChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('se');
  const [timeRange, setTimeRange] = useState<TimeRange>('3y');

  // Filter readings by time range
  const filteredReadings = readings.filter(r => {
    if (timeRange === 'all') return true;
    const now = new Date();
    const readingDate = new Date(r.year, r.month - 1);
    const yearsAgo = timeRange === '3y' ? 3 : 1;
    const cutoff = new Date(now.getFullYear() - yearsAgo, now.getMonth());
    return readingDate >= cutoff;
  });

  // Prepare chart data
  const chartData = filteredReadings.map(r => ({
    date: `${formatMonth(r.month)} ${r.year}`,
    year: r.year,
    month: r.month,
    se: calculateSE(r.wskaznik),
    wskaznik: Math.round(r.wskaznik * 1000) / 1000,
    gj: r.gj,
    m3: r.m3,
  }));

  // Calculate stats
  const avgSe = Math.round(chartData.reduce((s, d) => s + d.se, 0) / chartData.length);
  const avgWskaznik = Math.round((chartData.reduce((s, d) => s + d.wskaznik, 0) / chartData.length) * 1000) / 1000;
  const totalGj = Math.round(chartData.reduce((s, d) => s + d.gj, 0) * 10) / 10;
  const totalM3 = Math.round(chartData.reduce((s, d) => s + d.m3, 0));

  // Get years covered
  const years = [...new Set(filteredReadings.map(r => r.year))].sort();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.date === label);
      if (!data) return null;

      return (
        <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="text-foreground-muted">
              SE: <span className="font-mono text-efficiency">{data.se}%</span>
            </p>
            <p className="text-foreground-muted">
              Wskaźnik: <span className="font-mono">{data.wskaznik}</span> GJ/m³
            </p>
            <p className="text-foreground-muted">
              Zużycie: <span className="font-mono">{data.gj}</span> GJ
            </p>
            <p className="text-foreground-muted">
              CWU: <span className="font-mono">{data.m3}</span> m³
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader
        dataSource="ksm"
        action={
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex gap-1 bg-surface rounded-lg p-0.5">
              {(['1y', '3y', 'all'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    timeRange === range
                      ? 'bg-efficiency/20 text-efficiency'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {range === 'all' ? 'Wszystko' : range === '3y' ? '3 lata' : '1 rok'}
                </button>
              ))}
            </div>
            {/* View mode selector */}
            <div className="flex gap-1 bg-surface rounded-lg p-0.5">
              {(['se', 'wskaznik', 'consumption'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-efficiency/20 text-efficiency'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {mode === 'se' ? 'SE' : mode === 'wskaznik' ? 'GJ/m³' : 'Zużycie'}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12l3-4 3 2 4-6 2 3" />
            <circle cx="2" cy="12" r="1" fill="currentColor" />
            <circle cx="5" cy="8" r="1" fill="currentColor" />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="4" r="1" fill="currentColor" />
            <circle cx="14" cy="7" r="1" fill="currentColor" />
          </svg>
          Historia ({years[0]}-{years[years.length - 1]})
        </span>
      </CardHeader>
      <CardBody>
        {/* Stats summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">Średnia SE</p>
            <p className={`font-mono font-bold text-lg ${avgSe >= 80 ? 'text-success' : avgSe >= 70 ? 'text-warning' : 'text-critical'}`}>
              {avgSe}%
            </p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">Śr. wskaźnik</p>
            <p className="font-mono font-bold text-lg">{avgWskaznik}</p>
            <p className="text-xs text-foreground-subtle">GJ/m³</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">Suma GJ</p>
            <p className="font-mono font-bold text-lg">{totalGj}</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">Suma m³</p>
            <p className="font-mono font-bold text-lg">{totalM3.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'consumption' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#5c6370', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  interval={Math.floor(chartData.length / 12)}
                />
                <YAxis
                  tick={{ fill: '#5c6370', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gj" fill="#14b8a6" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#5c6370', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  interval={Math.floor(chartData.length / 12)}
                />
                <YAxis
                  tick={{ fill: '#5c6370', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={viewMode === 'se' ? [50, 110] : ['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                {viewMode === 'se' && (
                  <>
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.5} />
                    <ReferenceLine y={70} stroke="#14b8a6" strokeDasharray="5 5" strokeOpacity={0.5} />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
                  </>
                )}
                {viewMode === 'wskaznik' && (
                  <ReferenceLine y={OPTIMAL_WSKAZNIK} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.5} />
                )}
                <Area
                  type="monotone"
                  dataKey={viewMode}
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill={`url(#gradient-${nodeId})`}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-foreground-muted">
          {viewMode === 'se' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-success" />
                <span>Optymalna (≥80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-efficiency" />
                <span>Dobra (≥70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-warning" />
                <span>Do poprawy (≥60%)</span>
              </div>
            </>
          )}
          {viewMode === 'wskaznik' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-success" />
              <span>Optymalny wskaźnik (0.22 GJ/m³)</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
