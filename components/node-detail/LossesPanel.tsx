'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Losses } from '@/lib/types';

interface LossesPanelProps {
  losses: Losses;
}

interface LossItemProps {
  label: string;
  value: number;
}

function LossItem({ label, value }: LossItemProps) {
  const isPositive = value < 0; // Negative loss = improvement
  const displayValue = value > 0 ? `+${value}%` : `${value}%`;

  return (
    <div className="flex justify-between items-center py-3 border-b border-border-subtle last:border-b-0">
      <span className="text-foreground-muted">{label}</span>
      <span
        className={`
          text-xl font-mono font-bold
          ${isPositive ? 'text-success' : 'text-critical'}
        `}
      >
        {displayValue}
      </span>
    </div>
  );
}

export function LossesPanel({ losses }: LossesPanelProps) {
  return (
    <Card>
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          <span className="text-warning">⚡</span>
          Straty szacunkowe
        </span>
      </CardHeader>
      <CardBody>
        <LossItem label="vs optimum" value={losses.vs_optimal_percent} />
        <LossItem label="vs poprzedni tydzień" value={losses.vs_last_week_percent} />
        <LossItem label="vs rok temu" value={losses.vs_last_year_percent} />

        <div className="mt-4 p-3 bg-surface-elevated rounded-lg text-xs text-foreground-subtle">
          <p>
            <span className="text-success">Ujemna wartość</span> = poprawa (oszczędność)
          </p>
          <p className="mt-1">
            <span className="text-critical">Dodatnia wartość</span> = straty (wyższe zużycie)
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
