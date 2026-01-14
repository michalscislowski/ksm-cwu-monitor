'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Alert, AlertSeverity } from '@/lib/types';
import { getRelativeTime } from '@/lib/data';

interface AlertItemProps {
  alert: Alert;
}

function AlertItem({ alert }: AlertItemProps) {
  const severityConfig: Record<AlertSeverity, {
    icon: string;
    label: string;
    gradient: string;
    iconBg: string;
    textColor: string;
    borderColor: string;
  }> = {
    critical: {
      icon: '!',
      label: 'KRYTYCZNY',
      gradient: 'from-critical/10 via-critical/5 to-transparent',
      iconBg: 'bg-critical text-white shadow-lg shadow-critical/30',
      textColor: 'text-critical',
      borderColor: 'border-critical/40',
    },
    warning: {
      icon: '!',
      label: 'OSTRZEŻENIE',
      gradient: 'from-warning/10 via-warning/5 to-transparent',
      iconBg: 'bg-warning text-white shadow-lg shadow-warning/30',
      textColor: 'text-warning',
      borderColor: 'border-warning/40',
    },
    info: {
      icon: 'i',
      label: 'INFO',
      gradient: 'from-info/10 via-info/5 to-transparent',
      iconBg: 'bg-info text-white shadow-lg shadow-info/30',
      textColor: 'text-info',
      borderColor: 'border-info/40',
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <Link href={alert.node_id ? `/nodes/${alert.node_id}` : '#'}>
      <div
        className={`
          group relative overflow-hidden
          flex items-start gap-4 p-4
          bg-surface-elevated rounded-xl
          border ${config.borderColor}
          hover:border-opacity-80 hover:scale-[1.01]
          transition-all duration-200 cursor-pointer
        `}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`} />

        {/* Icon */}
        <div
          className={`
            relative z-10
            w-8 h-8 rounded-lg flex items-center justify-center
            text-sm font-bold flex-shrink-0
            ${config.iconBg}
          `}
        >
          {config.icon}
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
            <p className="text-success mb-1">✓</p>
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
