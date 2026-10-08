export interface SynthesizeOptions {
  voiceId: string;
  text: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
}

export interface SynthesizeResult {
  audio: Buffer;
  format: 'mp3' | 'wav' | 'ogg';
  durationSec?: number;
  charCount: number;
  providerVoiceId: string;
}

export interface VoiceInfo { id: string; name: string; labels?: Record<string, string>; previewUrl?: string; }

export interface TTSProvider {
  readonly name: string;
  synthesize(opts: SynthesizeOptions): Promise<SynthesizeResult>;
  listVoices(): Promise<VoiceInfo[]>;
}
