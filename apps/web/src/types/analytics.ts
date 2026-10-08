export type DateRange = '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsOverview {
  views: number;
  viewsChange: number;
  watchTime: number;
  watchTimeChange: number;
  subscribers: number;
  subscribersChange: number;
  retention: number;
  retentionChange: number;
  likes: number;
  likesChange: number;
  comments: number;
  commentsChange: number;
  shares: number;
  sharesChange: number;
  publishingConsistency: number;
  consistencyChange: number;
  videosPublished: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsSeries {
  id: string;
  label: string;
  data: ChartPoint[];
  color?: string;
}

export interface TopicPerformance {
  topic: string;
  videos: number;
  views: number;
  avgRetention: number;
  engagement: number;
  subscriberConversion: number;
}

export interface Insight {
  id: string;
  text: string;
  confidence: number;
  category: 'performance' | 'content' | 'timing' | 'audience' | 'trend';
}

export interface LearnedPreferences {
  bestDuration: string;
  bestHook: string;
  bestPillar: string;
  bestCta: string;
  bestPostingTime: string;
  videosAnalyzed: number;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  recommended: boolean;
}

export interface ContentPerformance {
  id: string;
  title: string;
  views: number;
  retention: number;
  likes: number;
  comments: number;
  publishedAt: string;
  thumbnail?: string;
}
