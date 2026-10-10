import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Film,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMotionSafe, motionTokens } from '../../lib/motion';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onDemoClick: () => void;
}

interface PortraitGalleryItem {
  id: string;
  title: string;
  hook: string;
  category: string;
  duration: string;
  wordCount: number;
  pacing: string;
  voice: string;
  aspect: string;
  visualNote: string;
  scriptSnippet: string;
  accentBadge: string;
}

const GALLERY_ITEMS: PortraitGalleryItem[] = [
  {
    id: 'hero_video_01',
    title: 'The 3 Flags That Make Claude 3.7 Code Like a Senior Dev',
    hook: 'Stop scrolling if you write Python or TypeScript.',
    category: 'Developer Tools',
    duration: '0:42',
    wordCount: 112,
    pacing: '160 WPM',
    voice: 'Adam (ElevenLabs Neural)',
    aspect: '1080×1920 (9:16)',
    visualNote: 'Aperture macro on live code architecture with warm studio backlighting.',
    scriptSnippet:
      'Stop scrolling if you write code. Most developers prompt Claude like it is 2023, asking general questions. But if you activate the architectural reasoning flag and constrain output tokens to strict diff blocks, your debugging time drops significantly. Here is the exact parameter.',
    accentBadge: 'ENGINEERING',
  },
  {
    id: 'hero_video_02',
    title: 'Why 1-Person Micro-SaaS Startups Hit Scale in 2026',
    hook: 'You no longer need 10 engineers to build scalable software.',
    category: 'Architecture',
    duration: '0:38',
    wordCount: 98,
    pacing: '155 WPM',
    voice: 'Rachel (ElevenLabs Studio)',
    aspect: '1080×1920 (9:16)',
    visualNote: 'High-contrast systems diagram collapsing complex microservices into a single outbox worker.',
    scriptSnippet:
      'You no longer need a 10-person dev team to operate scalable services. Modern solopreneurs run automated outbox queues, serverless edge workers, and AI customer reconciliation. Here is how three solo founders do it.',
    accentBadge: 'FOUNDERS',
  },
  {
    id: 'hero_video_03',
    title: 'Stop Storing Passwords with bcrypt in 2026',
    hook: 'Your database might be failing modern security audits right now.',
    category: 'Security',
    duration: '0:44',
    wordCount: 120,
    pacing: '163 WPM',
    voice: 'Antoni (ElevenLabs Explanatory)',
    aspect: '1080×1920 (9:16)',
    visualNote: 'Hardware memory bus visualization illustrating Argon2id memory-cost resistance.',
    scriptSnippet:
      'If your backend still hashes passwords with bcrypt, your authentication layer is vulnerable to GPU-accelerated dictionary attacks. Modern standards require Argon2id with memory cost protection. Here is the migration snippet.',
    accentBadge: 'SECURITY',
  },
  {
    id: 'hero_video_04',
    title: 'How Neural Video Renderers Beat Traditional Editors',
    hook: 'Why spend 6 hours in Premiere when FFmpeg renders in seconds?',
    category: 'Media Pipelines',
    duration: '0:36',
    wordCount: 94,
    pacing: '157 WPM',
    voice: 'Adam (ElevenLabs Neural)',
    aspect: '1080×1920 (9:16)',
    visualNote: 'Side-by-side terminal versus NLE benchmark showing zero-drop subtitle burning in sub-second passes.',
    scriptSnippet:
      'Why spend six hours keyframing captions when dual-pass FFmpeg compiles vertical video with sub-pixel alignment in seconds? Here is how automated outbox pipelines render broadcast-grade shorts on demand.',
    accentBadge: 'MEDIA PIPELINES',
  },
  {
    id: 'hero_video_05',
    title: 'The Psychological Rule That Holds Viewer Retention',
    hook: 'The first 3 seconds determine 90% of your video’s reach.',
    category: 'Creator Strategy',
    duration: '0:40',
    wordCount: 104,
    pacing: '156 WPM',
    voice: 'Rachel (ElevenLabs Studio)',
    aspect: '1080×1920 (9:16)',
    visualNote: 'Audience retention drop-off analytics curve juxtaposing a weak introductory statement against a tension loop.',
    scriptSnippet:
      'Most videos fail before the viewer even understands the premise. If your opening sentence gives away the answer, curiosity collapses and they swipe. The secret is holding an unresolved tension loop for twelve seconds.',
    accentBadge: 'CREATOR RETENTION',
  },
];

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(6);
  const [isMuted, setIsMuted] = useState(true);
  const [inspectedItem, setInspectedItem] = useState<PortraitGalleryItem | null>(null);
  const { shouldReduce } = useMotionSafe();

  const total = GALLERY_ITEMS.length;

  const nextItem = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevItem = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Video scrubber simulation for active frame
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 42) return 0;
        return Number((prev + 0.5).toFixed(1));
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeItem = GALLERY_ITEMS[activeIndex];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Eyebrow Tag */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.standard }}
          className="flex items-center justify-center gap-2 text-xs font-medium text-stone tracking-wide text-center"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          <span className="uppercase text-stone-muted font-mono tracking-wider">Independent Creative Technology</span>
          <span className="text-border">•</span>
          <span>ShortForge Studio 2026</span>
        </motion.div>

        {/* Headline & Value Proposition */}
        <div className="text-center space-y-5 max-w-4xl mx-auto">
          <motion.h1
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.deliberate, ease: motionTokens.ease.editorial }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-ink tracking-tight leading-[1.05] text-balance"
          >
            Turn your next idea <br />
            <span className="font-editorial italic font-normal text-coral">into a video.</span>
          </motion.h1>

          <motion.p
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.deliberate, ease: motionTokens.ease.editorial, delay: 0.08 }}
            className="text-base sm:text-lg text-stone leading-relaxed max-w-2xl mx-auto text-balance"
          >
            Plan your story, shape your scenes, master neural voiceovers, and compile broadcast-grade vertical video in one continuous workspace.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.standard, delay: 0.16 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link to="/signup" className="btn-primary h-12 px-8 text-sm w-full sm:w-auto justify-center shadow-sm">
              <span>Start creating</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#workflow"
              className="btn-secondary h-12 px-6 text-sm w-full sm:w-auto justify-center"
            >
              <ArrowDown className="h-4 w-4 text-stone" />
              <span>Explore the workflow</span>
            </a>
          </motion.div>
        </div>

        {/* PRIMARY DRIBBLE REFERENCE: Curved Gallery of Portrait Video Frames */}
        <div className="relative pt-6 pb-2 select-none">
          {/* Subtle Arc Track Baseline Guide (Desktop) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-[50%] border border-border/40 pointer-events-none hidden lg:block"
            style={{ clipPath: 'polygon(0% 45%, 100% 45%, 100% 100%, 0% 100%)' }}
          />

          {/* Curved Portrait Video Gallery Stage */}
          <div className="relative h-[460px] sm:h-[510px] flex items-center justify-center max-w-5xl mx-auto">
            {GALLERY_ITEMS.map((item, idx) => {
              // Calculate spatial offset relative to activeIndex
              let diff = idx - activeIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isCenter = diff === 0;
              const isVisible = Math.abs(diff) <= 2;

              if (!isVisible) return null;

              // Arc spatial geometry inspired by primary 11Video Dribbble reference
              // Parabolic curve: y = diff^2 * factor
              // Restrained rotation: diff * angle
              // Smooth scale falloff
              const xPos = diff * 215;
              const yPos = Math.pow(diff, 2) * 16;
              const rotateAngle = diff * 5.5;
              const scaleVal = isCenter ? 1.05 : 1 - Math.abs(diff) * 0.1;
              const opacityVal = isCenter ? 1.0 : Math.max(0.45, 0.9 - Math.abs(diff) * 0.22);
              const zIndexVal = 30 - Math.abs(diff) * 5;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(idx);
                  }}
                  className={cn(
                    'absolute w-[210px] sm:w-[235px] aspect-[9/16] rounded-2xl overflow-hidden border cursor-pointer',
                    'flex flex-col justify-between p-4 text-white shadow-lg transition-colors',
                    isCenter
                      ? 'border-coral ring-4 ring-coral/15 shadow-2xl cursor-default'
                      : 'border-border/80 hover:border-coral/50 hover:opacity-90'
                  )}
                  style={{
                    zIndex: zIndexVal,
                    background: 'linear-gradient(180deg, #1f231f 0%, #171a17 55%, #0e100e 100%)',
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
                    damping: 28,
                    mass: 0.85,
                  }}
                  aria-label={`${item.title} - ${item.category}`}
                >
                  {/* Top Bar: Category Pill & Duration Badge */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-yellow font-bold uppercase">
                      {item.accentBadge}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/50 text-white/80">
                      {item.duration}
                    </span>
                  </div>

                  {/* Center Media Play Button */}
                  <div className="my-auto text-center space-y-2">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-full mx-auto flex items-center justify-center transition-all',
                        isCenter
                          ? 'bg-coral text-white shadow-md hover:scale-110 cursor-pointer'
                          : 'bg-black/60 text-white/70'
                      )}
                      onClick={(e) => {
                        if (isCenter) {
                          e.stopPropagation();
                          setIsPlaying(!isPlaying);
                        }
                      }}
                    >
                      {isCenter && isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      )}
                    </div>
                    {isCenter && (
                      <span className="text-[10px] font-mono tracking-wide text-white/70 block">
                        {isPlaying ? 'Playing Sample' : 'Click to Play'}
                      </span>
                    )}
                  </div>

                  {/* Bottom: Hook & Telemetry */}
                  <div className="space-y-2">
                    <div className="bg-black/75 backdrop-blur-md p-2 rounded-lg border border-white/10">
                      <p className="text-[11px] font-bold leading-snug line-clamp-2 text-white">
                        "{item.hook}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/60 pt-0.5">
                      <span>{item.pacing}</span>
                      <span>{item.wordCount} words</span>
                    </div>

                    {isCenter && (
                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-coral transition-all duration-300"
                          style={{ width: `${(currentTime / 42) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Gallery Navigation & Pagination Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={prevItem}
              className="h-9 w-9 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous video frame"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {GALLERY_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    activeIndex === idx ? 'w-7 bg-coral' : 'w-2 bg-border hover:bg-stone-muted'
                  )}
                  aria-label={`Jump to video: ${item.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextItem}
              className="h-9 w-9 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next video frame"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Frame Metadata Ribbon */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: motionTokens.duration.standard }}
              className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-coral uppercase tracking-wide">
                    {activeItem.category}
                  </span>
                  <span className="text-border">•</span>
                  <span className="text-xs text-stone font-mono">{activeItem.duration}</span>
                </div>
                <h3 className="text-base font-bold text-ink truncate">{activeItem.title}</h3>
                <p className="text-xs text-stone line-clamp-1">{activeItem.visualNote}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => setInspectedItem(activeItem)}
                  className="btn-primary text-xs h-9 px-4 shrink-0"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1" />
                  <span>Inspect Screenplay</span>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature Narrative Progression Strip */}
        <div className="pt-8 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {[
              { step: '01', title: 'Story Ideation', desc: 'Topic angle & retention hook' },
              { step: '02', title: '3-Act Script', desc: 'Strict sentence cadence' },
              { step: '03', title: 'Neural Voice', desc: 'Studio voiceover mastering' },
              { step: '04', title: 'Scene Directing', desc: 'Vertical 9:16 portrait frames' },
              { step: '05', title: 'FFmpeg Compositor', desc: 'Subtitles & dual-pass MP4' },
              { step: '06', title: 'YouTube Direct', desc: 'Authorized OAuth delivery' },
            ].map((item) => (
              <div key={item.step} className="p-3 bg-surface rounded-md border border-border space-y-1">
                <div className="font-mono text-coral font-bold text-xs">{item.step}</div>
                <div className="font-semibold text-ink text-xs">{item.title}</div>
                <div className="text-[11px] text-stone-muted leading-tight">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenplay & Pipeline Inspector Dialog */}
      <Dialog open={!!inspectedItem} onClose={() => setInspectedItem(null)} size="xl">
        {inspectedItem && (
          <div>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-coral uppercase">
                  {inspectedItem.category}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs text-stone font-mono">{inspectedItem.duration}</span>
              </div>
              <DialogTitle>{inspectedItem.title}</DialogTitle>
              <DialogDescription>
                Complete screenplay composition, voiceover metrics, and server-side compositor pipeline.
              </DialogDescription>
            </DialogHeader>

            <DialogContent className="space-y-4">
              <div className="p-3.5 rounded-md bg-canvas-subtle border border-border space-y-1">
                <span className="text-[11px] font-mono font-bold text-coral uppercase block">
                  3-Second Opening Hook
                </span>
                <p className="text-xs sm:text-sm font-semibold text-ink">
                  "{inspectedItem.hook}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                  Full Narration Script
                </span>
                <div className="p-3.5 rounded-md bg-canvas-subtle border border-border text-xs text-ink leading-relaxed font-mono whitespace-pre-line">
                  {inspectedItem.scriptSnippet}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                  Visual Directing Note
                </span>
                <p className="p-3 rounded-md bg-canvas-subtle border border-border text-xs text-stone leading-relaxed">
                  {inspectedItem.visualNote}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Audio Synthesis:</span>
                  <span className="font-medium text-ink">{inspectedItem.voice}</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Word Target:</span>
                  <span className="font-medium text-ink">{inspectedItem.wordCount} words ({inspectedItem.pacing})</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border col-span-2 sm:col-span-1">
                  <span className="text-stone-muted block text-[11px]">Output Deliverable:</span>
                  <span className="font-medium text-ink">{inspectedItem.aspect} MP4</span>
                </div>
              </div>
            </DialogContent>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setInspectedItem(null)} className="btn-secondary text-xs">
                Close Inspector
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </section>
  );
}
