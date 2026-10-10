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

const sizeMap = {
  sm: 'h-8 px-2.5 text-xs rounded-md',
  md: 'h-9 px-3 text-xs rounded-md',
  lg: 'h-10 px-3.5 text-sm rounded-md',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, hint, error, leftIcon, rightIcon, inputSize = 'md', id, ...props },
    ref
  ) => {
    const inputId = id || props.name;
    const base =
      'w-full bg-surface text-ink placeholder:text-stone-muted border transition-all duration-150 focus:outline-none focus:border-vermilion focus:ring-1 focus:ring-vermilion/20 disabled:bg-canvas-subtle disabled:text-stone-muted';
    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-stone mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              base,
              sizeMap[inputSize],
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-[11px] text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-[11px] text-stone-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
