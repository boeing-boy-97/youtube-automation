import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/common/PageHeader';
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
  const items = useContentStore((s) => s.items);
  const updateContent = useContentStore((s) => s.updateContent);
  const showToast = useUIStore((s) => s.showToast);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'agenda'>('month');

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('18:00');

  const scheduled = items.filter((i) => i.status === 'scheduled' && i.scheduledAt);
  const published = items.filter((i) => i.status === 'published' && i.publishedAt);

  const conflicts = useMemo(() => {
    const list = [...scheduled].sort(
      (a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    );
    const conflictPairs: Array<{ first: (typeof list)[0]; second: (typeof list)[0]; diffHours: number }> =
      [];

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
    const shifted = new Date(original.getTime() + 4 * 60 * 60 * 1000).toISOString();
    updateContent(secondItemId, { scheduledAt: shifted });
    showToast({
      type: 'success',
      title: 'Conflict Resolved',
      message: `Shifted publication time 4 hours later to avoid overlap.`,
    });
  };

  const handleSaveReschedule = async () => {
    if (!selectedItem || !rescheduleDate) return;
    const combined = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
    updateContent(selectedItem.id, { scheduledAt: combined });

    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        await apiClient.scheduling.create({
          contentId: selectedItem.id,
          channelId: '',
          scheduledAt: combined,
        });
      }
    } catch {
      // Local mode fallback
    }

    showToast({ type: 'success', title: 'Rescheduled', message: `Moved to ${new Date(combined).toLocaleString()}` });
    setSelectedItem(null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publishing Calendar"
        description="Slot automation, distribution schedule, and YouTube release planning."
        actions={
          <Button
            onClick={() => navigate('/create')}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Short</span>
          </Button>
        }
      />

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-semibold text-amber-900 block">
              Scheduling Overlap Detected ({conflicts.length})
            </span>
            <p className="text-stone">
              Two shorts are scheduled within 2 hours of each other, which may cannibalize algorithm distribution.
            </p>
            <div className="pt-2 space-y-1">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-surface border border-border">
                  <span className="truncate max-w-sm text-ink font-medium">
                    "{c.first.title}" vs "{c.second.title}" ({c.diffHours}h apart)
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResolveConflict(c.second.id, c.second.scheduledAt!)}
                    className="btn-secondary h-7 px-2 text-[11px]"
                  >
                    Shift 4h Later
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="btn-secondary h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-ink min-w-[140px] text-center font-mono">
            {monthName}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="btn-secondary h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="btn-secondary h-8 px-2.5 text-xs ml-2"
          >
            Today
          </Button>
        </div>

        <div className="flex p-1 bg-canvas-subtle border border-border rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setView('month')}
            className={cn(
              'px-3 py-1 rounded-md transition-all font-medium',
              view === 'month' ? 'bg-surface text-ink font-semibold shadow-xs' : 'text-stone hover:text-ink'
            )}
          >
            Month Grid
          </button>
          <button
            type="button"
            onClick={() => setView('agenda')}
            className={cn(
              'px-3 py-1 rounded-md transition-all font-medium',
              view === 'agenda' ? 'bg-surface text-ink font-semibold shadow-xs' : 'text-stone hover:text-ink'
            )}
          >
            Agenda List
          </button>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' ? (
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <div className="grid grid-cols-7 gap-px bg-border text-center text-[11px] font-mono font-semibold text-stone mb-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-canvas-subtle py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-canvas-subtle/30 min-h-[90px] p-2" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayScheduled = scheduled.filter((s) => s.scheduledAt?.startsWith(dateStr));
              const dayPublished = published.filter((p) => p.publishedAt?.startsWith(dateStr));

              return (
                <div
                  key={day}
                  className="bg-surface min-h-[90px] p-2 flex flex-col justify-between hover:bg-canvas-subtle/40 transition-colors"
                >
                  <span className="font-mono text-xs font-semibold text-stone">{day}</span>

                  <div className="space-y-1 my-1">
                    {dayScheduled.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setRescheduleDate(item.scheduledAt!.split('T')[0]);
                        }}
                        className="p-1 rounded bg-coral-soft border border-coral/30 text-[10px] font-medium text-coral truncate cursor-pointer hover:border-coral"
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayPublished.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/content/${item.id}`)}
                        className="p-1 rounded bg-moss/10 border border-moss/30 text-[10px] font-medium text-moss-dark truncate cursor-pointer"
                      >
                        ✓ {item.title}
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] text-stone-muted font-mono text-right">
                    {dayScheduled.length + dayPublished.length > 0 ? `${dayScheduled.length + dayPublished.length} items` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
          <span className="text-xs font-mono font-bold text-stone uppercase tracking-wide block border-b border-border pb-2">
            Upcoming Scheduled Slots
          </span>

          {scheduled.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone">
              No shorts currently queued in the calendar.
            </div>
          ) : (
            <div className="divide-y border-border">
              {scheduled.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-ink block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono text-stone">
                      {new Date(item.scheduledAt!).toLocaleString()}
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setRescheduleDate(item.scheduledAt!.split('T')[0]);
                    }}
                    className="btn-secondary h-7 px-2.5 text-xs"
                  >
                    Reschedule
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} size="md">
          <DialogHeader>
            <DialogTitle>Reschedule Video Release</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <p className="text-xs text-stone">
              Update the scheduled publication slot for <strong>{selectedItem.title}</strong>.
            </p>
            <Input
              label="Release Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
            <Input
              label="Release Time (UTC)"
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
            />
          </DialogContent>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedItem(null)}
              className="btn-secondary text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReschedule}
              className="btn-primary text-xs"
            >
              Update Slot
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
