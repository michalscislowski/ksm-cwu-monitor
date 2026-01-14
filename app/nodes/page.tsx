'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
import { MiniGauge } from '@/components/node-detail/SEGauge';
import { getNodesWithEfficiency, getDashboardStats } from '@/lib/data';
import type { Category } from '@/lib/types';

type FilterType = 'all' | Category;

export default function NodesPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const nodes = getNodesWithEfficiency();
  const stats = getDashboardStats();

  // Filter nodes by category
  const filteredNodes = filter === 'all'
    ? nodes
    : nodes.filter(node => node.efficiency.benchmark.category === filter);

  // Sort by SE (worst first to highlight issues)
  const sortedNodes = [...filteredNodes].sort(
    (a, b) => a.efficiency.hierarchy.se.value - b.efficiency.hierarchy.se.value
  );

  const filterButtons: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Wszystkie', count: stats.totalNodes },
    { value: 'A', label: 'Kategoria A', count: stats.categoryACount },
    { value: 'B', label: 'Kategoria B', count: stats.categoryBCount },
    { value: 'C', label: 'Kategoria C', count: stats.categoryCCount },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="text-2xl font-bold text-foreground">Węzły cieplne</h1>
        <p className="text-foreground-muted mt-1">
          {stats.totalNodes} węzłów w systemie monitoringu
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 animate-in stagger-1">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === btn.value
                ? 'bg-efficiency/10 text-efficiency'
                : 'bg-surface-elevated text-foreground-muted hover:bg-surface-hover'
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {/* Nodes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNodes.map((node, index) => (
          <Link key={node.id} href={`/nodes/${node.id}`}>
            <Card
              hover
              className={`animate-in h-full`}
              style={{ animationDelay: `${(index % 9) * 50}ms` }}
            >
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{node.name}</h3>
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      {node.apartments_count} mieszkań • {node.mtcv_type}
                    </p>
                  </div>
                  <CategoryBadge category={node.efficiency.benchmark.category} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MiniGauge value={node.efficiency.hierarchy.se.value} />
                    <div>
                      <p className="text-xs text-foreground-subtle">Sprawność SE</p>
                      <TrendBadge
                        trend={node.stats?.trend || 'stable'}
                        change={node.stats?.trend_change || 0}
                      />
                    </div>
                  </div>

                  {/* Operational indicators summary */}
                  {(node.efficiency.indicators.wwc.status !== 'optimal' ||
                    node.efficiency.indicators.sh.status !== 'optimal' ||
                    node.efficiency.indicators.es.status !== 'optimal') && (
                    <div className="text-right">
                      <p className="text-xs text-foreground-subtle mb-1">Wskaźniki</p>
                      <div className="flex gap-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            node.efficiency.indicators.wwc.status === 'critical'
                              ? 'bg-critical/20 text-critical'
                              : node.efficiency.indicators.wwc.status === 'warning'
                              ? 'bg-warning/20 text-warning'
                              : node.efficiency.indicators.wwc.status === 'good'
                              ? 'bg-success/20 text-success'
                              : 'bg-success/20 text-success'
                          }`}
                        >
                          WWC
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            node.efficiency.indicators.sh.status === 'critical'
                              ? 'bg-critical/20 text-critical'
                              : node.efficiency.indicators.sh.status === 'warning'
                              ? 'bg-warning/20 text-warning'
                              : node.efficiency.indicators.sh.status === 'good'
                              ? 'bg-success/20 text-success'
                              : 'bg-success/20 text-success'
                          }`}
                        >
                          SH
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            node.efficiency.indicators.es.status === 'critical'
                              ? 'bg-critical/20 text-critical'
                              : node.efficiency.indicators.es.status === 'warning'
                              ? 'bg-warning/20 text-warning'
                              : node.efficiency.indicators.es.status === 'good'
                              ? 'bg-success/20 text-success'
                              : 'bg-success/20 text-success'
                          }`}
                        >
                          ES
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerts indicator */}
                {node.alerts && node.alerts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border-subtle">
                    <span className="text-xs text-critical flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse" />
                      {node.alerts.length} aktywny{node.alerts.length > 1 ? 'ch' : ''} alert
                      {node.alerts.length > 1 ? 'ów' : ''}
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {sortedNodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground-muted">
            Brak węzłów w kategorii {filter}
          </p>
        </div>
      )}
    </div>
  );
}
