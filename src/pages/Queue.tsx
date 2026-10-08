import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/common/EmptyState';
import { cn, formatRelativeTime, formatTime } from '../lib/utils';
import { ListTodo, Pause, RotateCcw, X, ChevronRight, AlertCircle } from 'lucide-react';

export function Queue() {
  const items = useContentStore(s => s.items);
  const jobs = useContentStore(s => s.jobs);

  const activeJobs = items.filter(i => ['script_ready', 'voice_ready', 'visuals_ready', 'rendering', 'quality_check', 'review'].includes(i.status));
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const selectedContent = items.find(i => i.id === selectedJob);
  const selectedJobData = jobs.find(j => j.contentId === selectedJob);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production Queue"
        description={`${activeJobs.length} active jobs`}
      />

      {activeJobs.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Queue is empty"
          description="Start creating content to see production jobs here."
          action={{ label: 'Create Content', onClick: () => window.location.href = '/create' }}
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
                        className={cn('hover:bg-surface-hover/50 cursor-pointer transition-colors', selectedJob === item.id && 'bg-accent-soft/40')}
                        onClick={() => setSelectedJob(item.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('h-8 w-14 rounded bg-gradient-to-br shrink-0', item.thumbnailGradient || 'from-slate-700 to-slate-800')} />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-text-primary truncate max-w-[200px]">{item.title}</div>
                              <div className="text-xs text-text-muted">Started {formatRelativeTime(item.updatedAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-text-secondary capitalize">{item.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 w-32">
                            {item.progress !== undefined ? (
                              <>
                                <Progress value={item.progress} size="sm" className="flex-1" />
                                <span className="text-xs text-text-muted w-8 text-right">{item.progress}%</span>
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
                            <Badge variant="warning" dot>Running</Badge>
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

          {/* Job detail drawer-like panel */}
          <div>
            {selectedContent ? (
              <Card>
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-text-primary text-sm mb-1">Job Details</h3>
                  <p className="text-xs text-text-muted">{selectedContent.title}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-label mb-2">Logs</div>
                    <div className="bg-background rounded-md p-3 font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
                      {(selectedJobData?.logs || []).length > 0 ? (
                        [...(selectedJobData?.logs || [])].reverse().map(log => (
                          <div key={log.id} className="flex gap-2">
                            <span className="text-text-muted">{formatTime(log.timestamp)}</span>
                            <span className={cn(
                              log.level === 'error' ? 'text-danger' :
                              log.level === 'success' ? 'text-success' :
                              log.level === 'warning' ? 'text-warning' : 'text-text-secondary'
                            )}>{log.message}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-text-muted">No logs available yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1"><Pause className="h-3.5 w-3.5" />Pause</Button>
                    <Button variant="secondary" size="sm" className="flex-1"><RotateCcw className="h-3.5 w-3.5" />Retry</Button>
                    <Button variant="ghost" size="sm" className="text-danger hover:text-danger"><X className="h-3.5 w-3.5" /></Button>
                  </div>

                  <Link to={`/content/${selectedContent.id}`}>
                    <Button variant="outline" size="sm" className="w-full">Open Content</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <ListTodo className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">Select a job to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
