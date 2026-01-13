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

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Węzły ogółem"
        value={stats.totalNodes}
        subtext="Wszystkie aktywne"
        delay={0}
      />
      <StatCard
        label="Średni IEZ"
        value={stats.avgIez}
        color="efficiency"
        trend={{ direction: 'up', text: '+2 vs poprzedni tydzień' }}
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
