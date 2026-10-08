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
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'All caught up'}
        actions={
          unread > 0 && <Button variant="secondary" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4" />Mark all read</Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You will see alerts about your content engine here." />
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {notifications.map(n => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className={cn('flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer', !n.read && 'bg-accent/3')}
                  onClick={() => markRead(n.id)}
                >
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', colorMap[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{n.message}</p>
                    <p className="text-xs text-text-muted mt-1">{formatRelativeTime(n.timestamp)}</p>
                  </div>
                  {n.link && (
                    <Link to={n.link} className="text-text-muted hover:text-accent shrink-0 mt-1">
                      <Video className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <p className="text-xs text-text-muted text-center">
        <Badge variant="default" className="mr-2">DEMO MODE</Badge>
        Notifications are simulated.
      </p>
    </div>
  );
}
