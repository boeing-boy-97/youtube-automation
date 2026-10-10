import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColor(name: string): string {
  const colors = ['bg-ink', 'bg-vermilion', 'bg-moss', 'bg-stone', 'bg-ink-pure'];
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-md object-cover', sizeClasses[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-md flex items-center justify-center font-bold text-white font-mono',
        sizeClasses[size],
        getColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
