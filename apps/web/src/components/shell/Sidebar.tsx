import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useContentStore } from '../../stores/contentStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Tooltip } from '../ui/Tooltip';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  LayoutDashboard,
  Lightbulb,
  FolderOpen,
  Plus,
  ListTodo,
  Calendar,
  FileText,
  Video,
  Zap,
  GitBranch,
  BarChart3,
  Bell,
  Palette,
  Settings,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play as YoutubeIcon,
} from 'lucide-react';

interface NavItem { to: string; icon: React.ComponentType<{ className?: string }>; label: string; dynamic?: boolean; badge?: number; }
interface NavSection { label: string; items: NavItem[]; }

const NAV_SECTIONS: NavSection[] = [
  { label: 'COMMAND CENTER', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  { label: 'CONTENT', items: [
    { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
    { to: '/content', icon: FolderOpen, label: 'Content Library' },
    { to: '/create', icon: Plus, label: 'Create' },
    { to: '/queue', icon: ListTodo, label: 'Queue' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/templates', icon: FileText, label: 'Templates' },
    { to: '/assets', icon: Layers, label: 'Assets' },
  ]},
  { label: 'PRODUCTION', items: [
    { to: '/script-lab/new', icon: FileText, label: 'Script Lab', dynamic: true },
    { to: '/studio/new', icon: Video, label: 'Video Studio', dynamic: true },
  ]},
  { label: 'AUTOMATION', items: [
    { to: '/automation', icon: Zap, label: 'Automation' },
    { to: '/workflow', icon: GitBranch, label: 'Workflow' },
  ]},
  { label: 'INTELLIGENCE', items: [{ to: '/analytics', icon: BarChart3, label: 'Analytics' }] },
  { label: 'CHANNEL', items: [{ to: '/youtube', icon: YoutubeIcon, label: 'YouTube' }] },
  { label: 'SYSTEM', items: [
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/brand-kit', icon: Palette, label: 'Brand Kit' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/help', icon: HelpCircle, label: 'Help' },
  ]},
];

const SIDEBAR_WIDTH = 'w-[252px]';
const COLLAPSED_WIDTH = 'w-[72px]';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const unreadCount = useContentStore(s => s.getUnreadCount());
  const workspace = useWorkspaceStore(s => s.workspace);
  const youtube = useWorkspaceStore(s => s.youtubeChannel);
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    if (to === '/script-lab/new') return location.pathname.startsWith('/script-lab');
    if (to === '/studio/new') return location.pathname.startsWith('/studio');
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <aside className={cn(
      'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-surface border-r border-border z-30 transition-[width] duration-200 ease-out',
      sidebarCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH
    )}>
      {/* Brand */}
      <div className={cn('h-16 flex items-center border-b border-border px-4', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && <span className="font-bold text-text-primary tracking-tight text-[15px]">ShortForge</span>}
        </NavLink>
        {!sidebarCollapsed && (
          <button onClick={toggleSidebar} className="text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors" aria-label="Collapse sidebar">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <button onClick={toggleSidebar} className="mx-auto mt-2 text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors" aria-label="Expand sidebar">
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-5">
            {!sidebarCollapsed && (
              <div className="px-3 mb-1.5">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.1em]">{section.label}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.to);
                const notifBadge = item.to === '/notifications' && unreadCount > 0 ? unreadCount : 0;

                const navItem = (
                  <NavLink
                    to={item.to}
                    className={cn(
                      'nav-item h-10 relative',
                      sidebarCollapsed ? 'justify-center w-10 mx-auto' : 'px-3',
                      active
                        ? 'bg-accent-soft text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    )}
                  >
                    {active && !sidebarCollapsed && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" />}
                    <Icon className={cn('shrink-0', sidebarCollapsed ? 'h-[18px] w-[18px]' : 'h-[18px] w-[18px]')} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate text-[13.5px]">{item.label}</span>
                        {notifBadge > 0 && <span className="ml-auto text-[10px] font-semibold bg-danger text-white rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">{notifBadge}</span>}
                      </>
                    )}
                  </NavLink>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.to} content={item.label} side="right">
                      {navItem}
                    </Tooltip>
                  );
                }
                return <div key={item.to}>{navItem}</div>;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        {/* Automation status */}
        {!sidebarCollapsed && workspace?.automationMode && workspace.automationMode !== 'manual' && (
          <div className="flex items-center gap-2.5 rounded-lg bg-success-soft border border-success/10 px-3 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse shrink-0" />
            <span className="text-[11.5px] text-success font-medium truncate">
              {workspace.automationMode === 'autonomous' ? 'Autonomous engine active' : 'Assisted mode active'}
            </span>
          </div>
        )}
        {sidebarCollapsed && workspace?.automationMode && workspace.automationMode !== 'manual' && (
          <Tooltip content="Automation active" side="right">
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </Tooltip>
        )}

        {/* Workspace profile */}
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors',
            sidebarCollapsed ? 'justify-center p-2 w-10 mx-auto' : 'px-3 py-2'
          )}
        >
          <Avatar name={workspace?.channelName || 'User'} size="sm" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary truncate">{workspace?.channelName || 'Your Channel'}</p>
              <p className="text-[11px] text-text-muted truncate">{youtube?.connectionStatus === 'connected' ? 'YouTube connected' : 'Not connected'}</p>
            </div>
          )}
        </NavLink>

        {!sidebarCollapsed && (
          <div className="px-3 py-1.5">
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-surface-hover px-2 py-1.5 text-[10px] font-medium text-text-muted uppercase tracking-widest border border-border/50">
              <Sparkles className="h-3 w-3 text-accent" />
              Demo Mode
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
