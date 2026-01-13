'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { DashboardStats } from '@/lib/types';

interface CategoriesChartProps {
  stats: DashboardStats;
}

export function CategoriesChart({ stats }: CategoriesChartProps) {
  const total = stats.totalNodes;

  const categories = [
    {
      label: 'Kategoria A',
      sublabel: 'Bardzo dobra',
      count: stats.categoryACount,
      percent: Math.round((stats.categoryACount / total) * 100),
      status: 'optimal' as const,
    },
    {
      label: 'Kategoria B',
      sublabel: 'Dobra',
      count: stats.categoryBCount,
      percent: Math.round((stats.categoryBCount / total) * 100),
      status: 'good' as const,
    },
    {
      label: 'Kategoria C',
      sublabel: 'Wymaga uwagi',
      count: stats.categoryCCount,
      percent: Math.round((stats.categoryCCount / total) * 100),
      status: 'warning' as const,
    },
  ];

  return (
    <Card className="animate-in stagger-5">
      <CardHeader>
        <span className="flex items-center gap-2">
          <span>📈</span>
          Rozkład kategorii
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
