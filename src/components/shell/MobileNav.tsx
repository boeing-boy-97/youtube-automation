import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/content', icon: FolderOpen, label: 'Content' },
    { to: '/create', icon: Plus, label: 'Create', primary: true },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: LayoutGrid, label: 'More' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-lg border-t border-border z-30 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
      {items.map(item => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.to) || (item.to === '/dashboard' && location.pathname === '/');
        if (item.primary) {
          return (
            <NavLink key={item.to} to={item.to} className="relative -mt-4">
              <div className="h-12 w-12 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(23,107,87,0.45)] active:scale-95 transition-transform">
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]',
              active ? 'text-accent' : 'text-text-muted'
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'stroke-[2.2px]')} />
            <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
