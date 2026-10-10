import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useContentStore } from '../../stores/contentStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Tooltip } from '../ui/Tooltip';
import { Avatar } from '../ui/Avatar';
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
  Play as YoutubeIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dynamic?: boolean;
  badge?: number;
}
interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'STUDIO',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
      { to: '/content', icon: FolderOpen, label: 'Content Library' },
      { to: '/create', icon: Plus, label: 'Create' },
    ],
  },
  {
    label: 'WORKSPACES',
    items: [
      { to: '/script-lab/new', icon: FileText, label: 'Script Lab', dynamic: true },
      { to: '/studio/new', icon: Video, label: 'Video Studio', dynamic: true },
      { to: '/queue', icon: ListTodo, label: 'Queue' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'PIPELINES',
    items: [
      { to: '/automation', icon: Zap, label: 'Automation' },
      { to: '/workflow', icon: GitBranch, label: 'Workflow' },
      { to: '/templates', icon: FileText, label: 'Templates' },
      { to: '/assets', icon: Layers, label: 'Assets' },
    ],
  },
  {
    label: 'CHANNEL & INTEL',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/youtube', icon: YoutubeIcon, label: 'YouTube' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/brand-kit', icon: Palette, label: 'Brand Kit' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/help', icon: HelpCircle, label: 'Help' },
    ],
  },
];

const SIDEBAR_WIDTH = 'w-[240px]';
const COLLAPSED_WIDTH = 'w-[68px]';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const unreadCount = useContentStore((s) => s.getUnreadCount());
  const workspace = useWorkspaceStore((s) => s.workspace);
  const youtube = useWorkspaceStore((s) => s.youtubeChannel);
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    if (to === '/script-lab/new') return location.pathname.startsWith('/script-lab');
    if (to === '/studio/new') return location.pathname.startsWith('/studio');
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-surface border-r border-border z-30 transition-[width] duration-200 ease-out',
        sidebarCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-border px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-md bg-ink flex items-center justify-center text-canvas font-mono font-bold text-xs shrink-0 group-hover:bg-coral transition-colors">
            SF
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <span className="font-bold text-ink tracking-tight text-sm">ShortForge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            </div>
          )}
        </NavLink>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="text-stone hover:text-ink p-1 rounded-md hover:bg-canvas-subtle transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mt-2 text-stone hover:text-ink p-1 rounded-md hover:bg-canvas-subtle transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <div className="px-2.5 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-stone-muted uppercase tracking-wider">
                  {section.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                const notifBadge = item.to === '/notifications' && unreadCount > 0 ? unreadCount : 0;

                const navItem = (
                  <NavLink
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2.5 h-9 rounded-md text-xs font-medium transition-all relative',
                      sidebarCollapsed ? 'justify-center w-9 mx-auto' : 'px-2.5',
                      active
                        ? 'bg-coral-soft text-coral font-semibold'
                        : 'text-stone hover:text-ink hover:bg-canvas-subtle'
                    )}
                  >
                    <Icon className={cn('shrink-0 h-4 w-4', active ? 'text-coral' : 'text-stone')} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {notifBadge > 0 && (
                          <span className="ml-auto text-[10px] font-semibold bg-danger text-white rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                            {notifBadge}
                          </span>
                        )}
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

      {/* Workspace Footer Indicator */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-border bg-canvas-subtle/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-surface border border-border flex items-center justify-center text-xs font-bold text-ink">
              {workspace?.name ? workspace.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-ink truncate">
                {workspace?.name || 'Studio Workspace'}
              </div>
              <div className="text-[10px] text-stone font-mono flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    youtube?.connectionStatus === 'connected' ? 'bg-moss' : 'bg-stone-muted'
                  )}
                />
                <span>{youtube?.connectionStatus === 'connected' ? 'YouTube Active' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
