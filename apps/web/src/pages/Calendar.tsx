import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../components/ui/Dialog';
import { cn, formatNumber, formatTime } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Video,
  ArrowRight,
} from 'lucide-react';

export function Calendar() {
  const navigate = useNavigate();
  const items = useContentStore(s => s.items);
  const updateContent = useContentStore(s => s.updateContent);
  const showToast = useUIStore(s => s.showToast);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');

  // Reschedule Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('18:00');

  const scheduled = items.filter(i => i.status === 'scheduled' && i.scheduledAt);
  const published = items.filter(i => i.status === 'published' && i.publishedAt);

  // Detect Scheduling Conflicts (items within 2 hours of each other)
  const conflicts = useMemo(() => {
    const list = [...scheduled].sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
    const conflictPairs: Array<{ first: typeof list[0]; second: typeof list[0]; diffHours: number }> = [];

    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      const diffMs = Math.abs(new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime());
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 2) {
        conflictPairs.push({ first: a, second: b, diffHours: Math.round(diffHours * 10) / 10 });
      }
    }
    return conflictPairs;
  }, [scheduled]);

  const handleResolveConflict = (secondItemId: string, originalDateStr: string) => {
    const original = new Date(originalDateStr);
    const resolved = new Date(original.getTime() + 4 * 60 * 60 * 1000).toISOString();
    updateContent(secondItemId, { scheduledAt: resolved });
    apiClient.scheduling.create({
      contentId: secondItemId,
      channelId: '',
      scheduledAt: resolved,
    }).catch(() => undefined);
    showToast({
      type: 'success',
      title: 'Conflict Resolved',
      message: 'Video rescheduled with 4-hour spacing to protect audience retention.',
    });
  };

  // Month Days calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const days: { date: Date; isCurrentMonth: boolean; items: typeof scheduled }[] = [];

    for (let i = 0; i < startDay; i++) {
      const d = new Date(year, month, -startDay + i + 1);
      days.push({ date: d, isCurrentMonth: false, items: [] });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      const d = new Date(year, month, i);
      const dayItems = scheduled.filter(item => {
        const sched = new Date(item.scheduledAt!);
        return sched.toDateString() === d.toDateString();
      });
      days.push({ date: d, isCurrentMonth: true, items: dayItems });
    }
    while (days.length % 7 !== 0) {
      const lastD = days[days.length - 1].date;
      const d = new Date(lastD);
      d.setDate(d.getDate() + 1);
      days.push({ date: d, isCurrentMonth: false, items: [] });
    }
    return days;
  }, [currentDate, scheduled]);

  // Week Days calculation (7 days around current week)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const firstDay = curr.getDate() - curr.getDay();
    const days: Array<{ date: Date; items: typeof scheduled; published: typeof published }> = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(firstDay + i));
      const daySched = scheduled.filter(item => new Date(item.scheduledAt!).toDateString() === d.toDateString());
      const dayPub = published.filter(item => new Date(item.publishedAt!).toDateString() === d.toDateString());
      days.push({ date: new Date(d), items: daySched, published: dayPub });
    }
    return days;
  }, [currentDate, scheduled, published]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toDateString();

  const goPrev = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goNext = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const openRescheduleModal = (item: any) => {
    setSelectedItem(item);
    const d = item.scheduledAt ? new Date(item.scheduledAt) : new Date();
    setRescheduleDate(d.toISOString().split('T')[0]);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setRescheduleTime(`${hh}:${mm}`);
  };

  const handleSaveReschedule = () => {
    if (!selectedItem || !rescheduleDate) return;
    const [hh, mm] = rescheduleTime.split(':');
    const dt = new Date(rescheduleDate);
    dt.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);

    updateContent(selectedItem.id, {
      scheduledAt: dt.toISOString(),
      status: 'scheduled',
    });
    apiClient.scheduling.create({
      contentId: selectedItem.id,
      channelId: '',
      scheduledAt: dt.toISOString(),
    }).catch(() => undefined);
    showToast({ type: 'success', title: 'Schedule updated', message: `${selectedItem.title} moved to ${dt.toLocaleString()}` });
    setSelectedItem(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content Calendar"
        description="Plan, schedule, and prevent distribution conflicts for upcoming short videos."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden bg-surface">
              {(['month', 'week', 'agenda'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    view === v ? 'bg-accent/15 text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button onClick={() => navigate('/create')}>
              <Plus className="h-4 w-4" />Schedule Video
            </Button>
          </div>
        }
      />

      {/* Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  Scheduling Conflict Detected ({conflicts.length})
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  "{conflicts[0].first.title}" and "{conflicts[0].second.title}" are scheduled only {conflicts[0].diffHours} hours apart. Publishing within 2 hours cannibalizes algorithm reach.
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleResolveConflict(conflicts[0].second.id, conflicts[0].second.scheduledAt!)}
            >
              Auto-Resolve (+4h Spacing)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Calendar Card */}
      <Card>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-semibold text-text-primary text-sm min-w-40">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs ml-2">
              Today
            </Button>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Published</span>
          </div>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div>
            <div className="grid grid-cols-7 bg-surface-subtle/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-2 text-micro-label uppercase tracking-wider text-text-muted text-center border-b border-border">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day, i) => {
                const isToday = day.date.toDateString() === today;
                const publishedOnDay = published.filter(p => new Date(p.publishedAt!).toDateString() === day.date.toDateString());
                const totalOnDay = day.items.length + publishedOnDay.length;

                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-28 p-2 border-b border-r border-border transition-colors',
                      !day.isCurrentMonth && 'bg-surface-subtle/40 opacity-70',
                      isToday && 'bg-accent/5'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn(
                        'text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full',
                        isToday ? 'bg-accent text-white font-bold' : day.isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                      )}>
                        {day.date.getDate()}
                      </span>
                      {totalOnDay > 0 && (
                        <span className="text-[10px] text-text-muted font-mono">{totalOnDay}/5</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {publishedOnDay.slice(0, 2).map(p => (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/content/${p.id}`)}
                          className="text-[11px] px-2 py-1 rounded bg-success/10 text-success truncate cursor-pointer hover:bg-success/20 font-medium"
                          title={p.title}
                        >
                          ✓ {p.title}
                        </div>
                      ))}
                      {day.items.slice(0, 2).map(item => (
                        <div
                          key={item.id}
                          onClick={() => openRescheduleModal(item)}
                          className="text-[11px] px-2 py-1 rounded bg-accent/15 text-accent truncate cursor-pointer hover:bg-accent/25 font-medium flex items-center justify-between"
                          title={`${item.title} (Click to reschedule)`}
                        >
                          <span className="truncate">{item.title}</span>
                          <Clock className="h-2.5 w-2.5 ml-1 shrink-0 opacity-70" />
                        </div>
                      ))}
                      {totalOnDay > 2 && (
                        <div className="text-[10px] text-text-muted px-1">+{totalOnDay - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-7 bg-surface-subtle/50 border-b border-border">
              {weekDays.map(({ date }, idx) => {
                const isToday = date.toDateString() === today;
                return (
                  <div key={idx} className={cn('p-3 text-center border-r border-border last:border-r-0', isToday && 'bg-accent/10')}>
                    <div className="text-micro-label uppercase tracking-wider text-text-muted">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn('text-sm font-bold mt-0.5', isToday ? 'text-accent' : 'text-text-primary')}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 min-h-[420px]">
              {weekDays.map(({ date, items: daySched, published: dayPub }, idx) => {
                const isToday = date.toDateString() === today;
                return (
                  <div key={idx} className={cn('p-2 border-r border-border last:border-r-0 space-y-2', isToday && 'bg-accent/5')}>
                    {dayPub.map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/content/${p.id}`)}
                        className="p-2 rounded border border-success/30 bg-success/10 text-success text-xs cursor-pointer hover:bg-success/20 transition-colors"
                      >
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Published
                        </div>
                      </div>
                    ))}
                    {daySched.map(item => (
                      <div
                        key={item.id}
                        onClick={() => openRescheduleModal(item)}
                        className="p-2.5 rounded border border-accent/30 bg-accent/10 text-accent text-xs cursor-pointer hover:bg-accent/20 transition-colors shadow-sm"
                      >
                        <div className="font-semibold truncate">{item.title}</div>
                        <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1 text-text-primary">
                          <Clock className="h-3 w-3 text-accent" />
                          {new Date(item.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                    {daySched.length === 0 && dayPub.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[11px] text-text-muted py-8 opacity-40">
                        No videos
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agenda View */}
        {view === 'agenda' && (
          <div className="divide-y divide-border">
            {[...scheduled]
              .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-subtle cursor-pointer transition-colors"
                  onClick={() => openRescheduleModal(item)}
                >
                  <div className={cn('h-12 w-20 rounded bg-gradient-to-br shrink-0 flex items-center justify-center text-white/50 text-xs font-mono', item.thumbnailGradient || 'from-slate-700 to-slate-800')}>
                    9:16
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">{item.title}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1 text-text-primary">
                        <CalendarIcon className="h-3.5 w-3.5 text-accent" />
                        {new Date(item.scheduledAt!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        {new Date(item.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>Target: {item.estimatedDuration || 45}s</span>
                    </div>
                  </div>
                  <Badge variant="accent">Scheduled</Badge>
                </div>
              ))}
            {scheduled.length === 0 && (
              <div className="py-16 text-center text-sm text-text-muted">
                No scheduled videos in the calendar.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Reschedule Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                <div className="text-xs text-text-muted">Selected Title</div>
                <div className="text-sm font-semibold text-text-primary truncate mt-0.5">{selectedItem.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date"
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/studio/${selectedItem.id}`)}>
                Open in Studio <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setSelectedItem(null)}>Cancel</Button>
                <Button onClick={handleSaveReschedule}>Save Schedule</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
