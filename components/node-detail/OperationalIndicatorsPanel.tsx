'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { OperationalIndicators, IndicatorStatus } from '@/lib/types';

interface OperationalIndicatorsPanelProps {
  indicators: OperationalIndicators;
}

interface IndicatorBarProps {
  label: string;
  shortLabel: string;
  value: number;
  status: IndicatorStatus;
  interpretation: string;
  action?: string;
  tooltip: React.ReactNode;
}

function IndicatorBar({ label, shortLabel, value, status, interpretation, action, tooltip }: IndicatorBarProps) {
  const statusConfig: Record<IndicatorStatus, { color: string; bgColor: string; barColor: string }> = {
    optimal: { color: 'text-success', bgColor: 'bg-success/10', barColor: 'bg-success' },
    good: { color: 'text-efficiency', bgColor: 'bg-efficiency/10', barColor: 'bg-efficiency' },
    warning: { color: 'text-warning', bgColor: 'bg-warning/10', barColor: 'bg-warning' },
    critical: { color: 'text-critical', bgColor: 'bg-critical/10', barColor: 'bg-critical' },
  };

  const config = statusConfig[status];

  return (
    <div className={`p-4 rounded-lg ${config.bgColor} border border-transparent hover:border-border-subtle transition-colors`}>
      {/* Header with value */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
            {shortLabel}
          </span>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <InfoTooltip content={tooltip} position="right" />
        </div>
        <span className={`text-2xl font-mono font-bold ${config.color}`}>
          {value}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-surface rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${config.barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>

      {/* Interpretation */}
      <p className="text-sm text-foreground-muted mb-1">
        {interpretation}
      </p>

      {/* Action (if any) */}
      {action && (
        <p className="text-sm font-medium text-foreground flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle">
          <span className={`w-1.5 h-1.5 rounded-full ${config.barColor}`} />
          {action}
        </p>
      )}
    </div>
  );
}

export function OperationalIndicatorsPanel({ indicators }: OperationalIndicatorsPanelProps) {
  const trendIcon = indicators.weekly_trend > 0 ? '↗' : indicators.weekly_trend < 0 ? '↘' : '→';
  const trendColor = indicators.weekly_trend > 0 ? 'text-success' : indicators.weekly_trend < 0 ? 'text-critical' : 'text-foreground-muted';

  return (
    <Card>
      <CardHeader
        dataSource="mec"
        action={
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <span>{trendIcon}</span>
            <span className="font-mono">{indicators.weekly_trend > 0 ? '+' : ''}{indicators.weekly_trend}%</span>
            <span className="text-foreground-subtle text-xs">/ tydzień</span>
          </div>
        }
      >
        <span className="flex items-center gap-2">
          <span className="text-efficiency">◎</span>
          Wskaźniki operacyjne
        </span>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <IndicatorBar
            label="Wymiana ciepła"
            shortLabel="WWC"
            value={indicators.wwc.value}
            status={indicators.wwc.status}
            interpretation={indicators.wwc.interpretation}
            action={indicators.wwc.action}
            tooltip={
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Wskaźnik Wymiany Ciepła (WWC)</p>
                <p className="text-foreground-muted">
                  Pokazuje jak efektywnie wymiennik ciepła przekazuje energię z sieci ciepłowniczej do instalacji budynku.
                </p>
                <p className="text-foreground-muted">
                  <span className="font-medium">Wzór:</span> WWC = (ΔT rzeczywiste / ΔT projektowe) × 100%
                </p>
                <p className="text-foreground-muted text-xs">
                  Niski WWC oznacza, że woda wraca do sieci zbyt ciepła - sprawdź nastawy zaworów MTCV.
                </p>
              </div>
            }
          />

          <IndicatorBar
            label="Stabilność hydrauliczna"
            shortLabel="SH"
            value={indicators.sh.value}
            status={indicators.sh.status}
            interpretation={indicators.sh.interpretation}
            action={indicators.sh.action}
            tooltip={
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Stabilność Hydrauliczna (SH)</p>
                <p className="text-foreground-muted">
                  Mierzy jak równomiernie pracuje instalacja w ciągu doby - czy ΔT jest stabilne czy mocno się waha.
                </p>
                <p className="text-foreground-muted">
                  <span className="font-medium">Wzór:</span> SH = 100% - (odchylenie ΔT / średnie ΔT) × 100%
                </p>
                <p className="text-foreground-muted text-xs">
                  Niska stabilność wskazuje na nierównomierne obciążenie pionów - wymaga równoważenia hydraulicznego.
                </p>
              </div>
            }
          />

          <IndicatorBar
            label="Efektywność szczytowa"
            shortLabel="ES"
            value={indicators.es.value}
            status={indicators.es.status}
            interpretation={indicators.es.interpretation}
            action={indicators.es.action}
            tooltip={
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Efektywność Szczytowa (ES)</p>
                <p className="text-foreground-muted">
                  Porównuje efektywność instalacji w godzinach szczytu (6-9, 17-20) z okresem niskiego obciążenia.
                </p>
                <p className="text-foreground-muted">
                  <span className="font-medium">Wzór:</span> ES = (WWC w szczycie / WWC w nocy) × 100%
                </p>
                <p className="text-foreground-muted text-xs">
                  Niska ES oznacza, że system nie nadąża ze szczytowym zapotrzebowaniem - sprawdź pompę cyrkulacyjną.
                </p>
              </div>
            }
          />
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-xs text-foreground-subtle mb-2">Progi oceny:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-foreground-muted">≥95% Optymalne</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-efficiency" />
              <span className="text-foreground-muted">≥85% Dobre</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-foreground-muted">≥70% Wymaga uwagi</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-critical" />
              <span className="text-foreground-muted">&lt;70% Krytyczne</span>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
