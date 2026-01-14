'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
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
            <span className="text-success text-2xl block mb-2">✓</span>
            <p>Wszystkie węzły pracują optymalnie</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="animate-in stagger-5">
      <CardHeader>{title}</CardHeader>
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
                          className={`text-xs px-2 py-0.5 rounded ${
                            worst.status === 'critical'
                              ? 'bg-critical/20 text-critical'
                              : worst.status === 'warning'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-efficiency/20 text-efficiency'
                          }`}
                        >
                          {worst.shortLabel}
                        </span>
                      ) : (
                        <span className="text-success text-xs">✓ OK</span>
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
