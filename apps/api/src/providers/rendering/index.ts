import { FFmpegRenderingProvider } from './ffmpeg/ffmpeg.renderer.js';
import type { RenderingProvider } from './rendering.provider.js';

let instance: RenderingProvider | null = null;
export function getRenderer(): RenderingProvider {
  if (instance) return instance;
  instance = new FFmpegRenderingProvider();
  return instance;
}

export * from './rendering.provider.js';
export { FFmpegRenderingProvider };
