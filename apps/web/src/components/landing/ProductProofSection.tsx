import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  FileText,
  Mic,
  Image as ImageIcon,
  Type,
  Video,
  Send,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepDetail {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  inputLabel: string;
  inputContent: string;
  outputLabel: string;
  outputContent: string;
  badge: string;
}

const PRODUCTION_STAGES: StepDetail[] = [
  {
    id: 'idea',
    number: '01',
    title: 'Idea Discovery',
    shortDesc: 'Semantic trend scoring and curiosity hook prediction.',
    icon: Lightbulb,
    badge: 'STAGE 1: CONCEPT',
    inputLabel: 'Strategy Niche & Pillars',
    inputContent: 'AI Coding Tools • Audience: Junior Developers • Tone: High Energy Discovery',
    outputLabel: 'Top Scored Concept (Virality 94/100)',
    outputContent: '"Why 90% of developers use Claude 3.7 incorrectly — and the 3 flags that fix it."',
  },
  {
    id: 'script',
    number: '02',
    title: '3-Act Scripting',
    shortDesc: 'Sentence-per-breath vertical narration with retention pattern interrupts.',
    icon: FileText,
    badge: 'STAGE 2: SCRIPT',
    inputLabel: 'Target Duration & Pacing',
    inputContent: '45 seconds • 115 words • 2.55 words/sec • Strict 3s scroll-stop rule',
    outputLabel: 'Generated Vertical Beats',
    outputContent: 'Hook (0-3s): Stop scrolling if you write Python.\nContext (3-12s): Most devs prompt like it is 2023.\nTwist (12-32s): Here is the exact chain-of-thought parameter.\nCTA (32-45s): Follow for daily agent breakdowns.',
  },
  {
    id: 'voice',
    number: '03',
    title: 'Neural Voice Synthesis',
    shortDesc: 'ElevenLabs 48kHz voice synthesis with breath-control pauses.',
    icon: Mic,
    badge: 'STAGE 3: AUDIO',
    inputLabel: 'Voice Model & Latency',
    inputContent: 'ElevenLabs Turbo v2.5 • Timbre: Adam • Stability: 0.55 • Similarity: 0.75',
    outputLabel: 'Audio Normalization Result',
    outputContent: '48,000 Hz, 320 kbps AAC stereo, -14.2 LUFS integrated broadcast standard.',
  },
  {
    id: 'scenes',
    number: '04',
    title: 'Visual Scene Directing',
    shortDesc: '9:16 vertical composition matching semantic beats.',
    icon: ImageIcon,
    badge: 'STAGE 4: VISUALS',
    inputLabel: 'Scene Breakdown Prompts',
    inputContent: 'Scene 1: High-contrast neon terminal glowing with matrix syntax, cinematic lighting, 9:16 aspect.',
    outputLabel: 'Rendered Visual Asset Key',
    outputContent: 'assets/ws_prod/scene_001_hook.png • 1080×1920 • Lossless WebP',
  },
  {
    id: 'captions',
    number: '05',
    title: 'Kinetic Subtitles',
    shortDesc: 'Word-by-word timestamped captions burned into safe-zones.',
    icon: Type,
    badge: 'STAGE 5: TYPOGRAPHY',
    inputLabel: 'Subtitle Layout Style',
    inputContent: 'Preset: Viral Punch (Inter Bold 64px, White text, Lime active highlight, #111310 drop shadow)',
    outputLabel: 'WebVTT Cue Sync',
    outputContent: '00:00.200 --> 00:00.800: "Stop"\n00:00.800 --> 00:01.400: "scrolling"\n00:01.400 --> 00:02.100: "right now."',
  },
  {
    id: 'render',
    number: '06',
    title: 'FFmpeg Composite Render',
    shortDesc: 'Dual-pass hardware encoding merging video, voiceover, music, and text.',
    icon: Video,
    badge: 'STAGE 6: COMPILE',
    inputLabel: 'Encoding Parameters',
    inputContent: 'ffmpeg -i scenes.concat -i voice.aac -filter_complex subtitles=burn.vtt -c:v libx264 -crf 18 -preset fast',
    outputLabel: 'Final MP4 Deliverable',
    outputContent: '1080×1920 @ 60.00 fps • 18.4 MB • ffprobe status: VALIDATED_PASSED',
  },
  {
    id: 'publish',
    number: '07',
    title: 'YouTube Shorts Publishing',
    shortDesc: 'Direct upload with idempotent reconciliation and automated analytics sync.',
    icon: Send,
    badge: 'STAGE 7: PUBLISH',
    inputLabel: 'YouTube Data API v3 Payload',
    inputContent: 'Snippet: { title, description, categoryId: "28", privacyStatus: "public", tags: ["#shorts", "#ai"] }',
    outputLabel: 'Publication Confirmation',
    outputContent: 'YouTube Video ID: dQw4w9WgXcQ • Scheduled Slot: 18:30 UTC • Analytics Sync: ACTIVE',
  },
];

export function ProductProofSection() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = PRODUCTION_STAGES[activeStageIndex];

  return (
    <section id="pipeline" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-subtle border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono mb-3">
            <span>Zero-Friction Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-tight">
            The 7-stage production engine.
          </h2>
          <p className="text-base sm:text-lg text-stone-muted mt-3 leading-relaxed">
            Every video progresses through an automated, state-machine validated pipeline.
            Inspect each phase below to see how raw concept data transforms into an authoritative YouTube Short.
          </p>
        </div>

        {/* Connected Horizontal Stage Tracker */}
        <div className="relative">
          {/* Progress bar background line */}
          <div className="hidden lg:block absolute top-7 left-8 right-8 h-0.5 bg-paper-border -z-0" />
          <div
            className="hidden lg:block absolute top-7 left-8 h-0.5 bg-forest transition-all duration-300 -z-0"
            style={{ width: `${(activeStageIndex / (PRODUCTION_STAGES.length - 1)) * 90}%` }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
            {PRODUCTION_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = activeStageIndex === idx;
              const isPassed = idx < activeStageIndex;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageIndex(idx)}
                  className={cn(
                    'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150',
                    isSelected
                      ? 'bg-ink text-paper border-ink shadow-md scale-[1.02]'
                      : isPassed
                      ? 'bg-paper text-ink border-forest/40 hover:border-forest'
                      : 'bg-paper text-stone-muted border-paper-border hover:text-ink hover:border-stone-muted'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold',
                        isSelected
                          ? 'bg-lime text-ink'
                          : isPassed
                          ? 'bg-forest text-paper'
                          : 'bg-paper-muted text-stone-muted'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold opacity-60">
                      {stage.number}
                    </span>
                  </div>
                  <span className={cn('text-xs font-bold leading-tight', isSelected ? 'text-paper' : 'text-ink')}>
                    {stage.title}
                  </span>
                  <span className="text-[10px] opacity-70 truncate mt-1">
                    {stage.shortDesc.split('.')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Transformation Inspector */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-paper border border-paper-border rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-paper-border">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-forest uppercase tracking-wider">
                  {activeStage.badge}
                </span>
                <h3 className="text-2xl font-bold text-ink">
                  Stage {activeStage.number}: {activeStage.title}
                </h3>
                <p className="text-sm text-stone-muted max-w-xl">
                  {activeStage.shortDesc}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeStageIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-paper-border text-xs font-medium text-ink hover:bg-paper-muted disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStageIndex((prev) => Math.min(PRODUCTION_STAGES.length - 1, prev + 1))}
                  disabled={activeStageIndex === PRODUCTION_STAGES.length - 1}
                  className="px-4 py-1.5 rounded-lg bg-ink text-lime text-xs font-semibold hover:bg-ink-surface transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Input vs Output Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Input Card */}
              <div className="bg-paper-subtle rounded-xl p-5 border border-paper-border space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-stone-muted">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-forest" />
                    INPUT PAYLOAD
                  </span>
                  <span className="text-[10px] bg-paper px-2 py-0.5 rounded border border-paper-border">
                    {activeStage.inputLabel}
                  </span>
                </div>
                <div className="font-mono text-xs text-ink bg-paper p-3.5 rounded-lg border border-paper-border/60 whitespace-pre-wrap leading-relaxed">
                  {activeStage.inputContent}
                </div>
              </div>

              {/* Output Card */}
              <div className="bg-ink rounded-xl p-5 border border-ink-border space-y-3 text-paper">
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-stone-muted">
                  <span className="flex items-center gap-1.5 text-lime">
                    <CheckCircle className="h-3.5 w-3.5 text-lime" />
                    COMPILED RESULT
                  </span>
                  <span className="text-[10px] bg-ink-surface px-2 py-0.5 rounded border border-ink-border text-stone-muted">
                    {activeStage.outputLabel}
                  </span>
                </div>
                <div className="font-mono text-xs text-paper bg-ink-subtle p-3.5 rounded-lg border border-ink-border whitespace-pre-wrap leading-relaxed text-lime">
                  {activeStage.outputContent}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
