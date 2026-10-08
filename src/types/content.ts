export type ContentStatus =
  | 'idea'
  | 'draft'
  | 'script_ready'
  | 'voice_ready'
  | 'visuals_ready'
  | 'rendering'
  | 'rendered'
  | 'quality_check'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

export interface ContentItem {
  id: string;
  title: string;
  hook?: string;
  angle?: string;
  pillarId?: string;
  pillar?: string;
  status: ContentStatus;
  progress?: number;
  duration?: number;
  estimatedDuration?: number;
  thumbnail?: string;
  thumbnailGradient?: string;
  script?: Script;
  voiceUrl?: string;
  voiceStatus: VoiceStatus;
  visuals?: Scene[];
  videoUrl?: string;
  description?: string;
  hashtags?: string[];
  cta?: string;
  goal?: ContentGoal;
  audience?: string;
  niche?: string;
  qualityScore?: QualityScores;
  qcStatus?: QcStatus;
  riskFlags?: string[];
  failureReason?: string;
  scheduledAt?: string;
  publishedAt?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  views?: number;
  likes?: number;
  comments?: number;
  retention?: number;
  shares?: number;
  watchTime?: number;
  subscribersGained?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  versions?: ContentVersion[];
  activity: ActivityItem[];
}

export type VoiceStatus = 'idle' | 'generating' | 'ready' | 'failed';
export type VisualsStatus = 'idle' | 'generating' | 'ready' | 'failed';

export type ContentGoal = 'reach' | 'subscribers' | 'education' | 'engagement' | 'conversion';

export interface Script {
  id: string;
  content: string;
  wordCount: number;
  charCount: number;
  hookStrength: number;
  ctaStrength: number;
  readability: number;
  estimatedDuration: number;
  versions: ScriptVersion[];
}

export interface ScriptVersion {
  id: string;
  content: string;
  wordCount: number;
  createdAt: string;
  label?: string;
}

export interface ContentVersion {
  id: string;
  label: string;
  createdAt: string;
  snapshot: Partial<ContentItem>;
}

export interface Scene {
  id: string;
  index: number;
  title: string;
  type: 'hook' | 'content' | 'cta' | 'intro' | 'outro';
  script: string;
  duration: number;
  visualAsset?: string;
  visualType?: 'image' | 'video' | 'generated' | 'stock' | 'upload';
  visualStatus: 'idle' | 'generating' | 'ready' | 'failed';
}

export interface QualityScores {
  overall: number;
  hook: number;
  script: number;
  voice: number;
  visuals: number;
  captions: number;
  brand: number;
  publishReadiness: number;
}

export interface QcCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message?: string;
}

export interface QcStatus {
  score: number;
  status: 'ready' | 'issues' | 'failed';
  checks: QcCheck[];
  completedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | 'idea_generated'
  | 'script_generated'
  | 'script_updated'
  | 'voice_generated'
  | 'visuals_generated'
  | 'render_started'
  | 'render_progress'
  | 'render_completed'
  | 'render_failed'
  | 'qc_passed'
  | 'qc_failed'
  | 'review_requested'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'scheduled'
  | 'publish_started'
  | 'publish_completed'
  | 'publish_failed'
  | 'analytics_synced'
  | 'duplicated'
  | 'archived'
  | 'note';

export interface Idea {
  id: string;
  title: string;
  hook: string;
  angle: string;
  pillar: string;
  pillarId?: string;
  whyItWorks: string;
  suggestedDuration: number;
  cta: string;
  potential: number;
  freshness: number;
  difficulty: number;
  estimatedRetention: number;
  source: string;
  status: 'trending' | 'saved' | 'generated' | 'used' | 'rejected';
  createdAt: string;
}

export interface IdeaGenerateParams {
  topic?: string;
  audience?: string;
  niche?: string;
  pillar?: string;
  tone?: string;
  count: number;
}
