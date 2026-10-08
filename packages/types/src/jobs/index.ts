/**
 * BullMQ queue and job progress contracts.
 */

export type ShortforgeQueueName =
  | 'trend-research' | 'idea-generation' | 'script-generation'
  | 'voice-generation' | 'visual-generation' | 'scene-processing'
  | 'subtitle-generation' | 'rendering' | 'quality-check'
  | 'publishing' | 'analytics-sync' | 'performance-analysis'
  | 'strategy-optimization' | 'notifications' | 'cleanup'
  | 'reconciliation' | 'automation';

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

export interface JobProgressEvent {
  jobId: string;
  queue: ShortforgeQueueName;
  status: JobStatus;
  progress: number;
  message?: string;
  timestamp: string;
}
