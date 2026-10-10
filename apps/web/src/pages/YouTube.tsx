import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/apiClient';
import type { YouTubeChannel } from '../types/youtube';
import { cn, formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import {
  Play as YoutubeIcon,
  Eye,
  Users,
  Video as VideoIcon,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export function YouTubePage() {
  const [searchParams] = useSearchParams();
  const youtubeChannel = useWorkspaceStore((s) => s.youtubeChannel);
  const connectYouTubeOAuth = useWorkspaceStore((s) => s.connectYouTubeOAuth);
  const setConnectedChannel = useWorkspaceStore((s) => s.setConnectedChannel);
  const disconnectYouTube = useWorkspaceStore((s) => s.disconnectYouTube);
  const items = useContentStore((s) => s.items);
  const showToast = useUIStore((s) => s.showToast);

  const [connecting, setConnecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const publishedVideos = items.filter((i) => i.status === 'published');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      setConnecting(true);
      apiClient.youtube
        .callback(code, state)
        .then((res) => {
          if (res?.channels && res.channels.length > 0) {
            const ch = res.channels[0];
            const liveChannel: YouTubeChannel = {
              id: ch.id || ch.providerChannelId,
              channelId: ch.id || ch.providerChannelId,
              title: ch.title,
              description: ch.description,
              avatarUrl: ch.thumbnailUrl,
              subscriberCount: ch.subscriberCount,
              viewCount: ch.viewCount,
              videoCount: ch.videoCount,
              connectionStatus: 'connected',
              lastSync: new Date().toISOString(),
            };
            setConnectedChannel(liveChannel);
            showToast({
              type: 'success',
              title: 'YouTube Channel Connected',
              message: `Authorized channel: ${ch.title}`,
            });
          }
        })
        .catch((err: any) => {
          setOauthError(err.message || 'OAuth authorization failed.');
          showToast({ type: 'error', title: 'Connection Failed', message: err.message });
        })
        .finally(() => setConnecting(false));
    }
  }, [searchParams, setConnectedChannel, showToast]);

  const handleConnect = async () => {
    setConnecting(true);
    setOauthError(null);
    try {
      const res = await apiClient.youtube.connect();
      if (res?.authUrl) {
        window.location.href = res.authUrl;
        return;
      }
    } catch (err: any) {
      setConnecting(false);
      const isMissingEnv =
        err.message?.includes('GOOGLE_CLIENT_ID') || err.message?.includes('credentials');
      if (isMissingEnv) {
        setOauthError(
          'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured in the backend environment. Please set them in your deployment environment variables.'
        );
      } else {
        setOauthError(err.message || 'Failed to initiate YouTube authorization.');
      }
    }
  };

  const isConnected = youtubeChannel?.connectionStatus === 'connected';

  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTube Channel Integration"
        description="Authorized Google OAuth v3 connection for automated YouTube Shorts publishing and telemetry sync."
      />

      {oauthError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-900 block">Configuration Notice</span>
            <p className="text-stone leading-relaxed">{oauthError}</p>
          </div>
        </div>
      )}

      {/* Main Connection Card */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-vermilion-soft text-vermilion flex items-center justify-center border border-vermilion/20">
              <YoutubeIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  {isConnected ? youtubeChannel.title : 'No YouTube Channel Connected'}
                </h3>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                    isConnected
                      ? 'bg-moss/10 text-moss-dark border border-moss/30'
                      : 'bg-canvas-subtle text-stone'
                  )}
                >
                  {isConnected ? 'Authorized' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-stone mt-0.5">
                {isConnected
                  ? `Connected channel: ${youtubeChannel.title}`
                  : 'Connect your YouTube channel using official Google OAuth to enable automated publishing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={disconnectYouTube}
                className="btn-secondary h-8 px-3 text-xs"
              >
                Disconnect Channel
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                loading={connecting}
                className="btn-primary h-9 px-4 text-xs"
              >
                <YoutubeIcon className="h-3.5 w-3.5 fill-current" />
                <span>Connect with Google OAuth</span>
              </Button>
            )}
          </div>
        </div>

        {/* Channel Telemetry if Connected */}
        {isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-canvas-subtle border border-border space-y-1">
              <span className="text-[11px] font-mono text-stone-muted block">Subscribers</span>
              <span className="text-base font-bold text-ink">
                {formatNumber(youtubeChannel.subscriberCount || 0)}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-canvas-subtle border border-border space-y-1">
              <span className="text-[11px] font-mono text-stone-muted block">Total Channel Views</span>
              <span className="text-base font-bold text-ink">
                {formatNumber(youtubeChannel.viewCount || 0)}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-canvas-subtle border border-border space-y-1">
              <span className="text-[11px] font-mono text-stone-muted block">Published Shorts</span>
              <span className="text-base font-bold text-ink">{publishedVideos.length}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-canvas-subtle border border-border space-y-1">
              <span className="text-[11px] font-mono text-stone-muted block">OAuth Token Security</span>
              <span className="text-xs font-semibold text-moss flex items-center gap-1 mt-0.5">
                <CheckCircle className="h-3.5 w-3.5" /> AES-256 Encrypted
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Published Shorts Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
            Published YouTube Shorts ({publishedVideos.length})
          </span>
          <span className="text-[11px] font-mono text-stone-muted">Sync Interval: Hourly</span>
        </div>

        {publishedVideos.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone">
            No videos have been uploaded to YouTube yet.
          </div>
        ) : (
          <div className="divide-y border-border">
            {publishedVideos.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-7 rounded bg-ink text-white font-mono text-[9px] flex items-center justify-center shrink-0">
                    9:16
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-ink truncate block">{item.title}</span>
                    <span className="text-[10px] text-stone font-mono">
                      Published {item.publishedAt ? formatRelativeTime(item.publishedAt) : 'Recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-stone">
                  {item.views !== undefined && <span>{formatNumber(item.views)} views</span>}
                  <a
                    href={item.youtubeUrl || `https://youtube.com/shorts/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded hover:bg-canvas-subtle text-stone hover:text-ink"
                    title="View on YouTube"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
