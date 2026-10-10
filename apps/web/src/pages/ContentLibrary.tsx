import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
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
  Eye,
  Calendar as CalendarIcon,
  Play,
  CheckCircle,
  Clock,
} from 'lucide-react';

const FILTERS: { key: ContentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Shorts' },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const items = useContentStore((s) => s.items);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<ContentStatus | 'all' | 'needs_attention'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const qf = searchParams.get('filter');
    if (qf === 'needs_attention') {
      setFilter('needs_attention');
    } else if (qf && FILTERS.some((f) => f.key === qf)) {
      setFilter(qf as any);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = items;
    if (filter === 'needs_attention') {
      result = result.filter((i) => i.status === 'review' || i.status === 'failed');
    } else if (filter !== 'all') {
      result = result.filter((i) => i.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || (i.pillar && i.pillar.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });
    return result;
  }, [items, filter, search, sortBy]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        description={`${items.length} vertical shorts in your studio catalogue.`}
        actions={
          <Button
            onClick={() => navigate('/create')}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Short</span>
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-muted" />
          <input
            type="search"
            placeholder="Search by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface text-xs placeholder:text-stone-muted focus:border-coral focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 px-3 text-xs rounded-md border border-border bg-surface text-ink focus:outline-none focus:border-coral"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Views</option>
          </select>

          <div className="flex rounded-md border border-border overflow-hidden bg-surface">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'h-9 w-9 flex items-center justify-center transition-colors',
                view === 'grid' ? 'bg-canvas-subtle text-ink font-semibold' : 'text-stone hover:text-ink'
              )}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'h-9 w-9 flex items-center justify-center transition-colors',
                view === 'list' ? 'bg-canvas-subtle text-ink font-semibold' : 'text-stone hover:text-ink'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filter === 'needs_attention' && (
          <button
            onClick={() => {
              setFilter('all');
              setSearchParams({});
            }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1.5"
          >
            <span>Needs Attention ({items.filter((i) => i.status === 'review' || i.status === 'failed').length})</span>
            <span className="text-xs">✕</span>
          </button>
        )}
        {FILTERS.map((f) => {
          const count = f.key === 'all' ? items.length : items.filter((i) => i.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setSearchParams({});
              }}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all border',
                filter === f.key
                  ? 'bg-surface border-coral text-coral font-semibold shadow-xs'
                  : 'bg-canvas-subtle border-border text-stone hover:text-ink'
              )}
            >
              <span>{f.label}</span>
              {count > 0 && (
                <span className="ml-1.5 text-[10px] font-mono text-stone-muted">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-canvas-subtle border border-coral/30 rounded-lg px-4 py-2 flex items-center gap-3 text-xs">
          <CheckCircle className="h-4 w-4 text-coral" />
          <span className="font-semibold text-ink">{selected.size} items selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="btn-ghost text-xs"
          >
            {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                selected.forEach((id) => useContentStore.getState().deleteContent(id));
                setSelected(new Set());
              }}
              className="h-8 px-3 text-xs"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No shorts match filter"
          description="Create your next video concept or reset active filter."
          action={{ label: 'Create Short', onClick: () => navigate('/create') }}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-surface rounded-lg border border-border overflow-hidden hover:border-coral/50 transition-all shadow-xs flex flex-col justify-between"
            >
              <Link to={`/content/${item.id}`} className="block">
                {/* 9:16 Vertical Thumbnail Card */}
                <div className="relative aspect-[9/12] bg-ink p-3 flex flex-col justify-between text-white overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <StatusBadge status={item.status} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className={cn(
                        'h-5 w-5 rounded border transition-all flex items-center justify-center',
                        selected.has(item.id)
                          ? 'bg-coral border-coral text-white'
                          : 'border-white/40 bg-black/30'
                      )}
                    >
                      {selected.has(item.id) && <CheckCircle className="h-3 w-3" />}
                    </button>
                  </div>

                  <div className="my-auto text-center">
                    <div className="h-10 w-10 rounded-full bg-coral/80 flex items-center justify-center mx-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    {item.pillar && (
                      <span className="text-[10px] font-mono text-marigold block">
                        {item.pillar}
                      </span>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
                      <span>{item.duration ? formatDuration(item.duration) : '0:45'}</span>
                      {item.views !== undefined && item.views > 0 && (
                        <span>{formatNumber(item.views)} views</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <h4 className="text-xs font-semibold text-ink line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-stone-muted pt-1 border-t border-border font-mono">
                    <span>{formatRelativeTime(item.createdAt)}</span>
                    <span className="text-coral font-medium group-hover:underline">Studio &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border divide-y divide-border overflow-hidden">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-canvas-subtle transition-colors"
            >
              <div className="h-12 w-9 rounded bg-ink flex items-center justify-center text-white shrink-0">
                <Play className="h-3 w-3 fill-current" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink truncate">{item.title}</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone mt-0.5 font-mono">
                  {item.pillar && <span>{item.pillar}</span>}
                  <span>{item.duration ? formatDuration(item.duration) : '0:45'}</span>
                  <span>{formatRelativeTime(item.createdAt)}</span>
                </div>
              </div>

              {item.views !== undefined && item.views > 0 && (
                <span className="text-xs font-mono text-ink font-semibold">
                  {formatNumber(item.views)} views
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
