import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { RankingList } from '@/components/dashboard/RankingList';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { NodesTable } from '@/components/dashboard/NodesTable';
import { CategoriesChart } from '@/components/dashboard/CategoriesChart';
import {
  getDashboardStats,
  getAllAlerts,
  getRanking,
  getHistory,
  getNodesWithEfficiency,
} from '@/lib/data';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const alerts = getAllAlerts();
  const ranking = getRanking();
  const history = getHistory('WC-001'); // Use first node for demo
  const nodes = getNodesWithEfficiency();

  // Filter nodes that need attention (category B or C)
  const nodesNeedingAttention = nodes.filter(
    (n) => n.efficiency.benchmark.category !== 'A'
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Page header */}
      <div className="animate-in">
        <h1 className="text-2xl font-bold text-foreground">Przegląd systemu</h1>
        <p className="text-foreground-muted mt-1">
          Monitor efektywności CWU dla {stats.totalNodes} węzłów cieplnych
        </p>
      </div>

      {/* Stats grid */}
      <StatsGrid stats={stats} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts - 2 columns */}
        <div className="lg:col-span-2">
          <AlertsList alerts={alerts} maxItems={4} />
        </div>

        {/* Ranking - 1 column */}
        <div>
          <RankingList ranking={ranking} showTop={3} />
        </div>
      </div>

      {/* Trend chart */}
      <TrendChart data={history} />

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes needing attention */}
        <div className="lg:col-span-2">
          <NodesTable nodes={nodesNeedingAttention} title="Węzły wymagające uwagi" />
        </div>

        {/* Categories distribution */}
        <div>
          <CategoriesChart stats={stats} />
        </div>
      </div>
    </div>
  );
}
