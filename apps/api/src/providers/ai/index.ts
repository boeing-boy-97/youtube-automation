import type { AIProvider } from './ai.provider.js';
import { OpenAIProvider } from './openai/openai.provider.js';
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

export * from './ai.provider.js';
export { OpenAIProvider };
