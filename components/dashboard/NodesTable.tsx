'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/Tooltip';
import { MiniGauge } from '@/components/node-detail/SEGauge';
import type { NodeWithEfficiency, IndicatorStatus } from '@/lib/types';

interface NodesTableProps {
  nodes: NodeWithEfficiency[];
  title?: string;
}

function getWorstIndicator(indicators: NodeWithEfficiency['efficiency']['indicators']): {
  label: string;
  shortLabel: string;
  status: IndicatorStatus;
} {
  const indicatorsList: Array<{ key: 'wwc' | 'sh' | 'es'; label: string; shortLabel: string }> = [
    { key: 'wwc', label: 'Wymiana ciepła', shortLabel: 'WWC' },
    { key: 'sh', label: 'Stabilność hydrauliczna', shortLabel: 'SH' },
    { key: 'es', label: 'Efektywność szczytowa', shortLabel: 'ES' },
  ];

  let worst = { label: '', shortLabel: '', status: 'optimal' as IndicatorStatus };
  const statusPriority: Record<IndicatorStatus, number> = {
    critical: 3,
    warning: 2,
    good: 1,
    optimal: 0,
  };

  for (const ind of indicatorsList) {
    const indicator = indicators[ind.key];
    if (statusPriority[indicator.status] > statusPriority[worst.status]) {
      worst = { label: ind.label, shortLabel: ind.shortLabel, status: indicator.status };
    }
  }

  return worst;
}

export function NodesTable({ nodes, title = 'Węzły' }: NodesTableProps) {
  if (nodes.length === 0) {
    return (
      <Card className="animate-in stagger-5">
        <CardHeader>{title}</CardHeader>
        <CardBody>
          <div className="text-center py-8 text-foreground-muted">
            <svg className="w-8 h-8 text-success mx-auto mb-2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l4 4 6-8" />
            </svg>
            <p>Wszystkie węzły pracują optymalnie</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="animate-in stagger-5">
      <CardHeader
        action={
          <Link href="/nodes" className="text-xs text-foreground-muted hover:text-efficiency transition-colors">
            Zobacz wszystkie
          </Link>
        }
      >
        <span className="flex items-center gap-2">
          {title}
          <InfoTooltip content={
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Węzły wymagające uwagi</p>
              <p className="text-foreground-muted text-sm">
                Lista węzłów, które wymagają przeglądu ze względu na niską sprawność lub problematyczne wskaźniki.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-medium text-foreground">Wskaźniki:</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">WWC</span>
                  <span className="text-foreground-muted">— Współczynnik Wymiany Ciepła</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">SH</span>
                  <span className="text-foreground-muted">— Stabilność Hydrauliczna</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">ES</span>
                  <span className="text-foreground-muted">— Efektywność Szczytowa</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-critical" />
                  <span className="text-foreground-muted">Krytyczny — wymaga interwencji</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-foreground-muted">Ostrzeżenie — wymaga uwagi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-foreground-muted">Dobry — w normie</span>
                </div>
              </div>
            </div>
          } />
        </span>
      </CardHeader>
      <CardBody noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground-muted border-b border-border-subtle">
                <th className="px-5 py-3 font-medium">Węzeł</th>
                <th className="px-5 py-3 font-medium">SE</th>
                <th className="px-5 py-3 font-medium">Trend</th>
                <th className="px-5 py-3 font-medium">Najsłabszy wskaźnik</th>
                <th className="px-5 py-3 font-medium">Kategoria</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const worst = getWorstIndicator(node.efficiency.indicators);

                return (
                  <tr
                    key={node.id}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/nodes/${node.id}`}
                        className="font-medium text-foreground hover:text-efficiency transition-colors"
                      >
                        {node.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <MiniGauge value={node.efficiency.hierarchy.se.value} />
                    </td>
                    <td className="px-5 py-4">
                      <TrendBadge
                        trend={node.efficiency.iez.trend}
                        change={node.efficiency.iez.trend_change}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {worst.status !== 'optimal' ? (
                        <span
                          className={`
                            inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md
                            ${worst.status === 'critical'
                              ? 'bg-critical/10 text-critical border border-critical/20'
                              : worst.status === 'warning'
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : 'bg-success/10 text-success border border-success/20'
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            worst.status === 'critical' ? 'bg-critical' :
                            worst.status === 'warning' ? 'bg-warning' : 'bg-success'
                          }`} />
                          {worst.shortLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <CategoryBadge category={node.efficiency.benchmark.category} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
