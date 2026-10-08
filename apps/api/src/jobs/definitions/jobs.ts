import type { QueueName } from '../queues/index.js';

/**
 * Job definitions — strongly-typed payloads per queue.
 * Imported by both the API (enqueue side) and workers (process side)
 * so the payload contract lives in one place.
 */

export interface JobPayloadMap {
  'trend-research': { workspaceId: string };
  'idea-generation': { workspaceId: string; topic?: string; count?: number };
  'script-generation': { workspaceId: string; contentId: string; userId: string };
  'voice-generation': { workspaceId: string; contentId: string; userId: string };
  'visual-generation': { workspaceId: string; contentId: string; userId: string };
  'scene-processing': { workspaceId: string; contentId: string };
  'subtitle-generation': { workspaceId: string; contentId: string };
  'rendering': { workspaceId: string; contentId: string; projectId: string; userId: string };
  'quality-check': { workspaceId: string; contentId: string; projectId: string; assetId: string; userId: string };
  'publishing': { workspaceId: string; contentId: string; userId: string; scheduledAt?: string; idempotencyKey: string };
  'analytics-sync': { workspaceId: string; contentId: string; userId: string };
  'performance-analysis': { workspaceId: string; contentId: string };
  'strategy-optimization': { workspaceId: string };
  'notifications': { userId: string; kind: string; payload: Record<string, unknown> };
  'cleanup': { olderThanDays?: number };
  'reconciliation': { workspaceId?: string };
  'automation': { workspaceId: string };
}

export type JobPayload<K extends QueueName = QueueName> = JobPayloadMap[K];

export interface JobResult {
  ok: boolean;
  note?: string;
  [k: string]: unknown;
}
