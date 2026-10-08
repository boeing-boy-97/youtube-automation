import { GoogleYouTubeProvider } from './GoogleYouTubeProvider.js';
import type { YouTubeProvider } from './YouTubeProvider.js';

let instance: YouTubeProvider | null = null;
export function getYouTube(): YouTubeProvider {
  if (instance) return instance;
  instance = new GoogleYouTubeProvider();
  return instance;
}

export * from './YouTubeProvider.js';
export * from './GoogleYouTubeProvider.js';
