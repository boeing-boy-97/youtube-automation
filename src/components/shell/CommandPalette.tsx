import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../stores/uiStore';
import { useContentStore } from '../../stores/contentStore';
import { useAutomationStore } from '../../stores/automationStore';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Lightbulb,
  FolderOpen,
  Plus,
  ListTodo,
  Calendar,
  BarChart3,
  Settings,
  Pause,
  Play,
  RotateCcw,
  Search,
  Play as YoutubeIcon,
  FileText,
  Video,
  Folder,
  Zap,
  Palette,
  Bell,
  HelpCircle,
  Images,
  LayoutTemplate,
  ChevronRight,
  X,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  shortcut?: string[];
  action: () => void;
}

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const navigate = useNavigate();
  const contentItems = useContentStore(s => s.items);
  const ideas = useContentStore(s => s.ideas);
  const { pauseEngine, resumeEngine, config } = useAutomationStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [commandPaletteOpen]);

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      { id: 'nav-create', label: 'Create new content', icon: Plus, category: 'Quick actions', shortcut: ['C'], action: () => { navigate('/create'); closeCommandPalette(); } },
      { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', shortcut: ['G','D'], action: () => { navigate('/dashboard'); closeCommandPalette(); } },
      { id: 'nav-content', label: 'Content Library', icon: FolderOpen, category: 'Navigation', shortcut: ['G','C'], action: () => { navigate('/content'); closeCommandPalette(); } },
      { id: 'nav-ideas', label: 'Ideas', hint: 'Generate new concepts', icon: Lightbulb, category: 'Navigation', shortcut: ['G','I'], action: () => { navigate('/ideas'); closeCommandPalette(); } },
      { id: 'nav-queue', label: 'Production Queue', icon: ListTodo, category: 'Navigation', shortcut: ['G','Q'], action: () => { navigate('/queue'); closeCommandPalette(); } },
      { id: 'nav-calendar', label: 'Calendar', icon: Calendar, category: 'Navigation', action: () => { navigate('/calendar'); closeCommandPalette(); } },
      { id: 'nav-analytics', label: 'Analytics', icon: BarChart3, category: 'Navigation', shortcut: ['G','A'], action: () => { navigate('/analytics'); closeCommandPalette(); } },
      { id: 'nav-workflow', label: 'Workflow Builder', icon: Folder, category: 'Navigation', action: () => { navigate('/workflow'); closeCommandPalette(); } },
      { id: 'nav-automation', label: 'Automation', icon: Zap, category: 'Navigation', action: () => { navigate('/automation'); closeCommandPalette(); } },
      { id: 'nav-youtube', label: 'YouTube Channels', icon: YoutubeIcon, category: 'Navigation', action: () => { navigate('/youtube'); closeCommandPalette(); } },
      { id: 'nav-templates', label: 'Templates', icon: LayoutTemplate, category: 'Navigation', action: () => { navigate('/templates'); closeCommandPalette(); } },
      { id: 'nav-assets', label: 'Assets', icon: Images, category: 'Navigation', action: () => { navigate('/assets'); closeCommandPalette(); } },
      { id: 'nav-brand-kit', label: 'Brand Kit', icon: Palette, category: 'Navigation', action: () => { navigate('/brand-kit'); closeCommandPalette(); } },
      { id: 'nav-notifications', label: 'Notifications', icon: Bell, category: 'Navigation', action: () => { navigate('/notifications'); closeCommandPalette(); } },
      { id: 'nav-settings', label: 'Settings', icon: Settings, category: 'Navigation', shortcut: ['G','S'], action: () => { navigate('/settings'); closeCommandPalette(); } },
      { id: 'nav-help', label: 'Help Center', icon: HelpCircle, category: 'Navigation', action: () => { navigate('/help'); closeCommandPalette(); } },
    ];

    if (config.status === 'active') {
      cmds.unshift({ id: 'auto-pause', label: 'Pause automation engine', icon: Pause, category: 'Quick actions', action: () => { pauseEngine(); closeCommandPalette(); } });
    } else {
      cmds.unshift({ id: 'auto-resume', label: 'Resume automation engine', icon: Play, category: 'Quick actions', action: () => { resumeEngine(); closeCommandPalette(); } });
    }
    cmds.push({ id: 'auto-test', label: 'Test workflow', icon: RotateCcw, category: 'Quick actions', action: () => { navigate('/workflow'); closeCommandPalette(); } });

    // Recent content
    contentItems.slice(0, 4).forEach(item => {
      cmds.push({
        id: `content-${item.id}`,
        label: item.title,
        hint: item.id.slice(0,8),
        icon: item.status === 'published' ? Video : FileText,
        category: 'Recent content',
        action: () => { navigate(`/content/${item.id}`); closeCommandPalette(); },
      });
    });

    // Recent ideas
    ideas.filter(i => i.status !== 'used' && i.status !== 'rejected').slice(0, 2).forEach(idea => {
      cmds.push({
        id: `idea-${idea.id}`,
        label: idea.title,
        hint: 'Idea',
        icon: Lightbulb,
        category: 'Ideas',
        action: () => { navigate('/ideas'); closeCommandPalette(); },
      });
    });

    return cmds;
  }, [navigate, contentItems, ideas, config.status, pauseEngine, resumeEngine, closeCommandPalette]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q) || (c.hint||'').toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) cmd.action();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeCommandPalette} />
      <div
        className="relative w-full max-w-[600px] bg-surface border border-border rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, content, actions..."
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none"
          />
          <button onClick={closeCommandPalette} className="btn-icon-sm text-text-muted hover:text-text-secondary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-text-muted">No commands or content match <span className="text-text-primary font-medium">"{query}"</span></p>
              <p className="text-[12px] text-text-muted mt-1">Try a different term or press Esc.</p>
            </div>
          )}
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-1.5 pt-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">{category}</span>
              </div>
              {cmds.map(cmd => {
                const idx = filtered.indexOf(cmd);
                const Icon = cmd.icon;
                const selected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    data-idx={idx}
                    onClick={cmd.action}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 mx-1 text-[13px] rounded-lg transition-colors',
                      selected ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    )}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', selected ? 'text-accent' : 'text-text-muted')} />
                    <span className="flex-1 text-left truncate font-medium">{cmd.label}</span>
                    {cmd.hint && <span className="text-[11px] text-text-muted font-mono hidden sm:block">{cmd.hint}</span>}
                    {cmd.shortcut && (
                      <span className="flex items-center gap-1 shrink-0">
                        {cmd.shortcut.map((k,i) => (
                          <kbd key={i} className="text-[10px] font-mono text-text-muted bg-surface border border-border rounded px-1.5 py-0.5 min-w-[20px] text-center">{k}</kbd>
                        ))}
                      </span>
                    )}
                    {selected && <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-surface-subtle">
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <kbd className="font-mono bg-surface border border-border rounded px-1.5 py-0.5">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <kbd className="font-mono bg-surface border border-border rounded px-1.5 py-0.5">↵</kbd>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted ml-auto">
            <kbd className="font-mono bg-surface border border-border rounded px-1.5 py-0.5">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
