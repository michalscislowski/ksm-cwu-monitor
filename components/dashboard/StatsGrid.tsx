'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
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

function StatCard({ label, value, subtext, trend, color = 'default', delay = 0, tooltip }: StatCardProps & { tooltip?: React.ReactNode }) {
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
        <div className="flex items-center gap-2 mb-1">
          <p className="text-foreground-muted text-sm">{label}</p>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <p className={`text-3xl font-bold font-mono tracking-tight ${valueColors[color]}`}>
          {value}
        </p>
        {subtext && (
          <p className="text-foreground-muted text-xs mt-1">{subtext}</p>
        )}
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trendColors[trend.direction]}`}>
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
  // Color matches category convention (A=green, B=yellow, C=red)
  const getStatus = () => {
    if (value >= 80) return { color: 'text-success', label: 'Kategoria A', bgColor: 'bg-success/10', borderColor: 'border-success/30' };
    if (value >= 70) return { color: 'text-warning', label: 'Kategoria B', bgColor: 'bg-warning/10', borderColor: 'border-warning/30' };
    return { color: 'text-critical', label: 'Kategoria C', bgColor: 'bg-critical/10', borderColor: 'border-critical/30' };
  };

  const status = getStatus();
  const strokeColor = value >= 80 ? '#22c55e' : value >= 70 ? '#eab308' : '#ef4444';

  return (
    <div
      className={`animate-in relative overflow-hidden rounded-lg bg-surface-elevated border ${status.borderColor}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold tracking-wide text-foreground-muted uppercase">
                Sprawność Energetyczna
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface-hover text-foreground-secondary">
                SE
              </span>
              <InfoTooltip content={
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground text-base">Sprawność Energetyczna (SE)</p>
                    <p className="text-foreground-muted text-xs mt-1">Główny wskaźnik systemu</p>
                  </div>

                  <p className="text-foreground-muted text-sm leading-relaxed">
                    Określa jaki procent zakupionej energii cieplnej faktycznie dociera do mieszkańców jako użyteczna ciepła woda.
                  </p>

                  <div className="bg-surface rounded-lg p-3 font-mono text-xs">
                    <p className="text-foreground mb-1">SE = (Q_teoretyczne / Q_rzeczywiste) × 100</p>
                    <p className="text-foreground-muted">gdzie Q_teor = V × c × ΔT × k_straty</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Interpretacja wartości SE:</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-foreground-muted">≥80% — bardzo dobra</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning" />
                        <span className="text-foreground-muted">70-79% — wymaga poprawy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-critical" />
                        <span className="text-foreground-muted">&lt;70% — niska</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-foreground-subtle mt-2">
                      Kategoria węzła (A/B/C) zależy od najsłabszego wskaźnika operacyjnego (WWC, SH, ES).
                    </p>
                  </div>

                  <p className="text-[10px] text-foreground-subtle border-t border-border pt-3">
                    Źródło: dane KSM (miesięczne) lub MEC SCADA (bieżące)
                  </p>
                </div>
              } />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-mono font-bold tracking-tight ${status.color}`}>
                {value}
              </span>
              <span className={`text-xl ${status.color} opacity-60`}>%</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-foreground-muted">
                średnia dla 40 węzłów
              </span>
            </div>
          </div>

          {/* Mini arc gauge */}
          <div className="w-16 h-10">
            <svg viewBox="-50 -50 100 55" className="w-full h-full">
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-surface-hover"
                strokeLinecap="round"
              />
              <path
                d="M -40 0 A 40 40 0 0 1 40 0"
                fill="none"
                stroke={strokeColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * Math.PI * 40} ${Math.PI * 40}`}
                className="transition-all duration-700"
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
        tooltip={
          <div className="space-y-3">
            <p className="font-semibold text-foreground">System Alertów</p>
            <p className="text-foreground-muted text-sm">
              Alerty generowane są automatycznie gdy wskaźniki przekraczają ustalone progi.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-critical" />
                <span className="text-foreground-muted"><strong>Krytyczny</strong> — wymaga pilnej interwencji</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-foreground-muted"><strong>Ostrzeżenie</strong> — wymaga uwagi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info" />
                <span className="text-foreground-muted"><strong>Info</strong> — do wiadomości</span>
              </div>
            </div>
          </div>
        }
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
        tooltip={
          <div className="space-y-3">
            <p className="font-semibold text-foreground">System Kategorii</p>
            <p className="text-foreground-muted text-sm">
              Węzły są kategoryzowane według średniej Sprawności Energetycznej (SE).
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success">A</span>
                <span className="text-foreground-muted">SE ≥ 80% — Praca optymalna</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-warning/20 text-warning">B</span>
                <span className="text-foreground-muted">SE 70-79% — Wymaga optymalizacji</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-critical/20 text-critical">C</span>
                <span className="text-foreground-muted">SE &lt; 70% — Wymaga interwencji</span>
              </div>
            </div>
            <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border">
              Cel: maksymalizacja węzłów kategorii A
            </p>
          </div>
        }
      />
    </div>
  );
}
