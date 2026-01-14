'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllAlerts } from '@/lib/data';

const navItems = [
  { href: '/dashboard', label: 'Przegląd' },
  { href: '/nodes', label: 'Węzły' },
  { href: '/alerts', label: 'Alerty' },
  { href: '/docs', label: 'Dokumentacja' },
];

export function Navigation() {
  const pathname = usePathname();
  const alerts = getAllAlerts();
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  return (
    <>
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-efficiency via-efficiency to-info flex items-center justify-center shadow-lg shadow-efficiency/30 group-hover:shadow-efficiency/50 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-sm tracking-tight">KSM</span>
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="transition-transform group-hover:translate-x-0.5 duration-300">
                <h1 className="font-semibold text-foreground leading-tight tracking-tight">
                  Monitor CWU
                </h1>
                <p className="text-xs text-foreground-subtle leading-tight">
                  KSM Przylesie
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-surface-elevated/50">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const isAlerts = item.href === '/alerts';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'text-efficiency bg-efficiency/15 shadow-sm shadow-efficiency/20'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                      }
                    `}
                  >
                    {item.label}
                    {isAlerts && activeAlerts > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-critical to-red-600 text-white text-xs flex items-center justify-center font-bold shadow-lg shadow-critical/40 animate-pulse">
                        {activeAlerts}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-efficiency to-transparent rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-success/20 shadow-inner">
                <span className="relative w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                  <span className="relative block w-2 h-2 rounded-full bg-success" />
                </span>
                <span className="text-xs text-success font-medium">Online</span>
              </div>

              {/* Version badge */}
              <div className="hidden lg:block text-[10px] text-foreground-subtle font-mono px-2 py-1 rounded bg-surface-elevated/50 border border-border-subtle">
                v3.2
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border-subtle z-50 pb-safe">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isAlerts = item.href === '/alerts';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'text-efficiency bg-efficiency/10'
                    : 'text-foreground-muted active:scale-95'
                  }
                `}
              >
                <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.href === '/dashboard' && '📊'}
                  {item.href === '/nodes' && '🏢'}
                  {item.href === '/alerts' && '🔔'}
                  {item.href === '/docs' && '📄'}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-efficiency' : ''}`}>
                  {item.label}
                </span>
                {isAlerts && activeAlerts > 0 && (
                  <span className="absolute top-0.5 right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-critical to-red-600 text-white text-[9px] flex items-center justify-center font-bold shadow-md shadow-critical/30">
                    {activeAlerts}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-efficiency" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
