'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge } from '@/components/ui/Badge';
import type { MonthlyForecast, Category } from '@/lib/types';

interface MonthlyForecastPanelProps {
  forecast: MonthlyForecast;
  lastKnownWskaznik?: number;  // From KSM Excel data
}

// Optimal wskaźnik for category A
const OPTIMAL_WSKAZNIK = 0.22;

export function MonthlyForecastPanel({ forecast, lastKnownWskaznik }: MonthlyForecastPanelProps) {
  const confidenceLabels: Record<'high' | 'medium' | 'low', { label: string; color: string }> = {
    high: { label: 'Wysoka', color: 'text-success' },
    medium: { label: 'Średnia', color: 'text-warning' },
    low: { label: 'Niska', color: 'text-critical' },
  };

  const confidenceConfig = confidenceLabels[forecast.confidence];

  // Calculate how far from optimal
  const deviationFromOptimal = Math.round(((forecast.predicted_wskaznik / OPTIMAL_WSKAZNIK) - 1) * 100);

  return (
    <Card>
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10l3-3 3 2 4-5 2 2" />
            <path d="M14 6v5h-5" />
          </svg>
          Prognoza miesięczna
        </span>
      </CardHeader>
      <CardBody>
        {/* Main forecast */}
        <div className="text-center mb-6">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">
            Prognozowany wskaźnik GJ/m³
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-bold text-foreground">
              {forecast.predicted_wskaznik.toFixed(2)}
            </span>
            <CategoryBadge category={forecast.predicted_category} size="lg" showLabel />
          </div>
          <p className="text-sm text-foreground-muted mt-2">
            <span className={confidenceConfig.color}>Pewność: {confidenceConfig.label}</span>
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Target */}
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">Cel (kat. A)</p>
            <p className="font-mono font-semibold text-lg text-success">
              ≤ {OPTIMAL_WSKAZNIK.toFixed(2)}
            </p>
            <p className="text-xs text-foreground-muted">
              {deviationFromOptimal > 0 ? `+${deviationFromOptimal}%` : `${deviationFromOptimal}%`} od celu
            </p>
          </div>

          {/* vs Last month */}
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="text-xs text-foreground-subtle">vs poprzedni miesiąc</p>
            <p className={`font-mono font-semibold text-lg ${forecast.vs_last_month < 0 ? 'text-success' : forecast.vs_last_month > 0 ? 'text-critical' : 'text-foreground-muted'}`}>
              {forecast.vs_last_month > 0 ? '+' : ''}{forecast.vs_last_month}%
            </p>
            <p className="text-xs text-foreground-muted">
              {forecast.vs_last_month < 0 ? 'Poprawa' : forecast.vs_last_month > 0 ? 'Pogorszenie' : 'Bez zmian'}
            </p>
          </div>
        </div>

        {/* Last known value from KSM */}
        {lastKnownWskaznik && (
          <div className="p-3 bg-surface rounded-lg border border-border-subtle mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground-subtle">Ostatni znany wskaźnik (z rozliczenia)</p>
                <p className="font-mono font-semibold text-foreground">
                  {lastKnownWskaznik.toFixed(3)} GJ/m³
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-efficiency/10 text-efficiency rounded">
                KSM
              </span>
            </div>
          </div>
        )}

        {/* Potential improvement */}
        {forecast.potential_improvement > 0 && (
          <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-sm font-medium text-success flex items-center gap-2">
              <span>↗</span>
              Potencjał poprawy
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Przy optymalnej regulacji MTCV możliwa redukcja wskaźnika o{' '}
              <span className="font-mono font-semibold text-success">
                {forecast.potential_improvement.toFixed(2)} GJ/m³
              </span>
            </p>
          </div>
        )}

        {/* Explanation */}
        <div className="mt-4 pt-4 border-t border-border-subtle text-xs text-foreground-subtle">
          <p>
            Prognoza oparta na bieżących wskaźnikach operacyjnych (WWC, SH, ES)
            i historycznych danych rozliczeniowych. Weryfikacja po otrzymaniu
            faktury za bieżący miesiąc.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
