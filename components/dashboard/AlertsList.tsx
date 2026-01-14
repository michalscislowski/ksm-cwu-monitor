'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Alert, AlertSeverity } from '@/lib/types';
import { getRelativeTime } from '@/lib/data';

interface AlertItemProps {
  alert: Alert;
}

// SVG icons for alert severity
function AlertIcon({ severity, className }: { severity: AlertSeverity; className?: string }) {
  if (severity === 'critical' || severity === 'warning') {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 5v4M8 11v.01" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v4M8 11v.01" />
    </svg>
  );
}

function AlertItem({ alert }: AlertItemProps) {
  const severityConfig: Record<AlertSeverity, {
    label: string;
    iconBg: string;
    textColor: string;
    borderColor: string;
  }> = {
    critical: {
      label: 'KRYTYCZNY',
      iconBg: 'bg-critical text-white',
      textColor: 'text-critical',
      borderColor: 'border-critical/30',
    },
    warning: {
      label: 'OSTRZEŻENIE',
      iconBg: 'bg-warning text-white',
      textColor: 'text-warning',
      borderColor: 'border-warning/30',
    },
    info: {
      label: 'INFO',
      iconBg: 'bg-info text-white',
      textColor: 'text-info',
      borderColor: 'border-info/30',
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <Link href={alert.node_id ? `/nodes/${alert.node_id}` : '#'}>
      <div
        className={`
          group relative
          flex items-start gap-3 p-4
          bg-surface-elevated rounded-lg
          border ${config.borderColor}
          hover:border-foreground-subtle
          transition-colors duration-150 cursor-pointer
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-7 h-7 rounded-md flex items-center justify-center
            flex-shrink-0
            ${config.iconBg}
          `}
        >
          <AlertIcon severity={alert.severity} className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold tracking-wider ${config.textColor}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-foreground-subtle">
              • {getRelativeTime(alert.created_at)}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">
            {alert.node_name && (
              <span className="text-foreground-muted font-normal">{alert.node_name} — </span>
            )}
            {alert.message}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="relative z-10 self-center text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity">
          →
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
          dataSource="mec"
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
            <svg className="w-6 h-6 text-success mx-auto mb-2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l4 4 6-8" />
            </svg>
            <p>Brak aktywnych alertów</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AlertItem alert={alert} />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
