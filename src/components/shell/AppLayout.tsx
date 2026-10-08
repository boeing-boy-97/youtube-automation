import { ReactNode, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../ui/Toast';
import { Drawer } from '../ui/Drawer';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  FolderOpen,
  Plus,
  ListTodo,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  X,
  Bell,
  Palette,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const mobileItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/content', icon: FolderOpen, label: 'Content' },
  { to: '/create', icon: Plus, label: 'Create' },
  { to: '/queue', icon: ListTodo, label: 'Queue' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/automation', icon: Zap, label: 'Automation' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/brand-kit', icon: Palette, label: 'Brand Kit' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help' },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, openCommandPalette } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;

      // Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (isInput) return;

      // Single key shortcuts
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        navigate('/create');
      }
      if (e.key === '/') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, openCommandPalette, mobileMenuOpen, setMobileMenuOpen]);

  if (!isAuthenticated) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        'transition-all duration-200',
        'lg:pl-[252px]',
        sidebarCollapsed && 'lg:pl-[72px]'
      )}>
        <Header />
        <main className={cn('px-4 py-5 sm:px-6 lg:px-8 pb-24 lg:pb-10 min-h-[calc(100vh-4rem)] max-w-[1440px] mx-auto')}>
          {children || <Outlet />}
        </main>
      </div>

      <MobileNav />
      <CommandPalette />
      <ToastContainer />

      {/* Mobile menu drawer */}
      <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" size="sm">
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border">
            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-text-primary text-lg">ShortForge</span>
            <button onClick={() => setMobileMenuOpen(false)} className="ml-auto text-text-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {mobileItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </Drawer>
    </div>
  );
}
