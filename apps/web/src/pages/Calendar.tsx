import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn, formatNumber, formatTime } from '../lib/utils';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

export function Calendar() {
  const navigate = useNavigate();
  const items = useContentStore(s => s.items);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const scheduled = items.filter(i => i.status === 'scheduled' && i.scheduledAt);
  const published = items.filter(i => i.status === 'published' && i.publishedAt);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
  }, [currentMonth, scheduled]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toDateString();

  const goPrev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const goNext = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content Calendar"
        description="Plan and schedule your publishing."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              {(['month', 'week', 'agenda'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 text-xs font-medium capitalize transition-colors', view === v ? 'bg-surface-subtle text-text-primary' : 'text-text-muted hover:text-text-primary')}>{v}</button>
              ))}
            </div>
            <Button onClick={() => navigate('/create')}><Plus className="h-4 w-4" />Schedule</Button>
          </div>
        }
      />

      <Card>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-semibold text-text-primary w-40">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Published</span>
          </div>
        </div>

        {view === 'month' && (
          <div>
            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-2 text-micro-label uppercase tracking-wider text-text-muted text-center border-b border-border">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day, i) => {
                const isToday = day.date.toDateString() === today;
                const publishedOnDay = published.filter(p => new Date(p.publishedAt!).toDateString() === day.date.toDateString());
                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-24 p-1.5 border-b border-r border-border',
                      !day.isCurrentMonth && 'bg-surface-subtle/70',
                      isToday && 'bg-accent-soft/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        'text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full',
                        isToday ? 'bg-accent text-white' : day.isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                      )}>
                        {day.date.getDate()}
                      </span>
                      {day.items.length < 5 && (
                        <span className="text-[10px] text-text-muted">{day.items.length + publishedOnDay.length}/5</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {publishedOnDay.slice(0, 2).map(p => (
                        <div key={p.id} onClick={() => navigate(`/content/${p.id}`)} className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success truncate cursor-pointer hover:bg-success/20">
                          {p.title}
                        </div>
                      ))}
                      {day.items.slice(0, 2).map(item => (
                        <div key={item.id} onClick={() => navigate(`/content/${item.id}`)} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent truncate cursor-pointer hover:bg-accent/20">
                          {item.title}
                        </div>
                      ))}
                      {(day.items.length + publishedOnDay.length) > 2 && (
                        <div className="text-[10px] text-text-muted px-1">+{day.items.length + publishedOnDay.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'agenda' && (
          <div className="divide-y divide-border">
            {[...scheduled].sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()).map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-subtle cursor-pointer" onClick={() => navigate(`/content/${item.id}`)}>
                <div className={cn('h-10 w-16 rounded bg-gradient-to-br shrink-0', item.thumbnailGradient || 'from-slate-700 to-slate-800')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{item.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {new Date(item.scheduledAt!).toLocaleString()}
                  </div>
                </div>
                <Badge variant="accent">Scheduled</Badge>
              </div>
            ))}
            {scheduled.length === 0 && (
              <div className="py-12 text-center text-sm text-text-muted">No scheduled videos</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
