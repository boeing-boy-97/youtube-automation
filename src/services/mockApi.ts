import { delay } from '../lib/utils';

// Simulate realistic network latency and processing times
export const NETWORK_DELAY = {
  instant: 150,
  fast: 400,
  normal: 800,
  slow: 1500,
  ai_generation: 2000,
  voice: 2500,
  render: 4000,
  upload: 3000,
};

export interface SimulatedProgress {
  onProgress?: (progress: number, stage?: string) => void;
  shouldFail?: boolean;
  failAt?: number;
}

export async function simulateProgress(
  stages: { label: string; weight: number }[],
  callbacks: {
    onStage?: (label: string) => void;
    onProgress?: (overall: number) => void;
    onComplete?: () => void;
    onFail?: (error: string) => void;
  },
  options: { shouldFail?: boolean; failStage?: number; duration?: number } = {}
): Promise<boolean> {
  const { shouldFail = false, failStage = -1, duration = 3000 } = options;
  const totalWeight = stages.reduce((s, st) => s + st.weight, 0);
  const tickRate = 150;
  let accumulatedWeight = 0;

  for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
    const stage = stages[stageIdx];
    callbacks.onStage?.(stage.label);

    if (shouldFail && stageIdx === failStage) {
      const errors = [
        'Temporary service unavailable',
        'Provider rate limit exceeded',
        'Network timeout',
        'Resource allocation failed',
      ];
      callbacks.onFail?.(errors[Math.floor(Math.random() * errors.length)]);
      return false;
    }

    const stageDuration = (duration * stage.weight) / totalWeight;
    const ticks = Math.ceil(stageDuration / tickRate);

    for (let t = 0; t < ticks; t++) {
      await delay(tickRate);
      const stageProgress = (t + 1) / ticks;
      const overallProgress = ((accumulatedWeight + stage.weight * stageProgress) / totalWeight) * 100;
      callbacks.onProgress?.(Math.min(99, Math.round(overallProgress)));
    }

    accumulatedWeight += stage.weight;
  }

  callbacks.onProgress?.(100);
  callbacks.onComplete?.();
  return true;
}

export const renderStages = [
  { label: 'Preparing assets', weight: 1 },
  { label: 'Rendering scenes', weight: 3 },
  { label: 'Compositing video', weight: 2 },
  { label: 'Mixing audio', weight: 1 },
  { label: 'Adding captions', weight: 1 },
  { label: 'Encoding', weight: 2 },
  { label: 'Running quality check', weight: 1 },
];

export const scriptStages = [
  { label: 'Analyzing topic', weight: 1 },
  { label: 'Crafting hook', weight: 2 },
  { label: 'Building script body', weight: 3 },
  { label: 'Writing CTA', weight: 1 },
  { label: 'Checking structure', weight: 1 },
];

export const voiceStages = [
  { label: 'Preparing text', weight: 1 },
  { label: 'Generating voice', weight: 3 },
  { label: 'Processing audio', weight: 2 },
  { label: 'Finalizing', weight: 1 },
];

export const visualStages = [
  { label: 'Analyzing scenes', weight: 1 },
  { label: 'Generating visuals', weight: 4 },
  { label: 'Processing assets', weight: 2 },
  { label: 'Finalizing', weight: 1 },
];

export const uploadStages = [
  { label: 'Connecting to YouTube', weight: 1 },
  { label: 'Uploading video', weight: 4 },
  { label: 'Processing on YouTube', weight: 3 },
  { label: 'Setting metadata', weight: 1 },
  { label: 'Finalizing', weight: 1 },
];

export const ideaStages = [
  { label: 'Analyzing trends', weight: 2 },
  { label: 'Researching topics', weight: 2 },
  { label: 'Generating concepts', weight: 3 },
  { label: 'Scoring potential', weight: 1 },
  { label: 'Finalizing ideas', weight: 1 },
];
