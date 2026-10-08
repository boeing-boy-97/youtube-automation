import type { AIProvider } from './AIProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { env } from '../../config/env.js';

let instance: AIProvider | null = null;

export function getAI(): AIProvider {
  if (instance) return instance;
  if (env.OPENAI_API_KEY) {
    instance = new OpenAIProvider();
  } else {
    throw new Error('AI provider is not configured. Set OPENAI_API_KEY.');
  }
  return instance;
}

export * from './AIProvider.js';
export { OpenAIProvider };
