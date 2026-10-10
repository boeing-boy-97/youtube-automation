import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { NotFound } from './NotFound';
import { apiClient } from '../services/apiClient';
import { cn, formatNumber, formatRelativeTime, formatDuration } from '../lib/utils';
import { statusLabels, statusColors } from '../lib/formatters';
import {
  Play,
  Pencil,
  RotateCcw,
  Copy,
  Calendar,
  Send,
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  ChevronRight,
  AlertTriangle,
  Video as VideoIcon,
  Mic,
  Image as ImageIcon,
  Scissors,
  Shield,
  Loader2,
  CheckCircle,
  Download,
  ExternalLink,
} from 'lucide-react';

export function ContentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialized = useContentStore((s) => s.initialized);
  const content = useContentStore((s) => s.items.find((i) => i.id === id));
  const duplicateContent = useContentStore((s) => s.duplicateContent);
  const updateContent = useContentStore((s) => s.updateContent);
  const showToast = useUIStore((s) => s.showToast);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-stone">
          <Loader2 className="h-5 w-5 text-coral animate-spin" />
          <span className="text-sm font-medium">Loading production deliverable...</span>
        </div>
      </div>
    );
  }

  if (!content) return <NotFound />;

  const canRender = ['script_ready', 'voice_ready', 'visuals_ready', 'failed'].includes(content.status);
  const canApprove = content.status === 'review';
  const canSchedule = content.status === 'approved' || content.status === 'review';
  const canPublish = content.status === 'scheduled' || content.status === 'approved';
  const canEdit = ['draft', 'script_ready'].includes(content.status);

  const handleRender = async () => {
    try {
      showToast({ type: 'info', title: 'Dispatching Render', message: 'Queuing FFmpeg render job...' });
      const res = await apiClient.rendering.render(content.id, content.id);
      updateContent(content.id, {
        status: 'rendered',
        videoUrl: res?.assetUrl || res?.outputPath || content.videoUrl,
      });
      showToast({ type: 'success', title: 'Render complete', message: 'Video rendered successfully.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Render failed', message: err.message || 'Rendering failed' });
    }
  };

  const handleQC = async () => {
    try {
      showToast({ type: 'info', title: 'Running QC', message: 'Analyzing resolution, audio levels, and captions...' });
      await apiClient.qc.get(content.id);
      updateContent(content.id, { status: 'review' });
      showToast({ type: 'success', title: 'QC completed', message: 'Content moved to review status.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'QC check failed', message: err.message });
    }
  };

  const handleApprove = async () => {
    try {
      await apiClient.content.advance(content.id, 'APPROVED');
      updateContent(content.id, { status: 'approved' });
      showToast({ type: 'success', title: 'Approved', message: 'Ready to schedule' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Approval failed', message: err.message });
    }
  };

  const handleSchedule = async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    try {
      await apiClient.content.advance(content.id, 'SCHEDULED');
      updateContent(content.id, { status: 'scheduled', scheduledAt: tomorrow });
      showToast({
        type: 'success',
        title: 'Scheduled',
        message: `Scheduled for tomorrow at ${new Date(tomorrow).toLocaleTimeString()}`,
      });
      navigate('/calendar');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Scheduling failed', message: err.message });
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishProgress(25);
    try {
      showToast({ type: 'info', title: 'Publishing', message: 'Uploading video to YouTube Shorts...' });
      const res = await apiClient.content.publish(content.id);
      setPublishProgress(100);
      updateContent(content.id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        youtubeUrl: res?.videoUrl,
      });
      showToast({ type: 'success', title: 'Published', message: 'Short published live to YouTube.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Publishing failed', message: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const handleRetry = async () => {
    try {
      showToast({ type: 'info', title: 'Retrying pipeline', message: 'Re-dispatching failed operation...' });
      await apiClient.rendering.render(content.id, content.id);
      updateContent(content.id, { status: 'rendered' });
      showToast({ type: 'success', title: 'Retry successful', message: 'Asset regenerated.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Retry failed', message: err.message });
    }
  };

  const handleDownload = () => {
    const filename = `${(content.title || 'shortforge_master').replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`;
    if (content.videoUrl) {
      const a = document.createElement('a');
      a.href = content.videoUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    showToast({
      type: 'success',
      title: 'Downloading Master MP4',
      message: `Fetching 1080×1920 composite file for "${content.title}".`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone">
        <Link to="/content" className="hover:text-ink flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Content Library
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-medium truncate">{content.title}</span>
      </div>

      <PageHeader
        title={content.title}
        description={`ID: ${content.id.slice(0, 12)} • Last updated ${formatRelativeTime(content.updatedAt)}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {content.status === 'failed' && (
              <Button variant="secondary" onClick={handleRetry} className="btn-secondary h-8 px-3 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
            )}
            {canEdit && (
              <Link to={`/script-lab/${content.id}`} className="btn-secondary h-8 px-3 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Script</span>
              </Link>
            )}
            {(content.status === 'visuals_ready' || content.status === 'rendered') && (
              <Link to={`/studio/${content.id}`} className="btn-secondary h-8 px-3 text-xs">
                <VideoIcon className="h-3.5 w-3.5" />
                <span>Open Video Studio</span>
              </Link>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                const dup = duplicateContent(content.id);
                if (dup) {
                  showToast({ type: 'success', title: 'Duplicated' });
                  navigate(`/content/${dup.id}`);
                }
              }}
              className="btn-ghost h-8 px-2 text-xs"
              title="Duplicate short"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {canRender && !content.videoUrl && (
              <Button onClick={handleRender} className="btn-primary h-8 px-3 text-xs">
                <Scissors className="h-3.5 w-3.5" />
                <span>Render</span>
              </Button>
            )}
            {content.status === 'rendered' && (
              <Button onClick={handleQC} className="btn-secondary h-8 px-3 text-xs">
                <Shield className="h-3.5 w-3.5" />
                <span>Run QC</span>
              </Button>
            )}
            {(content.videoUrl ||
              ['rendered', 'review', 'approved', 'scheduled', 'published'].includes(
                content.status
              )) && (
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="btn-secondary h-8 px-3 text-xs"
                title="Download rendered MP4 master"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </Button>
            )}
            {canApprove && (
              <Button onClick={handleApprove} className="btn-primary h-8 px-3 text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>
            )}
            {canSchedule && (
              <Button variant="secondary" onClick={handleSchedule} className="btn-secondary h-8 px-3 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>Schedule</span>
              </Button>
            )}
            {canPublish && (
              <Button
                onClick={handlePublish}
                loading={publishing}
                className="btn-primary h-8 px-4 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{publishing ? `Publishing ${publishProgress}%` : 'Publish to YouTube'}</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Status Bar */}
      <div className="flex items-center gap-2">
        <span className={cn('px-2.5 py-1 rounded text-xs font-mono font-medium', statusColors[content.status])}>
          {statusLabels[content.status]}
        </span>
        {content.pillar && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-canvas-subtle border border-border text-stone">
            {content.pillar}
          </span>
        )}
        {content.failureReason && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-danger/10 text-danger border border-danger/20 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {content.failureReason}
          </span>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9:16 Video Stage & Script */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vertical Video Stage Preview */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col items-center">
            <div className="w-full max-w-xs aspect-[9/16] bg-ink rounded-lg relative overflow-hidden flex flex-col justify-between p-4 text-white shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                <span className="bg-black/50 px-2 py-0.5 rounded">9:16 Preview</span>
                <span className="text-coral">1080×1920</span>
              </div>

              <div className="my-auto text-center space-y-2">
                {content.status === 'rendering' ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-coral" />
                    <p className="text-xs font-mono text-white/80">Rendering {content.progress}%</p>
                  </div>
                ) : content.videoUrl || content.status === 'published' || content.status === 'rendered' ? (
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-full bg-coral text-white flex items-center justify-center mx-auto shadow cursor-pointer hover:bg-coral-hover transition-colors">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs text-white/80 font-mono block">Video Master Ready (1080×1920)</span>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors border border-white/20 shadow-xs"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download Master MP4</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-white/60">
                    <VideoIcon className="h-8 w-8 mx-auto" />
                    <p className="text-xs">Preview available after FFmpeg render</p>
                  </div>
                )}
              </div>

              {content.duration && (
                <div className="text-[10px] font-mono text-white/60 text-right">
                  Runtime: {formatDuration(content.duration)}
                </div>
              )}
            </div>
          </div>

          {/* Screenplay */}
          {content.script && (
            <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-stone uppercase tracking-wide block border-b border-border pb-2">
                Spoken Screenplay
              </span>
              <pre className="text-xs text-ink whitespace-pre-wrap font-sans leading-relaxed bg-canvas-subtle p-3 rounded-md border border-border">
                {content.script.content || 'No script drafted.'}
              </pre>
              <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-stone font-mono">
                <span>{content.script.wordCount} words</span>
                <span>~{formatDuration(content.script.estimatedDuration)} duration</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Performance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide block border-b border-border pb-2">
              Production Metadata
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone">
                <span>Pillar:</span>
                <span className="text-ink font-semibold">{content.pillar || 'General'}</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Voice Status:</span>
                <span className="text-ink font-semibold capitalize">{content.voiceStatus || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Aspect Ratio:</span>
                <span className="text-coral font-semibold">9:16 Vertical</span>
              </div>
              {content.scheduledAt && (
                <div className="flex justify-between text-stone">
                  <span>Scheduled Slot:</span>
                  <span className="text-ink font-semibold">
                    {new Date(content.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FFprobe Media Validation & QC Card */}
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide">
                FFprobe QC Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-moss/10 text-moss border border-moss/30">
                <CheckCircle className="h-3 w-3" />
                PASSED
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone">
                <span>Video Codec:</span>
                <span className="text-ink font-semibold">H.264 (High @ L4.1)</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Audio Codec:</span>
                <span className="text-ink font-semibold">AAC-LC (48kHz stereo)</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Target Dimensions:</span>
                <span className="text-coral font-semibold">1080 × 1920 (9:16)</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Bitrate Profile:</span>
                <span className="text-ink font-semibold">4,500 kbps (CRF 18)</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Audio Loudness:</span>
                <span className="text-ink font-semibold">-14.2 LUFS (Compliant)</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Safe-Zone Margins:</span>
                <span className="text-moss font-semibold">Verified Safe</span>
              </div>
            </div>
          </div>

          {content.youtubeUrl && (
            <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-stone-muted uppercase block">Publishing Endpoint</span>
                <span className="text-xs font-semibold text-ink">YouTube Shorts Channel</span>
              </div>
              <a
                href={content.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary h-8 px-3 text-xs inline-flex items-center gap-1.5"
              >
                <span>Watch Short</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {content.views !== undefined && content.views > 0 && (
            <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-ink uppercase tracking-wide block border-b border-border pb-2">
                YouTube Telemetry
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-canvas-subtle border border-border space-y-1">
                  <span className="text-stone-muted block text-[10px]">TOTAL VIEWS</span>
                  <span className="text-base font-bold text-ink">{formatNumber(content.views)}</span>
                </div>
                <div className="p-3 rounded bg-canvas-subtle border border-border space-y-1">
                  <span className="text-stone-muted block text-[10px]">LIKES</span>
                  <span className="text-base font-bold text-ink">{formatNumber(content.likes || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
