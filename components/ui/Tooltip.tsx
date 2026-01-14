'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoPanelProps {
  content: ReactNode;
  children?: ReactNode;
}

export function InfoTooltip({ content }: InfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 640);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const panelWidth = 380;
    const panelHeight = 400;
    const padding = 16;

    if (window.innerWidth < 640) {
      // Mobile: bottom sheet mode
      setPosition({ top: 0, left: 0 });
    } else {
      // Desktop positioning
      const fitsRight = rect.right + panelWidth + padding < window.innerWidth;

      let top: number;
      let left: number;

      if (fitsRight) {
        top = Math.max(padding, Math.min(rect.top - 20, window.innerHeight - panelHeight - padding));
        left = rect.right + 12;
      } else {
        top = rect.bottom + 12;
        left = Math.max(padding, Math.min(rect.left - panelWidth / 2, window.innerWidth - panelWidth - padding));
      }

      setPosition({ top, left });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Prevent scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handlePanelMouseEnter = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePanelMouseLeave = () => {
    if (isMobile) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isMobile && setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          inline-flex items-center justify-center w-4 h-4
          rounded-full text-[10px] font-medium
          transition-colors duration-150
          ${isOpen
            ? 'bg-primary text-white'
            : 'bg-surface-hover text-foreground-muted hover:bg-surface-active hover:text-foreground'
          }
        `}
        aria-expanded={isOpen}
        aria-label="Pokaż informacje"
      >
        ?
      </button>

      {/* Panel */}
      {isMounted && isOpen && createPortal(
        <>
          {/* Mobile: backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
              style={{ animation: 'fadeIn 0.2s ease-out' }}
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Panel */}
          <div
            ref={panelRef}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
            className={`
              fixed z-[101]
              ${isMobile
                ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl'
                : 'w-[380px] max-h-[80vh] rounded-xl'
              }
              bg-surface-elevated backdrop-blur-xl
              border border-border
              shadow-xl
              overflow-hidden
              flex flex-col
            `}
            style={{
              ...(isMobile ? {} : { top: position.top, left: position.left }),
              animation: isMobile
                ? 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide">
                  Informacja
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors btn-press"
                aria-label="Zamknij"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l10 10M11 1L1 11" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-4 text-sm">
                {content}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-5 py-2.5 border-t border-border-subtle bg-surface/30">
              <p className="text-[11px] text-foreground-subtle text-center">
                {isMobile ? (
                  'Dotknij poza panel aby zamknąć'
                ) : (
                  <>
                    Naciśnij{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px]">
                      ESC
                    </kbd>
                    {' '}aby zamknąć
                  </>
                )}
              </p>
            </div>
          </div>

        </>,
        document.body
      )}
    </>
  );
}

// Re-export for backwards compatibility
export const Tooltip = InfoTooltip;

// Simple hover tooltip for small hints
interface SimpleTooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function SimpleTooltip({ content, children, position = 'top' }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = position === 'top' ? rect.top - 8 : rect.bottom + 8;
        setCoords({ x, y });
        setIsVisible(true);
      }
    }, 400);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>
      {mounted && isVisible && createPortal(
        <div
          className="fixed z-[200] px-2.5 py-1.5 text-xs font-medium text-foreground bg-surface-elevated border border-border rounded-lg shadow-lg pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y,
            transform: `translate(-50%, ${position === 'top' ? '-100%' : '0'})`,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
