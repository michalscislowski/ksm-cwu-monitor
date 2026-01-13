'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Alert, AlertSeverity } from '@/lib/types';
import { getRelativeTime, getSeverityBg } from '@/lib/data';

interface AlertItemProps {
  alert: Alert;
}

function AlertItem({ alert }: AlertItemProps) {
  const severityConfig: Record<AlertSeverity, { icon: string; borderColor: string }> = {
    critical: { icon: '!', borderColor: 'border-l-critical' },
    warning: { icon: '!', borderColor: 'border-l-warning' },
    info: { icon: 'i', borderColor: 'border-l-info' },
  };

  const config = severityConfig[alert.severity];

  return (
    <Link href={alert.node_id ? `/nodes/${alert.node_id}` : '#'}>
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg border-l-4
          ${config.borderColor}
          ${getSeverityBg(alert.severity)}
          hover:bg-opacity-30 transition-colors cursor-pointer
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            text-xs font-bold flex-shrink-0
            ${alert.severity === 'critical' ? 'bg-critical/20 text-critical' : ''}
            ${alert.severity === 'warning' ? 'bg-warning/20 text-warning' : ''}
            ${alert.severity === 'info' ? 'bg-info/20 text-info' : ''}
          `}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {alert.node_name && (
              <span className="text-foreground-muted">{alert.node_name} — </span>
            )}
            {alert.message}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {getRelativeTime(alert.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}

interface AlertsListProps {
  alerts: Alert[];
  maxItems?: number;
  showHeader?: boolean;
}

export function AlertsList({ alerts, maxItems = 5, showHeader = true }: AlertsListProps) {
  const displayAlerts = alerts.slice(0, maxItems);

  return (
    <Card className="animate-in stagger-2">
      {showHeader && (
        <CardHeader
          action={
            alerts.length > maxItems && (
              <Link
                href="/alerts"
                className="text-sm text-efficiency hover:text-efficiency/80 transition-colors"
              >
                Zobacz wszystkie →
              </Link>
            )
          }
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                alerts.some((a) => a.severity === 'critical')
                  ? 'bg-critical animate-pulse'
                  : 'bg-warning'
              }`}
            />
            Aktywne alerty
          </span>
        </CardHeader>
      )}
      <CardBody>
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-foreground-muted">
            <p className="text-success mb-1">✓</p>
            <p>Brak aktywnych alertów</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
