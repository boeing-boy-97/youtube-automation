import { ElevenLabsProvider } from './elevenlabs/elevenlabs.provider.js';
import type { TTSProvider } from './tts.provider.js';
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

export * from './tts.provider.js';
export { ElevenLabsProvider };
