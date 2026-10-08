import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' };

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getColor(name: string): string {
  const colors = ['bg-emerald-700', 'bg-teal-700', 'bg-cyan-800', 'bg-slate-700', 'bg-stone-700', 'bg-emerald-800'];
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size], className)} />;
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-medium text-white', sizeClasses[size], getColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}
