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
    if (value >= 80) return { color: 'text-success', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]', label: 'Optymalna' };
    if (value >= 70) return { color: 'text-efficiency', glow: 'shadow-[0_0_40px_rgba(20,184,166,0.2)]', label: 'Dobra' };
    if (value >= 60) return { color: 'text-warning', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]', label: 'Wymaga uwagi' };
    return { color: 'text-critical', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]', label: 'Krytyczna' };
  };

  const status = getStatus();

  return (
    <Card
      className={`animate-in relative overflow-hidden ${status.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient background based on status */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        value >= 80 ? 'from-success/5' :
        value >= 70 ? 'from-efficiency/5' :
        value >= 60 ? 'from-warning/5' :
        'from-critical/5'
      } to-transparent`} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }} />

      <CardBody className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground-muted text-sm mb-1">Średnia Sprawność Energetyczna</p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-mono font-black tracking-tighter ${status.color}`}
                style={{ textShadow: value >= 70 ? '0 0 30px currentColor' : 'none' }}
              >
                {value}%
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                value >= 80 ? 'bg-success/10 text-success' :
                value >= 70 ? 'bg-efficiency/10 text-efficiency' :
                value >= 60 ? 'bg-warning/10 text-warning' :
                'bg-critical/10 text-critical'
              }`}>
                {status.label}
              </span>
            </div>
            <p className="text-foreground-subtle text-xs mt-2">
              Procent energii dostarczony do mieszkańców
            </p>
          </div>

          {/* Mini arc gauge */}
          <div className="w-16 h-10">
            <svg viewBox="-50 -50 100 55" className="w-full h-full">
              <defs>
                <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={value >= 80 ? '#10b981' : value >= 70 ? '#14b8a6' : value >= 60 ? '#f59e0b' : '#ef4444'} stopOpacity="0.3"/>
                  <stop offset="100%" stopColor={value >= 80 ? '#10b981' : value >= 70 ? '#14b8a6' : value >= 60 ? '#f59e0b' : '#ef4444'} stopOpacity="1"/>
                </linearGradient>
              </defs>
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-surface-elevated"
                strokeLinecap="round"
              />
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke="url(#hero-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * Math.PI * 40} ${Math.PI * 40}`}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>
      </CardBody>
    </Card>
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
