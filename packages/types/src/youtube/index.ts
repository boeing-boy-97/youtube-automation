/**
 * YouTube integration types.
 */

export interface YouTubeChannelSummary {
  id: string;
  title: string;
  customUrl?: string;
  thumbnailUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  publishedAt?: string;
}

export type YouTubePrivacyStatus = 'public' | 'unlisted' | 'private';

export interface YouTubePublishPayload {
  title: string;
  description: string;
  tags?: string[];
  privacyStatus: YouTubePrivacyStatus;
  madeForKids?: boolean;
}
