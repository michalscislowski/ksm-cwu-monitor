'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { EfficiencyHierarchy, OperationalIndicators, IndicatorStatus } from '@/lib/types';

interface EfficiencyHierarchyPanelProps {
  hierarchy: EfficiencyHierarchy;
  indicators: OperationalIndicators;
}

const statusColors: Record<IndicatorStatus, { text: string; bg: string; bar: string }> = {
  optimal: { text: 'text-success', bg: 'bg-success/10', bar: 'bg-success' },
  good: { text: 'text-efficiency', bg: 'bg-efficiency/10', bar: 'bg-efficiency' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning' },
  critical: { text: 'text-critical', bg: 'bg-critical/10', bar: 'bg-critical' },
};

const issueLabels: Record<string, { label: string; icon: string }> = {
  exchanger: { label: 'Problem z wymiennikiem', icon: '🔧' },
  circulation: { label: 'Straty cyrkulacyjne', icon: '🔄' },
  balanced: { label: 'System zrównoważony', icon: '✓' },
  unknown: { label: 'Wymaga diagnostyki', icon: '?' },
};

function ProgressBar({ value, status }: { value: number; status: IndicatorStatus }) {
  const colors = statusColors[status];
  return (
    <div className="h-3 bg-surface rounded-full overflow-hidden">
      <div
        className={`h-full ${colors.bar} transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function MiniIndicator({
  label,
  shortLabel,
  value,
  status
}: {
  label: string;
  shortLabel: string;
  value: number;
  status: IndicatorStatus;
}) {
  const colors = statusColors[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
        {shortLabel}
      </span>
      <span className="text-xs text-foreground-muted">{label}</span>
      <span className={`text-sm font-mono font-semibold ml-auto ${colors.text}`}>{value}%</span>
    </div>
  );
}

export function EfficiencyHierarchyPanel({ hierarchy, indicators }: EfficiencyHierarchyPanelProps) {
  const { se, kw, ss, primary_issue, savings_potential_percent, savings_potential_gj } = hierarchy;
  const issue = issueLabels[primary_issue];

  // Calculate estimated annual savings in PLN (assuming ~120 PLN/GJ)
  const savingsPLN = savings_potential_gj * 120;

  return (
    <Card>
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          Sprawność Energetyczna
          <InfoTooltip
            content={
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Hierarchia Wskaźników Efektywności</p>

                <div className="text-foreground-muted text-sm space-y-2">
                  <p>
                    <span className="font-medium text-foreground">SE — Sprawność Energetyczna</span><br />
                    Główny wskaźnik pokazujący jaki procent kupowanej energii trafia do mieszkańców
                    jako ciepła woda użytkowa. Uwzględnia wszystkie straty w systemie.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">KW — Kondycja Wymiennika</span><br />
                    Średnia geometryczna wskaźników WWC, SH i ES. Pokazuje jak sprawnie
                    pracuje wymiennik ciepła i instalacja przy wymienniku.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">SS — Straty Systemowe</span><br />
                    Straty energii poza wymiennikiem: cyrkulacja, rury, izolacja.
                    Obliczane jako różnica między KW a SE.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Diagnostyka:</span><br />
                    • SE niskie, KW wysokie → problem z cyrkulacją<br />
                    • SE niskie, KW niskie → problem z wymiennikiem<br />
                    • Oba wysokie → system sprawny
                  </p>
                </div>
              </div>
            }
          />
        </span>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Main indicator: SE */}
        <div className="text-center pb-4 border-b border-border-subtle">
          <div className="text-6xl font-mono font-bold mb-2" style={{ color: `var(--color-${se.status === 'optimal' ? 'success' : se.status === 'good' ? 'efficiency' : se.status === 'warning' ? 'warning' : 'critical'})` }}>
            {se.value}%
          </div>
          <p className="text-foreground-muted text-sm">{se.interpretation}</p>
          <p className="text-foreground-subtle text-xs mt-1">
            {se.losses_percent}% energii tracone w systemie
          </p>
        </div>

        {/* Components: KW and SS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KW - Exchanger Condition */}
          <div className={`p-4 rounded-lg ${statusColors[kw.status].bg} border border-transparent`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Kondycja Wymiennika</span>
                <span className="text-xs text-foreground-muted">(KW)</span>
              </div>
              <span className={`text-2xl font-mono font-bold ${statusColors[kw.status].text}`}>
                {kw.value}%
              </span>
            </div>
            <ProgressBar value={kw.value} status={kw.status} />
            <p className="text-xs text-foreground-muted mt-2">{kw.interpretation}</p>

            {/* WWC, SH, ES breakdown */}
            <div className="mt-3 pt-3 border-t border-border-subtle space-y-1.5">
              <MiniIndicator
                label="Wymiana"
                shortLabel="WWC"
                value={indicators.wwc.value}
                status={indicators.wwc.status}
              />
              <MiniIndicator
                label="Stabilność"
                shortLabel="SH"
                value={indicators.sh.value}
                status={indicators.sh.status}
              />
              <MiniIndicator
                label="Szczyt"
                shortLabel="ES"
                value={indicators.es.value}
                status={indicators.es.status}
              />
            </div>
          </div>

          {/* SS - System Losses */}
          <div className={`p-4 rounded-lg ${statusColors[ss.status].bg} border border-transparent`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Straty Systemowe</span>
                <span className="text-xs text-foreground-muted">(SS)</span>
              </div>
              <span className={`text-2xl font-mono font-bold ${statusColors[ss.status].text}`}>
                {ss.value}%
              </span>
            </div>
            <ProgressBar value={ss.value} status={ss.status} />
            <p className="text-xs text-foreground-muted mt-2">{ss.interpretation}</p>

            {/* Breakdown */}
            <div className="mt-3 pt-3 border-t border-border-subtle space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Cyrkulacja (est.)</span>
                <span className="font-mono text-foreground">{ss.estimated_circulation}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Rury/izolacja (est.)</span>
                <span className="font-mono text-foreground">{ss.estimated_pipes}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Wskaźnik nocny</span>
                <span className="font-mono text-foreground">{Math.round(ss.night_ratio * 100)}%</span>
              </div>
            </div>

            {ss.action && (
              <p className="text-xs font-medium text-foreground mt-3 pt-2 border-t border-border-subtle flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[ss.status].bar}`} />
                {ss.action}
              </p>
            )}
          </div>
        </div>

        {/* Diagnostic summary */}
        <div className="p-4 rounded-lg bg-surface-elevated border border-border-subtle">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{issue.icon}</span>
                <span className="font-medium text-foreground">{issue.label}</span>
              </div>
              <p className="text-sm text-foreground-muted">
                {primary_issue === 'circulation' && 'Wymiennik pracuje dobrze, ale duże straty w cyrkulacji i rurach.'}
                {primary_issue === 'exchanger' && 'Główny problem to sprawność wymiennika ciepła.'}
                {primary_issue === 'balanced' && 'System pracuje efektywnie, brak pilnych interwencji.'}
                {primary_issue === 'unknown' && 'Wymagana szczegółowa diagnostyka na miejscu.'}
              </p>
            </div>

            {savings_potential_percent > 0 && (
              <div className="text-right">
                <p className="text-xs text-foreground-subtle">Potencjał oszczędności</p>
                <p className="text-lg font-mono font-bold text-efficiency">{savings_potential_percent}%</p>
                <p className="text-xs text-foreground-muted">~{savings_potential_gj} GJ/rok</p>
                <p className="text-xs text-foreground-subtle">~{savingsPLN.toLocaleString()} PLN</p>
              </div>
            )}
          </div>
        </div>

        {/* Seasonal info */}
        <div className="flex items-center justify-between text-xs text-foreground-subtle pt-2 border-t border-border-subtle">
          <span>
            T<sub>zimna</sub> (estymowana): {se.t_cold_estimated}°C
          </span>
          <span>
            Q<sub>teoretyczne</sub>: {se.q_theoretical} GJ | Q<sub>rzeczywiste</sub>: {se.q_actual} GJ
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
