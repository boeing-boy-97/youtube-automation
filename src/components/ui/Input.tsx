import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-9 px-3 text-sm rounded-md', md: 'h-10 px-3.5 rounded-lg', lg: 'h-11 px-4 rounded-lg' };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, inputSize = 'md', id, ...props }, ref) => {
    const inputId = id || props.name;
    const base = 'w-full bg-surface text-[14px] text-text-primary placeholder:text-text-muted/70 border transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:bg-surface-subtle disabled:text-text-muted';
    return (
      <div className={className}>
        {label && <label htmlFor={inputId} className="block text-[12px] font-medium text-text-secondary mb-1.5 tracking-wide">{label}</label>}
        <div className="relative">
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              base,
              sizeMap[inputSize],
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-border'
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{rightIcon}</span>}
        </div>
        {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-text-muted">{hint}</p> : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
