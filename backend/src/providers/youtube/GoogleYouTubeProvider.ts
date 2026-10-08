import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'node:fs';
import { createReadStream } from 'node:fs';
import { env } from '../../config/env.js';
import { ProviderError } from '../../common/errors/AppError.js';
import { decryptObject, encryptObject } from '../../common/crypto/crypto.js';
import type { UploadVideoInput, UploadVideoResult, VideoAnalytics, YouTubeChannelInfo, YouTubeProvider, YouTubeTokens } from './YouTubeProvider.js';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

export const YOUTUBE_SCOPES = SCOPES;

export function createOAuthClient(redirectUri?: string): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new ProviderError('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured');
  }
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
}

export function generateAuthUrl(redirectUri: string, state: string): string {
  const oauth = createOAuthClient(redirectUri);
  return oauth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent',
    state,
  });
}

export class GoogleYouTubeProvider implements YouTubeProvider {
  readonly name = 'google';

  private async clientFor(tokens: YouTubeTokens): Promise<OAuth2Client> {
    const oauth = createOAuthClient();
    oauth.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate ?? undefined,
    });
    // Auto refresh on expiry is handled by google-auth-library; force a refresh if within 60s of expiry.
    if (tokens.expiryDate && tokens.expiryDate - Date.now() < 60_000 && tokens.refreshToken) {
      const { credentials } = await oauth.refreshAccessToken();
      oauth.setCredentials(credentials);
      // Caller is responsible for persisting new tokens; we expose them through the upload return where appropriate via the client, but for simplicity we return fresh tokens via refreshAccessToken result upstream.
    }
    return oauth;
  }

  async exchangeAuthCode(code: string, redirectUri: string): Promise<YouTubeTokens> {
    const oauth = createOAuthClient(redirectUri);
    try {
      const { tokens } = await oauth.getToken(code);
      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date ?? undefined,
      };
    } catch (err) {
      throw new ProviderError('Google OAuth code exchange failed', { cause: err, code: 'PROVIDER_AUTH_FAILED', retryable: false });
    }
  }

  async getTokensFromRefresh(refreshToken: string): Promise<YouTubeTokens> {
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await oauth.refreshAccessToken();
      return { accessToken: credentials.access_token!, refreshToken: credentials.refresh_token || refreshToken, expiryDate: credentials.expiry_date ?? undefined };
    } catch (err) {
      throw new ProviderError('Google token refresh failed; re-connect channel', { cause: err, code: 'YOUTUBE_TOKEN_EXPIRED', retryable: false });
    }
  }

  async listChannels(tokens: YouTubeTokens): Promise<YouTubeChannelInfo[]> {
    const auth = await this.clientFor(tokens);
    const yt = google.youtube({ version: 'v3', auth });
    try {
      const res = await yt.channels.list({ part: ['id', 'snippet', 'statistics', 'brandingSettings'], mine: true });
      return (res.data.items || []).map((c) => ({
        id: c.id!,
        title: c.snippet?.title || '',
        description: c.snippet?.description || undefined,
        customUrl: c.snippet?.customUrl || undefined,
        country: c.snippet?.country || undefined,
        thumbnails: {
          default: c.snippet?.thumbnails?.default?.url || undefined,
          medium: c.snippet?.thumbnails?.medium?.url || undefined,
          high: c.snippet?.thumbnails?.high?.url || undefined,
        },
        statistics: {
          subscriberCount: c.statistics?.subscriberCount || undefined,
          videoCount: c.statistics?.videoCount || undefined,
          viewCount: c.statistics?.viewCount || undefined,
        },
      }));
    } catch (err) {
      throw this.toProviderError(err);
    }
  }

  async uploadVideo(tokens: YouTubeTokens, input: UploadVideoInput): Promise<UploadVideoResult> {
    const auth = await this.clientFor(tokens);
    const yt = google.youtube({ version: 'v3', auth });
    const body: youtube_v3.Schema$Video = {
      snippet: {
        title: input.title.slice(0, 100),
        description: input.description.slice(0, 5000),
        tags: input.tags,
        categoryId: input.categoryId || '22', // People & Blogs default
      },
      status: {
        privacyStatus: input.privacyStatus,
        selfDeclaredMadeForKids: input.madeForKids ?? false,
        publishAt: input.publishAt?.toISOString(),
      },
    };

    try {
      let media: { body: fs.ReadStream | Buffer } | undefined;
      if (input.filePath) media = { body: createReadStream(input.filePath) };
      else if (input.fileBuffer) media = { body: input.fileBuffer };
      else throw new ProviderError('uploadVideo requires filePath or fileBuffer');

      const res = await yt.videos.insert({
        part: ['snippet', 'status'],
        requestBody: body,
        media: { mimeType: input.mimeType || 'video/mp4', body: media.body },
      }, {
        onUploadProgress: (evt) => input.onProgress?.(evt.bytesRead || 0, 0),
      });
      const video = res.data;
      if (!video.id) throw new ProviderError('YouTube upload returned no video id');
      return { videoId: video.id, status: (video.status?.uploadStatus as any) || 'uploaded', etag: video.etag || undefined };
    } catch (err) {
      throw this.toProviderError(err);
    }
  }

  async getVideoStatus(tokens: YouTubeTokens, videoId: string) {
    const auth = await this.clientFor(tokens);
    const yt = google.youtube({ version: 'v3', auth });
    try {
      const res = await yt.videos.list({ part: ['status'], id: [videoId] });
      const item = res.data.items?.[0];
      return {
        privacyStatus: (item?.status?.privacyStatus as string) || 'unknown',
        uploadStatus: (item?.status?.uploadStatus as string) || 'unknown',
        failureReason: (item?.status?.failureReason as string) || undefined,
      };
    } catch (err) {
      throw this.toProviderError(err);
    }
  }

  async updateVideoMetadata(tokens: YouTubeTokens, videoId: string, updates: { title?: string; description?: string; tags?: string[]; privacyStatus?: string; publishAt?: Date }) {
    const auth = await this.clientFor(tokens);
    const yt = google.youtube({ version: 'v3', auth });
    try {
      const existing = await yt.videos.list({ part: ['snippet', 'status'], id: [videoId] });
      const item = existing.data.items?.[0];
      if (!item) throw new ProviderError(`YouTube video ${videoId} not found`, { code: 'NOT_FOUND' });
      await yt.videos.update({
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: {
            title: updates.title ?? item.snippet?.title,
            description: updates.description ?? item.snippet?.description,
            tags: updates.tags ?? item.snippet?.tags,
            categoryId: item.snippet?.categoryId,
          },
          status: {
            privacyStatus: (updates.privacyStatus as any) ?? item.status?.privacyStatus,
            publishAt: updates.publishAt?.toISOString() ?? item.status?.publishAt,
          },
        },
      });
    } catch (err) {
      throw this.toProviderError(err);
    }
  }

  async getVideoAnalytics(tokens: YouTubeTokens, videoId: string, start: Date, end: Date): Promise<VideoAnalytics> {
    const auth = await this.clientFor(tokens);
    // Reports API for views/watch time; basic stats from videos.list for likes/comments
    const yt = google.youtube({ version: 'v3', auth });
    try {
      const res = await yt.videos.list({ part: ['statistics'], id: [videoId] });
      const stats = res.data.items?.[0]?.statistics;
      return {
        views: Number(stats?.viewCount || 0),
        likes: Number(stats?.likeCount || 0),
        comments: Number(stats?.commentCount || 0),
        periodStart: start,
        periodEnd: end,
      };
    } catch (err) {
      throw this.toProviderError(err);
    }
  }

  private toProviderError(err: unknown): ProviderError {
    const e = err as any;
    const code = e?.code ?? e?.response?.status;
    const msg = e?.message || e?.response?.data?.error?.message || 'YouTube API error';
    if (code === 401 || code === 403) return new ProviderError(`YouTube auth error: ${msg}`, { code: 'YOUTUBE_TOKEN_EXPIRED', cause: err, retryable: false });
    if (code === 429) return new ProviderError(`YouTube rate limited: ${msg}`, { code: 'YOUTUBE_QUOTA_EXCEEDED', cause: err, retryable: true });
    return new ProviderError(`YouTube error: ${msg}`, { cause: err, retryable: true });
  }
}

// Encryption helpers for DB storage of refresh tokens
export function encryptTokens(tokens: YouTubeTokens): string {
  return encryptObject(tokens);
}
export function decryptTokens(payload: string): YouTubeTokens {
  return decryptObject<YouTubeTokens>(payload);
}
