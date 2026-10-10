import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/common/EmptyState';
import { cn, formatRelativeTime } from '../lib/utils';
import {
  ListTodo,
  Pause,
  RotateCcw,
  X,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';

export function Queue() {
  const navigate = useNavigate();
  const items = useContentStore((s) => s.items);
  const updateContent = useContentStore((s) => s.updateContent);
  const showToast = useUIStore((s) => s.showToast);

  const activeJobs = items.filter((i) =>
    ['script_ready', 'voice_ready', 'visuals_ready', 'rendering', 'quality_check', 'review'].includes(
      i.status
    )
  );

  const [selectedJob, setSelectedJob] = useState<string | null>(activeJobs[0]?.id || null);
  const selectedContent = items.find((i) => i.id === selectedJob);

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
    <div className="space-y-6">
      <PageHeader
        title="Production Queue"
        description={`${activeJobs.length} active generation, synthesis, and FFmpeg jobs in progress.`}
        actions={
          <Button
            onClick={() => navigate('/create')}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Short</span>
          </Button>
        }
      />

      {activeJobs.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Queue is empty"
          description="Start creating content to see background worker pipelines execute here."
          action={{ label: 'Create Short', onClick: () => navigate('/create') }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-canvas-subtle/50 text-[11px] font-mono text-stone uppercase">
                    <th className="px-4 py-3">Content Short</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Pipeline Stage</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border">
                  {activeJobs.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedJob(item.id)}
                      className={cn(
                        'hover:bg-canvas-subtle/50 cursor-pointer transition-colors',
                        selectedJob === item.id && 'bg-vermilion-soft/30'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-6 rounded bg-ink text-white font-mono text-[9px] flex items-center justify-center shrink-0">
                            9:16
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate max-w-[200px]">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-stone-muted font-mono">
                              {formatRelativeTime(item.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell font-mono text-stone capitalize">
                        {item.status.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-28">
                          {item.progress !== undefined ? (
                            <>
                              <Progress value={item.progress} size="sm" className="flex-1" />
                              <span className="font-mono text-[10px] text-stone">{item.progress}%</span>
                            </>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-subtle border border-border text-stone">
                              Queued
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="h-4 w-4 text-stone-muted" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Job Detail Panel */}
          <div className="lg:col-span-4">
            {selectedContent ? (
              <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-mono font-bold text-vermilion uppercase">
                    Job Details
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas-subtle border border-border text-stone">
                    ID: {selectedContent.id.slice(0, 8)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-ink leading-snug">{selectedContent.title}</h4>
                  <p className="text-xs text-stone mt-1">Stage: {selectedContent.status.replace('_', ' ')}</p>
                </div>

                <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-stone">
                    <span>Target Format:</span>
                    <span className="text-ink font-semibold">1080×1920 (9:16)</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Rendering Engine:</span>
                    <span className="text-ink font-semibold">BullMQ / FFmpeg</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Estimated Duration:</span>
                    <span className="text-ink font-semibold">~45 seconds</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link
                    to={`/studio/${selectedContent.id}`}
                    className="btn-primary w-full h-8 text-xs justify-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in Video Studio</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePause(selectedContent.id)}
                      className="btn-secondary h-8 text-xs"
                    >
                      <Pause className="h-3 w-3" />
                      <span>Pause</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRetry(selectedContent.id)}
                      className="btn-secondary h-8 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-surface border border-border shadow-xs text-center text-xs text-stone">
                Select a job from the table to inspect telemetry and worker status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
