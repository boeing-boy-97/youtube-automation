import OpenAI from 'openai';
import { env } from '../../../config/env.js';
import { ProviderError } from '../../../common/errors/app-error.js';
import type { VisualProvider, GenerateVisualInput, VisualResult } from '../visual.provider.js';

const DEFAULT_MODEL = 'gpt-image-1'; // image generation via OpenAI

export class OpenAIVisualProvider implements VisualProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) throw new ProviderError('OPENAI_API_KEY is not configured');
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async generate(input: GenerateVisualInput): Promise<VisualResult> {
    try {
      const prompt = buildPrompt(input);
      const size = resolveSize(input.width, input.height);
      const res = await this.client.images.generate({
        model: DEFAULT_MODEL,
        prompt,
        n: 1,
        size: size as any,
        quality: 'standard',
      });
      const item = res.data?.[0];
      if (!item?.b64_json) throw new ProviderError('OpenAI image generation returned no b64_json');
      const buf = Buffer.from(item.b64_json, 'base64');
      const dim = sizeFromLabel(size);
      return { buffer: buf, format: 'png', width: dim.w, height: dim.h, model: DEFAULT_MODEL, revisedPrompt: item.revised_prompt };
    } catch (err: any) {
      if (err?.status === 401) throw new ProviderError('OpenAI auth failed for visual generation', { code: 'PROVIDER_AUTH_FAILED', cause: err, retryable: false });
      throw new ProviderError(`Visual generation failed: ${err?.message || 'unknown'}`, { cause: err, retryable: true });
    }
  }
}

function buildPrompt(i: GenerateVisualInput): string {
  const styleTag = i.style ? `Style: ${i.style}. ` : '';
  const neg = i.negativePrompt ? `Avoid: ${i.negativePrompt}. ` : '';
  return `${styleTag}${neg}${i.prompt}`.slice(0, 4000);
}

function resolveSize(w?: number, h?: number): '1024x1024' | '1792x1024' | '1024x1792' {
  if (w && h && w > h) return '1792x1024';
  if (w && h && h > w) return '1024x1792';
  return '1024x1024';
}
function sizeFromLabel(label: string): { w: number; h: number } {
  if (label === '1792x1024') return { w: 1792, h: 1024 };
  if (label === '1024x1792') return { w: 1024, h: 1792 };
  return { w: 1024, h: 1024 };
}
