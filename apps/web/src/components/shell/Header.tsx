import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useContentStore } from '../../stores/contentStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  Plus,
  Zap,
  Command,
  Play as YoutubeIcon,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_TITLES: Record<string, { title?: string; subtitle?: string }> = {
  '/dashboard': { subtitle: 'Your content engine is healthy' },
  '/ideas': { title: 'Ideas', subtitle: 'Discover, generate and refine content concepts' },
  '/content': { title: 'Content Library', subtitle: 'Manage your entire production pipeline' },
  '/create': { title: 'Create Content', subtitle: 'Guided production workspace' },
  '/queue': { title: 'Production Queue', subtitle: 'Active jobs and rendering progress' },
  '/calendar': { title: 'Calendar', subtitle: 'Schedule and publishing plan' },
  '/templates': { title: 'Templates', subtitle: 'Reusable content frameworks' },
  '/assets': { title: 'Assets', subtitle: 'Images, video, audio and brand files' },
  '/automation': { title: 'Automation', subtitle: 'Control your autonomous content engine' },
  '/workflow': { title: 'Workflow', subtitle: 'Design your content pipeline' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance intelligence' },
  '/youtube': { title: 'YouTube', subtitle: 'Channel management' },
  '/notifications': { title: 'Notifications' },
  '/brand-kit': { title: 'Brand Kit', subtitle: 'Consistent visual identity' },
  '/settings': { title: 'Settings', subtitle: 'Workspace and configuration' },
  '/help': { title: 'Help Center', subtitle: 'Documentation and guides' },
  '/script-lab': { title: 'Script Lab', subtitle: 'Professional writing environment' },
  '/studio': { title: 'Video Studio', subtitle: 'Edit, preview and finalize' },
};

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme, openCommandPalette, setMobileMenuOpen, sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();
  const unreadCount = useContentStore(s => s.getUnreadCount());
  const youtube = useWorkspaceStore(s => s.youtubeChannel);
  const workspace = useWorkspaceStore(s => s.workspace);
  const failedCount = useContentStore(s => s.items.filter(i => i.status === 'failed').length);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  let currentPage: { title: string; subtitle?: string } = { title: 'ShortForge' };
  for (const [path, info] of Object.entries(PAGE_TITLES)) {
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      if (location.pathname === '/dashboard') {
        currentPage = { title: `${greeting}, ${user?.name?.split(' ')[0] || 'Creator'}`, subtitle: info.subtitle };
      } else {
        currentPage = { title: info.title || path.split('/').pop() || '', subtitle: info.subtitle };
      }
      break;
    }
  }

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const pageTitle = isDashboard ? currentPage.title : currentPage.title;
  const showSubtitle = !isDashboard || location.pathname === '/dashboard';

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
      <div className="h-full flex items-center px-5 lg:px-8 gap-4">
        {/* Mobile menu */}
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden -ml-2 h-9 w-9 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-secondary" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title area */}
        <div className="flex-1 min-w-0">
          <h1 className={cn(
            'font-bold tracking-tight text-text-primary truncate',
            isDashboard ? 'text-[22px] lg:text-[26px]' : 'text-[22px] lg:text-[24px]'
          )}>
            {pageTitle}
          </h1>
          {showSubtitle && currentPage.subtitle && (
            <p className="text-[13px] text-text-secondary hidden sm:block truncate mt-0.5">{currentPage.subtitle}</p>
          )}
        </div>

        {/* Status chips (desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          {workspace?.automationMode === 'autonomous' && (
            <Badge variant="success" dot className="hidden lg:inline-flex"><Zap className="h-3 w-3" />Autonomous</Badge>
          )}
          {failedCount > 0 && (
            <Tooltip content={`${failedCount} failed job${failedCount > 1 ? 's' : ''}`}>
              <Badge variant="danger" className="cursor-pointer hidden lg:inline-flex"><AlertCircle className="h-3 w-3" />{failedCount} failed</Badge>
            </Tooltip>
          )}
        </div>

        {/* Search command */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-2 text-[13px] text-text-muted bg-surface-subtle hover:bg-surface-hover rounded-lg px-3 h-9 border border-border/70 transition-colors w-[240px]"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left truncate">Search or run command...</span>
          <kbd className="text-[10px] text-text-muted bg-surface border border-border rounded px-1.5 py-0.5 flex items-center font-mono">
            <Command className="h-2.5 w-2.5 mr-0.5" />K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip content="Quick search (/)">
            <button onClick={openCommandPalette} className="btn-icon md:hidden" aria-label="Search"><Search className="h-[18px] w-[18px]" /></button>
          </Tooltip>

          <Tooltip content="Create content (C)">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/create'} className="hidden sm:flex">
              <Plus className="h-[18px] w-[18px]" />
            </Button>
          </Tooltip>

          <Tooltip content="Toggle theme">
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </Tooltip>

          <Tooltip content={youtube?.connectionStatus === 'connected' ? 'YouTube connected' : 'Connect YouTube'}>
            <button className="btn-icon hidden sm:flex" onClick={() => window.location.href = '/youtube'} aria-label="YouTube">
              <YoutubeIcon className={cn('h-[18px] w-[18px]', youtube?.connectionStatus === 'connected' ? 'text-success' : 'text-text-muted')} />
            </button>
          </Tooltip>

          <Tooltip content="Notifications">
            <button onClick={() => window.location.href = '/notifications'} className="btn-icon relative">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-danger text-white text-[9px] font-semibold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <NavLink to="/settings" className="ml-1">
            <Avatar name={user?.name || 'User'} size="sm" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
