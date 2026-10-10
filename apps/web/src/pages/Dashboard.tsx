import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useAutomationStore } from '../stores/automationStore';
import { useUIStore } from '../stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn, formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import {
  Zap,
  Play,
  Pause,
  TriangleAlert,
  Eye,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  XCircle,
  Play as YoutubeIcon,
  ArrowRight,
  Activity,
  Plus,
  ThumbsUp,
  Video,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

const PIPELINE_STAGES = [
  { key: 'idea', label: 'Idea' },
  { key: 'script_ready', label: 'Script' },
  { key: 'voice_ready', label: 'Voice' },
  { key: 'visuals_ready', label: 'Visuals' },
  { key: 'rendering', label: 'Render' },
  { key: 'quality_check', label: 'QC' },
  { key: 'review', label: 'Review' },
  { key: 'approved', label: 'Approve' },
  { key: 'scheduled', label: 'Schedule' },
  { key: 'published', label: 'Published' },
] as const;

type StageKey = (typeof PIPELINE_STAGES)[number]['key'];

const STATUS_ORDER: Record<string, number> = {
  idea: 0,
  draft: 0,
  script_ready: 1,
  voice_ready: 2,
  visuals_ready: 3,
  rendering: 4,
  rendered: 4,
  quality_check: 5,
  review: 6,
  approved: 7,
  scheduled: 8,
  published: 9,
  failed: -1,
};

export function Dashboard() {
  const navigate = useNavigate();
  const items = useContentStore((s) => s.items);
  const jobs = useContentStore((s) => s.jobs);
  const youtube = useWorkspaceStore((s) => s.youtubeChannel);
  const { config, pauseEngine, resumeEngine } = useAutomationStore();
  const showToast = useUIStore((s) => s.showToast);

  const [pipelineFilter, setPipelineFilter] = useState<StageKey | null>(null);

  // Computed stats
  const activeItems = items.filter((i) => i.status !== 'published' && i.status !== 'failed');
  const failedItems = items.filter((i) => i.status === 'failed');
  const needsReview = items.filter((i) => i.status === 'review' || i.status === 'quality_check');
  const scheduledItems = items
    .filter((i) => i.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''));
  const publishedItems = items.filter((i) => i.status === 'published');
  const todayJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'running');
  const recentlyPublished = [...publishedItems]
    .sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt))
    .slice(0, 5);

  // Concrete metrics
  const publishedViews = publishedItems.reduce((s, i) => s + (i.views || 0), 0);
  const isYouTubeConnected = youtube?.connectionStatus === 'connected';
  const totalViews = isYouTubeConnected ? youtube?.viewCount || publishedViews : publishedViews;
  const totalSubs = isYouTubeConnected ? youtube?.subscriberCount || 0 : 0;
  const totalPublished = publishedItems.length;

  // Next publish: nearest scheduled
  const nextScheduled = scheduledItems[0];
  const nextPublishAt = nextScheduled?.scheduledAt ? new Date(nextScheduled.scheduledAt) : null;

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number }> = {};
    PIPELINE_STAGES.forEach((s) => {
      counts[s.key] = { total: 0, active: 0 };
    });
    items.forEach((i) => {
      const st = STATUS_ORDER[i.status];
      if (st === undefined || st < 0) return;
      const stage = PIPELINE_STAGES[Math.min(st, PIPELINE_STAGES.length - 1)];
      if (stage) {
        counts[stage.key].total++;
        if (['rendering', 'quality_check', 'review', 'scheduled'].includes(i.status))
          counts[stage.key].active++;
      }
    });
    counts['idea'].total += items.filter((i) => i.status === 'draft').length;
    return counts;
  }, [items]);

  const engineActive = config.status === 'active';

  const handleEngineToggle = () => {
    if (engineActive) {
      pauseEngine();
      showToast({ type: 'info', title: 'Engine paused', message: 'Autonomous production paused.' });
    } else {
      resumeEngine();
      showToast({ type: 'success', title: 'Engine active', message: 'Autonomous production running.' });
    }
  };

  // Health status
  const healthIssues: string[] = [];
  if (failedItems.length > 0)
    healthIssues.push(`${failedItems.length} failed job${failedItems.length > 1 ? 's' : ''}`);
  if (!youtube || youtube.connectionStatus !== 'connected') healthIssues.push('YouTube not connected');
  const healthStatus =
    healthIssues.length === 0 ? 'healthy' : failedItems.length > 2 ? 'attention' : 'degraded';

  return (
    <div className="space-y-6">
      {/* Studio Header & Status Strip */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border',
              healthStatus === 'healthy'
                ? 'bg-coral-soft border-coral/30 text-coral'
                : healthStatus === 'degraded'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-danger/10 border-danger/30 text-danger'
            )}
          >
            {healthStatus === 'healthy' ? <Zap className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-coral uppercase tracking-wide">
                STUDIO PRODUCTION ENGINE
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              <span className="text-xs text-stone font-mono capitalize">{healthStatus}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ink mt-0.5">
              {healthStatus === 'healthy'
                ? 'All production pipelines operational'
                : healthStatus === 'degraded'
                ? healthIssues.join(' • ')
                : `${failedItems.length} issues require review`}
            </h2>
            <p className="text-xs text-stone mt-0.5">
              {engineActive
                ? `Autonomous mode • ${config.approvalMode === 'none' ? 'Direct publish enabled' : 'Creator review gate active'}`
                : 'Engine paused — manual dispatch only'}
            </p>
          </div>
        </div>

        {/* Center: Next Scheduled Output */}
        <div className="lg:border-l lg:border-border lg:pl-6 space-y-1">
          <div className="text-[11px] font-mono text-stone-muted uppercase tracking-wider">
            Next Scheduled Slot
          </div>
          {nextPublishAt ? (
            <div>
              <div className="text-xs font-semibold text-ink truncate max-w-xs">{nextScheduled?.title}</div>
              <div className="text-[11px] text-stone font-mono">
                {format(nextPublishAt, 'EEE, MMM d • h:mm a')} ({formatRelativeTime(nextPublishAt.toISOString())})
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone">No items queued for automatic release</div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/queue')}
            className="btn-secondary h-9 text-xs"
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>View Queue</span>
          </Button>
          <Button
            variant={engineActive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleEngineToggle}
            className={engineActive ? 'h-9 text-xs' : 'btn-primary h-9 text-xs'}
          >
            {engineActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{engineActive ? 'Pause Engine' : 'Resume Engine'}</span>
          </Button>
        </div>
      </div>

      {/* Honest Metric KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={Eye}
          label="Total Channel Views"
          value={totalViews > 0 ? formatNumber(totalViews) : totalPublished > 0 ? '0' : '--'}
        />
        <MetricCard
          icon={Users}
          label="Subscribers"
          value={isYouTubeConnected ? formatNumber(totalSubs) : 'Not Connected'}
        />
        <MetricCard
          icon={Video}
          label="Published Shorts"
          value={totalPublished.toString()}
        />
        <MetricCard
          icon={ListTodo}
          label="In Production"
          value={activeItems.length.toString()}
        />
      </div>

      {/* Main 2-Column Area: Pipeline Progression + Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Progression Tracker (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink">Production Pipeline</h3>
              <p className="text-xs text-stone">Click a stage to filter the content library</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/content')}
              className="btn-ghost text-xs"
            >
              <span>Library</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Connected Stage Nodes */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
            {PIPELINE_STAGES.map((stage, idx) => {
              const c = pipelineCounts[stage.key];
              const isFiltered = pipelineFilter === stage.key;
              const isActive = c.total > 0;
              const isPublished = stage.key === 'published';

              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => {
                    setPipelineFilter(isFiltered ? null : stage.key);
                    if (!isFiltered) navigate(`/content?stage=${stage.key}`);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all text-center',
                    isFiltered
                      ? 'bg-coral-soft border-coral'
                      : isActive
                      ? 'bg-canvas-subtle border-border hover:border-coral/50'
                      : 'bg-surface border-border opacity-70 hover:opacity-100'
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-7 rounded-md flex items-center justify-center font-mono text-xs font-bold transition-colors',
                      isPublished
                        ? 'bg-coral text-white'
                        : isActive
                        ? 'bg-coral-soft text-coral border border-coral/30'
                        : 'bg-surface border border-border text-stone-muted'
                    )}
                  >
                    {isPublished ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-semibold text-ink uppercase truncate w-full">
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-mono text-stone-muted">
                    {c.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Items Strip */}
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono block">
              Active Productions
            </span>
            {activeItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/content/${item.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-canvas-subtle hover:bg-surface border border-border transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-surface border border-border flex items-center justify-center text-coral shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink truncate">{item.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={item.status} />
                      {item.estimatedDuration && (
                        <span className="text-[10px] text-stone font-mono">
                          {formatDuration(item.estimatedDuration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-stone-muted font-mono shrink-0">
                  {formatRelativeTime(item.updatedAt)}
                </span>
              </Link>
            ))}
            {activeItems.length === 0 && (
              <div className="text-center py-6 text-xs text-stone">
                <p>No active productions in the queue.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/create')}
                  className="btn-primary h-8 px-3 text-xs mt-3"
                >
                  <Plus className="h-3 w-3" />
                  <span>Create Short</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention Panel */}
        <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-ink">Action Checkpoint</h3>
            {needsReview.length + failedItems.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-coral-soft text-coral">
                {needsReview.length + failedItems.length} pending
              </span>
            )}
          </div>

          {needsReview.length === 0 && failedItems.length === 0 && (
            <div className="py-8 text-center space-y-2">
              <div className="h-9 w-9 rounded-full bg-coral-soft text-coral mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-ink">No Blocking Items</p>
              <p className="text-[11px] text-stone">All jobs progressing cleanly without errors.</p>
            </div>
          )}

          {failedItems.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="p-3 rounded-md bg-danger/5 border border-danger/20 block space-y-1 hover:border-danger/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-danger truncate">{item.title}</span>
                <XCircle className="h-3.5 w-3.5 text-danger shrink-0" />
              </div>
              <p className="text-[11px] text-stone leading-tight">
                {item.failureReason || 'Pipeline failed ffprobe media validation'}
              </p>
            </Link>
          ))}

          {needsReview.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="p-3 rounded-md bg-canvas-subtle border border-border block space-y-1 hover:border-border-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink truncate">{item.title}</span>
                <span className="text-[10px] font-mono text-coral font-bold">Review</span>
              </div>
              <p className="text-[11px] text-stone leading-tight">
                Draft rendered. Awaiting creator publication approval.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'attention' }) {
  return (
    <span
      className={cn(
        'h-2 w-2 rounded-full inline-block',
        status === 'healthy' ? 'bg-moss' : status === 'degraded' ? 'bg-amber-500' : 'bg-danger'
      )}
    />
  );
}
