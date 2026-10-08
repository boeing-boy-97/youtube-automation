export type JobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type JobStage =
  | 'idea'
  | 'script'
  | 'voice'
  | 'visuals'
  | 'rendering'
  | 'qc'
  | 'approval'
  | 'scheduling'
  | 'publishing';

export interface ProductionJob {
  id: string;
  contentId: string;
  stage: JobStage;
  status: JobStatus;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  eta?: string;
  error?: string;
  logs: JobLog[];
}

export interface JobLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface PipelineStage {
  key: JobStage;
  label: string;
  count: number;
  active: number;
  failed: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  hook: string;
  sceneStructure: string[];
  captionStyle: string;
  cta: string;
  duration: number;
  category: string;
  usageCount: number;
  isDefault?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  size: number;
  duration?: number;
  mimeType: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
}

export type AssetType = 'image' | 'video' | 'audio' | 'music' | 'font' | 'logo';
