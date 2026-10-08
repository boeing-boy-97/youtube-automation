import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Crumb { label: string; to?: string; }

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  className?: string;
}

export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-[12px] text-text-muted mb-2">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-muted/50">/</span>}
              <span className={cn(i === breadcrumbs.length - 1 ? 'text-text-secondary' : 'hover:text-text-primary cursor-pointer')}>{c.label}</span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-page-title text-text-primary">{title}</h1>
          {description && <p className="text-[14px] text-text-secondary mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
