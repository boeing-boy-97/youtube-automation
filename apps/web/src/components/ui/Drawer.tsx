import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
}

const sizes = { sm: 'w-80', md: 'w-96', lg: 'w-[32rem]', xl: 'w-[40rem]' };

export function Drawer({ open, onClose, children, side = 'right', size = 'md', title }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className={cn(
        'absolute top-0 bottom-0 bg-surface border-border shadow-xl flex flex-col animate-slide-in-right',
        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        sizes[size]
      )}>
        {title && (
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
