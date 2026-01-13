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
          <InfoTooltip content={tooltip} />
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
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Wskaźnik Wymiany Ciepła (WWC)</p>

                <div className="text-foreground-muted text-sm space-y-2">
                  <p>
                    <span className="font-medium text-foreground">Skąd się bierze ΔT?</span><br />
                    ΔT to różnica temperatur mierzona na wymienniku ciepła po stronie sieciowej:
                    temperatura zasilania (T<sub>zas</sub>) minus temperatura powrotu (T<sub>pow</sub>).
                    Dla CWU projektowe ΔT wynosi zwykle 20-25K.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Co mierzy WWC?</span><br />
                    WWC = (ΔT<sub>rzeczywiste</sub> / ΔT<sub>projektowe</sub>) × 100%<br />
                    Pokazuje jaki procent projektowej różnicy temperatur jest wykorzystywany.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Interpretacja:</span><br />
                    • <span className="text-success">WWC ≥95%</span> — wymiennik pracuje zgodnie z projektem<br />
                    • <span className="text-warning">WWC 70-85%</span> — woda wraca za ciepła, energia nie jest w pełni odbierana<br />
                    • <span className="text-critical">WWC &lt;70%</span> — znaczne straty, pilna regulacja
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Co robić przy niskim WWC?</span><br />
                    Niskie ΔT oznacza zbyt mały odbiór ciepła. Przyczyny: MTCV za bardzo przymknięte,
                    zbyt mały przepływ w instalacji wewnętrznej, lub problem z wymiennikiem.
                    Sprawdź nastawy MTCV na pionach CWU.
                  </p>
                </div>
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
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Stabilność Hydrauliczna (SH)</p>

                <div className="text-foreground-muted text-sm space-y-2">
                  <p>
                    <span className="font-medium text-foreground">Co mierzy SH?</span><br />
                    SH pokazuje jak bardzo ΔT waha się w ciągu doby. Obliczamy odchylenie standardowe
                    ΔT ze wszystkich pomiarów dobowych i porównujemy do średniego ΔT.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Wzór:</span><br />
                    SH = 100% - (σ<sub>ΔT</sub> / μ<sub>ΔT</sub>) × 100%<br />
                    gdzie σ = odchylenie standardowe, μ = średnia
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Dlaczego ΔT się waha?</span><br />
                    W dobrze zrównoważonej instalacji ΔT powinno być podobne niezależnie od obciążenia.
                    Duże wahania oznaczają, że przy różnym poborze CWU instalacja reaguje nierównomiernie
                    — niektóre piony są przeciążone, inne niedociążone.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Interpretacja:</span><br />
                    • <span className="text-success">SH ≥90%</span> — stabilna praca, piony dobrze zrównoważone<br />
                    • <span className="text-warning">SH 70-85%</span> — zauważalne wahania, monitoruj<br />
                    • <span className="text-critical">SH &lt;70%</span> — niestabilna hydraulika, wymaga interwencji
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Co robić przy niskim SH?</span><br />
                    Wykonaj równoważenie hydrauliczne instalacji. Sprawdź nastawy MTCV na wszystkich
                    pionach — mogą być zbyt zróżnicowane. Przy bardzo niskim SH sprawdź też pompę
                    cyrkulacyjną (może pracować niestabilnie).
                  </p>
                </div>
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
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Efektywność Szczytowa (ES)</p>

                <div className="text-foreground-muted text-sm space-y-2">
                  <p>
                    <span className="font-medium text-foreground">Co mierzy ES?</span><br />
                    ES porównuje jak instalacja radzi sobie w godzinach szczytu (6:00-9:00 rano,
                    17:00-20:00 wieczorem) względem okresu niskiego obciążenia (2:00-4:00 w nocy).
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Wzór:</span><br />
                    ES = (WWC<sub>szczyt</sub> / WWC<sub>noc</sub>) × 100%<br />
                    Jeśli w szczycie WWC spada np. do 75%, a w nocy jest 95%, to ES = 79%.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Dlaczego w szczycie jest gorzej?</span><br />
                    W godzinach szczytu mieszkańcy intensywnie korzystają z CWU (poranki, wieczory).
                    Instalacja musi dostarczyć więcej ciepła w krótkim czasie. Jeśli pompa cyrkulacyjna
                    lub przepustowość MTCV są niewystarczające, ΔT spada — woda wraca cieplejsza.
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Interpretacja:</span><br />
                    • <span className="text-success">ES ≥90%</span> — instalacja dobrze radzi sobie ze szczytami<br />
                    • <span className="text-warning">ES 75-85%</span> — zauważalny spadek wydajności w szczycie<br />
                    • <span className="text-critical">ES &lt;75%</span> — instalacja przeciążona, pilna interwencja
                  </p>

                  <p>
                    <span className="font-medium text-foreground">Co robić przy niskim ES?</span><br />
                    1. Sprawdź wydajność pompy cyrkulacyjnej — może być za słaba na szczytowe obciążenie<br />
                    2. Rozważ zwiększenie otwarcia MTCV na najbardziej obciążonych pionach<br />
                    3. Zoptymalizuj harmonogram pracy pompy (wyższa wydajność w godzinach szczytu)
                  </p>
                </div>
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
