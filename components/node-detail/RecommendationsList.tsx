'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Recommendation, RecommendationPriority, RecommendationCategory } from '@/lib/types';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

const priorityConfig: Record<RecommendationPriority, { label: string; variant: 'critical' | 'warning' | 'info' }> = {
  high: { label: 'Wysoki', variant: 'critical' },
  medium: { label: 'Średni', variant: 'warning' },
  low: { label: 'Niski', variant: 'info' },
};

const categoryIcons: Record<RecommendationCategory, string> = {
  mtcv_adjustment: '🔧',
  hydraulic_balance: '💧',
  maintenance: '🔩',
  circulation_pump: '⚙️',
  insulation: '🧱',
};

interface RecommendationItemProps {
  recommendation: Recommendation;
}

function RecommendationItem({ recommendation }: RecommendationItemProps) {
  const priority = priorityConfig[recommendation.priority];
  const icon = categoryIcons[recommendation.category] || '📋';

  return (
    <div
      className={`
        p-4 rounded-lg border-l-4 bg-surface-elevated
        ${recommendation.priority === 'high' ? 'border-l-critical' : ''}
        ${recommendation.priority === 'medium' ? 'border-l-warning' : ''}
        ${recommendation.priority === 'low' ? 'border-l-info' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <span>{icon}</span>
          {recommendation.title}
        </h4>
        <Badge variant={priority.variant} size="sm">
          {priority.label}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground-muted mb-3">
        {recommendation.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-subtle">
        <span className="flex items-center gap-1">
          <span className="text-success">↗</span>
          Szacowana poprawa:{' '}
          <span className="font-mono font-semibold text-success">
            +{recommendation.expected_improvement.iez_points} pkt IEZ
          </span>
        </span>

        {recommendation.affected_hours.length > 0 && (
          <span className="flex items-center gap-1">
            <span>🕐</span>
            Dotyczy godzin:{' '}
            <span className="font-mono">
              {recommendation.affected_hours.map((h) => `${h}:00`).join(', ')}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <span className="flex items-center gap-2">
            <span>💡</span>
            Rekomendacje
          </span>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6 text-foreground-muted">
            <p className="text-success text-xl mb-2">✓</p>
            <p>Brak rekomendacji - węzeł pracuje optymalnie</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Sort by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const order: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card>
      <CardHeader>
        <span className="flex items-center gap-2">
          <span>💡</span>
          Rekomendacje ({recommendations.length})
        </span>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {sortedRecommendations.map((rec) => (
            <RecommendationItem key={rec.id} recommendation={rec} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
