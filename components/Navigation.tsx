'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllAlerts } from '@/lib/data';

const navItems = [
  { href: '/dashboard', label: 'Przegląd', icon: DashboardIcon },
  { href: '/nodes', label: 'Węzły', icon: NodesIcon },
  { href: '/alerts', label: 'Alerty', icon: AlertsIcon },
  { href: '/docs', label: 'Dokumentacja', icon: DocsIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const alerts = getAllAlerts();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-semibold text-xs">KSM</span>
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">Monitor CWU</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const isAlerts = item.href === '/alerts';
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                      transition-colors duration-150
                      ${isActive
                        ? 'text-foreground bg-surface-hover'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isAlerts && activeAlerts > 0 && (
                      <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-critical text-white text-[11px] flex items-center justify-center font-medium">
                        {activeAlerts}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side - Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-border text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-foreground-muted">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isAlerts = item.href === '/alerts';
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-md min-w-[60px]
                  transition-colors duration-150
                  ${isActive
                    ? 'text-foreground'
                    : 'text-foreground-muted'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isAlerts && activeAlerts > 0 && (
                  <span className="absolute top-0 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-critical text-white text-[10px] flex items-center justify-center font-medium">
                    {activeAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Clean, consistent icon components (stroke-based, 1.5px width)
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function NodesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01" />
      <path d="M9 12v.01" />
      <path d="M9 15v.01" />
      <path d="M9 18v.01" />
    </svg>
  );
}

function AlertsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function DocsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}
