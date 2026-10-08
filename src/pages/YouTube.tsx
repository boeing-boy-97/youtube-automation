import { useWorkspaceStore } from '../stores/workspaceStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import { seedRecentUploads } from '../mock/seedData';
import {
  Play as YoutubeIcon,
  Eye,
  Users,
  Video as VideoIcon,
  Clock,
  Heart,
  CheckCircle,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

export function YouTubePage() {
  const { youtubeChannel, connectYouTube, disconnectYouTube } = workspaceStore();
  const [connecting, setConnecting] = useState(false);
  const recentUploads = seedRecentUploads();

  function workspaceStore() {
    return {
      youtubeChannel: useWorkspaceStore(s => s.youtubeChannel),
      connectYouTube: useWorkspaceStore(s => s.connectYouTube),
      disconnectYouTube: useWorkspaceStore(s => s.disconnectYouTube),
    };
  }

  const handleConnect = async () => {
    setConnecting(true);
    await connectYouTube();
    setConnecting(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="YouTube Channel"
        description="Manage your YouTube connection and publishing."
      />

      {!youtubeChannel || youtubeChannel.connectionStatus !== 'connected' ? (
        <Card className="p-12 text-center">
          <YoutubeIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-section-title text-text-primary mb-2">Connect your YouTube channel</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">Link your YouTube channel to enable publishing, analytics sync, and channel management.</p>
          <Button onClick={handleConnect} loading={connecting}>
            <YoutubeIcon className="h-4 w-4" />
            {connecting ? 'Connecting...' : 'Connect YouTube'}
          </Button>
          <p className="text-xs text-text-muted mt-4">Demo mode: This simulates an OAuth connection.</p>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <YoutubeIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-text-primary">{youtubeChannel.title}</h2>
                    <Badge variant="success" dot>Connected</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">{youtubeChannel.description}</p>
                  <div className="flex flex-wrap gap-6">
                    <Stat icon={Users} label="Subscribers" value={formatNumber(youtubeChannel.subscriberCount || 0)} />
                    <Stat icon={Eye} label="Total Views" value={formatNumber(youtubeChannel.viewCount || 0)} />
                    <Stat icon={VideoIcon} label="Videos" value={youtubeChannel.videoCount?.toString() || '0'} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" size="sm" onClick={disconnectYouTube}>Disconnect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Connection Health</div>
                    <div className="text-sm font-semibold text-success">Healthy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Last Upload</div>
                    <div className="text-sm font-semibold text-text-primary">{youtubeChannel.lastUpload ? formatRelativeTime(youtubeChannel.lastUpload) : 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Next Upload</div>
                    <div className="text-sm font-semibold text-text-primary">Tomorrow 7:30 PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <div className="divide-y divide-border">
              {recentUploads.map(upload => (
                <div key={upload.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-subtle transition-colors">
                  <div className="h-12 w-20 rounded bg-gradient-to-br from-slate-700 to-slate-900 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{upload.title}</div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(upload.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(upload.likes)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(upload.duration)}</span>
                      <span>{formatRelativeTime(upload.publishedAt)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text-muted mb-0.5">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold text-text-primary">{value}</div>
    </div>
  );
}
