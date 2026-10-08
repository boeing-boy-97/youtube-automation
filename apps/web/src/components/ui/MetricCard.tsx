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
    <div className={cn('card p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        {Icon ? (
          <div className="h-8 w-8 rounded-lg bg-surface-subtle flex items-center justify-center">
            <Icon className="h-4 w-4 text-text-muted" />
          </div>
        ) : <div />}
        {sparkline && <Sparkline data={sparkline} width={72} height={24} />}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[12px] text-text-secondary">{label}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={cn(
            'text-[11px] font-medium tabular-nums',
            positive ? 'text-success' : negative ? 'text-danger' : 'text-text-muted'
          )}>
            {positive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
