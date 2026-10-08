export interface GenerateVisualInput {
  prompt: string;
  style?: 'cinematic' | 'minimal' | 'bold-text' | 'b-roll';
  width?: number;
  height?: number;
  negativePrompt?: string;
}

export interface VisualResult {
  buffer: Buffer;
  format: 'png' | 'jpg';
  width: number;
  height: number;
  model: string;
  revisedPrompt?: string;
}

export interface VisualProvider {
  readonly name: string;
  generate(input: GenerateVisualInput): Promise<VisualResult>;
}
