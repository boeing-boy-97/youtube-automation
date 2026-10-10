import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Film,
  Mic,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useMotionSafe, motionTokens } from '../../lib/motion';

interface SampleOutput {
  id: string;
  title: string;
  hook: string;
  category: string;
  duration: string;
  wordCount: number;
  pacing: string;
  voice: string;
  gradient: string;
  scriptSnippet: string;
  visualNote: string;
  aspect: string;
  renderEngine: string;
}

const CAROUSEL_SAMPLES: SampleOutput[] = [
  {
    id: 'sample_01',
    title: 'The 3 Flags That Make Claude 3.7 Code Like a Senior Dev',
    hook: 'Stop scrolling if you write Python or TypeScript.',
    category: 'Developer Tools',
    duration: '0:42',
    wordCount: 112,
    pacing: '160 WPM',
    voice: 'Adam (ElevenLabs Neural)',
    gradient: 'from-stone-900 via-stone-850 to-black',
    visualNote: 'Dynamic split code diff showing architectural reasoning flags activating with warm studio backlighting.',
    aspect: '1080×1920 (9:16)',
    renderEngine: 'FFmpeg Dual-Pass libx264 • Subtitles Burned',
    scriptSnippet:
      'Stop scrolling if you write code. Most developers prompt Claude like it is 2023, asking general questions. But if you activate the architectural reasoning flag and constrain output tokens to strict diff blocks, your debugging time drops significantly. Here is the exact parameter.',
  },
  {
    id: 'sample_02',
    title: 'Why 1-Person Micro-SaaS Startups Hit Scale in 2026',
    hook: 'You no longer need 10 engineers to build scalable software.',
    category: 'Architecture',
    duration: '0:38',
    wordCount: 98,
    pacing: '155 WPM',
    voice: 'Rachel (ElevenLabs Studio)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    visualNote: 'Clean macro architecture diagram collapsing complex microservice clusters into a single outbox worker.',
    aspect: '1080×1920 (9:16)',
    renderEngine: 'FFmpeg Dual-Pass libx264 • 30.00 fps',
    scriptSnippet:
      'You no longer need a 10-person dev team to operate scalable services. Modern solopreneurs run automated outbox queues, serverless edge workers, and AI customer reconciliation. Here is how three solo founders do it.',
  },
  {
    id: 'sample_03',
    title: 'Stop Storing Passwords with bcrypt in 2026',
    hook: 'Your database might be failing modern security audits right now.',
    category: 'Security Engineering',
    duration: '0:44',
    wordCount: 120,
    pacing: '163 WPM',
    voice: 'Antoni (ElevenLabs Explanatory)',
    gradient: 'from-stone-950 via-stone-900 to-black',
    visualNote: 'Hardware memory bus visualization illustrating Argon2id memory-cost hardness against GPU clusters.',
    aspect: '1080×1920 (9:16)',
    renderEngine: 'FFmpeg Dual-Pass libx264 • CRF 18',
    scriptSnippet:
      'If your backend still hashes passwords with bcrypt, your authentication layer is vulnerable to GPU-accelerated dictionary attacks. Modern standards require Argon2id with memory cost protection. Here is the migration snippet.',
  },
  {
    id: 'sample_04',
    title: 'How Neural Video Renderers Beat Traditional Editors',
    hook: 'Why spend 6 hours in Premiere when FFmpeg renders in seconds?',
    category: 'Media Pipelines',
    duration: '0:36',
    wordCount: 94,
    pacing: '157 WPM',
    voice: 'Adam (ElevenLabs Neural)',
    gradient: 'from-stone-900 via-stone-850 to-black',
    visualNote: 'Side-by-side terminal versus NLE benchmark showing zero-drop subtitle burning in sub-second passes.',
    aspect: '1080×1920 (9:16)',
    renderEngine: 'FFmpeg Dual-Pass libx264 • Audio LUFS -14',
    scriptSnippet:
      'Why spend six hours keyframing captions when dual-pass FFmpeg compiles vertical video with sub-pixel alignment in seconds? Here is how automated outbox pipelines render broadcast-grade shorts on demand.',
  },
  {
    id: 'sample_05',
    title: 'The Psychological Rule That Holds Viewer Retention',
    hook: 'The first 3 seconds determine 90% of your video’s reach.',
    category: 'Creator Strategy',
    duration: '0:40',
    wordCount: 104,
    pacing: '156 WPM',
    voice: 'Rachel (ElevenLabs Studio)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    visualNote: 'Audience retention drop-off analytics curve juxtaposing a weak introductory statement against a tension loop.',
    aspect: '1080×1920 (9:16)',
    renderEngine: 'FFmpeg Dual-Pass libx264 • WebVTT Aligned',
    scriptSnippet:
      'Most videos fail before the viewer even understands the premise. If your opening sentence gives away the answer, curiosity collapses and they swipe. The secret is holding an unresolved tension loop for twelve seconds.',
  },
];

export function SpatialCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inspectedSample, setInspectedSample] = useState<SampleOutput | null>(null);
  const { shouldReduce } = useMotionSafe();

  const total = CAROUSEL_SAMPLES.length;

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay progression: advances every 5 seconds when not interacting
  useEffect(() => {
    if (isPaused || shouldReduce) return;
    const interval = setInterval(nextCard, 5000);
    return () => clearInterval(interval);
  }, [isPaused, shouldReduce, nextCard]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
  };

  const activeSample = CAROUSEL_SAMPLES[activeIndex];

  return (
    <section
      id="output"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Creator Workflow Showcase & Video Output Gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-subtle border border-border text-xs font-mono font-medium text-stone">
            <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            <span>Creator Workflow Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.12]">
            Authentic video deliverables, <br />
            <span className="font-editorial italic font-normal text-vermilion">
              crafted for high retention.
            </span>
          </h2>

          <p className="text-base text-stone leading-relaxed max-w-2xl mx-auto text-balance">
            Every sample below was synthesized from a raw creative premise using ShortForge’s script studio, neural voiceover, and server-side FFmpeg compositor.
          </p>
        </div>

        {/* 1.2 Animated Central-Card Spatial Carousel */}
        <div className="relative pt-4 pb-2 select-none">
          {/* Spatial 3D Carousel Stage */}
          <div className="relative h-[480px] sm:h-[530px] flex items-center justify-center max-w-5xl mx-auto">
            {CAROUSEL_SAMPLES.map((sample, idx) => {
              // Calculate relative offset from active
              let diff = idx - activeIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isCenter = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isVisible = Math.abs(diff) <= 2;

              if (!isVisible) return null;

              // Spatial offsets: Center is featured, left/right are rotated and de-emphasized
              let xPos = 0;
              let yPos = 0;
              let rotateAngle = 0;
              let scaleVal = 1.0;
              let opacityVal = 1.0;
              let zIndexVal = 30;

              if (isCenter) {
                xPos = 0;
                yPos = 0;
                rotateAngle = 0;
                scaleVal = 1.0;
                opacityVal = 1.0;
                zIndexVal = 30;
              } else if (isLeft) {
                xPos = -270;
                yPos = 14;
                rotateAngle = -5;
                scaleVal = 0.88;
                opacityVal = 0.65;
                zIndexVal = 20;
              } else if (isRight) {
                xPos = 270;
                yPos = 14;
                rotateAngle = 5;
                scaleVal = 0.88;
                opacityVal = 0.65;
                zIndexVal = 20;
              } else if (diff === -2) {
                xPos = -460;
                yPos = 30;
                rotateAngle = -9;
                scaleVal = 0.76;
                opacityVal = 0.25;
                zIndexVal = 10;
              } else if (diff === 2) {
                xPos = 460;
                yPos = 30;
                rotateAngle = 9;
                scaleVal = 0.76;
                opacityVal = 0.25;
                zIndexVal = 10;
              }

              return (
                <motion.div
                  key={sample.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(idx);
                  }}
                  className={cn(
                    'absolute w-[240px] sm:w-[270px] aspect-[9/16] rounded-xl overflow-hidden border cursor-pointer',
                    'flex flex-col justify-between p-4 text-white shadow-lg transition-colors',
                    isCenter
                      ? 'border-vermilion ring-4 ring-vermilion/10 shadow-2xl cursor-default'
                      : 'border-border/80 hover:border-vermilion/40 hover:opacity-90'
                  )}
                  style={{
                    zIndex: zIndexVal,
                    background: 'linear-gradient(180deg, #1f1b19 0%, #151312 60%, #0d0c0b 100%)',
                  }}
                  animate={
                    shouldReduce
                      ? { opacity: opacityVal }
                      : {
                          x: xPos,
                          y: yPos,
                          rotate: rotateAngle,
                          scale: scaleVal,
                          opacity: opacityVal,
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.9,
                  }}
                  aria-label={`${sample.title} - ${sample.category}`}
                >
                  {/* Top Bar: Category & Duration */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-marigold font-semibold">
                      {sample.category}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/50 text-white/80">
                      {sample.duration}
                    </span>
                  </div>

                  {/* Center Play / Inspect Action */}
                  <div className="my-auto text-center space-y-2">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-full mx-auto flex items-center justify-center transition-all',
                        isCenter
                          ? 'bg-vermilion text-white shadow-md hover:scale-110'
                          : 'bg-black/60 text-white/70'
                      )}
                      onClick={(e) => {
                        if (isCenter) {
                          e.stopPropagation();
                          setInspectedSample(sample);
                        }
                      }}
                    >
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                    {isCenter && (
                      <span className="text-[11px] font-medium text-white/80 block">
                        Inspect Screenplay & Audio
                      </span>
                    )}
                  </div>

                  {/* Bottom: Opening Hook & Timing */}
                  <div className="space-y-2">
                    <div className="bg-black/75 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
                      <p className="text-[11px] sm:text-xs font-bold leading-snug line-clamp-2 text-white">
                        "{sample.hook}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/60 pt-1">
                      <span>{sample.pacing}</span>
                      <span>{sample.wordCount} words</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls & Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={prevCard}
              className="h-9 w-9 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous sample video"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {CAROUSEL_SAMPLES.map((sample, idx) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    activeIndex === idx
                      ? 'w-7 bg-vermilion'
                      : 'w-2 bg-border hover:bg-stone-muted'
                  )}
                  aria-label={`Jump to sample: ${sample.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextCard}
              className="h-9 w-9 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next sample video"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 text-stone-muted hover:text-stone transition-colors p-1"
              title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Synchronized Detail Metadata Strip */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSample.id}
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: motionTokens.duration.standard }}
              className="p-6 rounded-xl bg-surface border border-border shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-vermilion uppercase tracking-wide">
                      {activeSample.category}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-xs text-stone font-mono">{activeSample.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mt-0.5">{activeSample.title}</h3>
                </div>

                <Button
                  onClick={() => setInspectedSample(activeSample)}
                  className="btn-primary text-xs h-9 px-4 shrink-0"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1" />
                  <span>Inspect Script & Engine</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-canvas-subtle border border-border space-y-1">
                  <span className="text-[11px] font-mono text-stone-muted block">Neural Voiceover</span>
                  <span className="font-semibold text-ink">{activeSample.voice}</span>
                </div>
                <div className="p-3 rounded-lg bg-canvas-subtle border border-border space-y-1">
                  <span className="text-[11px] font-mono text-stone-muted block">Narration Metrics</span>
                  <span className="font-semibold text-ink">{activeSample.wordCount} words • {activeSample.pacing}</span>
                </div>
                <div className="p-3 rounded-lg bg-canvas-subtle border border-border space-y-1">
                  <span className="text-[11px] font-mono text-stone-muted block">Render Pipeline</span>
                  <span className="font-semibold text-ink">{activeSample.aspect} • H.264</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Inspect Dialog */}
      <Dialog open={!!inspectedSample} onClose={() => setInspectedSample(null)} size="xl">
        {inspectedSample && (
          <div>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-vermilion uppercase">
                  {inspectedSample.category}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs text-stone font-mono">{inspectedSample.duration}</span>
              </div>
              <DialogTitle>{inspectedSample.title}</DialogTitle>
              <DialogDescription>
                Production screenplay, narration metrics, and compositing pipeline.
              </DialogDescription>
            </DialogHeader>

            <DialogContent className="space-y-4">
              <div className="p-3.5 rounded-md bg-canvas-subtle border border-border space-y-1">
                <span className="text-[11px] font-mono font-bold text-vermilion uppercase block">
                  Opening 3-Second Retention Hook
                </span>
                <p className="text-xs sm:text-sm font-semibold text-ink">
                  "{inspectedSample.hook}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                  Full 3-Act Narration Script
                </span>
                <div className="p-3.5 rounded-md bg-canvas-subtle border border-border text-xs text-ink leading-relaxed font-mono whitespace-pre-line">
                  {inspectedSample.scriptSnippet}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                  Visual Direction & Aperture
                </span>
                <p className="p-3 rounded-md bg-canvas-subtle border border-border text-xs text-stone leading-relaxed">
                  {inspectedSample.visualNote}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Audio Model:</span>
                  <span className="font-medium text-ink">{inspectedSample.voice}</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Duration & Count:</span>
                  <span className="font-medium text-ink">{inspectedSample.duration} ({inspectedSample.wordCount} words)</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border col-span-2 sm:col-span-1">
                  <span className="text-stone-muted block text-[11px]">Video Encoder:</span>
                  <span className="font-medium text-ink">{inspectedSample.renderEngine}</span>
                </div>
              </div>
            </DialogContent>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setInspectedSample(null)} className="btn-secondary text-xs">
                Close Inspector
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </section>
  );
}
