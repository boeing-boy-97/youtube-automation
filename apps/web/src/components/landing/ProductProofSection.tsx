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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMotionSafe, motionTokens } from '../../lib/motion';

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
    shortDesc: 'Topic angle and curiosity hook structuring.',
    icon: Lightbulb,
    badge: 'STAGE 1: CONCEPT',
    inputLabel: 'Strategy Niche & Pillars',
    inputContent: 'AI & Engineering • Audience: Developers & Tech Creators • Tone: Practical & Focused',
    outputLabel: 'Selected Concept Angle',
    outputContent: '"Why 90% of developers use Claude incorrectly — and the 3 parameters that fix it."',
  },
  {
    id: 'script',
    number: '02',
    title: '3-Act Scripting',
    shortDesc: 'Sentence-by-sentence vertical narration with strict retention pacing.',
    icon: FileText,
    badge: 'STAGE 2: SCRIPT',
    inputLabel: 'Target Duration & Pacing',
    inputContent: '45 seconds • 115 words • 2.55 words/sec • Strict 3-second opening hook rule',
    outputLabel: 'Structured Screenplay Beats',
    outputContent: 'Hook (0-3s): Stop scrolling if you write code.\nContext (3-14s): Most developers prompt like it is 2023.\nTwist (14-34s): Here is the exact parameter to pass.\nOutro (34-45s): Follow for daily production breakdowns.',
  },
  {
    id: 'voice',
    number: '03',
    title: 'Voice Synthesis',
    shortDesc: 'Studio-grade voice narration with natural cadence.',
    icon: Mic,
    badge: 'STAGE 3: AUDIO',
    inputLabel: 'Selected Voice Model',
    inputContent: 'Voice: Adam (Authoritative Tech Narration) • ElevenLabs Neural Engine',
    outputLabel: 'Audio Master Result',
    outputContent: '48,000 Hz, 320 kbps AAC stereo, broadcast normalized (-14 LUFS).',
  },
  {
    id: 'scenes',
    number: '04',
    title: 'Scene Directing',
    shortDesc: '9:16 vertical composition matching semantic beats.',
    icon: ImageIcon,
    badge: 'STAGE 4: VISUALS',
    inputLabel: 'Scene Breakdown Prompts',
    inputContent: 'Scene 1: High-contrast terminal showing live code architecture, cinematic lighting, 9:16 aspect.',
    outputLabel: 'Rendered Visual Asset',
    outputContent: 'scene_001_hook.png • 1080×1920 • Lossless Format',
  },
  {
    id: 'captions',
    number: '05',
    title: 'Kinetic Subtitles',
    shortDesc: 'Word-by-word timestamped captions positioned in safe zones.',
    icon: Type,
    badge: 'STAGE 5: TYPOGRAPHY',
    inputLabel: 'Subtitle Layout Style',
    inputContent: 'Preset: Clean Modern (Inter Bold, High Contrast, Centered Safe-Zone Placement)',
    outputLabel: 'WebVTT Cue Sync',
    outputContent: '00:00.200 --> 00:00.800: "Stop"\n00:00.800 --> 00:01.400: "scrolling"\n00:01.400 --> 00:02.100: "right now."',
  },
  {
    id: 'render',
    number: '06',
    title: 'FFmpeg Compositor',
    shortDesc: 'Server-side encoding merging video, voiceover, music, and text.',
    icon: Video,
    badge: 'STAGE 6: COMPILE',
    inputLabel: 'Encoding Engine',
    inputContent: 'ffmpeg -i scenes.concat -i voice.aac -filter_complex subtitles -c:v libx264 -crf 18',
    outputLabel: 'Completed MP4 Deliverable',
    outputContent: '1080×1920 @ 30.00 fps • ffprobe media validation: PASSED',
  },
  {
    id: 'publish',
    number: '07',
    title: 'YouTube Shorts',
    shortDesc: 'Authorized Google OAuth v3 upload and scheduled slot management.',
    icon: Send,
    badge: 'STAGE 7: PUBLISH',
    inputLabel: 'YouTube Data API v3 Payload',
    inputContent: 'Snippet: { title, description, categoryId: "28", privacyStatus: "public", tags: ["#shorts"] }',
    outputLabel: 'Publishing Status',
    outputContent: 'Authorized OAuth channel link • Scheduled slot • Direct metadata sync',
  },
];

export function ProductProofSection() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = PRODUCTION_STAGES[activeStageIndex];
  const { shouldReduce } = useMotionSafe();

  return (
    <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            The Production Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            How a concept becomes <br />
            <span className="font-editorial italic font-normal text-coral">a vertical short.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            Every video progresses through an automated, state-machine validated pipeline. Click any stage below to inspect how data passes from idea to finished deliverable.
          </p>
        </div>

        {/* Horizontal Stage Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {PRODUCTION_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStageIndex === idx;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={cn(
                  'p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-3',
                  isActive
                    ? 'bg-surface border-coral shadow-sm ring-1 ring-coral/20'
                    : 'bg-surface/60 border-border hover:bg-surface hover:border-border-strong'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-md flex items-center justify-center transition-colors',
                      isActive ? 'bg-coral text-white' : 'bg-canvas-subtle text-stone'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-muted">{stage.number}</span>
                </div>

                <div>
                  <div className="font-semibold text-xs text-ink">{stage.title}</div>
                  <div className="text-[11px] text-stone-muted line-clamp-1 mt-0.5">{stage.shortDesc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Stage Inspector Panel */}
        <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: motionTokens.duration.standard }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-coral">{activeStage.badge}</span>
                  <span className="text-stone-muted">•</span>
                  <h3 className="text-lg font-bold text-ink">{activeStage.title}</h3>
                </div>
                <span className="text-xs text-stone">{activeStage.shortDesc}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Data Card */}
                <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                  <div className="text-xs font-semibold text-stone uppercase tracking-wider font-mono">
                    Input Payload
                  </div>
                  <div className="text-xs font-medium text-ink">{activeStage.inputLabel}</div>
                  <div className="p-3 rounded bg-surface border border-border font-mono text-xs text-stone whitespace-pre-line leading-relaxed">
                    {activeStage.inputContent}
                  </div>
                </div>

                {/* Output Data Card */}
                <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                  <div className="text-xs font-semibold text-coral uppercase tracking-wider font-mono">
                    Pipeline Output
                  </div>
                  <div className="text-xs font-medium text-ink">{activeStage.outputLabel}</div>
                  <div className="p-3 rounded bg-surface border border-border font-mono text-xs text-ink whitespace-pre-line leading-relaxed">
                    {activeStage.outputContent}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
