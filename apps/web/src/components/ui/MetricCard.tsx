import { cn } from '../../lib/utils';
import { Sparkline } from './Sparkline';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  sparkline?: number[];
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, sparkline, className }: MetricCardProps) {
  const positive = trend !== undefined && trend > 0;
  const negative = trend !== undefined && trend < 0;
  return (
    <div className={cn('studio-card p-4 space-y-2', className)}>
      <div className="flex items-start justify-between">
        {Icon ? (
          <div className="h-8 w-8 rounded-md bg-canvas-subtle border border-border flex items-center justify-center">
            <Icon className="h-4 w-4 text-stone" />
          </div>
        ) : (
          <div />
        )}
        {sparkline && <Sparkline data={sparkline} width={72} height={24} />}
      </div>
      <div className="text-xl font-bold tracking-tight text-ink">{value}</div>
      <div className="flex items-center justify-between text-xs text-stone pt-0.5">
        <span className="truncate">{label}</span>
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              'font-mono text-[11px] font-semibold tabular-nums',
              positive ? 'text-green' : negative ? 'text-danger' : 'text-stone-muted'
            )}
          >
            {positive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
