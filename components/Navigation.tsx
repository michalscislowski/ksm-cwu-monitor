'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllAlerts } from '@/lib/data';

const navItems = [
  { href: '/dashboard', label: 'Przegląd' },
  { href: '/nodes', label: 'Węzły' },
  { href: '/alerts', label: 'Alerty' },
];

export function Navigation() {
  const pathname = usePathname();
  const alerts = getAllAlerts();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return (
    <>
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-efficiency to-info flex items-center justify-center shadow-lg shadow-efficiency/20 group-hover:shadow-efficiency/40 transition-shadow">
                <span className="text-white font-bold text-sm">KSM</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground leading-tight">
                  Monitor CWU
                </h1>
                <p className="text-xs text-foreground-subtle leading-tight">
                  KSM Przylesie
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const isAlerts = item.href === '/alerts';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'text-efficiency bg-efficiency/10'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                      }
                    `}
                  >
                    {item.label}
                    {isAlerts && activeAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-critical text-white text-xs flex items-center justify-center font-bold animate-pulse">
                        {activeAlerts}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-efficiency rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border-subtle">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-foreground-muted">System aktywny</span>
              </div>

              {/* Time */}
              <div className="text-xs text-foreground-subtle hidden lg:block">
                {new Date().toLocaleDateString('pl-PL', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-subtle z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isAlerts = item.href === '/alerts';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg
                  ${isActive ? 'text-efficiency' : 'text-foreground-muted'}
                `}
              >
                <span className="text-lg">
                  {item.href === '/dashboard' && '📊'}
                  {item.href === '/nodes' && '🏢'}
                  {item.href === '/alerts' && '🔔'}
                </span>
                <span className="text-xs">{item.label}</span>
                {isAlerts && activeAlerts > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-critical text-white text-[10px] flex items-center justify-center font-bold">
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
