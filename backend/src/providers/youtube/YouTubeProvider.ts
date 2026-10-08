export interface YouTubeTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number; // ms
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description?: string;
  thumbnails?: { default?: string; medium?: string; high?: string };
  customUrl?: string;
  country?: string;
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
}

export interface UploadVideoInput {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  filePath?: string; // local path to MP4
  fileBuffer?: Buffer;
  mimeType?: string;
  madeForKids?: boolean;
  publishAt?: Date; // scheduled publish
  onProgress?: (uploaded: number, total: number) => void;
}

export interface UploadVideoResult {
  videoId: string;
  status: 'uploaded' | 'uploading' | 'processed' | 'failed';
  etag?: string;
}

export interface VideoAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  watchTimeMinutes?: number;
  averageViewDuration?: number;
  subscribersGained?: number;
  impressions?: number;
  clickThroughRate?: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface YouTubeProvider {
  readonly name: string;
  exchangeAuthCode(code: string, redirectUri: string): Promise<YouTubeTokens>;
  getTokensFromRefresh(refreshToken: string): Promise<YouTubeTokens>;
  listChannels(tokens: YouTubeTokens): Promise<YouTubeChannelInfo[]>;
  uploadVideo(tokens: YouTubeTokens, input: UploadVideoInput): Promise<UploadVideoResult>;
  getVideoStatus(tokens: YouTubeTokens, videoId: string): Promise<{ privacyStatus: string; uploadStatus: string; failureReason?: string }>;
  updateVideoMetadata(tokens: YouTubeTokens, videoId: string, updates: { title?: string; description?: string; tags?: string[]; privacyStatus?: string; publishAt?: Date }): Promise<void>;
  getVideoAnalytics(tokens: YouTubeTokens, videoId: string, start: Date, end: Date): Promise<VideoAnalytics>;
  // Token refresh: returns fresh tokens; caller is responsible for persisting
}
