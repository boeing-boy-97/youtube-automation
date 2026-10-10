import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useContentStore } from '../../stores/contentStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_TITLES: Record<string, { title?: string; subtitle?: string }> = {
  '/dashboard': { subtitle: 'Creative Studio command center' },
  '/ideas': { title: 'Ideas', subtitle: 'Discover, score, and refine vertical video concepts' },
  '/content': { title: 'Content Library', subtitle: 'Manage your entire vertical production catalogue' },
  '/create': { title: 'Create Short', subtitle: 'Guided script-to-screen production workspace' },
  '/queue': { title: 'Production Queue', subtitle: 'Active background workers and FFmpeg jobs' },
  '/calendar': { title: 'Publishing Calendar', subtitle: 'Scheduled slots and YouTube delivery cadence' },
  '/templates': { title: 'Templates', subtitle: 'Reusable 3-act vertical frameworks' },
  '/assets': { title: 'Assets & Media', subtitle: 'Scene graphics, audio stems, and brand files' },
  '/automation': { title: 'Automation Rules', subtitle: 'Configure assisted and autonomous publishing limits' },
  '/workflow': { title: 'Workflow Engine', subtitle: 'State-machine pipeline definitions' },
  '/analytics': { title: 'Analytics', subtitle: 'Audience retention and performance intelligence' },
  '/youtube': { title: 'YouTube Channel', subtitle: 'Google OAuth v3 connection & upload status' },
  '/notifications': { title: 'Notifications' },
  '/brand-kit': { title: 'Brand Kit', subtitle: 'Typography presets, safe zones, and palettes' },
  '/settings': { title: 'Settings', subtitle: 'Workspace members, credentials, and API keys' },
  '/help': { title: 'Documentation & Guides', subtitle: 'Architecture guides and studio tutorials' },
  '/script-lab': { title: 'Script Lab', subtitle: '3-Act vertical screenplay drafting' },
  '/studio': { title: 'Video Studio', subtitle: 'Multi-track timeline preview and subtitle safe zones' },
};

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme, openCommandPalette, setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const unreadCount = useContentStore((s) => s.getUnreadCount());
  const youtube = useWorkspaceStore((s) => s.youtubeChannel);
  const workspace = useWorkspaceStore((s) => s.workspace);
  const failedCount = useContentStore((s) => s.items.filter((i) => i.status === 'failed').length);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  let currentPage: { title: string; subtitle?: string } = { title: 'ShortForge Studio' };
  for (const [path, info] of Object.entries(PAGE_TITLES)) {
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      if (location.pathname === '/dashboard') {
        currentPage = {
          title: `${greeting}, ${user?.name?.split(' ')[0] || 'Creator'}`,
          subtitle: info.subtitle,
        };
      } else {
        currentPage = { title: info.title || path.split('/').pop() || '', subtitle: info.subtitle };
      }
      break;
    }
  }

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const showSubtitle = !isDashboard || location.pathname === '/dashboard';

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-20">
      <div className="h-full flex items-center px-4 sm:px-6 lg:px-8 gap-4 justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-canvas-subtle text-stone"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="font-bold tracking-tight text-ink truncate text-sm sm:text-base">
              {currentPage.title}
            </h1>
            {showSubtitle && currentPage.subtitle && (
              <p className="text-[11px] text-stone hidden md:block truncate">
                {currentPage.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Search Command Bar */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-2 text-xs text-stone-muted bg-canvas-subtle hover:bg-canvas rounded-md px-3 h-8 border border-border transition-colors w-56 lg:w-64"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">Search or run command...</span>
          <kbd className="text-[10px] text-stone bg-surface border border-border rounded px-1 flex items-center font-mono">
            <Command className="h-2.5 w-2.5 mr-0.5" />K
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Status Indicators */}
          {workspace?.automationMode === 'autonomous' && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-vermilion-soft text-vermilion border border-vermilion/20">
              <Zap className="h-3 w-3" />
              <span>Autonomous</span>
            </span>
          )}

          {failedCount > 0 && (
            <NavLink
              to="/queue"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-danger/10 text-danger border border-danger/20"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{failedCount} failed</span>
            </NavLink>
          )}

          {/* New Short Button */}
          <NavLink
            to="/create"
            className="btn-primary h-8 px-3 text-xs hidden sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
          </NavLink>

          {/* YouTube Connection Indicator */}
          <Tooltip content={youtube?.connectionStatus === 'connected' ? 'YouTube Connected' : 'Connect YouTube'}>
            <NavLink
              to="/youtube"
              className="p-1.5 rounded-md text-stone hover:text-ink hover:bg-canvas-subtle transition-colors"
              aria-label="YouTube integration"
            >
              <YoutubeIcon
                className={cn(
                  'h-4 w-4',
                  youtube?.connectionStatus === 'connected' ? 'text-vermilion' : 'text-stone-muted'
                )}
              />
            </NavLink>
          </Tooltip>

          {/* Notifications */}
          <Tooltip content="Notifications">
            <NavLink
              to="/notifications"
              className="p-1.5 rounded-md text-stone hover:text-ink hover:bg-canvas-subtle transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 min-w-[14px] rounded-full bg-vermilion text-white text-[9px] font-mono font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          </Tooltip>

          {/* User Profile */}
          <div className="w-px h-5 bg-border mx-1" />
          <NavLink to="/settings" className="flex items-center">
            <Avatar name={user?.name || 'Creator'} size="sm" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
