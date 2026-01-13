'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DeviationBar } from '@/components/ui/ProgressBar';
import type { Deviations } from '@/lib/types';

interface DeviationsPanelProps {
  deviations: Deviations;
}

const deviationLabels: Record<keyof Deviations, { label: string; notes: Record<string, string> }> = {
  delta_t: {
    label: 'ΔT (różnica temperatur)',
    notes: {
      ok: 'W normie',
      warning: 'Odbiega od optimum - sprawdź zawory MTCV',
      critical: 'Znacząco odbiega - wymaga interwencji',
    },
  },
  return_temp: {
    label: 'Temperatura powrotu',
    notes: {
      ok: 'W normie',
      warning: 'Podwyższona - możliwe straty ciepła',
      critical: 'Zbyt wysoka - pilna kontrola izolacji',
    },
  },
  flow_balance: {
    label: 'Przepływ cyrkulacji',
    notes: {
      ok: 'Zrównoważony',
      warning: 'Nierównomierny - sprawdź równoważenie',
      critical: 'Problem hydrauliczny - wymaga interwencji',
    },
  },
};

export function DeviationsPanel({ deviations }: DeviationsPanelProps) {
  return (
    <Card>
      <CardHeader dataSource="mec">
        <span className="flex items-center gap-2">
          <span className="text-efficiency">◎</span>
          Odchylenia od optimum
        </span>
      </CardHeader>
      <CardBody>
        {Object.entries(deviations).map(([key, deviation]) => {
          const config = deviationLabels[key as keyof Deviations];
          return (
            <DeviationBar
              key={key}
              label={config.label}
              value={deviation.percent_of_optimal}
              status={deviation.status}
              note={config.notes[deviation.status]}
            />
          );
        })}
      </CardBody>
    </Card>
  );
}
