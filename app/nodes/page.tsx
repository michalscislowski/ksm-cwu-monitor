import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
import { MiniGauge } from '@/components/node-detail/IEZGauge';
import { getNodesWithEfficiency, getDashboardStats } from '@/lib/data';

export default function NodesPage() {
  const nodes = getNodesWithEfficiency();
  const stats = getDashboardStats();

  // Sort by IEZ (worst first to highlight issues)
  const sortedNodes = [...nodes].sort(
    (a, b) => a.efficiency.iez.value - b.efficiency.iez.value
  );

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
        <button className="px-4 py-2 rounded-lg bg-efficiency/10 text-efficiency text-sm font-medium">
          Wszystkie ({stats.totalNodes})
        </button>
        <button className="px-4 py-2 rounded-lg bg-surface-elevated text-foreground-muted text-sm font-medium hover:bg-surface-hover transition-colors">
          Kategoria A ({stats.categoryACount})
        </button>
        <button className="px-4 py-2 rounded-lg bg-surface-elevated text-foreground-muted text-sm font-medium hover:bg-surface-hover transition-colors">
          Kategoria B ({stats.categoryBCount})
        </button>
        <button className="px-4 py-2 rounded-lg bg-surface-elevated text-foreground-muted text-sm font-medium hover:bg-surface-hover transition-colors">
          Kategoria C ({stats.categoryCCount})
        </button>
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
                    <MiniGauge value={node.efficiency.iez.value} />
                    <div>
                      <p className="text-xs text-foreground-subtle">Indeks IEZ</p>
                      <TrendBadge
                        trend={node.efficiency.iez.trend}
                        change={node.efficiency.iez.trend_change}
                      />
                    </div>
                  </div>

                  {/* Worst deviation indicator */}
                  {Object.values(node.efficiency.deviations).some(
                    (d) => d.status !== 'ok'
                  ) && (
                    <div className="text-right">
                      <p className="text-xs text-foreground-subtle mb-1">Problem</p>
                      <div className="flex gap-1">
                        {node.efficiency.deviations.delta_t.status !== 'ok' && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              node.efficiency.deviations.delta_t.status === 'critical'
                                ? 'bg-critical/20 text-critical'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            ΔT
                          </span>
                        )}
                        {node.efficiency.deviations.return_temp.status !== 'ok' && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              node.efficiency.deviations.return_temp.status === 'critical'
                                ? 'bg-critical/20 text-critical'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            Tp
                          </span>
                        )}
                        {node.efficiency.deviations.flow_balance.status !== 'ok' && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              node.efficiency.deviations.flow_balance.status === 'critical'
                                ? 'bg-critical/20 text-critical'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            Q
                          </span>
                        )}
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
    </div>
  );
}
