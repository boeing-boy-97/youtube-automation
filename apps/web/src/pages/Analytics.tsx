import { useState, useEffect } from 'react';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { apiClient } from '../services/apiClient';
import { seedAnalytics, seedViewsSeries, seedWatchTimeSeries, seedSubscribersSeries, seedTopics, seedInsights, seedLearnedPreferences, seedHeatmap, seedContentPerformance } from '../mock/seedData';
import { cn, formatNumber } from '../lib/utils';
import {
  Eye,
  Clock,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  Calendar as CalendarIcon,
  Lightbulb,
  BarChart3,
  Brain,
  Target,
  Flame,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';

export function Analytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [liveTotals, setLiveTotals] = useState<{ views?: number; likes?: number; comments?: number; watchTimeMinutes?: number } | null>(null);
  const items = useContentStore(s => s.items);
  const published = items.filter(i => i.status === 'published');
  const analytics = seedAnalytics();

  useEffect(() => {
    apiClient.get<any>('/analytics/summary')
      .then((res) => {
        if (res?.totals && res.totals.views > 0) {
          setLiveTotals(res.totals);
        }
      })
      .catch(() => undefined);
  }, []);

  const rawViewsData = seedViewsSeries();
  const rawWatchTimeData = seedWatchTimeSeries();
  const rawSubsData = seedSubscribersSeries();

  const sliceCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 14 : 30;
  const viewsData = rawViewsData.slice(-sliceCount);
  const watchTimeData = rawWatchTimeData.slice(-sliceCount);
  const subsData = rawSubsData.slice(-sliceCount);
  const topics = seedTopics();
  const insights = seedInsights();
  const learned = seedLearnedPreferences();
  const heatmap = seedHeatmap();
  const contentPerf = seedContentPerformance();

  const kpis = [
    { label: 'Views', value: formatNumber(liveTotals?.views ?? analytics.views), change: analytics.viewsChange, icon: Eye },
    { label: 'Watch Time', value: formatNumber(Math.round((liveTotals?.watchTimeMinutes ? liveTotals.watchTimeMinutes * 60 : analytics.watchTime) / 3600)) + ' hrs', change: analytics.watchTimeChange, icon: Clock },
    { label: 'Subscribers', value: formatNumber(analytics.subscribers + 46000), change: analytics.subscribersChange, icon: Users },
    { label: 'Avg. Retention', value: analytics.retention + '%', change: analytics.retentionChange, icon: TrendingUp },
    { label: 'Likes', value: formatNumber((liveTotals?.likes ?? analytics.likes) + published.reduce((s,i)=>s+(i.likes||0),0)), change: analytics.likesChange, icon: Heart },
    { label: 'Comments', value: formatNumber((liveTotals?.comments ?? analytics.comments) + published.reduce((s,i)=>s+(i.comments||0),0)), change: analytics.commentsChange, icon: MessageSquare },
    { label: 'Shares', value: formatNumber(analytics.shares), change: analytics.sharesChange, icon: Share2 },
    { label: 'Consistency', value: analytics.publishingConsistency + '%', change: analytics.consistencyChange, icon: CalendarIcon },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapHours = [18, 19, 20, 21, 22];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Performance intelligence and content insights."
        actions={
          <div className="flex items-center gap-1">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  dateRange === r ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.slice(0, 4).map(kpi => {
          const Icon = kpi.icon;
          const positive = kpi.change > 0;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-surface-subtle flex items-center justify-center">
                  <Icon className="h-4 w-4 text-text-muted" />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[12px] text-text-secondary">{kpi.label}</span>
                {kpi.change !== 0 && (
                  <span className={cn('text-[11px] font-medium tabular-nums', positive ? 'text-success' : 'text-danger')}>
                    {positive ? '+' : ''}{kpi.change}%
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Views</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(155,43%,38%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(155,43%,38%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(155,43%,38%)" strokeWidth={2} fill="url(#viewsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Watch Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={watchTimeData}>
                  <defs>
                    <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(140,4%,55%)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="hsl(140,4%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 3600 ? (v/3600).toFixed(0)+'h' : (v/60).toFixed(0)+'m'} />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(140,4%,45%)" strokeWidth={1.5} fill="url(#wtGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* AI Insights */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4 text-accent" />Content Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map(ins => (
                <div key={ins.id} className="flex gap-3 p-3 rounded-lg bg-surface-subtle">
                  <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary leading-relaxed">{ins.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-text-muted">Confidence:</span>
                      <div className="w-16 h-1 bg-surface rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', ins.confidence >= 85 ? 'bg-success' : ins.confidence >= 70 ? 'bg-warning' : 'bg-error')} style={{ width: `${ins.confidence}%` }} />
                      </div>
                      <span className="text-xs font-medium text-text-primary">{ins.confidence}%</span>
                      <Badge variant="default" className="ml-auto capitalize">{ins.category}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-text-muted italic">Demo insights based on seeded data patterns.</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Loop */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Learning Engine</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" className="stroke-border" strokeWidth="3" />
                  <circle cx="32" cy="32" r="26" fill="none" className="stroke-accent" strokeWidth="3" strokeDasharray={`${90 * 0.78 * Math.PI} ${90 * Math.PI}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-text-primary">{learned.videosAnalyzed}</span>
                  <span className="text-[10px] text-text-muted">videos</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-text-muted mb-4">Learning from your published content</p>
            <div className="space-y-2">
              <LearnedRow icon={Clock} label="Best duration" value={learned.bestDuration} />
              <LearnedRow icon={Target} label="Best hook" value={learned.bestHook} />
              <LearnedRow icon={BarChart3} label="Best pillar" value={learned.bestPillar} />
              <LearnedRow icon={Flame} label="Best posting" value={learned.bestPostingTime} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic performance */}
      <Card>
        <CardHeader><CardTitle>Topic Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Topic</th>
                  <th className="text-right py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Videos</th>
                  <th className="text-right py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Views</th>
                  <th className="text-right py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Avg Retention</th>
                  <th className="text-right py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Engagement</th>
                  <th className="text-right py-2 text-micro-label uppercase tracking-wider text-text-muted font-medium">Sub Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topics.map(t => (
                  <tr key={t.topic} className="hover:bg-surface-subtle">
                    <td className="py-2.5 text-sm font-medium text-text-primary">{t.topic}</td>
                    <td className="py-2.5 text-sm text-text-secondary text-right">{t.videos}</td>
                    <td className="py-2.5 text-sm text-text-primary text-right font-medium">{formatNumber(t.views)}</td>
                    <td className="py-2.5 text-sm text-right">
                      <span className={cn(t.avgRetention >= 75 ? 'text-success' : 'text-warning')}>{t.avgRetention}%</span>
                    </td>
                    <td className="py-2.5 text-sm text-text-secondary text-right">{t.engagement}%</td>
                    <td className="py-2.5 text-sm text-text-secondary text-right">{t.subscriberConversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best posting time heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Best Posting Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full max-w-lg">
              <thead>
                <tr>
                  <th></th>
                  {heatmapHours.map(h => (
                    <th key={h} className="text-center text-xs text-text-muted font-medium py-1 px-1">{h > 12 ? h - 12 : h} PM</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day}>
                    <td className="text-xs text-text-secondary py-1 pr-3 font-medium">{day}</td>
                    {heatmapHours.map(hour => {
                      const cell = heatmap.find(c => c.day === day && c.hour === hour);
                      if (!cell) return <td key={hour} className="p-1"><div className="h-8 rounded bg-surface-subtle" /></td>;
                      return (
                        <td key={hour} className="p-1">
                          <div
                            className={cn('h-8 rounded flex items-center justify-center text-xs font-medium transition-colors', cell.recommended ? 'ring-2 ring-accent/40' : '')}
                            style={{
                              backgroundColor: `hsl(155, 43%, ${100 - cell.value * 0.5}%)`,
                              color: cell.value > 50 ? 'white' : 'hsl(var(--text-muted))',
                            }}
                            title={`${day} ${hour > 12 ? hour - 12 : hour} PM: ${cell.value}% engagement`}
                          >
                            {cell.recommended && <Flame className="h-3 w-3" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted mt-3">Your audience is most active around 7:30–9:00 PM.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LearnedRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-text-muted" />
      <span className="text-text-muted">{label}:</span>
      <span className="text-text-primary font-medium ml-auto">{value}</span>
    </div>
  );
}
