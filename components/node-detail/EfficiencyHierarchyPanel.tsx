'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { EfficiencyHierarchy, OperationalIndicators, IndicatorStatus } from '@/lib/types';

interface EfficiencyHierarchyPanelProps {
  hierarchy: EfficiencyHierarchy;
  indicators: OperationalIndicators;
}

// Color convention: optimal/good = green, warning = yellow, critical = red
const statusColors: Record<IndicatorStatus, { text: string; bg: string; border: string }> = {
  optimal: { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  good: { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  critical: { text: 'text-critical', bg: 'bg-critical/10', border: 'border-critical/30' },
};

// SVG icons for issue types
function IssueIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'exchanger') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" />
      </svg>
    );
  }
  if (type === 'circulation') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8a6 6 0 0 1 6-6M14 8a6 6 0 0 1-6 6" />
        <path d="M8 2l2-2M8 2L6 0M8 14l2 2M8 14l-2 2" />
      </svg>
    );
  }
  if (type === 'balanced') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8l4 4 6-8" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v4M8 11v.01" />
    </svg>
  );
}

const issueLabels: Record<string, { label: string; type: string; color: string }> = {
  exchanger: { label: 'Problem z wymiennikiem', type: 'exchanger', color: 'text-warning' },
  circulation: { label: 'Straty cyrkulacyjne', type: 'circulation', color: 'text-warning' },
  balanced: { label: 'System zrównoważony', type: 'balanced', color: 'text-success' },
  unknown: { label: 'Wymaga diagnostyki', type: 'unknown', color: 'text-foreground-muted' },
};

// Arc Gauge Component - the hero visualization
function ArcGauge({
  value,
  status,
  size = 'lg'
}: {
  value: number;
  status: IndicatorStatus;
  size?: 'sm' | 'lg';
}) {
  const colors = statusColors[status];
  const radius = size === 'lg' ? 90 : 40;
  const strokeWidth = size === 'lg' ? 12 : 6;
  const circumference = Math.PI * radius;
  const progress = (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const viewBox = size === 'lg' ? '-100 -100 200 120' : '-50 -50 100 60';

  const getColor = () => {
    switch (status) {
      case 'optimal': return '#22c55e';
      case 'good': return '#22c55e';
      case 'warning': return '#eab308';
      case 'critical': return '#ef4444';
    }
  };

  return (
    <div className="relative">
      <svg viewBox={viewBox} className={size === 'lg' ? 'w-full h-auto' : 'w-24 h-auto'}>
        {/* Background arc */}
        <path
          d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-hover"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-700 ease-out"
        />

        {/* Tick marks */}
        {size === 'lg' && [0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180 - 180;
          const radian = (angle * Math.PI) / 180;
          const innerR = radius - strokeWidth - 8;
          const outerR = radius - strokeWidth - 4;
          return (
            <line
              key={tick}
              x1={Math.cos(radian) * innerR}
              y1={Math.sin(radian) * innerR}
              x2={Math.cos(radian) * outerR}
              y2={Math.sin(radian) * outerR}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground-subtle"
            />
          );
        })}
      </svg>

      {/* Value display */}
      {size === 'lg' && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={`text-5xl font-mono font-bold tracking-tight ${colors.text}`}>
            {value}
            <span className="text-2xl opacity-60">%</span>
          </span>
          <span className="text-foreground-muted text-xs font-medium tracking-wide uppercase mt-1">
            sprawność
          </span>
        </div>
      )}
    </div>
  );
}

// Mini indicator with compact design
function MiniIndicator({
  label,
  shortLabel,
  value,
  status,
  tooltip
}: {
  label: string;
  shortLabel: string;
  value: number;
  status: IndicatorStatus;
  tooltip?: React.ReactNode;
}) {
  const colors = statusColors[status];
  const barWidth = Math.min(100, Math.max(0, value));

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
            {shortLabel}
          </span>
          <span className="text-xs text-foreground-muted">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <span className={`text-sm font-mono font-semibold ${colors.text}`}>{value}%</span>
      </div>
      <div className="h-1 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            status === 'optimal' ? 'bg-success' :
            status === 'good' ? 'bg-success' :
            status === 'warning' ? 'bg-warning' :
            'bg-critical'
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

// Component card with status-based styling
function ComponentCard({
  title,
  shortTitle,
  value,
  status,
  interpretation,
  children,
  action,
  tooltip,
}: {
  title: string;
  shortTitle: string;
  value: number;
  status: IndicatorStatus;
  interpretation: string;
  children?: React.ReactNode;
  action?: string;
  tooltip?: React.ReactNode;
}) {
  const colors = statusColors[status];

  return (
    <div className={`relative p-4 rounded-lg border bg-surface ${colors.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{title}</span>
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {shortTitle}
            </span>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
          <p className="text-xs text-foreground-muted max-w-[200px]">{interpretation}</p>
        </div>
        <div className={`text-2xl font-mono font-bold ${colors.text}`}>
          {value}%
        </div>
      </div>

      {/* Children (sub-indicators) */}
      {children && (
        <div className="space-y-3 pt-3 border-t border-border">
          {children}
        </div>
      )}

      {/* Action */}
      {action && (
        <div className={`mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs font-medium ${colors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'critical' ? 'bg-critical' :
            status === 'warning' ? 'bg-warning' :
            'bg-success'
          }`} />
          {action}
        </div>
      )}
    </div>
  );
}

export function EfficiencyHierarchyPanel({ hierarchy, indicators }: EfficiencyHierarchyPanelProps) {
  const { se, kw, ss, primary_issue, savings_potential_percent, savings_potential_gj } = hierarchy;
  const issue = issueLabels[primary_issue];
  const savingsPLN = savings_potential_gj * 120;

  return (
    <Card className="overflow-hidden">
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          Sprawność Energetyczna
          <InfoTooltip
            content={
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
                  <p className="text-xs font-medium text-foreground">Kategorie:</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground-muted">≥80% — Kategoria A</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-foreground-muted">70-79% — Kategoria B</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-critical" />
                      <span className="text-foreground-muted">&lt;70% — Kategoria C</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-foreground-subtle border-t border-border pt-3">
                  Źródło: dane KSM (miesięczne) lub MEC SCADA (bieżące)
                </p>
              </div>
            }
          />
        </span>
      </CardHeader>
      <CardBody className="p-0">
        {/* Hero Section - Main SE Gauge */}
        <div className="px-6 pt-6 pb-6">
          <div className="max-w-xs mx-auto">
            <ArcGauge value={se.value} status={se.status} size="lg" />
          </div>

          {/* SE Interpretation */}
          <p className="text-center text-foreground-muted text-sm mt-4 max-w-md mx-auto">
            {se.interpretation}
          </p>

          {/* Loss indicator */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-hover border border-border text-xs">
              <span className="text-foreground-muted">Straty w systemie:</span>
              <span className={`font-mono font-semibold ${
                se.losses_percent > 30 ? 'text-critical' :
                se.losses_percent > 20 ? 'text-warning' :
                'text-foreground-secondary'
              }`}>
                {se.losses_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Hierarchy Flow Visualization */}
        <div className="px-6 py-3 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-foreground-muted">
            <span className="font-mono font-semibold text-foreground">SE</span>
            <span>=</span>
            <span className="font-mono">KW</span>
            <span>−</span>
            <span className="font-mono">SS</span>
            <span className="ml-2">(Sprawność = Wymiennik − Straty)</span>
          </div>
        </div>

        {/* Components Grid - KW and SS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
          {/* KW - Exchanger Condition */}
          <ComponentCard
            title="Kondycja Wymiennika"
            shortTitle="KW"
            value={kw.value}
            status={kw.status}
            interpretation={kw.interpretation}
            tooltip={
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Kondycja Wymiennika (KW)</p>
                  <p className="text-foreground-subtle text-xs mt-0.5">Wskaźnik poziomu 2 • Agregacja operacyjna</p>
                </div>
                <p className="text-foreground-muted text-sm">
                  Pokazuje jak sprawnie pracuje wymiennik ciepła i instalacja przy wymienniku.
                  Jest średnią geometryczną trzech wskaźników operacyjnych.
                </p>
                <div className="bg-surface-elevated rounded-lg p-2.5 font-mono text-xs">
                  <p className="text-efficiency">KW = ∛(WWC × SH × ES)</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="font-medium text-foreground">Składniki:</p>
                  <p className="text-foreground-muted">• <strong>WWC</strong> — Sprawność wymiany ciepła</p>
                  <p className="text-foreground-muted">• <strong>SH</strong> — Stabilność przepływów</p>
                  <p className="text-foreground-muted">• <strong>ES</strong> — Efektywność w szczytach</p>
                </div>
                <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border-subtle">
                  Niski KW → problem z wymiennikiem lub regulacją
                </p>
              </div>
            }
          >
            <MiniIndicator
              label="Wymiana ciepła"
              shortLabel="WWC"
              value={indicators.wwc.value}
              status={indicators.wwc.status}
              tooltip={
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Współczynnik Wymiany Ciepła (WWC)</p>
                    <p className="text-foreground-subtle text-xs mt-0.5">Wskaźnik poziomu 3 • Składnik KW</p>
                  </div>
                  <p className="text-foreground-muted text-sm">
                    Ocenia efektywność przekazywania ciepła w wymienniku na podstawie
                    różnicy temperatur zasilania i powrotu.
                  </p>
                  <div className="bg-surface-elevated rounded-lg p-2.5 font-mono text-xs space-y-1">
                    <p className="text-efficiency">WWC = 100 × (ΔT_rzecz / ΔT_opt)</p>
                    <p className="text-foreground-subtle text-[10px]">ΔT_rzecz = T_zasilanie − T_powrót</p>
                    <p className="text-foreground-subtle text-[10px]">ΔT_opt = 20 K (wartość projektowa)</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground-muted">≥90% — Optymalna wymiana</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-foreground-muted">70-89% — Możliwe osady</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-critical" />
                      <span className="text-foreground-muted">&lt;70% — Wymaga czyszczenia</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border-subtle">
                    Źródło: MEC SCADA (T_zas, T_pow)
                  </p>
                </div>
              }
            />
            <MiniIndicator
              label="Stabilność hydraul."
              shortLabel="SH"
              value={indicators.sh.value}
              status={indicators.sh.status}
              tooltip={
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Stabilność Hydrauliczna (SH)</p>
                    <p className="text-foreground-subtle text-xs mt-0.5">Wskaźnik poziomu 3 • Składnik KW</p>
                  </div>
                  <p className="text-foreground-muted text-sm">
                    Ocenia równomierność przepływu w instalacji w ciągu doby.
                    Bazuje na współczynniku zmienności (CV) z 96 pomiarów/24h.
                  </p>
                  <div className="bg-surface-elevated rounded-lg p-2.5 font-mono text-xs space-y-1">
                    <p className="text-efficiency">SH = 100 − (CV × 100)</p>
                    <p className="text-foreground-subtle text-[10px]">CV = σ(Q) / μ(Q)</p>
                    <p className="text-foreground-subtle text-[10px]">σ = odchylenie std, μ = średnia przepływu</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground-muted">≥90% — Stabilny przepływ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-foreground-muted">70-89% — Wahania przepływu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-critical" />
                      <span className="text-foreground-muted">&lt;70% — Problemy hydrauliczne</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border-subtle">
                    Źródło: MEC SCADA (Q_flow, seria 24h)
                  </p>
                </div>
              }
            />
            <MiniIndicator
              label="Efektywność szczyt."
              shortLabel="ES"
              value={indicators.es.value}
              status={indicators.es.status}
              tooltip={
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Efektywność Szczytowa (ES)</p>
                    <p className="text-foreground-subtle text-xs mt-0.5">Wskaźnik poziomu 3 • Składnik KW</p>
                  </div>
                  <p className="text-foreground-muted text-sm">
                    Porównuje sprawność w godzinach szczytu (7-9, 17-21) ze
                    średnią całodobową. Pokazuje czy system nadąża przy dużym poborze.
                  </p>
                  <div className="bg-surface-elevated rounded-lg p-2.5 font-mono text-xs space-y-1">
                    <p className="text-efficiency">ES = 100 × (SE_szczyt / SE_średnia)</p>
                    <p className="text-foreground-subtle text-[10px]">SE_szczyt = średnia SE z godz. 7-9, 17-21</p>
                    <p className="text-foreground-subtle text-[10px]">SE_średnia = średnia SE całodobowa</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground-muted">≥95% — Wymiennik dobrze dobrany</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-foreground-muted">80-94% — Spadek w szczytach</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-critical" />
                      <span className="text-foreground-muted">&lt;80% — Wymiennik niedowymiarowany</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border-subtle">
                    Źródło: MEC SCADA (delta_GJ, delta_m³, agregacja godz.)
                  </p>
                </div>
              }
            />
          </ComponentCard>

          {/* SS - System Losses */}
          <ComponentCard
            title="Straty Systemowe"
            shortTitle="SS"
            value={ss.value}
            status={ss.status}
            interpretation={ss.interpretation}
            action={ss.action}
            tooltip={
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Straty Systemowe (SS)</p>
                  <p className="text-foreground-subtle text-xs mt-0.5">Wskaźnik poziomu 2 • Diagnostyka strat</p>
                </div>
                <p className="text-foreground-muted text-sm">
                  Straty energii występujące poza wymiennikiem — w cyrkulacji CWU, rurach
                  rozprowadzających i izolacji termicznej.
                </p>
                <div className="bg-surface-elevated rounded-lg p-2.5 font-mono text-xs">
                  <p className="text-efficiency">SS = 100 × (1 − SE/KW)</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="font-medium text-foreground">Składniki strat:</p>
                  <p className="text-foreground-muted">• <strong>Cyrkulacja</strong> — ciągły przepływ CWU w pętli</p>
                  <p className="text-foreground-muted">• <strong>Rury</strong> — straty przez izolację i długość</p>
                  <p className="text-foreground-muted">• <strong>Wskaźnik nocny</strong> — zużycie w godzinach 0-5</p>
                </div>
                <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border-subtle">
                  Wysokie SS przy dobrym KW → problem z cyrkulacją/rurami
                </p>
              </div>
            }
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Cyrkulacja (est.)</span>
                <span className="font-mono font-semibold text-foreground">{ss.estimated_circulation}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Rury/izolacja (est.)</span>
                <span className="font-mono font-semibold text-foreground">{ss.estimated_pipes}%</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
                <span className="text-foreground-muted">Wskaźnik nocny</span>
                <span className={`font-mono font-semibold ${
                  ss.night_ratio > 0.3 ? 'text-warning' : 'text-foreground'
                }`}>
                  {Math.round(ss.night_ratio * 100)}%
                </span>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Diagnostic Summary */}
        <div className="mx-6 mb-6 p-4 rounded-lg bg-surface border border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <IssueIcon type={issue.type} className={`w-5 h-5 ${issue.color}`} />
              <div>
                <span className={`text-sm font-medium ${issue.color}`}>{issue.label}</span>
                <p className="text-xs text-foreground-muted mt-1">
                  {primary_issue === 'circulation' && 'Wymiennik pracuje dobrze, ale duże straty w cyrkulacji i rurach.'}
                  {primary_issue === 'exchanger' && 'Główny problem to sprawność wymiennika ciepła.'}
                  {primary_issue === 'balanced' && 'System pracuje efektywnie, brak pilnych interwencji.'}
                  {primary_issue === 'unknown' && 'Wymagana szczegółowa diagnostyka na miejscu.'}
                </p>
              </div>
            </div>

            {savings_potential_percent > 0 && (
              <div className="text-right shrink-0">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Potencjał oszczędności</p>
                <p className="text-xl font-mono font-bold text-success">{savings_potential_percent}%</p>
                <p className="text-xs text-foreground-muted font-mono">~{savings_potential_gj} GJ/rok</p>
                <p className="text-[10px] text-foreground-subtle">~{savingsPLN.toLocaleString()} PLN</p>
              </div>
            )}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}
