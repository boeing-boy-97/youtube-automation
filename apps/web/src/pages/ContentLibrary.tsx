import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/common/EmptyState';
import { cn, formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import type { ContentStatus } from '../types/content';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Plus,
  Grid3x3,
  List,
  Search,
  FolderOpen,
  MoreHorizontal,
  Clock,
  Eye,
  Calendar as CalendarIcon,
  Play,
  CheckCircle,
} from 'lucide-react';

const FILTERS: { key: ContentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'script_ready', label: 'Script' },
  { key: 'voice_ready', label: 'Producing' },
  { key: 'review', label: 'Review' },
  { key: 'approved', label: 'Ready' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
  { key: 'failed', label: 'Failed' },
];

export function ContentLibrary() {
  const navigate = useNavigate();
  const items = useContentStore(s => s.items);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'retention'>('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = items;
    if (filter !== 'all') result = result.filter(i => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || (i.pillar && i.pillar.toLowerCase().includes(q)));
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views': return (b.views || 0) - (a.views || 0);
        case 'retention': return (b.retention || 0) - (a.retention || 0);
        default: return 0;
      }
    });
    return result;
  }, [items, filter, search, sortBy]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(i => i.id)));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content Library"
        description={`${items.length} items in your pipeline`}
        actions={
          <Button onClick={() => navigate('/create')}>
            <Plus className="h-4 w-4" />
            New Content
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-[13px] placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-9 px-3 text-[13px] rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent w-full sm:w-auto">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="views">Most Views</option>
            <option value="retention">Best Retention</option>
          </select>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setView('grid')} className={cn('h-9 w-9 flex items-center justify-center rounded-md transition-colors', view === 'grid' ? 'bg-surface-hover text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-hover')} aria-label="Grid view">
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('h-9 w-9 flex items-center justify-center rounded-md transition-colors', view === 'list' ? 'bg-surface-hover text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-hover')} aria-label="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTERS.map(f => {
          const count = f.key === 'all' ? items.length : items.filter(i => i.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors border border-transparent',
                filter === f.key ? 'bg-surface-subtle text-text-primary border-border' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              {f.label}
              {count > 0 && <span className="ml-1.5 text-xs text-text-muted">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-accent-soft/40 border border-accent/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-text-primary">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={selectAll}>{selected.size === filtered.length ? 'Deselect all' : 'Select all'}</Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm">Archive</Button>
            <Button variant="danger" size="sm" onClick={() => {
              selected.forEach(id => useContentStore.getState().deleteContent(id));
              setSelected(new Set());
            }}>Delete</Button>
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No content found"
          description="Start creating to build your content library."
          action={{ label: 'Create Content', onClick: () => navigate('/create') }}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <Link key={item.id} to={`/content/${item.id}`}>
              <Card interactive className="overflow-hidden group">
                <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-900">
                  <div className={cn('absolute inset-0 bg-gradient-to-br', item.thumbnailGradient || 'from-slate-700 to-slate-900')} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Play className="h-10 w-10 text-white drop-shadow-lg" fill="white" />
                  </div>
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={e => { e.preventDefault(); toggleSelect(item.id); }}
                      className={cn(
                        'h-5 w-5 rounded border-2 transition-all flex items-center justify-center',
                        selected.has(item.id) ? 'bg-accent border-accent' : 'border-white/60 bg-black/20 hover:bg-black/40'
                      )}
                    >
                      {selected.has(item.id) && <CheckCircle className="h-3 w-3 text-white" />}
                    </button>
                  </div>
                  {item.progress !== undefined && item.status === 'rendering' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                      <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-[13px] font-semibold text-text-primary line-clamp-2 leading-snug mb-2">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    {item.views !== undefined && (
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(item.views)}</span>
                    )}
                    {item.scheduledAt && item.status === 'scheduled' && (
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatRelativeTime(item.scheduledAt)}</span>
                    )}
                    {item.status === 'published' && item.publishedAt && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(item.publishedAt)}</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {filtered.map(item => (
              <Link key={item.id} to={`/content/${item.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover/60 transition-colors">
                <div className={cn('h-10 w-16 rounded bg-gradient-to-br shrink-0 relative overflow-hidden', item.thumbnailGradient || 'from-slate-700 to-slate-900')}>
                  {item.duration && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/70 text-white text-[9px]">{formatDuration(item.duration)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{item.title}</div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <StatusBadge status={item.status} />
                    {item.views !== undefined && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(item.views)}</span>}
                    {item.pillar && <span>{item.pillar}</span>}
                  </div>
                </div>
                <div className="text-xs text-text-muted hidden sm:block">{formatRelativeTime(item.updatedAt)}</div>
                <button className="btn-icon"><MoreHorizontal className="h-4 w-4" /></button>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
