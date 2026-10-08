import type { ContentStatus } from '../types/content';
import type { JobStatus } from '../types/production';

export const statusLabels: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  script_ready: 'Script Ready',
  voice_ready: 'Voice Ready',
  visuals_ready: 'Visuals Ready',
  rendering: 'Rendering',
  rendered: 'Rendered',
  quality_check: 'Quality Check',
  review: 'In Review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Failed',
};

export const statusColors: Record<ContentStatus, string> = {
  idea: 'bg-surface-muted text-text-secondary',
  draft: 'bg-surface-muted text-text-secondary',
  script_ready: 'bg-info/10 text-info',
  voice_ready: 'bg-info/10 text-info',
  visuals_ready: 'bg-info/10 text-info',
  rendering: 'bg-warning/10 text-warning',
  rendered: 'bg-info/10 text-info',
  quality_check: 'bg-warning/10 text-warning',
  review: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  scheduled: 'bg-accent/10 text-accent',
  publishing: 'bg-warning/10 text-warning',
  published: 'bg-success/10 text-success',
  failed: 'bg-error/10 text-error',
};

export const jobStatusLabels: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export function formatTimeOfDay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getStatusVariant(status: ContentStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'published':
    case 'approved':
      return 'success';
    case 'rendering':
    case 'quality_check':
    case 'review':
    case 'publishing':
      return 'warning';
    case 'failed':
      return 'error';
    case 'script_ready':
    case 'voice_ready':
    case 'visuals_ready':
    case 'scheduled':
    case 'rendered':
      return 'info';
    default:
      return 'default';
  }
}
