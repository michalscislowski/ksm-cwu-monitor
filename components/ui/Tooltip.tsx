'use client';

import { useState, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-[360px] max-w-[90vw]"
        >
          <div className="bg-surface-elevated border border-border rounded-lg shadow-xl p-4 text-sm">
            {content}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
            <div className="w-3 h-3 bg-surface-elevated border-r border-b border-border rotate-45 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}

// Info icon with tooltip
interface InfoTooltipProps {
  content: ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-foreground-subtle/20 text-foreground-subtle text-xs font-medium hover:bg-foreground-subtle/30 transition-colors cursor-help"
      >
        ?
      </button>
    </Tooltip>
  );
}
