'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 380;
      const panelHeight = 400;
      const padding = 16;

      // Check if panel fits to the right
      const fitsRight = rect.right + panelWidth + padding < window.innerWidth;
      // Check if panel fits below
      const fitsBelow = rect.bottom + panelHeight + padding < window.innerHeight;

      let top: number;
      let left: number;

      if (window.innerWidth < 640) {
        // Mobile: bottom sheet mode - handled separately
        top = 0;
        left = 0;
      } else if (fitsRight) {
        // Desktop: position to the right
        top = Math.max(padding, Math.min(rect.top - 20, window.innerHeight - panelHeight - padding));
        left = rect.right + 12;
      } else {
        // Fallback: position below
        top = rect.bottom + 12;
        left = Math.max(padding, Math.min(rect.left - panelWidth / 2, window.innerWidth - panelWidth - padding));
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

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
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center justify-center w-5 h-5
          rounded-full text-xs font-semibold font-mono
          transition-all duration-200
          ${isOpen
            ? 'bg-efficiency text-background ring-2 ring-efficiency/30'
            : 'bg-foreground-subtle/20 text-foreground-muted hover:bg-efficiency/20 hover:text-efficiency'
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Panel */}
          <div
            ref={panelRef}
            className={`
              fixed z-[101]
              ${isMobile
                ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl animate-in slide-in-from-bottom duration-300'
                : 'w-[380px] max-h-[80vh] rounded-xl animate-in fade-in slide-in-from-left-2 duration-200'
              }
              bg-surface-elevated/95 backdrop-blur-xl
              border border-border
              shadow-2xl shadow-black/50
              overflow-hidden
              flex flex-col
            `}
            style={!isMobile ? { top: position.top, left: position.left } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-efficiency animate-pulse" />
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Informacja techniczna
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Zamknij"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-4">
                {content}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-border-subtle bg-surface/30">
              <p className="text-xs text-foreground-subtle text-center">
                Kliknij poza panel lub naciśnij <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px]">ESC</kbd> aby zamknąć
              </p>
            </div>
          </div>

          {/* Desktop: connecting line */}
          {!isMobile && triggerRef.current && (
            <svg
              className="fixed z-[100] pointer-events-none animate-in fade-in duration-200"
              style={{
                top: triggerRef.current.getBoundingClientRect().top + triggerRef.current.offsetHeight / 2 - 10,
                left: triggerRef.current.getBoundingClientRect().right - 2,
                width: 20,
                height: 20,
              }}
            >
              <path
                d="M 2 10 L 18 10"
                stroke="var(--color-efficiency)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <circle
                cx="2"
                cy="10"
                r="3"
                fill="var(--color-efficiency)"
                opacity="0.5"
              />
            </svg>
          )}
        </>,
        document.body
      )}
    </>
  );
}

// Re-export for backwards compatibility
export const Tooltip = InfoTooltip;
