import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
  children?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className, children, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-10 px-6' : 'py-20 px-6', className)}>
      {Icon && (
        <div className="h-12 w-12 rounded-xl bg-surface-subtle border border-border/60 flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-text-muted" />
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-[13.5px] text-text-secondary max-w-sm leading-relaxed mb-5">{description}</p>
      <div className="flex items-center gap-2">
        {action && <Button onClick={action.onClick}>{action.label}</Button>}
        {secondaryAction && <Button variant="secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>}
      </div>
      {children}
    </div>
  );
}
