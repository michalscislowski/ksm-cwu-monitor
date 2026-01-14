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

// SVG icons for recommendation categories
function CategoryIcon({ category, className }: { category: RecommendationCategory | 'default'; className?: string }) {
  switch (category) {
    case 'mtcv_adjustment':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.5 2L3 4.5 5.5 7" />
          <path d="M3 4.5h7a3 3 0 0 1 0 6H7" />
          <circle cx="5" cy="12" r="2" />
        </svg>
      );
    case 'hydraulic_balance':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v12" />
          <path d="M4 6l4-4 4 4" />
          <path d="M4 10l4 4 4-4" />
        </svg>
      );
    case 'maintenance':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L4 6l2 2-4 6" />
          <path d="M10 2l2 4-2 2 4 6" />
        </svg>
      );
    case 'circulation_pump':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="5" />
          <path d="M8 5v3l2 2" />
        </svg>
      );
    case 'insulation':
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="10" height="10" rx="1" />
          <path d="M6 3v10M10 3v10" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v8M8 13v.01" />
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
  }
}

// Light bulb icon for header
function LightBulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14h4M7 14v-2M9 14v-2" />
      <path d="M5 10a5 5 0 1 1 6 0c0 1-1 2-1 2H6s-1-1-1-2z" />
    </svg>
  );
}

// Clock icon
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l3 2" />
    </svg>
  );
}

// Checkmark icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l4 4 6-8" />
    </svg>
  );
}

interface RecommendationItemProps {
  recommendation: Recommendation;
}

function RecommendationItem({ recommendation }: RecommendationItemProps) {
  const priority = priorityConfig[recommendation.priority];

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
          <CategoryIcon category={recommendation.category} className="w-4 h-4 text-foreground-muted" />
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
          <svg className="w-3 h-3 text-success" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 8l4-4 4 4" />
          </svg>
          Szacowana poprawa:{' '}
          <span className="font-mono font-semibold text-success">
            +{recommendation.expected_improvement.iez_points}% SE
          </span>
        </span>

        {recommendation.affected_hours.length > 0 && (
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
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
        <CardHeader dataSource="mec">
          <span className="flex items-center gap-2">
            <LightBulbIcon className="w-4 h-4" />
            Rekomendacje
          </span>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6 text-foreground-muted">
            <CheckIcon className="w-8 h-8 text-success mx-auto mb-2" />
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
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          <LightBulbIcon className="w-4 h-4" />
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
