'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { EfficiencyHierarchy, OperationalIndicators, IndicatorStatus } from '@/lib/types';

interface EfficiencyHierarchyPanelProps {
  hierarchy: EfficiencyHierarchy;
  indicators: OperationalIndicators;
}

const statusColors: Record<IndicatorStatus, { text: string; bg: string; glow: string; ring: string }> = {
  optimal: { text: 'text-success', bg: 'bg-success/10', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]', ring: 'ring-success/40' },
  good: { text: 'text-efficiency', bg: 'bg-efficiency/10', glow: 'shadow-[0_0_30px_rgba(20,184,166,0.3)]', ring: 'ring-efficiency/40' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]', ring: 'ring-warning/40' },
  critical: { text: 'text-critical', bg: 'bg-critical/10', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]', ring: 'ring-critical/40' },
};

const issueLabels: Record<string, { label: string; icon: string; color: string }> = {
  exchanger: { label: 'Problem z wymiennikiem', icon: '⚙', color: 'text-warning' },
  circulation: { label: 'Straty cyrkulacyjne', icon: '↻', color: 'text-warning' },
  balanced: { label: 'System zrównoważony', icon: '✓', color: 'text-success' },
  unknown: { label: 'Wymaga diagnostyki', icon: '?', color: 'text-foreground-muted' },
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
      case 'optimal': return '#10b981';
      case 'good': return '#14b8a6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
    }
  };

  return (
    <div className="relative">
      <svg viewBox={viewBox} className={size === 'lg' ? 'w-full h-auto' : 'w-24 h-auto'}>
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${status}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getColor()} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={getColor()} stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-elevated"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
          fill="none"
          stroke={`url(#gradient-${status})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          filter={`url(#glow-${status})`}
          className="transition-all duration-1000 ease-out"
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
          <span
            className={`text-6xl font-mono font-black tracking-tighter ${colors.text}`}
            style={{ textShadow: status !== 'optimal' && status !== 'good' ? 'none' : '0 0 30px rgba(20, 184, 166, 0.5)' }}
          >
            {value}
          </span>
          <span className="text-foreground-subtle text-sm font-medium tracking-widest uppercase">
            sprawność %
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
          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
            {shortLabel}
          </span>
          <span className="text-xs text-foreground-muted group-hover:text-foreground transition-colors">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <span className={`text-sm font-mono font-bold ${colors.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            status === 'optimal' ? 'bg-gradient-to-r from-success/60 to-success' :
            status === 'good' ? 'bg-gradient-to-r from-efficiency/60 to-efficiency' :
            status === 'warning' ? 'bg-gradient-to-r from-warning/60 to-warning' :
            'bg-gradient-to-r from-critical/60 to-critical'
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
    <div className={`relative p-5 rounded-xl border transition-all duration-300 ${
      status === 'critical' ? 'bg-gradient-to-br from-critical/5 to-transparent border-critical/30' :
      status === 'warning' ? 'bg-gradient-to-br from-warning/5 to-transparent border-warning/20' :
      status === 'good' ? 'bg-gradient-to-br from-efficiency/5 to-transparent border-efficiency/20' :
      'bg-gradient-to-br from-success/5 to-transparent border-success/20'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {shortTitle}
            </span>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
          <p className="text-xs text-foreground-muted max-w-[200px]">{interpretation}</p>
        </div>
        <div className={`text-3xl font-mono font-black ${colors.text}`}>
          {value}%
        </div>
      </div>

      {/* Children (sub-indicators) */}
      {children && (
        <div className="space-y-3 pt-4 border-t border-border-subtle">
          {children}
        </div>
      )}

      {/* Action */}
      {action && (
        <div className={`mt-4 pt-3 border-t border-border-subtle flex items-center gap-2 text-xs font-medium ${colors.text}`}>
          <span className={`w-2 h-2 rounded-full ${
            status === 'critical' ? 'bg-critical animate-pulse' :
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
      <CardBody className="p-0">
        {/* Hero Section - Main SE Gauge */}
        <div className="relative bg-gradient-to-b from-surface-elevated/50 to-transparent px-6 pt-6 pb-8">
          {/* Decorative grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative max-w-xs mx-auto">
            <ArcGauge value={se.value} status={se.status} size="lg" />
          </div>

          {/* SE Interpretation */}
          <p className="text-center text-foreground-muted text-sm mt-4 max-w-md mx-auto">
            {se.interpretation}
          </p>

          {/* Loss indicator */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-subtle">
              <span className="text-foreground-subtle text-xs">Straty w systemie:</span>
              <span className={`font-mono font-bold text-sm ${
                se.losses_percent > 30 ? 'text-critical' :
                se.losses_percent > 20 ? 'text-warning' :
                'text-foreground-muted'
              }`}>
                {se.losses_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Hierarchy Flow Visualization */}
        <div className="px-6 py-4 border-t border-border-subtle">
          <div className="flex items-center justify-center gap-2 text-xs text-foreground-subtle mb-4">
            <span className="font-mono font-bold text-efficiency">SE</span>
            <span>=</span>
            <span className="font-mono">KW</span>
            <span>−</span>
            <span className="font-mono">SS</span>
            <span className="text-foreground-muted ml-2">(Sprawność = Wymiennik − Straty)</span>
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
        <div className="mx-6 mb-6 p-4 rounded-xl bg-surface-elevated border border-border-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={`text-2xl ${issue.color}`}>{issue.icon}</span>
              <div>
                <span className={`font-semibold ${issue.color}`}>{issue.label}</span>
                <p className="text-sm text-foreground-muted mt-1">
                  {primary_issue === 'circulation' && 'Wymiennik pracuje dobrze, ale duże straty w cyrkulacji i rurach.'}
                  {primary_issue === 'exchanger' && 'Główny problem to sprawność wymiennika ciepła.'}
                  {primary_issue === 'balanced' && 'System pracuje efektywnie, brak pilnych interwencji.'}
                  {primary_issue === 'unknown' && 'Wymagana szczegółowa diagnostyka na miejscu.'}
                </p>
              </div>
            </div>

            {savings_potential_percent > 0 && (
              <div className="text-right shrink-0">
                <p className="text-[10px] text-foreground-subtle uppercase tracking-wider">Potencjał oszczędności</p>
                <p className="text-2xl font-mono font-black text-efficiency">{savings_potential_percent}%</p>
                <p className="text-xs text-foreground-muted font-mono">~{savings_potential_gj} GJ/rok</p>
                <p className="text-xs text-foreground-subtle">~{savingsPLN.toLocaleString()} PLN</p>
              </div>
            )}
          </div>
        </div>

        {/* Technical Footer */}
        <div className="px-6 py-3 bg-surface-elevated/50 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-subtle font-mono">
          <span>
            T<sub>zimna</sub> = {se.t_cold_estimated}°C
          </span>
          <span className="text-foreground-muted">|</span>
          <span>
            Q<sub>teor</sub> = {se.q_theoretical} GJ
          </span>
          <span className="text-foreground-muted">|</span>
          <span>
            Q<sub>rzecz</sub> = {se.q_actual} GJ
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
