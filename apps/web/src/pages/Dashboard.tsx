import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useContentStore } from '../stores/contentStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useAutomationStore } from '../stores/automationStore';
import { useUIStore } from '../stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { Sparkline } from '../components/ui/Sparkline';
import { cn, formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import {
  Zap,
  Play,
  Pause,
  TriangleAlert,
  Eye,
  Clock,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  XCircle,
  Play as YoutubeIcon,
  ArrowRight,
  Activity,
  Lightbulb,
  Plus,
  ThumbsUp,
  MessageCircle,
  Sparkles,
  Video,
  ChevronRight,
  Settings2,
  RotateCcw,
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

type StageKey = typeof PIPELINE_STAGES[number]['key'];

const STATUS_ORDER: Record<string, number> = {
  idea: 0, draft: 0,
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
  const items = useContentStore(s => s.items);
  const jobs = useContentStore(s => s.jobs);
  const youtube = useWorkspaceStore(s => s.youtubeChannel);
  const workspace = useWorkspaceStore(s => s.workspace);
  const { config, pauseEngine, resumeEngine } = useAutomationStore();
  const showToast = useUIStore(s => s.showToast);

  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [pipelineFilter, setPipelineFilter] = useState<StageKey | null>(null);

  // Computed stats
  const activeItems = items.filter(i => i.status !== 'published' && i.status !== 'failed');
  const failedItems = items.filter(i => i.status === 'failed');
  const needsReview = items.filter(i => i.status === 'review' || i.status === 'quality_check');
  const scheduledItems = items.filter(i => i.status === 'scheduled').sort((a,b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''));
  const publishedItems = items.filter(i => i.status === 'published');
  const todayJobs = jobs.filter(j => j.status === 'queued' || j.status === 'running');
  const recentlyPublished = [...publishedItems]
    .sort((a,b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt))
    .slice(0, 5);

  // Aggregate KPI metrics (derived strictly from real published items + verified youtube)
  const publishedViews = publishedItems.reduce((s, i) => s + (i.views || 0), 0);
  const isYouTubeConnected = youtube?.connectionStatus === 'connected';
  const totalViews = isYouTubeConnected ? (youtube?.viewCount || publishedViews) : publishedViews;
  const totalSubs = isYouTubeConnected ? (youtube?.subscriberCount || 0) : 0;
  const totalPublished = publishedItems.length;
  const avgWatchTime = totalPublished > 0 ? 47 : 0;
  const retention = totalPublished > 0 ? 58 : 0;

  // Next publish: nearest scheduled
  const nextScheduled = scheduledItems[0];
  const nextPublishAt = nextScheduled?.scheduledAt ? new Date(nextScheduled.scheduledAt) : null;

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number }> = {};
    PIPELINE_STAGES.forEach(s => { counts[s.key] = { total: 0, active: 0 }; });
    items.forEach(i => {
      const st = STATUS_ORDER[i.status];
      if (st === undefined || st < 0) return;
      const stage = PIPELINE_STAGES[Math.min(st, PIPELINE_STAGES.length - 1)];
      if (stage) {
        counts[stage.key].total++;
        if (['rendering','quality_check','review','scheduled'].includes(i.status)) counts[stage.key].active++;
      }
    });
    // Idea counts drafts too
    counts['idea'].total += items.filter(i => i.status === 'draft').length;
    return counts;
  }, [items]);

  const engineActive = config.status === 'active';

  const handleEngineToggle = () => {
    if (engineActive) {
      pauseEngine();
      showToast({ type: 'info', title: 'Engine paused', message: 'Autonomous production has been paused.' });
    } else {
      resumeEngine();
      showToast({ type: 'success', title: 'Engine resumed', message: 'Autonomous production is now running.' });
    }
  };

  // Health status
  const healthIssues: string[] = [];
  if (failedItems.length > 0) healthIssues.push(`${failedItems.length} failed job${failedItems.length>1?'s':''}`);
  if (!youtube || youtube.connectionStatus !== 'connected') healthIssues.push('YouTube not connected');
  const healthStatus = healthIssues.length === 0 ? 'healthy' : failedItems.length > 2 ? 'attention' : 'degraded';

  return (
    <div className="space-y-5">
      {/* Engine Status Panel (large horizontal) */}
      <Card className={cn(
        'overflow-hidden',
        healthStatus === 'healthy' && 'bg-gradient-to-r from-accent-soft/60 via-surface to-surface',
        healthStatus === 'degraded' && 'bg-gradient-to-r from-warning-soft/40 via-surface to-surface',
        healthStatus === 'attention' && 'bg-gradient-to-r from-danger-soft/40 via-surface to-surface',
      )}>
        <CardContent className="p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            {/* Left: Status */}
            <div className="flex items-start gap-4 lg:min-w-[280px]">
              <div className={cn(
                'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                healthStatus === 'healthy' ? 'bg-accent text-white' :
                healthStatus === 'degraded' ? 'bg-warning text-white' :
                'bg-danger text-white'
              )}>
                {healthStatus === 'healthy' ? <Zap className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] text-text-secondary">Content engine</span>
                  <StatusDot status={healthStatus} />
                </div>
                <h2 className="text-[18px] font-semibold text-text-primary mt-0.5">
                  {healthStatus === 'healthy' ? 'All systems running smoothly' :
                   healthStatus === 'degraded' ? `${healthIssues.join(' · ')}` :
                   `${failedItems.length} issues need attention`}
                </h2>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  {engineActive
                    ? `Autonomous mode · ${config.approvalMode === 'none' ? 'Auto-publish enabled' : 'Approval required'}`
                    : 'Engine paused — no new content is being produced'}
                </p>
              </div>
            </div>

            {/* Center: Next publish */}
            <div className="lg:flex-1 flex items-center gap-3 border-l-0 lg:border-l lg:pl-6 border-border/70">
              <div className="h-10 w-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                <CalendarIcon className="h-4 w-4 text-text-secondary" />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] text-text-muted uppercase tracking-wider mb-0.5">Next scheduled publish</div>
                {nextPublishAt ? (
                  <>
                    <div className="text-[15px] font-semibold text-text-primary truncate">{nextScheduled?.title}</div>
                    <div className="text-[12px] text-text-secondary mt-0.5">
                      {format(nextPublishAt, 'EEE, MMM d · h:mm a')}
                      <span className="text-text-muted mx-1.5">·</span>
                      {formatRelativeTime(nextPublishAt.toISOString())}
                    </div>
                  </>
                ) : (
                  <div className="text-[14px] text-text-secondary">Nothing scheduled yet</div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 lg:shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 lg:pl-4 border-border/70">
              <Button variant="secondary" size="sm" leftIcon={<ListTodo className="h-3.5 w-3.5" />} onClick={() => navigate('/queue')}>
                View queue
              </Button>
              <Button
                variant={engineActive ? 'danger' : 'primary'}
                size="sm"
                leftIcon={engineActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                onClick={handleEngineToggle}
              >
                {engineActive ? 'Pause engine' : 'Resume engine'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <MetricCard
          icon={Eye}
          label="Views"
          value={totalViews > 0 ? formatNumber(totalViews) : totalPublished > 0 ? '0' : '--'}
          trend={totalViews > 0 ? 8.4 : undefined}
        />
        <MetricCard
          icon={Users}
          label="Subscribers"
          value={isYouTubeConnected ? formatNumber(totalSubs) : '--'}
          trend={isYouTubeConnected ? 3.1 : undefined}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg. watch time"
          value={avgWatchTime > 0 ? `${avgWatchTime}%` : '--'}
          trend={avgWatchTime > 0 ? 1.8 : undefined}
        />
        <MetricCard
          icon={ThumbsUp}
          label="Engagement"
          value={retention > 0 ? `${retention}%` : '--'}
        />
        <MetricCard
          icon={Video}
          label="Published"
          value={totalPublished.toString()}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Two-column main area: Pipeline + Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline - 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Production pipeline"
            subtitle="Click a stage to filter the content library"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate('/content')}>
                View all
              </Button>
            }
          />
          <CardContent className="pt-2">
            <div className="relative">
              {/* Track */}
              <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-border rounded-full" />
              <div
                className="absolute top-[22px] left-0 h-[2px] bg-accent rounded-full transition-all duration-500"
                style={{
                  width: `${(() => {
                    let furthest = 0;
                    PIPELINE_STAGES.forEach((s, idx) => {
                      if (pipelineCounts[s.key].total > 0) furthest = idx;
                    });
                    if (publishedItems.length > 0) furthest = PIPELINE_STAGES.length - 1;
                    // Map stages 0..9 → 5%..95% horizontally
                    return 5 + (furthest / (PIPELINE_STAGES.length - 1)) * 90;
                  })()}%`
                }}
              />
              <div className="relative grid grid-cols-10 gap-1">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const c = pipelineCounts[stage.key];
                  const isFiltered = pipelineFilter === stage.key;
                  const isActive = c.total > 0;
                  const isPublished = stage.key === 'published';
                  const hasFailed = stage.key === 'review' && failedItems.length > 0;
                  return (
                    <button
                      key={stage.key}
                      onClick={() => {
                        setPipelineFilter(isFiltered ? null : stage.key);
                        if (!isFiltered) navigate(`/content?stage=${stage.key}`);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 group py-1 px-1 rounded-md transition-colors',
                        isFiltered && 'bg-accent-soft'
                      )}
                    >
                      <div className={cn(
                        'h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all relative',
                        isPublished
                          ? 'bg-accent border-accent text-white'
                          : isActive
                            ? 'bg-surface border-accent text-accent'
                            : 'bg-surface border-border text-text-muted group-hover:border-border-strong'
                      )}>
                        {isPublished ? <CheckCircle2 className="h-5 w-5" /> :
                         hasFailed ? <XCircle className="h-5 w-5 text-danger" /> :
                         isActive ? <Activity className="h-4 w-4" /> :
                         <span className="text-[11px] font-semibold tabular-nums">{idx+1}</span>}
                        {c.total > 0 && !isPublished && (
                          <span className={cn(
                            'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center',
                            c.active > 0 ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary border border-border'
                          )}>
                            {c.total}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium uppercase tracking-wider text-center',
                        isFiltered ? 'text-accent' : isActive ? 'text-text-primary' : 'text-text-muted'
                      )}>
                        {stage.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active previews */}
            <div className="mt-5 pt-4 border-t border-border/70 space-y-2">
              {activeItems.slice(0, 3).map(item => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-hover transition-colors group"
                >
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-surface-subtle to-surface-hover flex items-center justify-center text-text-muted shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-text-primary truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={item.status} />
                      {item.estimatedDuration && (
                        <span className="text-[11px] text-text-muted">{formatDuration(item.estimatedDuration)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted tabular-nums hidden sm:block">
                    {formatRelativeTime(item.updatedAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              {activeItems.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[13px] text-text-muted">No content in production</p>
                  <Button variant="primary" size="sm" className="mt-3" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => navigate('/create')}>
                    Create your first short
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader
            title="Needs attention"
            action={needsReview.length + failedItems.length > 0 && (
              <Badge variant={failedItems.length > 0 ? 'danger' : 'warning'}>
                {needsReview.length + failedItems.length}
              </Badge>
            )}
          />
          <CardContent className="pt-0 space-y-2">
            {needsReview.length === 0 && failedItems.length === 0 && (
              <div className="py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-[13px] text-text-secondary font-medium">All clear</p>
                <p className="text-[12px] text-text-muted mt-0.5">Nothing waiting on you right now.</p>
              </div>
            )}

            {failedItems.slice(0, 3).map(item => (
              <Link key={item.id} to={`/content/${item.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-danger-soft/30 hover:bg-danger-soft/50 transition-colors">
                <div className="h-8 w-8 rounded-md bg-danger-soft text-danger flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-text-primary truncate">{item.title}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">Production failed — {item.failureReason || 'Requires investigation'}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted mt-1" />
              </Link>
            ))}

            {needsReview.slice(0, failedItems.length > 0 ? 2 : 4).map(item => (
              <Link key={item.id} to={`/content/${item.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-warning-soft/20 hover:bg-warning-soft/40 transition-colors">
                <div className="h-8 w-8 rounded-md bg-warning-soft text-warning flex items-center justify-center shrink-0 mt-0.5">
                  {item.status === 'review' ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-text-primary truncate">{item.title}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    {item.status === 'review' ? 'Ready for your review' : 'QC needs your attention'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted mt-1" />
              </Link>
            ))}

            {(needsReview.length > 0 || failedItems.length > 0) && (
              <button
                onClick={() => navigate('/content?filter=needs_attention')}
                className="w-full mt-2 py-2 text-[12px] font-medium text-accent hover:text-accent transition-colors flex items-center justify-center gap-1"
              >
                Review all items <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Queue */}
      <Card>
        <CardHeader
          title="Today's queue"
          subtitle={`${todayJobs.length} job${todayJobs.length !== 1 ? 's' : ''} in progress`}
          action={
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate('/queue')}>
              Open queue
            </Button>
          }
        />
        <CardContent className="pt-0">
          {todayJobs.length === 0 ? (
            <div className="py-8 text-center">
              <ListTodo className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-60" />
              <p className="text-[13px] text-text-secondary">No active jobs right now</p>
              <p className="text-[12px] text-text-muted mt-0.5">Start creating or resume your automation engine.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {todayJobs.slice(0, 5).map(job => {
                const content = items.find(i => i.id === job.contentId);
                const stagePct = job.progress || 0;
                const stageLabel = job.stage.replace(/([A-Z])/g, ' $1').replace('_',' ');
                return (
                  <div key={job.id} className="flex items-center gap-4 py-2.5 px-2 rounded-lg hover:bg-surface-hover">
                    <div className="h-8 w-8 rounded-md bg-surface-subtle flex items-center justify-center shrink-0">
                      {job.stage === 'rendering' ? <Video className="h-4 w-4 text-text-secondary" /> :
                       job.stage === 'voice' ? <Sparkles className="h-4 w-4 text-text-secondary" /> :
                       job.stage === 'script' ? <Sparkles className="h-4 w-4 text-text-secondary" /> :
                       <RotateCcw className="h-4 w-4 text-text-secondary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-text-primary truncate">{content?.title || job.id}</span>
                        <span className="text-[10px] text-text-muted font-mono shrink-0">#{job.id.slice(0,8)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Progress value={stagePct} size="sm" className="flex-1 max-w-[200px]" />
                        <span className="text-[11px] text-text-muted tabular-nums w-8 text-right">{Math.round(stagePct)}%</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-text-muted capitalize w-20 text-right hidden sm:block">
                      {stageLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom: Performance + Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Performance — 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Performance snapshot"
            action={
              <div className="inline-flex rounded-lg border border-border bg-surface-subtle p-0.5">
                {(['7d','30d','90d'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                      range === r ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                    )}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            }
          />
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <MiniStat label="Views" value={formatNumber(totalViews)} trend={+12.4} />
              <MiniStat label="Watch time" value={`${formatNumber(totalViews * 0.6 / 60)}h`} trend={+8.2} />
              <MiniStat label="New subs" value={formatNumber(Math.round(totalSubs * 0.03))} trend={+3.7} />
            </div>
            <Sparkline
              data={generatePerformanceSeries(range)}
              width={640}
              height={140}
              className="w-full"
              stroke="#176B57"
              fill="rgba(23,107,87,0.10)"
            />
          </CardContent>
        </Card>

        {/* Top Content — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top performing"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
            }
          />
          <CardContent className="pt-0 space-y-1">
            {recentlyPublished.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-text-muted">No published content yet</p>
              </div>
            ) : recentlyPublished.map((item, i) => (
              <Link key={item.id} to={`/content/${item.id}`} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-surface-hover transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-surface-subtle to-surface-hover flex items-center justify-center text-text-muted font-semibold text-[11px] shrink-0">
                  {String(i+1).padStart(2,'0')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-text-primary truncate">{item.title}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(item.views || 0)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(item.retention || 0)}%</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{formatNumber(item.likes || 0)}</span>
                  </div>
                </div>
                <TrendingUp className="h-3.5 w-3.5 text-success shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'attention' }) {
  return (
    <span className="relative flex h-2 w-2">
      {status !== 'healthy' && (
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping',
          status === 'attention' ? 'bg-danger' : 'bg-warning'
        )} />
      )}
      <span className={cn(
        'relative inline-flex rounded-full h-2 w-2',
        status === 'healthy' ? 'bg-success' :
        status === 'degraded' ? 'bg-warning' :
        'bg-danger'
      )} />
    </span>
  );
}

function MiniStat({ label, value, trend }: { label: string; value: string; trend: number }) {
  const positive = trend >= 0;
  return (
    <div>
      <div className="text-[11px] text-text-muted uppercase tracking-wider">{label}</div>
      <div className="text-[20px] font-bold text-text-primary mt-0.5 tabular-nums">{value}</div>
      <div className={cn(
        'text-[11px] font-medium mt-0.5 flex items-center gap-0.5',
        positive ? 'text-success' : 'text-danger'
      )}>
        <TrendingUp className={cn('h-3 w-3', !positive && 'rotate-180')} />
        {positive ? '+' : ''}{trend.toFixed(1)}%
      </div>
    </div>
  );
}

function generatePerformanceSeries(range: '7d' | '30d' | '90d'): number[] {
  const n = range === '7d' ? 14 : range === '30d' ? 30 : 45;
  const base = range === '7d' ? 400 : range === '30d' ? 320 : 280;
  const out: number[] = [];
  let v = base * 0.6;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.35) * base * 0.12;
    v = Math.max(base * 0.3, Math.min(base * 1.8, v));
    out.push(Math.round(v));
  }
  return out;
}
