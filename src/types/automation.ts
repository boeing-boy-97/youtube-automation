export type AutomationStatus = 'active' | 'paused' | 'error';

export interface AutomationConfig {
  mode: 'manual' | 'assisted' | 'autonomous';
  status: AutomationStatus;
  frequency: 'daily' | 'weekdays' | 'custom';
  publishTime: string;
  niche: string;
  dailyLimit: number;
  approvalMode: 'none' | 'required' | 'always';
  lastRun?: string;
  nextRun?: string;
  totalRuns: number;
  totalPublished: number;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: string;
  position: { x: number; y: number };
  config?: Record<string, unknown>;
}

export type WorkflowNodeType =
  | 'scheduler'
  | 'topic-generator'
  | 'trend-analyzer'
  | 'script-generator'
  | 'voice-generator'
  | 'visual-generator'
  | 'video-renderer'
  | 'caption-generator'
  | 'quality-checker'
  | 'approval-gate'
  | 'youtube-publisher'
  | 'analytics-sync'
  | 'learning-engine'
  | 'database';

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  timestamp: string;
}
