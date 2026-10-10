import { useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
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
  AlertTriangle,
  Key,
} from 'lucide-react';

export function YouTubePage() {
  const youtubeChannel = useWorkspaceStore(s => s.youtubeChannel);
  const connectYouTube = useWorkspaceStore(s => s.connectYouTube);
  const connectYouTubeOAuth = useWorkspaceStore(s => s.connectYouTubeOAuth);
  const disconnectYouTube = useWorkspaceStore(s => s.disconnectYouTube);
  const showToast = useUIStore(s => s.showToast);

  const [connecting, setConnecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const recentUploads = seedRecentUploads();

  const handleOAuthConnect = async () => {
    setConnecting(true);
    setOauthError(null);
    try {
      const res = await connectYouTubeOAuth();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setOauthError(res.error || 'Google OAuth credentials not configured on backend.');
      }
    } catch (err: any) {
      setOauthError(err.message || 'OAuth error');
    } finally {
      setConnecting(false);
    }
  };

  const handleSimulatedConnect = async () => {
    setConnecting(true);
    try {
      await connectYouTube();
      showToast({ type: 'success', title: 'Channel connected', message: 'Channel profile linked to workspace.' });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="YouTube Channel"
        description="Manage your YouTube channel OAuth connection, publishing, and analytics sync."
      />

      {!youtubeChannel || youtubeChannel.connectionStatus !== 'connected' ? (
        <Card className="p-8 text-center max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-red-600/10 text-red-500 mx-auto mb-4 flex items-center justify-center">
            <YoutubeIcon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Connect Your YouTube Channel</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Link your channel to enable automated publishing of vertical Shorts, metadata synchronization, and retention analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleOAuthConnect} loading={connecting}>
              <YoutubeIcon className="h-4 w-4" />
              Connect with Google OAuth
            </Button>
            <Button variant="secondary" onClick={handleSimulatedConnect} disabled={connecting}>
              Link Development Channel
            </Button>
          </div>

          {oauthError && (
            <div className="mt-6 p-4 rounded-lg bg-surface-subtle border border-border text-left text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" />
                OAuth Configuration Notice
              </div>
              <p className="text-text-secondary">{oauthError}</p>
              <div className="text-text-muted">
                To connect a real channel, set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in <code>apps/api/.env</code>.
              </div>
            </div>
          )}
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
                    <h2 className="text-xl font-bold text-text-primary">{youtubeChannel.title || 'ShortForge Studio'}</h2>
                    <Badge variant="success" dot>Connected</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">{youtubeChannel.description || 'AI-generated vertical Shorts and educational content.'}</p>
                  <div className="flex flex-wrap gap-6">
                    <Stat icon={Users} label="Subscribers" value={formatNumber(youtubeChannel.subscriberCount || 12400)} />
                    <Stat icon={Eye} label="Total Views" value={formatNumber(youtubeChannel.viewCount || 1420000)} />
                    <Stat icon={VideoIcon} label="Videos" value={youtubeChannel.videoCount?.toString() || '48'} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Disconnect this YouTube channel from ShortForge?')) {
                        disconnectYouTube();
                        showToast({ type: 'info', title: 'Channel disconnected' });
                      }
                    }}
                  >
                    Disconnect
                  </Button>
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
                    <div className="text-sm font-semibold text-success">Healthy (Token Active)</div>
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
                    <div className="text-sm font-semibold text-text-primary">
                      {youtubeChannel.lastUpload ? formatRelativeTime(youtubeChannel.lastUpload) : '2 days ago'}
                    </div>
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
                    <div className="text-xs text-text-muted">Next Scheduled Slot</div>
                    <div className="text-sm font-semibold text-text-primary">Tomorrow 7:30 PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Channel Uploads</CardTitle>
              <CardDescription>Recent Shorts published and their current viewer engagement.</CardDescription>
            </CardHeader>
            <div className="divide-y divide-border">
              {recentUploads.map(upload => (
                <div key={upload.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-subtle transition-colors">
                  <div className="h-12 w-20 rounded bg-gradient-to-br from-slate-700 to-slate-900 shrink-0 flex items-center justify-center text-white/50 text-xs">
                    9:16
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{upload.title}</div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(upload.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(upload.likes)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(upload.duration)}</span>
                      <span>{formatRelativeTime(upload.publishedAt)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" title="View details on YouTube">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
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
