import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { ProviderError } from '../../common/errors/AppError.js';
import type { AIProvider, ChatMessage, ChatOptions, ChatResult } from './AIProvider.js';

// Rough per-1M-token pricing (USD). Update periodically.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10, output: 30 },
};
const DEFAULT_MODEL = 'gpt-4o-mini';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new ProviderError('OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const model = opts.model || DEFAULT_MODEL;
    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens,
        seed: opts.seed,
        response_format: opts.responseFormat,
      };
      // Use structured outputs when jsonSchema provided (requires response_format json_schema)
      if (opts.jsonSchema) {
        (params as any).response_format = { type: 'json_schema', json_schema: { name: 'response', schema: opts.jsonSchema, strict: true } };
      }
      const res = await this.client.chat.completions.create(params);
      const choice = res.choices[0];
      const content = choice.message.content || '';
      let parsed: unknown = undefined;
      if (opts.responseFormat?.type === 'json_object' || opts.jsonSchema) {
        try { parsed = JSON.parse(content); } catch { parsed = undefined; }
      }
      return {
        content,
        parsed,
        model: res.model,
        usage: {
          inputTokens: res.usage?.prompt_tokens ?? 0,
          outputTokens: res.usage?.completion_tokens ?? 0,
          totalTokens: res.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason || 'unknown',
      };
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; code?: string };
      if (e?.status === 401) throw new ProviderError('OpenAI authentication failed: check OPENAI_API_KEY', { code: 'PROVIDER_AUTH_FAILED', cause: err, retryable: false });
      if (e?.status === 429) throw new ProviderError('OpenAI rate limited or quota exceeded', { code: 'PROVIDER_RATE_LIMITED', cause: err, retryable: true });
      throw new ProviderError(`OpenAI request failed: ${e?.message || 'unknown'}`, { cause: err, retryable: true });
    }
  }

  estimateCost({ model, inputTokens, outputTokens }: { model: string; inputTokens: number; outputTokens: number }) {
    const p = MODEL_PRICING[model] || MODEL_PRICING[DEFAULT_MODEL];
    const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
    return { usd };
  }
}
