export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' };
  jsonSchema?: Record<string, unknown>;
  seed?: number;
}

export interface ChatResult {
  content: string;
  parsed?: unknown;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  finishReason: string;
}

export interface EstimateCostInput { model: string; inputTokens: number; outputTokens: number; }

export interface AIProvider {
  readonly name: string;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
  estimateCost(input: EstimateCostInput): { usd: number };
}
