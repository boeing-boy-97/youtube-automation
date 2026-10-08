import { GoogleYouTubeProvider } from './google/google-youtube.provider.js';
import type { YouTubeProvider } from './youtube.provider.js';

let instance: YouTubeProvider | null = null;
export function getYouTube(): YouTubeProvider {
  if (instance) return instance;
  instance = new GoogleYouTubeProvider();
  return instance;
}

export * from './youtube.provider.js';
export * from './google/google-youtube.provider.js';
