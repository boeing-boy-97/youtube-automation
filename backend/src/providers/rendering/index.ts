import { FFmpegRenderingProvider } from './FFmpegRenderingProvider.js';
import type { RenderingProvider } from './RenderingProvider.js';

let instance: RenderingProvider | null = null;
export function getRenderer(): RenderingProvider {
  if (instance) return instance;
  instance = new FFmpegRenderingProvider();
  return instance;
}

export * from './RenderingProvider.js';
export { FFmpegRenderingProvider };
