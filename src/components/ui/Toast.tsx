import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore();

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-surface border border-border rounded-lg shadow-lg p-4 flex items-start gap-3"
            >
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', colors[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{toast.title}</p>
                {toast.message && <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => dismissToast(toast.id)} className="text-text-muted hover:text-text-primary transition-colors shrink-0" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
