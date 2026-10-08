import { cn } from '../../lib/utils';
import { ContentStatus } from '../../types/content';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' }> = {
  idea: { label: 'Idea', variant: 'neutral' },
  draft: { label: 'Draft', variant: 'neutral' },
  script_ready: { label: 'Script', variant: 'info' },
  voice_ready: { label: 'Voice', variant: 'info' },
  visuals_ready: { label: 'Visuals', variant: 'info' },
  rendering: { label: 'Rendering', variant: 'warning' },
  rendered: { label: 'Rendered', variant: 'info' },
  quality_check: { label: 'QC', variant: 'warning' },
  review: { label: 'Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  scheduled: { label: 'Scheduled', variant: 'accent' },
  publishing: { label: 'Publishing', variant: 'warning' },
  published: { label: 'Published', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
};

export function StatusBadge({ status, className }: { status: ContentStatus | string; className?: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, variant: 'neutral' as const };
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none tracking-wide',
      cfg.variant === 'success' && 'bg-success-soft text-success',
      cfg.variant === 'warning' && 'bg-warning-soft text-warning',
      cfg.variant === 'danger' && 'bg-danger-soft text-danger',
      cfg.variant === 'info' && 'bg-info-soft text-info',
      cfg.variant === 'accent' && 'bg-accent-soft text-accent',
      cfg.variant === 'neutral' && 'bg-surface-hover text-text-secondary border border-border/70',
      className
    )}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        cfg.variant === 'success' && 'bg-success',
        cfg.variant === 'warning' && 'bg-warning',
        cfg.variant === 'danger' && 'bg-danger',
        cfg.variant === 'info' && 'bg-info',
        cfg.variant === 'accent' && 'bg-accent',
        cfg.variant === 'neutral' && 'bg-text-muted',
      )} />
      {cfg.label}
    </span>
  );
}
