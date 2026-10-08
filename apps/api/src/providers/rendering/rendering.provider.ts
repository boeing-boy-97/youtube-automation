export interface RenderInput {
  projectId: string;
  workspaceId: string;
  scenes: SceneInput[];
  audioTrack?: { key: string };
  width: number;
  height: number;
  fps?: number;
  outputKey: string; // storage key where final MP4 should land
}

export interface SceneInput {
  id: string;
  durationSec: number;
  visualKey?: string; // image or video clip
  textOverlay?: string;
  transition?: 'none' | 'fade' | 'cut';
}

export interface RenderProgress {
  stage: string;
  percent: number;
  fps?: number;
  frame?: number;
  totalFrames?: number;
}

export interface RenderResult {
  outputKey: string;
  sizeBytes: number;
  durationSec: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  diagnostics: { ffprobe?: unknown; stages: Array<{ name: string; durationMs: number }> };
}

export interface MediaInfo {
  durationSec: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  sizeBytes: number;
  format: string;
  audioCodec?: string;
  audioSampleRate?: number;
}

export interface RenderingProvider {
  readonly name: string;
  render(input: RenderInput, onProgress?: (p: RenderProgress) => Promise<void> | void): Promise<RenderResult>;
  probe(filePath: string): Promise<MediaInfo>;
}
