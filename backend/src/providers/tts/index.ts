import { ElevenLabsProvider } from './ElevenLabsProvider.js';
import type { TTSProvider } from './TTSProvider.js';
import { env } from '../../config/env.js';

let instance: TTSProvider | null = null;

export function getTTS(): TTSProvider {
  if (instance) return instance;
  if (env.ELEVENLABS_API_KEY) {
    instance = new ElevenLabsProvider();
  } else {
    throw new Error('TTS provider is not configured. Set ELEVENLABS_API_KEY.');
  }
  return instance;
}

export * from './TTSProvider.js';
export { ElevenLabsProvider };
