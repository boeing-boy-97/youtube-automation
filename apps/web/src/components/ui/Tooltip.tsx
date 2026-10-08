import { useState, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  shortcut?: string;
}

export function Tooltip({ content, children, side = 'top', shortcut }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [delay, setDelay] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    const t = setTimeout(() => setShow(true), 300);
    setDelay(t);
  };
  const handleLeave = () => {
    if (delay) clearTimeout(delay);
    setShow(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave} onFocus={handleEnter} onBlur={handleLeave}>
      {children}
      {show && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 rounded-md bg-text-primary text-white text-xs whitespace-nowrap pointer-events-none shadow-md animate-fade-in',
            positions[side]
          )}
        >
          {content}
          {shortcut && <span className="ml-2 text-white/50 font-mono text-[10px]">{shortcut}</span>}
        </div>
      )}
    </span>
  );
}
