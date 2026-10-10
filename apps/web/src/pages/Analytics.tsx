import { useState, useEffect } from 'react';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { apiClient } from '../services/apiClient';
import {
  seedAnalytics,
  seedViewsSeries,
  seedWatchTimeSeries,
  seedTopics,
  seedInsights,
  seedLearnedPreferences,
  seedContentPerformance,
} from '../mock/seedData';
import { cn, formatNumber } from '../lib/utils';
import {
  Eye,
  Clock,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Brain,
  Target,
  Flame,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export function Analytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [liveTotals, setLiveTotals] = useState<{
    views?: number;
    likes?: number;
    comments?: number;
    watchTimeMinutes?: number;
  } | null>(null);
  const items = useContentStore((s) => s.items);
  const published = items.filter((i) => i.status === 'published');
  const analytics = seedAnalytics();

  useEffect(() => {
    apiClient
      .get<any>('/analytics/summary')
      .then((res) => {
        if (res?.totals && res.totals.views > 0) {
          setLiveTotals(res.totals);
        }
      })
      .catch(() => undefined);
  }, []);

  const rawViewsData = seedViewsSeries();
  const rawWatchTimeData = seedWatchTimeSeries();

  const sliceCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 14 : 30;
  const viewsData = rawViewsData.slice(-sliceCount);
  const watchTimeData = rawWatchTimeData.slice(-sliceCount);
  const topics = seedTopics();
  const insights = seedInsights();
  const learned = seedLearnedPreferences();
  const contentPerf = seedContentPerformance();

  const totalViews = liveTotals?.views ?? analytics.views;
  const totalWatchHours = Math.round(
    (liveTotals?.watchTimeMinutes ? liveTotals.watchTimeMinutes * 60 : analytics.watchTime) / 3600
  );

  const kpis = [
    { label: 'Total Views', value: formatNumber(totalViews), icon: Eye },
    { label: 'Watch Time', value: `${formatNumber(totalWatchHours)} hrs`, icon: Clock },
    { label: 'Subscribers', value: formatNumber(analytics.subscribers), icon: Users },
    { label: 'Avg. Retention', value: `${analytics.retention}%`, icon: TrendingUp },
    {
      label: 'Likes',
      value: formatNumber(
        (liveTotals?.likes ?? analytics.likes) + published.reduce((s, i) => s + (i.likes || 0), 0)
      ),
      icon: Heart,
    },
    {
      label: 'Comments',
      value: formatNumber(
        (liveTotals?.comments ?? analytics.comments) +
          published.reduce((s, i) => s + (i.comments || 0), 0)
      ),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channel Intelligence & Analytics"
        description="Audience retention curves, topic pacing feedback, and YouTube release performance."
        actions={
          <div className="flex items-center gap-1 p-1 bg-canvas-subtle border border-border rounded-lg">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all',
                  dateRange === r
                    ? 'bg-surface text-ink font-semibold shadow-xs'
                    : 'text-stone hover:text-ink'
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between text-stone">
                <span className="text-[11px] font-mono">{kpi.label}</span>
                <Icon className="h-3.5 w-3.5 text-stone-muted" />
              </div>
              <div className="text-xl font-bold text-ink">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
              Views Progression
            </span>
            <span className="text-[11px] font-mono text-coral">1080×1920 Shorts</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EC5A3A" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#EC5A3A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#706B64' }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#706B64' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)}
                />
                <ReTooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5DDD1',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#EC5A3A"
                  strokeWidth={2}
                  fill="url(#viewsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
              Total Watch Duration (Hours)
            </span>
            <span className="text-[11px] font-mono text-moss-dark">Normalized Pacing</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={watchTimeData}>
                <defs>
                  <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#789181" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#789181" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#706B64' }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#706B64' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 3600 ? (v / 3600).toFixed(0) + 'h' : (v / 60).toFixed(0) + 'm')}
                />
                <ReTooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5DDD1',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#789181"
                  strokeWidth={2}
                  fill="url(#wtGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Editorial Insights & Learning Loop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Brain className="h-4 w-4 text-coral" />
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
              Algorithmic Feedback Insights
            </span>
          </div>
          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-lg bg-canvas-subtle border border-border flex items-start gap-3"
              >
                <Lightbulb className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-ink leading-relaxed">{ins.text}</p>
                  <span className="text-[10px] font-mono text-stone-muted uppercase block">
                    Category: {ins.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <BarChart3 className="h-4 w-4 text-coral" />
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
              Pacing Diagnostics
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-canvas-subtle border border-border flex justify-between">
              <span className="text-stone">Ideal Duration:</span>
              <span className="font-semibold text-ink">{learned.bestDuration}</span>
            </div>
            <div className="p-2.5 rounded bg-canvas-subtle border border-border flex justify-between">
              <span className="text-stone">Top Hook Angle:</span>
              <span className="font-semibold text-ink">{learned.bestHook}</span>
            </div>
            <div className="p-2.5 rounded bg-canvas-subtle border border-border flex justify-between">
              <span className="text-stone">Leading Pillar:</span>
              <span className="font-semibold text-ink">{learned.bestPillar}</span>
            </div>
            <div className="p-2.5 rounded bg-canvas-subtle border border-border flex justify-between">
              <span className="text-stone">Release Slot:</span>
              <span className="font-semibold text-coral">{learned.bestPostingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
