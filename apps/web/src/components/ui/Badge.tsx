import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'accent' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-surface-hover text-text-secondary border border-border/70',
  neutral: 'bg-surface-hover text-text-secondary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  error: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-soft text-accent',
};

const dotColorMap: Record<BadgeVariant, string> = {
  default: 'bg-text-muted',
  neutral: 'bg-text-muted',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  error: 'bg-danger',
  info: 'bg-info',
  accent: 'bg-accent',
};

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none tracking-wide', variantMap[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColorMap[variant])} />}
      {children}
    </span>
  );
}
