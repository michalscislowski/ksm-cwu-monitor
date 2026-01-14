'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CategoryBadge } from '@/components/ui/Badge';
import { InfoTooltip } from '@/components/ui/Tooltip';
import type { Benchmark } from '@/lib/types';

interface BenchmarkPanelProps {
  benchmark: Benchmark;
}

export function BenchmarkPanel({ benchmark }: BenchmarkPanelProps) {
  const { percentile, category } = benchmark;

  // Calculate position on the bar (0-100%)
  const position = percentile;

  return (
    <Card>
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 14V8M6 14V4M10 14V6M14 14V2" />
          </svg>
          Benchmark
          <InfoTooltip content={
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Benchmark — pozycja węzła</p>
              <div className="text-foreground-muted text-sm space-y-2">
                <p>
                  <span className="font-medium text-foreground">Co pokazuje percentyl?</span><br />
                  Percentyl określa pozycję węzła na tle wszystkich węzłów w sieci MEC.
                  Np. percentyl 75 oznacza, że węzeł jest lepszy od 75% innych węzłów.
                </p>
                <p>
                  <span className="font-medium text-foreground">Skala kolorów:</span><br />
                  • <span className="text-critical">Czerwony (0-33%)</span> — dolna tercja, wymaga poprawy<br />
                  • <span className="text-warning">Żółty (34-66%)</span> — średnia wydajność<br />
                  • <span className="text-success">Zielony (67-100%)</span> — górna tercja, dobra efektywność
                </p>
                <p>
                  <span className="font-medium text-foreground">Jak poprawić pozycję?</span><br />
                  Optymalizacja wskaźników operacyjnych (WWC, SH, ES) bezpośrednio
                  wpływa na pozycję w rankingu. Skup się na wskaźnikach ze statusem
                  „wymaga uwagi" lub „krytyczny".
                </p>
              </div>
            </div>
          } />
        </span>
      </CardHeader>
      <CardBody className="text-center">
        {/* Gradient bar */}
        <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-critical via-warning to-success mb-2">
          {/* Marker */}
          <div
            className="absolute top-0 w-1 h-full bg-foreground rounded-sm shadow-lg transform -translate-x-1/2 transition-all duration-700"
            style={{ left: `${position}%` }}
          >
            {/* Pointer */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-foreground" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-foreground-subtle mb-4">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* Percentile value */}
        <div className="py-4">
          <p className="text-5xl font-mono font-bold text-efficiency mb-1">
            {percentile}
          </p>
          <p className="text-foreground-muted text-sm">percentyl</p>
        </div>

        {/* Category */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-foreground-muted text-sm">Kategoria:</span>
          <CategoryBadge category={category} size="lg" showLabel />
        </div>

        {/* Description */}
        <p className="text-sm text-foreground-muted">
          {percentile < 50 ? (
            <>
              <span className="text-critical">{100 - percentile}%</span> podobnych węzłów
              w sieci MEC pracuje efektywniej
            </>
          ) : (
            <>
              Ten węzeł jest w <span className="text-success">górnych {100 - percentile}%</span>
              {' '}pod względem efektywności
            </>
          )}
        </p>
      </CardBody>
    </Card>
  );
}
