import { Link } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { cn, formatRelativeTime } from '../lib/utils';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-moss bg-moss/10 border-moss/20',
  error: 'text-danger bg-danger/10 border-danger/20',
  warning: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  info: 'text-stone bg-canvas-subtle border-border',
};

export function Notifications() {
  const notifications = useContentStore((s) => s.notifications);
  const markRead = useContentStore((s) => s.markNotificationRead);
  const markAllRead = useContentStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Studio Notifications"
        description={
          unread > 0
            ? `${unread} unread alert${unread > 1 ? 's' : ''} requiring review.`
            : 'All pipeline alerts and publishing events reviewed.'
        }
        actions={
          unread > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="btn-secondary h-8 px-3 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="Pipeline notifications, render completions, and QC alerts will appear here."
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-xs divide-y border-border overflow-hidden">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Info;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'p-4 flex items-start gap-4 transition-colors cursor-pointer',
                  !n.read ? 'bg-vermilion-soft/20 hover:bg-vermilion-soft/30' : 'hover:bg-canvas-subtle/50'
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5',
                    colorMap[n.type] || colorMap.info
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-ink leading-snug">{n.title}</h4>
                    <span className="text-[10px] font-mono text-stone-muted shrink-0">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-stone leading-relaxed">{n.message}</p>
                </div>

                {!n.read && <span className="h-2 w-2 rounded-full bg-vermilion shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
