import { Link } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatRelativeTime } from '../lib/utils';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  CheckCheck,
  Video,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-success bg-success/10',
  error: 'text-danger bg-danger/10',
  warning: 'text-warning bg-warning/10',
  info: 'text-info bg-info/10',
};

export function Notifications() {
  const notifications = useContentStore(s => s.notifications);
  const markRead = useContentStore(s => s.markNotificationRead);
  const markAllRead = useContentStore(s => s.markAllNotificationsRead);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread alert${unread > 1 ? 's' : ''}` : 'All pipeline alerts reviewed'}
        actions={
          unread > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="Pipeline notifications, render completions, and QC alerts will appear here."
        />
      ) : (
        <Card className="border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {notifications.map(n => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3.5 px-5 py-4 transition-colors cursor-pointer hover:bg-surface-subtle',
                    !n.read && 'bg-accent/5'
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', colorMap[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                      {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-text-muted mt-1 font-mono">{formatRelativeTime(n.timestamp)}</p>
                  </div>
                  {n.link && (
                    <Link to={n.link} className="text-text-muted hover:text-accent shrink-0 mt-1" title="View associated content">
                      <Video className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
