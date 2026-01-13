import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge, DataSourceBadge } from '@/components/ui/Badge';
import { IEZGauge } from '@/components/node-detail/IEZGauge';
import { DeviationsPanel } from '@/components/node-detail/DeviationsPanel';
import { LossesPanel } from '@/components/node-detail/LossesPanel';
import { BenchmarkPanel } from '@/components/node-detail/BenchmarkPanel';
import { RecommendationsList } from '@/components/node-detail/RecommendationsList';
import { HistoricalChart } from '@/components/node-detail/HistoricalChart';
import { DailyProfileChart } from '@/components/dashboard/TrendChart';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { getNodeWithEfficiency, getNodes } from '@/lib/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for all nodes
export async function generateStaticParams() {
  const nodes = getNodes();
  return nodes.map((node) => ({
    id: node.id,
  }));
}

export default async function NodeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const node = getNodeWithEfficiency(id);

  if (!node) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted animate-in">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Przegląd
        </Link>
        <span>/</span>
        <Link href="/nodes" className="hover:text-foreground transition-colors">
          Węzły
        </Link>
        <span>/</span>
        <span className="text-foreground">{node.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{node.name}</h1>
          <p className="text-foreground-muted mt-1">
            {node.address}
          </p>
          <p className="text-foreground-subtle text-sm mt-1">
            {node.apartments_count} mieszkań • {node.mtcv_count} zaworów {node.mtcv_type}
          </p>
        </div>
        <CategoryBadge category={node.efficiency.benchmark.category} size="lg" showLabel />
      </div>

      {/* Data source legend */}
      <div className="flex items-center gap-4 text-xs text-foreground-muted bg-surface/50 rounded-lg px-4 py-2 border border-border-subtle">
        <span className="font-medium">Źródła danych:</span>
        <div className="flex items-center gap-2">
          <DataSourceBadge source="mec" />
          <span>Dane z MEC Koszalin (symulowane)</span>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge source="ksm" />
          <span>Dane KSM Przylesie (rzeczywiste)</span>
        </div>
      </div>

      {/* Top row - IEZ + Deviations + Losses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IEZ Gauge */}
        <Card className="animate-in stagger-2">
          <CardHeader dataSource="mec">Indeks Efektywności (IEZ)</CardHeader>
          <CardBody className="flex justify-center py-6">
            <IEZGauge iez={node.efficiency.iez} size="lg" />
          </CardBody>
        </Card>

        {/* Deviations */}
        <div className="animate-in stagger-3">
          <DeviationsPanel deviations={node.efficiency.deviations} />
        </div>

        {/* Losses */}
        <div className="animate-in stagger-4">
          <LossesPanel losses={node.efficiency.losses} />
        </div>
      </div>

      {/* Daily Profile */}
      {node.dailyProfile && (
        <div className="animate-in stagger-5">
          <DailyProfileChart hours={node.dailyProfile.hours} />
        </div>
      )}

      {/* Historical Chart */}
      {node.readings && node.readings.length > 0 && (
        <div className="animate-in">
          <HistoricalChart readings={node.readings} nodeId={node.id} />
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="lg:col-span-2">
          <RecommendationsList recommendations={node.recommendations || []} />
        </div>

        {/* Benchmark */}
        <div>
          <BenchmarkPanel benchmark={node.efficiency.benchmark} />
        </div>
      </div>

      {/* Alerts */}
      {node.alerts && node.alerts.length > 0 && (
        <AlertsList alerts={node.alerts} showHeader={true} maxItems={10} />
      )}

      {/* Node info */}
      <Card>
        <CardHeader dataSource="ksm">
          <span className="flex items-center gap-2">
            <span>ℹ️</span>
            Informacje o węźle
          </span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 bg-surface-elevated rounded-lg">
              <p className="text-xs text-foreground-subtle">Liczba mieszkań</p>
              <p className="font-mono font-semibold text-lg">{node.apartments_count}</p>
            </div>
            <div className="p-3 bg-surface-elevated rounded-lg">
              <p className="text-xs text-foreground-subtle">Kubatura</p>
              <p className="font-mono font-semibold text-lg">
                {node.building_volume_m3.toLocaleString()} m³
              </p>
            </div>
            <div className="p-3 bg-surface-elevated rounded-lg">
              <p className="text-xs text-foreground-subtle">Typ zaworów</p>
              <p className="font-semibold">{node.mtcv_type}</p>
            </div>
            <div className="p-3 bg-surface-elevated rounded-lg">
              <p className="text-xs text-foreground-subtle">Liczba MTCV</p>
              <p className="font-mono font-semibold text-lg">{node.mtcv_count}</p>
            </div>
            {node.stats && (
              <div className="p-3 bg-surface-elevated rounded-lg">
                <p className="text-xs text-foreground-subtle">Dane historyczne</p>
                <p className="font-mono font-semibold text-lg">{node.stats.total_readings}</p>
                <p className="text-xs text-foreground-subtle">
                  {node.stats.years_covered[0]}-{node.stats.years_covered[node.stats.years_covered.length - 1]}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
