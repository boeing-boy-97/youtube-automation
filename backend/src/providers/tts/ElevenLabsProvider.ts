import { ElevenLabsClient } from 'elevenlabs';
import { env } from '../../config/env.js';
import { ProviderError } from '../../common/errors/AppError.js';
import type { SynthesizeOptions, SynthesizeResult, TTSProvider, VoiceInfo } from './TTSProvider.js';

const DEFAULT_MODEL = 'eleven_multilingual_v2';

export class ElevenLabsProvider implements TTSProvider {
  readonly name = 'elevenlabs';
  private client: ElevenLabsClient;

  constructor() {
    if (!env.ELEVENLABS_API_KEY) {
      throw new ProviderError('ELEVENLABS_API_KEY is not configured');
    }
    this.client = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
  }

  async synthesize(opts: SynthesizeOptions): Promise<SynthesizeResult> {
    try {
      const audioStream = await this.client.textToSpeech.convertAsStream(opts.voiceId, {
        text: opts.text,
        model_id: opts.model || DEFAULT_MODEL,
        voice_settings: {
          stability: opts.stability ?? 0.5,
          similarity_boost: opts.similarityBoost ?? 0.75,
          style: opts.style ?? 0,
        },
        output_format: 'mp3_44100_128',
      });
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream as unknown as AsyncIterable<Buffer>) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const audio = Buffer.concat(chunks);
      return {
        audio,
        format: 'mp3',
        charCount: opts.text.length,
        providerVoiceId: opts.voiceId,
      };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string };
      if (e?.statusCode === 401) throw new ProviderError('ElevenLabs authentication failed', { code: 'PROVIDER_AUTH_FAILED', cause: err, retryable: false });
      throw new ProviderError(`ElevenLabs synthesis failed: ${(e as any)?.message || 'unknown'}`, { cause: err, retryable: true });
    }
  }

  async listVoices(): Promise<VoiceInfo[]> {
    try {
      const res = await this.client.voices.getAll();
      return (res.voices || []).map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        labels: v.labels,
        previewUrl: v.preview_url,
      }));
    } catch (err) {
      throw new ProviderError('ElevenLabs list voices failed', { cause: err });
    }
  }
}
