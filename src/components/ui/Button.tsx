import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeMap: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-8 w-8 p-0 rounded-md',
};

const variantMap: Record<Variant, string> = {
  primary: 'bg-accent text-accent-contrast hover:bg-accent-hover shadow-sm',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong shadow-xs',
  tertiary: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover px-3',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover px-2.5 h-9 rounded-md text-sm',
  danger: 'bg-danger text-white hover:opacity-90 shadow-sm',
  outline: 'bg-transparent text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg whitespace-nowrap select-none',
          'transition-all duration-150 ease-out will-change-transform',
          'disabled:opacity-40 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:scale-[0.98]',
          variantMap[variant],
          sizeMap[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
