import { ReactNode, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../ui/Toast';
import { Drawer } from '../ui/Drawer';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useMotionSafe } from '../../lib/motion';
import { cn } from '../../lib/utils';
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
  const location = useLocation();
  const { shouldReduce } = useMotionSafe();

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement).isContentEditable;

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
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-200',
          'lg:pl-[240px]',
          sidebarCollapsed && 'lg:pl-[68px]'
        )}
      >
        <Header />
        <main className="px-4 py-5 sm:px-6 lg:px-8 pb-24 lg:pb-10 min-h-[calc(100vh-3.5rem)] max-w-7xl mx-auto">
          <motion.div
            key={location.pathname}
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>

      <MobileNav />
      <CommandPalette />
      <ToastContainer />

      {/* Mobile menu drawer */}
      <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" size="sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-ink flex items-center justify-center text-canvas font-mono font-bold text-xs">
                SF
              </div>
              <span className="font-bold text-ink text-base">ShortForge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-md text-stone hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {mobileItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-coral-soft text-coral font-semibold'
                        : 'text-stone hover:bg-canvas-subtle hover:text-ink'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </Drawer>
    </div>
  );
}
