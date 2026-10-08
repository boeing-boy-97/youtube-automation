import type { VisualProvider } from './VisualProvider.js';
import { OpenAIVisualProvider } from './OpenAIVisualProvider.js';
import { env } from '../../config/env.js';

let instance: VisualProvider | null = null;

export function getVisual(): VisualProvider {
  if (instance) return instance;
  if (env.OPENAI_API_KEY) instance = new OpenAIVisualProvider();
  else throw new Error('Visual provider is not configured. Set OPENAI_API_KEY.');
  return instance;
}

export * from './VisualProvider.js';
export { OpenAIVisualProvider };
