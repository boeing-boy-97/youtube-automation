/**
 * ShortForge platform constants.
 */

export const PLATFORM_NAME = 'ShortForge';
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const VIDEO_ASPECT_RATIOS = ['9:16', '16:9', '1:1'] as const;
export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIOS)[number];

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac'] as const;
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov'] as const;
