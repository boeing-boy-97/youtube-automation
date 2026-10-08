import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  subtle?: boolean;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, interactive, subtle, hover, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      subtle ? 'bg-surface-subtle border border-border/70 rounded-xl' : 'bg-surface border border-border rounded-xl',
      hover && 'hover:border-border-strong hover:shadow-sm transition-all duration-150',
      interactive && 'hover:border-border-strong hover:shadow-sm transition-all duration-150 cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ className, title, subtitle, action, children, ...props }: CardHeaderProps) {
  if (children) {
    return <div className={cn('px-5 py-4', className)} {...props}>{children}</div>;
  }
  return (
    <div className={cn('px-5 pt-4 pb-2 flex items-start justify-between gap-4', className)} {...props}>
      <div className="min-w-0">
        {title && <h3 className="text-[14px] font-semibold text-text-primary leading-snug">{title}</h3>}
        {subtitle && <p className="text-[12px] text-text-secondary mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-3.5 border-t border-border bg-surface-subtle/30 rounded-b-xl flex items-center justify-end gap-2', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[14px] font-semibold text-text-primary leading-snug', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[12px] text-text-secondary mt-1 leading-relaxed', className)} {...props}>{children}</p>;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border', className)} />;
}
