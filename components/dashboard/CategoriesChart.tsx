'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { DashboardStats } from '@/lib/types';

interface CategoriesChartProps {
  stats: DashboardStats;
}

export function CategoriesChart({ stats }: CategoriesChartProps) {
  const total = stats.totalNodes;

  const categories = [
    {
      label: 'Kategoria A',
      sublabel: 'wszystkie wskaźniki ≥80%',
      count: stats.categoryACount,
      percent: Math.round((stats.categoryACount / total) * 100),
      status: 'optimal' as const,
    },
    {
      label: 'Kategoria B',
      sublabel: 'najsłabszy wskaźnik 70-79%',
      count: stats.categoryBCount,
      percent: Math.round((stats.categoryBCount / total) * 100),
      status: 'warning' as const,
    },
    {
      label: 'Kategoria C',
      sublabel: 'najsłabszy wskaźnik <70%',
      count: stats.categoryCCount,
      percent: Math.round((stats.categoryCCount / total) * 100),
      status: 'critical' as const,
    },
  ];

  return (
    <Card className="animate-in stagger-5">
      <CardHeader>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 14V8M6 14V5M10 14V7M14 14V2" />
          </svg>
          Rozkład kategorii
          <InfoTooltip content={
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Rozkład kategorii węzłów</p>
              <div className="text-foreground-muted text-sm space-y-2">
                <p>
                  <span className="font-medium text-foreground">Jak ustalana jest kategoria?</span><br />
                  Kategoria węzła zależy od <strong>najsłabszego</strong> wskaźnika
                  operacyjnego: WWC (wymiana ciepła), SH (stabilność hydrauliczna)
                  lub ES (efektywność szczytowa).
                </p>
                <p>
                  <span className="font-medium text-foreground">Progi kategorii:</span><br />
                  • <span className="text-success">A</span> — wszystkie wskaźniki ≥80%<br />
                  • <span className="text-warning">B</span> — najsłabszy 70-79%<br />
                  • <span className="text-critical">C</span> — najsłabszy &lt;70%
                </p>
                <p className="text-xs text-foreground-subtle">
                  Przykład: węzeł z SE 85% może mieć kategorię B,
                  jeśli jego ES wynosi tylko 76%.
                </p>
              </div>
            </div>
          } />
        </span>
      </CardHeader>
      <CardBody>
        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <span className="text-xs text-foreground-subtle ml-2">({cat.sublabel})</span>
                </div>
                <span className="text-sm">
                  <span className="font-mono font-bold">{cat.count}</span>
                  <span className="text-foreground-subtle"> ({cat.percent}%)</span>
                </span>
              </div>
              <ProgressBar value={cat.percent} status={cat.status} size="lg" />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-surface-elevated rounded-lg">
          <p className="text-sm text-foreground-muted">
            <span className="text-success font-semibold">{stats.categoryACount}</span> węzłów
            pracuje optymalnie,{' '}
            {stats.categoryCCount > 0 ? (
              <>
                <span className="text-critical font-semibold">{stats.categoryCCount}</span> wymaga
                pilnej uwagi
              </>
            ) : (
              <span className="text-success">brak węzłów wymagających pilnej uwagi</span>
            )}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
