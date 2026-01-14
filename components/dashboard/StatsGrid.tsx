'use client';

import { Card, CardBody } from '@/components/ui/Card';
import type { DashboardStats } from '@/lib/types';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  color?: 'default' | 'efficiency' | 'warning' | 'success';
  delay?: number;
}

function StatCard({ label, value, subtext, trend, color = 'default', delay = 0 }: StatCardProps) {
  const valueColors = {
    default: 'text-foreground',
    efficiency: 'text-efficiency',
    warning: 'text-warning',
    success: 'text-success',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-critical',
    neutral: 'text-foreground-muted',
  };

  return (
    <Card className="animate-in" style={{ animationDelay: `${delay}ms` }}>
      <CardBody>
        <p className="text-foreground-muted text-sm mb-1">{label}</p>
        <p className={`text-4xl font-bold font-mono tracking-tight ${valueColors[color]}`}>
          {value}
        </p>
        {subtext && (
          <p className="text-foreground-subtle text-sm mt-1">{subtext}</p>
        )}
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trendColors[trend.direction]}`}>
            <span>
              {trend.direction === 'up' && '↗'}
              {trend.direction === 'down' && '↘'}
              {trend.direction === 'neutral' && '→'}
            </span>
            {trend.text}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

// Hero stat card for the main SE indicator
function HeroStatCard({ value, delay = 0 }: { value: number; delay?: number }) {
  // Determine status based on value
  const getStatus = () => {
    if (value >= 80) return { color: 'text-success', glow: 'shadow-[0_0_60px_rgba(16,185,129,0.25)]', label: 'Optymalna', bgColor: 'from-success/8 via-success/3' };
    if (value >= 70) return { color: 'text-efficiency', glow: 'shadow-[0_0_60px_rgba(20,184,166,0.25)]', label: 'Dobra', bgColor: 'from-efficiency/8 via-efficiency/3' };
    if (value >= 60) return { color: 'text-warning', glow: 'shadow-[0_0_60px_rgba(245,158,11,0.25)]', label: 'Wymaga uwagi', bgColor: 'from-warning/8 via-warning/3' };
    return { color: 'text-critical', glow: 'shadow-[0_0_60px_rgba(239,68,68,0.25)]', label: 'Krytyczna', bgColor: 'from-critical/8 via-critical/3' };
  };

  const status = getStatus();

  return (
    <div
      className={`hero-glow animate-in relative overflow-hidden rounded-2xl bg-surface-elevated border border-border-subtle ${status.glow} transition-shadow duration-500 hover:shadow-[0_0_80px_rgba(20,184,166,0.3)]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${status.bgColor} to-transparent`} />

      {/* Subtle animated grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }} />

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${
        value >= 80 ? 'from-success/10' :
        value >= 70 ? 'from-efficiency/10' :
        value >= 60 ? 'from-warning/10' :
        'from-critical/10'
      } to-transparent rounded-bl-full`} />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-widest text-foreground-subtle uppercase">
                Sprawność Energetyczna
              </span>
              <span className="data-badge">SE</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className={`text-6xl font-mono font-black tracking-tighter ${status.color} stat-number`}
                style={{
                  textShadow: value >= 70 ? '0 0 40px currentColor' : 'none',
                  filter: value >= 70 ? 'drop-shadow(0 0 20px currentColor)' : 'none'
                }}
              >
                {value}
              </span>
              <span className={`text-2xl font-light ${status.color} opacity-60`}>%</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                value >= 80 ? 'bg-success/15 text-success border border-success/20' :
                value >= 70 ? 'bg-efficiency/15 text-efficiency border border-efficiency/20' :
                value >= 60 ? 'bg-warning/15 text-warning border border-warning/20' :
                'bg-critical/15 text-critical border border-critical/20'
              }`}>
                {status.label}
              </span>
              <span className="text-xs text-foreground-subtle">
                średnia dla {40} węzłów
              </span>
            </div>
          </div>

          {/* Mini arc gauge */}
          <div className="w-20 h-12 -mr-1">
            <svg viewBox="-50 -50 100 55" className="w-full h-full">
              <defs>
                <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={value >= 80 ? '#10b981' : value >= 70 ? '#14b8a6' : value >= 60 ? '#f59e0b' : '#ef4444'} stopOpacity="0.2"/>
                  <stop offset="100%" stopColor={value >= 80 ? '#10b981' : value >= 70 ? '#14b8a6' : value >= 60 ? '#f59e0b' : '#ef4444'} stopOpacity="1"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-border-subtle"
                strokeLinecap="round"
              />
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke="url(#hero-gradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * Math.PI * 40} ${Math.PI * 40}`}
                className="transition-all duration-1000"
                filter="url(#glow)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Hero SE stat - spans 2 columns on larger screens */}
      <div className="sm:col-span-2 lg:col-span-1">
        <HeroStatCard value={stats.avgSe} delay={0} />
      </div>

      <StatCard
        label="Węzły ogółem"
        value={stats.totalNodes}
        subtext="Wszystkie aktywne"
        delay={50}
      />
      <StatCard
        label="Aktywne alerty"
        value={stats.activeAlerts}
        color={stats.activeAlerts > 2 ? 'warning' : 'default'}
        subtext={stats.activeAlerts > 0 ? 'Wymaga uwagi' : 'Brak alertów'}
        delay={100}
      />
      <StatCard
        label="Węzły kat. A"
        value={stats.categoryACount}
        color="success"
        trend={{
          direction: 'up',
          text: `${Math.round((stats.categoryACount / stats.totalNodes) * 100)}% wszystkich`,
        }}
        delay={150}
      />
    </div>
  );
}
