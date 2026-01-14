'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge, TrendBadge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { RankingEntry } from '@/lib/types';

interface RankingItemProps {
  entry: RankingEntry;
  isFirst?: boolean;
  isLast?: boolean;
}

function RankingItem({ entry, isFirst, isLast }: RankingItemProps) {
  const positionStyles = {
    1: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
    2: 'bg-gradient-to-br from-slate-400/20 to-slate-500/10 text-slate-300 border-slate-400/30',
    3: 'bg-gradient-to-br from-orange-600/20 to-orange-700/10 text-orange-400 border-orange-500/30',
  };

  const getPositionStyle = (pos: number) => {
    if (pos <= 3) return positionStyles[pos as 1 | 2 | 3];
    if (isLast) return 'bg-critical/10 text-critical border-critical/30';
    return 'bg-surface-elevated text-foreground-muted border-border';
  };

  return (
    <Link href={`/nodes/${entry.node_id}`}>
      <div
        className={`
          flex items-center gap-4 py-3 px-1
          border-b border-border-subtle last:border-b-0
          hover:bg-surface-hover/50 transition-colors rounded-lg -mx-1 px-2
          ${isLast ? 'mt-2 pt-4 border-t border-dashed' : ''}
        `}
      >
        {/* Position */}
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            text-sm font-bold border
            ${getPositionStyle(entry.position)}
          `}
        >
          {entry.position}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{entry.name}</p>
          <p className="text-xs text-foreground-muted">
            SE: <span className="font-mono">{entry.avg_se}%</span>
          </p>
        </div>

        {/* Category & Trend */}
        <div className="flex items-center gap-2">
          <TrendBadge trend={entry.trend} change={0} />
          <CategoryBadge category={entry.category} size="sm" />
        </div>
      </div>
    </Link>
  );
}

interface RankingListProps {
  ranking: RankingEntry[];
  showTop?: number;
  showBottom?: boolean;
}

export function RankingList({ ranking, showTop = 3, showBottom = true }: RankingListProps) {
  const topEntries = ranking.slice(0, showTop);
  const bottomEntry = showBottom ? ranking[ranking.length - 1] : null;

  return (
    <Card className="animate-in stagger-3 h-full flex flex-col">
      <CardHeader
        action={
          <span className="text-xs text-foreground-subtle">ostatnie 30 dni</span>
        }
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2l2 4 4 .5-3 3 .5 4.5L8 12l-3.5 2 .5-4.5-3-3L6 6l2-4z" />
          </svg>
          Ranking węzłów
          <InfoTooltip content={
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Ranking węzłów</p>
              <p className="text-foreground-muted text-sm">
                Zestawienie wszystkich węzłów cieplnych posortowanych według średniej Sprawności Energetycznej (SE) z ostatnich 30 dni.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-medium text-foreground">Pozycje:</p>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-foreground-muted">Najlepsza sprawność</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-critical/10 text-critical text-xs font-bold flex items-center justify-center">40</span>
                  <span className="text-foreground-muted">Najgorsza sprawność</span>
                </div>
              </div>
              <p className="text-[10px] text-foreground-subtle pt-2 border-t border-border">
                Kliknij w węzeł aby zobaczyć szczegóły
              </p>
            </div>
          } />
        </span>
      </CardHeader>
      <CardBody className="flex-1">
        <div>
          {topEntries.map((entry, i) => (
            <RankingItem
              key={entry.node_id}
              entry={entry}
              isFirst={i === 0}
            />
          ))}

          {ranking.length > showTop + 1 && (
            <Link href="/nodes" className="block py-3 text-center text-foreground-subtle text-sm hover:text-efficiency transition-colors">
              ... {ranking.length - showTop - 1} pozostałych węzłów ...
            </Link>
          )}

          {bottomEntry && bottomEntry.position !== showTop && (
            <RankingItem entry={bottomEntry} isLast />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
