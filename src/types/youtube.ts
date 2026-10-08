export type YouTubeConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

export interface YouTubeChannel {
  id: string;
  connectionStatus: YouTubeConnectionStatus;
  channelId?: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscriberCount?: number;
  viewCount?: number;
  videoCount?: number;
  lastSync?: string;
  lastUpload?: string;
  nextUpload?: string;
  expiresAt?: string;
}

export interface YouTubeUpload {
  id: string;
  contentId: string;
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  scheduledAt?: string;
  status: 'pending' | 'uploading' | 'processing' | 'published' | 'failed';
  progress: number;
  youtubeId?: string;
  youtubeUrl?: string;
  publishedAt?: string;
  error?: string;
}

export interface RecentUpload {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: number;
}
