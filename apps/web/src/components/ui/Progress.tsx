import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  size?: 'sm' | 'md';
}

export function Progress({ value, className, indicatorClassName, size = 'md' }: ProgressProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-surface-hover', size === 'sm' ? 'h-1' : 'h-1.5', className)}>
      <div
        className={cn('h-full bg-accent rounded-full transition-[width] duration-300 ease-out', indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
