'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
import { MiniGauge } from '@/components/node-detail/IEZGauge';
import type { NodeWithEfficiency, DeviationStatus } from '@/lib/types';

interface NodesTableProps {
  nodes: NodeWithEfficiency[];
  title?: string;
}

function getWorstDeviation(deviations: NodeWithEfficiency['efficiency']['deviations']): {
  param: string;
  status: DeviationStatus;
} {
  const params: Array<{ key: string; label: string }> = [
    { key: 'delta_t', label: 'ΔT' },
    { key: 'return_temp', label: 'Temp. powrotu' },
    { key: 'flow_balance', label: 'Przepływ' },
  ];

  let worst = { param: '', status: 'ok' as DeviationStatus };

  for (const p of params) {
    const dev = deviations[p.key as keyof typeof deviations];
    if (dev.status === 'critical') {
      return { param: p.label, status: 'critical' };
    }
    if (dev.status === 'warning' && worst.status !== 'warning') {
      worst = { param: p.label, status: 'warning' };
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
                <th className="px-5 py-3 font-medium">IEZ</th>
                <th className="px-5 py-3 font-medium">Trend</th>
                <th className="px-5 py-3 font-medium">Problem</th>
                <th className="px-5 py-3 font-medium">Kategoria</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const worst = getWorstDeviation(node.efficiency.deviations);

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
                      <MiniGauge value={node.efficiency.iez.value} />
                    </td>
                    <td className="px-5 py-4">
                      <TrendBadge
                        trend={node.efficiency.iez.trend}
                        change={node.efficiency.iez.trend_change}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {worst.status !== 'ok' ? (
                        <span
                          className={`text-xs ${
                            worst.status === 'critical' ? 'text-critical' : 'text-warning'
                          }`}
                        >
                          {worst.param}
                        </span>
                      ) : (
                        <span className="text-foreground-subtle text-xs">—</span>
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
