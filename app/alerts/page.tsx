import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAllAlerts, getRelativeTime, getSeverityBg } from '@/lib/data';
import type { Alert, AlertSeverity } from '@/lib/types';

function AlertCard({ alert }: { alert: Alert }) {
  const severityConfig: Record<AlertSeverity, { label: string; icon: string }> = {
    critical: { label: 'Krytyczny', icon: '⚠️' },
    warning: { label: 'Ostrzeżenie', icon: '⚡' },
    info: { label: 'Informacja', icon: 'ℹ️' },
  };

  const config = severityConfig[alert.severity];

  return (
    <Link href={alert.node_id ? `/nodes/${alert.node_id}` : '#'}>
      <Card hover className="animate-in">
        <CardBody>
          <div className="flex items-start gap-4">
            {/* Severity icon */}
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0
                ${alert.severity === 'critical' ? 'bg-critical/20' : ''}
                ${alert.severity === 'warning' ? 'bg-warning/20' : ''}
                ${alert.severity === 'info' ? 'bg-info/20' : ''}
              `}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-foreground">
                  {alert.message}
                </p>
                <Badge
                  variant={
                    alert.severity === 'critical'
                      ? 'critical'
                      : alert.severity === 'warning'
                      ? 'warning'
                      : 'info'
                  }
                  size="sm"
                >
                  {config.label}
                </Badge>
              </div>

              {alert.node_name && (
                <p className="text-sm text-foreground-muted mb-2">
                  Węzeł: <span className="text-efficiency">{alert.node_name}</span>
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                <span>{getRelativeTime(alert.created_at)}</span>
                <span>•</span>
                <span className={alert.status === 'active' ? 'text-warning' : 'text-success'}>
                  {alert.status === 'active' ? 'Aktywny' : 'Potwierdzony'}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function AlertsPage() {
  const alerts = getAllAlerts();

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="text-2xl font-bold text-foreground">Centrum alertów</h1>
        <p className="text-foreground-muted mt-1">
          {alerts.length} alert{alerts.length !== 1 ? 'ów' : ''} w systemie
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-in stagger-1">
        <Card className={criticalCount > 0 ? 'border-critical/30' : ''}>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold font-mono text-critical">{criticalCount}</p>
            <p className="text-xs text-foreground-muted mt-1">Krytycznych</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold font-mono text-warning">{warningCount}</p>
            <p className="text-xs text-foreground-muted mt-1">Ostrzeżeń</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold font-mono text-info">{infoCount}</p>
            <p className="text-xs text-foreground-muted mt-1">Informacyjnych</p>
          </CardBody>
        </Card>
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">✓</span>
              <h3 className="text-lg font-semibold text-success mb-2">
                Brak aktywnych alertów
              </h3>
              <p className="text-foreground-muted">
                Wszystkie węzły pracują prawidłowo
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              <AlertCard alert={alert} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
