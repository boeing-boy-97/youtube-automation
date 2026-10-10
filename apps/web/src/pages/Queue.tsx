import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/common/EmptyState';
import { cn, formatRelativeTime, formatTime } from '../lib/utils';
import {
  ListTodo,
  Pause,
  Play,
  RotateCcw,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';

export function Queue() {
  const navigate = useNavigate();
  const items = useContentStore(s => s.items);
  const jobs = useContentStore(s => s.jobs);
  const updateContent = useContentStore(s => s.updateContent);
  const showToast = useUIStore(s => s.showToast);

  const activeJobs = items.filter(i =>
    ['script_ready', 'voice_ready', 'visuals_ready', 'rendering', 'quality_check', 'review'].includes(i.status)
  );

  const [selectedJob, setSelectedJob] = useState<string | null>(activeJobs[0]?.id || null);
  const selectedContent = items.find(i => i.id === selectedJob);
  const selectedJobData = jobs.find(j => j.contentId === selectedJob);

  const handlePause = (contentId: string) => {
    updateContent(contentId, { status: 'review' });
    showToast({ type: 'info', title: 'Job Paused', message: 'Production task paused for review.' });
  };

  const handleRetry = (contentId: string) => {
    updateContent(contentId, { status: 'rendering', progress: 10 });
    showToast({ type: 'success', title: 'Job Retried', message: 'Re-dispatched to worker queue.' });
  };

  const handleCancel = (contentId: string) => {
    if (window.confirm('Cancel this active production job?')) {
      updateContent(contentId, { status: 'failed', failureReason: 'Cancelled by user' });
      showToast({ type: 'info', title: 'Job Cancelled', message: 'Removed from active queue.' });
      setSelectedJob(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production Queue"
        description={`${activeJobs.length} active generation and rendering jobs`}
        actions={
          <Button onClick={() => navigate('/create')}>
            <Plus className="h-4 w-4" /> Create New Content
          </Button>
        }
      />

      {activeJobs.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Queue is empty"
          description="Start creating content to see background production jobs here."
          action={{ label: 'Create Content', onClick: () => navigate('/create') }}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-micro-label uppercase tracking-wider text-text-muted font-medium">Content</th>
                      <th className="text-left px-4 py-3 text-micro-label uppercase tracking-wider text-text-muted font-medium hidden sm:table-cell">Stage</th>
                      <th className="text-left px-4 py-3 text-micro-label uppercase tracking-wider text-text-muted font-medium">Progress</th>
                      <th className="text-left px-4 py-3 text-micro-label uppercase tracking-wider text-text-muted font-medium hidden md:table-cell">Status</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeJobs.map(item => (
                      <tr
                        key={item.id}
                        className={cn('hover:bg-surface-hover/50 cursor-pointer transition-colors', selectedJob === item.id && 'bg-accent/5')}
                        onClick={() => setSelectedJob(item.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('h-8 w-14 rounded bg-gradient-to-br shrink-0 flex items-center justify-center text-white/60 text-[10px] font-mono', item.thumbnailGradient || 'from-slate-700 to-slate-800')}>
                              9:16
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-text-primary truncate max-w-[220px]">{item.title}</div>
                              <div className="text-[10px] text-text-muted">{formatRelativeTime(item.updatedAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-text-secondary capitalize">{item.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 w-32">
                            {item.progress !== undefined ? (
                              <>
                                <Progress value={item.progress} size="sm" className="flex-1" />
                                <span className="text-xs text-text-muted w-8 text-right font-mono">{item.progress}%</span>
                              </>
                            ) : (
                              <Badge variant={item.status === 'review' ? 'warning' : 'info'}>
                                {item.status === 'review' ? 'Waiting' : 'Queued'}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {item.status === 'failed' ? (
                            <Badge variant="error"><AlertCircle className="h-3 w-3" />Error</Badge>
                          ) : item.status === 'rendering' ? (
                            <Badge variant="warning" dot>Rendering</Badge>
                          ) : (
                            <Badge variant="info" dot>Active</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="h-4 w-4 text-text-muted" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Job detail drawer panel */}
          <div>
            {selectedContent ? (
              <Card>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm truncate max-w-[200px]">{selectedContent.title}</h3>
                    <p className="text-[11px] text-text-muted capitalize">Stage: {selectedContent.status.replace('_', ' ')}</p>
                  </div>
                  <Badge variant="accent">ID: {selectedContent.id.slice(0, 7)}</Badge>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase mb-2">Worker Diagnostics & Logs</div>
                    <div className="bg-background rounded-lg p-3 font-mono text-[11px] space-y-1.5 max-h-72 overflow-y-auto border border-border">
                      <div className="flex gap-2">
                        <span className="text-text-muted">10:42:01</span>
                        <span className="text-success">[Worker] BullMQ queue job initialized</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-text-muted">10:42:03</span>
                        <span className="text-text-secondary">[FFmpeg] Probing scene assets 1080x1920</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-text-muted">10:42:05</span>
                        <span className="text-info">[TTS] Synthesizing voice track with ElevenLabs</span>
                      </div>
                      {(selectedJobData?.logs || []).map(log => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-text-muted">{formatTime(log.timestamp)}</span>
                          <span className={cn(
                            log.level === 'error' ? 'text-danger' :
                            log.level === 'success' ? 'text-success' :
                            log.level === 'warning' ? 'text-warning' : 'text-text-secondary'
                          )}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePause(selectedContent.id)}
                    >
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRetry(selectedContent.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:text-danger"
                      onClick={() => handleCancel(selectedContent.id)}
                      title="Cancel Job"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/studio/${selectedContent.id}`)}
                  >
                    Open in Video Studio <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <ListTodo className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">Select a job to view diagnostics and controls</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
