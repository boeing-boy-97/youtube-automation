import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { NotFound } from './NotFound';
import { demoEngine } from '../services/demoEngine';
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
  MessageSquare,
  Share2,
  TrendingUp,
  FileText,
  CheckCircle,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Video as VideoIcon,
  Mic,
  Image as ImageIcon,
  Scissors,
  Shield,
} from 'lucide-react';

export function ContentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore(s => s.items.find(i => i.id === id));
  
  const duplicateContent = useContentStore(s => s.duplicateContent);
  const showToast = useUIStore(s => s.showToast);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  if (!content) return <NotFound />;

  const canRender = ['script_ready', 'voice_ready', 'visuals_ready', 'failed'].includes(content.status);
  const canApprove = content.status === 'review';
  const canSchedule = content.status === 'approved' || content.status === 'review';
  const canPublish = content.status === 'scheduled' || content.status === 'approved';
  const canEdit = ['draft', 'script_ready'].includes(content.status);

  const handleRender = async () => {
    await demoEngine.simulateRendering(content.id);
  };

  const handleQC = async () => {
    await demoEngine.simulateQualityCheck(content.id);
  };

  const handleApprove = async () => {
    await demoEngine.simulateApproval(content.id);
    showToast({ type: 'success', title: 'Approved', message: 'Ready to schedule' });
  };

  const handleSchedule = async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    await demoEngine.simulateScheduling(content.id, tomorrow);
    navigate('/calendar');
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishProgress(0);
    await demoEngine.simulateYouTubeUpload(content.id, (p) => setPublishProgress(p));
    setPublishing(false);
  };

  const handleRetry = () => {
    demoEngine.retryJob(content.id);
  };

  const statusFlow = [
    { key: 'draft', label: 'Draft', icon: FileText },
    { key: 'script_ready', label: 'Script', icon: FileText },
    { key: 'voice_ready', label: 'Voice', icon: Mic },
    { key: 'visuals_ready', label: 'Visuals', icon: ImageIcon },
    { key: 'rendered', label: 'Rendered', icon: VideoIcon },
    { key: 'review', label: 'Review', icon: Shield },
    { key: 'scheduled', label: 'Scheduled', icon: Calendar },
    { key: 'published', label: 'Published', icon: Send },
  ];

  const currentStatusIdx = statusFlow.findIndex(s => content.status === s.key || (content.status === 'scheduled' && s.key === 'scheduled'));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/content" className="hover:text-text-primary flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Content Library
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text-primary truncate">{content.title}</span>
      </div>

      <PageHeader
        title={content.title}
        description={`ID: ${content.id.slice(0, 12)} • Last updated ${formatRelativeTime(content.updatedAt)}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {content.status === 'failed' && (
              <Button variant="secondary" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
            {canEdit && (
              <Link to={`/script-lab/${content.id}`}><Button variant="secondary"><Pencil className="h-4 w-4" />Edit Script</Button></Link>
            )}
            {content.status === 'visuals_ready' || content.status === 'rendered' ? (
              <Link to={`/studio/${content.id}`}><Button variant="secondary"><VideoIcon className="h-4 w-4" />Open Studio</Button></Link>
            ) : null}
            <Button variant="ghost" onClick={() => { const dup = duplicateContent(content.id); if (dup) { showToast({ type: 'success', title: 'Duplicated' }); navigate(`/content/${dup.id}`); } }}>
              <Copy className="h-4 w-4" />
            </Button>
            {canRender && !content.videoUrl && <Button onClick={handleRender}><Scissors className="h-4 w-4" />Render</Button>}
            {content.status === 'rendered' && <Button onClick={handleQC}><Shield className="h-4 w-4" />Run QC</Button>}
            {canApprove && <Button onClick={handleApprove}><CheckCircle className="h-4 w-4" />Approve</Button>}
            {canSchedule && <Button variant="secondary" onClick={handleSchedule}><Calendar className="h-4 w-4" />Schedule</Button>}
            {canPublish && <Button onClick={handlePublish} loading={publishing}><Send className="h-4 w-4" />{publishing ? `Publishing ${publishProgress}%` : 'Publish'}</Button>}
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <span className={cn('badge', statusColors[content.status])}>{statusLabels[content.status]}</span>
        {content.pillar && <Badge variant="default">{content.pillar}</Badge>}
        {content.failureReason && <Badge variant="error"><AlertTriangle className="h-3 w-3" />{content.failureReason}</Badge>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video preview */}
          <Card>
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-950 relative rounded-t-lg overflow-hidden">
              <div className={cn('absolute inset-0 bg-gradient-to-br', content.thumbnailGradient || 'from-slate-800 to-emerald-900')} />
              <div className="absolute inset-0 flex items-center justify-center">
                {content.status === 'rendering' ? (
                  <div className="text-center text-white">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-80">Rendering {content.progress}%</p>
                    <div className="mt-3 w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${content.progress}%` }} />
                    </div>
                  </div>
                ) : content.videoUrl || content.status === 'published' ? (
                  <button className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="h-7 w-7 text-white ml-1" fill="white" />
                  </button>
                ) : content.status === 'failed' ? (
                  <div className="text-center text-white/80">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-danger" />
                    <p className="text-sm">Render failed</p>
                  </div>
                ) : (
                  <div className="text-center text-white/60">
                    <VideoIcon className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm">Preview available after render</p>
                  </div>
                )}
              </div>
              {content.duration && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                  {formatDuration(content.duration)}
                </div>
              )}
            </div>
          </Card>

          {/* Script */}
          {content.script && (
            <Card>
              <CardHeader>
                <CardTitle>Script</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                  {content.script.content || 'No script content yet.'}
                </pre>
                {content.script && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-text-muted">
                    <span>{content.script.wordCount} words</span>
                    <span>{content.script.charCount} chars</span>
                    <span>~{formatDuration(content.script.estimatedDuration)}</span>
                    <span className="ml-auto">Hook: <span className="text-accent font-medium">{content.script.hookStrength}%</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scenes */}
          {content.visuals && content.visuals.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Scenes ({content.visuals.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content.visuals.map((scene, i) => (
                    <div key={scene.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-surface-subtle">
                      <div className="h-8 w-12 rounded bg-gradient-to-br from-emerald-800 to-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{scene.title}</span>
                          <Badge variant="default" className="capitalize">{scene.type}</Badge>
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">{scene.script}</p>
                      </div>
                      <span className="text-xs text-text-muted">{scene.duration}s</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity timeline */}
          {content.activity.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {[...content.activity].reverse().map(act => (
                    <div key={act.id} className="flex gap-3 pb-3 relative last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                        <div className="w-px flex-1 bg-border" />
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm text-text-primary">{act.message}</p>
                        <p className="text-xs text-text-muted">{formatRelativeTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status flow */}
          <Card>
            <CardHeader><CardTitle>Production Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-0">
                {statusFlow.map((step, i) => {
                  const Icon = step.icon;
                  const done = currentStatusIdx >= i;
                  const current = content.status === step.key || (content.status === 'rendering' && i === 3);
                  return (
                    <div key={step.key} className="flex items-center gap-3 py-1.5">
                      <div className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
                        done ? 'bg-accent/10 text-accent' : current ? 'bg-warning/10 text-warning' : 'bg-surface-subtle text-text-muted'
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className={cn('text-sm', done || current ? 'text-text-primary font-medium' : 'text-text-muted')}>{step.label}</span>
                      {done && <CheckCircle className="h-3.5 w-3.5 text-success ml-auto" />}
                      {current && content.progress !== undefined && (
                        <div className="ml-auto w-16">
                          <Progress value={content.progress} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quality score */}
          {content.qualityScore && content.qualityScore.overall > 0 && (
            <Card>
              <CardHeader><CardTitle>Content Score</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-text-primary">{content.qualityScore.overall}</div>
                  <div className="text-xs text-text-muted">/ 100</div>
                </div>
                <div className="space-y-2">
                  {Object.entries({
                    Hook: content.qualityScore.hook,
                    Script: content.qualityScore.script,
                    Voice: content.qualityScore.voice,
                    Visuals: content.qualityScore.visuals,
                    Captions: content.qualityScore.captions,
                    Brand: content.qualityScore.brand,
                  }).map(([name, score]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary w-16">{name}</span>
                      <div className="flex-1 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', score >= 90 ? 'bg-success' : score >= 75 ? 'bg-warning' : 'bg-error')} style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-text-primary w-7 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publishing info */}
          {(content.scheduledAt || content.publishedAt) && (
            <Card>
              <CardHeader><CardTitle>{content.publishedAt ? 'Published' : 'Scheduled'}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {content.scheduledAt && !content.publishedAt && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar className="h-4 w-4 text-text-muted" />
                    {new Date(content.scheduledAt).toLocaleString()}
                  </div>
                )}
                {content.publishedAt && (
                  <>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="h-4 w-4 text-text-muted" />
                      {new Date(content.publishedAt).toLocaleDateString()}
                    </div>
                    {content.youtubeUrl && (
                      <a href={content.youtubeUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-accent text-xs hover:underline">
                        View on YouTube
                      </a>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Performance */}
          {content.status === 'published' && (
            <Card>
              <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Stat icon={Eye} label="Views" value={formatNumber(content.views || 0)} />
                  <Stat icon={Clock} label="Watch Time" value={formatNumber(Math.round((content.watchTime || 0) / 60)) + 'm'} />
                  <Stat icon={Heart} label="Likes" value={formatNumber(content.likes || 0)} />
                  <Stat icon={MessageSquare} label="Comments" value={formatNumber(content.comments || 0)} />
                  <Stat icon={Share2} label="Shares" value={formatNumber(content.shares || 0)} />
                  <Stat icon={TrendingUp} label="Retention" value={(content.retention || 0) + '%'} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {content.description && (
                <div>
                  <span className="text-xs text-text-muted block mb-1">Description</span>
                  <p className="text-text-secondary">{content.description}</p>
                </div>
              )}
              {content.hashtags && content.hashtags.length > 0 && (
                <div>
                  <span className="text-xs text-text-muted block mb-1">Hashtags</span>
                  <div className="flex flex-wrap gap-1">
                    {content.hashtags.map(tag => (
                      <span key={tag} className="text-xs text-accent">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-2 rounded-md bg-surface-subtle">
      <Icon className="h-3.5 w-3.5 text-text-muted mb-1" />
      <div className="text-sm font-semibold text-text-primary">{value}</div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
