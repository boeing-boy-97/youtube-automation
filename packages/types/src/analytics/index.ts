/**
 * Analytics types.
 */

export interface MetricDataPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  estimatedMinutesWatched?: number;
  averageViewDurationSeconds?: number;
}

export interface ChannelAnalyticsOverview {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  recentTrends: MetricDataPoint[];
}
