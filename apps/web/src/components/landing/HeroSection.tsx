import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  FileText,
  Mic,
  Film,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMotionSafe, motionTokens } from '../../lib/motion';

interface HeroSectionProps {
  onDemoClick: () => void;
}

interface SceneBeat {
  index: number;
  timeRange: string;
  startTime: number;
  endTime: number;
  title: string;
  subtitle: string;
  visualNote: string;
}

const SAMPLE_BEATS: SceneBeat[] = [
  {
    index: 1,
    timeRange: '0:00 – 0:04',
    startTime: 0,
    endTime: 4,
    title: 'The Curiosity Hook',
    subtitle: 'Stop scrolling if you write code.',
    visualNote: 'Macro aperture focus on live code architecture with warm studio lighting.',
  },
  {
    index: 2,
    timeRange: '0:04 – 0:22',
    startTime: 4,
    endTime: 22,
    title: 'The Friction Problem',
    subtitle: 'Most developers prompt like it is 2023, losing 90% of architectural reasoning.',
    visualNote: 'Split benchmark screen comparing unstructured prompts against constrained diff outputs.',
  },
  {
    index: 3,
    timeRange: '0:22 – 0:45',
    startTime: 22,
    endTime: 45,
    title: 'The Seamless Loop',
    subtitle: 'ShortForge synchronizes voice syllables to video frames in one continuous pipeline.',
    visualNote: 'Clean 9:16 vertical composition with kinetic typography leading into the replay cadence.',
  },
];

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(6);
  const [isMuted, setIsMuted] = useState(true);
  const totalDuration = 45;
  const { shouldReduce } = useMotionSafe();

  const activeBeat =
    SAMPLE_BEATS.find((b) => currentTime >= b.startTime && currentTime < b.endTime) ||
    SAMPLE_BEATS[SAMPLE_BEATS.length - 1];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) return 0;
        return Number((prev + 0.5).toFixed(1));
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Top Eyebrow */}
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.standard }}
          className="flex items-center gap-2 text-xs font-medium text-stone tracking-wide"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          <span className="uppercase text-stone-muted font-mono tracking-wider">Independent Creative Technology</span>
          <span className="text-border">•</span>
          <span>ShortForge Studio 2026</span>
        </motion.div>

        {/* Asymmetrical Editorial Composition with Floating Creative Product Objects */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline & Purpose */}
          <motion.div
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.deliberate, ease: motionTokens.ease.editorial }}
            className="lg:col-span-7 space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.08] text-balance">
              From first thought <br />
              <span className="font-editorial italic font-normal text-coral">to finished frame.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone leading-relaxed max-w-xl text-balance">
              ShortForge brings scriptwriting, voiceover, scene directing, and automated editing into one continuous studio. From a raw concept to a broadcast-grade 9:16 vertical short ready for YouTube—without tool switching.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/signup" className="btn-primary h-12 px-7 text-sm">
                <span>Start creating free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={onDemoClick} className="btn-secondary h-12 px-6 text-sm">
                <Play className="h-3.5 w-3.5 text-stone fill-current" />
                <span>Explore studio tour</span>
              </button>
            </div>

            {/* Value Propositions */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                No multi-app switching
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Real FFmpeg rendering
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Authorized YouTube OAuth upload
              </span>
            </div>
          </motion.div>

          {/* Right Column: Cinematic 9:16 Media Preview with Floating Creative Objects */}
          <div className="lg:col-span-5 relative flex justify-center py-4">
            {/* Floating Object 1: Screenplay Beat Card (Top-Left Desktop) */}
            <motion.div
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, x: -20, y: -10, rotate: -3 }}
              animate={shouldReduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, rotate: -3 }}
              transition={{ duration: motionTokens.duration.spatial, delay: 0.15 }}
              className="hidden sm:block absolute -top-4 -left-10 z-20 w-48 p-3 rounded-lg bg-surface border border-border shadow-md select-none pointer-events-none"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-muted mb-1">
                <span className="text-coral font-bold uppercase">Beat 01</span>
                <span>0-3s Hook</span>
              </div>
              <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-tight">
                "Stop scrolling if you write code."
              </p>
              <div className="flex items-center justify-between text-[10px] text-stone-muted mt-2 pt-1.5 border-t border-border font-mono">
                <span>160 WPM</span>
                <span className="text-green font-medium">92% retention</span>
              </div>
            </motion.div>

            {/* Floating Object 2: Audio Master Waveform Tile (Bottom-Right Desktop) */}
            <motion.div
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, x: 20, y: 15, rotate: 3 }}
              animate={shouldReduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, rotate: 3 }}
              transition={{ duration: motionTokens.duration.spatial, delay: 0.25 }}
              className="hidden sm:block absolute -bottom-4 -right-8 z-20 w-52 p-3 rounded-lg bg-surface border border-border shadow-md select-none pointer-events-none"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-5 w-5 rounded bg-coral-soft flex items-center justify-center text-coral">
                  <Mic className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-ink block truncate leading-none">Adam • Neural TTS</span>
                  <span className="text-[9px] font-mono text-stone-muted">48 kHz • -14 LUFS</span>
                </div>
              </div>
              <div className="h-4 flex items-end gap-0.5 px-1 py-0.5 bg-canvas-subtle rounded">
                {[40, 75, 30, 90, 60, 45, 80, 100, 70, 50, 85, 40, 65, 95, 55, 30].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-coral/70 rounded-xs transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Main 9:16 Video Player Container */}
            <motion.div
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: motionTokens.duration.spatial, ease: motionTokens.ease.editorial, delay: 0.1 }}
              className="w-full max-w-sm bg-surface rounded-xl border border-border shadow-lg p-4 space-y-4 relative z-10"
            >
              {/* Studio Canvas Status Bar */}
              <div className="flex items-center justify-between text-xs text-stone border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" />
                  <span className="font-semibold text-ink text-xs">Studio Output Preview</span>
                </div>
                <span className="text-[11px] font-mono text-stone-muted">1080×1920 • 9:16</span>
              </div>

              {/* 9:16 Video Player Screen */}
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-ink text-white flex flex-col justify-between p-4 shadow-inner">
                {/* Background Ambient Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-ink to-black pointer-events-none" />

                {/* Top Player Status */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/70">
                  <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs text-butter">
                    Scene 0{activeBeat.index} of 03
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="h-6 w-6 rounded bg-black/50 flex items-center justify-center text-white/80 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-coral" />}
                  </button>
                </div>

                {/* Center Visual Direction */}
                <div className="relative z-10 text-center space-y-2 my-auto px-3">
                  <div className="inline-block px-2.5 py-1 rounded bg-black/60 text-[10px] font-mono tracking-widest text-butter uppercase">
                    {activeBeat.title}
                  </div>
                  <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                    {activeBeat.visualNote}
                  </p>
                </div>

                {/* Bottom Synchronous Subtitles */}
                <div className="relative z-10 space-y-3">
                  <div className="bg-black/85 backdrop-blur-md p-3 rounded-md border border-white/10 text-center shadow-md">
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      "{activeBeat.subtitle}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>H.264 / AAC</span>
                    <span>{formatSeconds(currentTime)} / 0:45</span>
                  </div>
                </div>
              </div>

              {/* Player Controls & Scrubber */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-8 w-8 rounded-md bg-ink text-canvas flex items-center justify-center hover:bg-ink-pure transition-colors shrink-0"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="h-8 w-8 rounded-md bg-canvas-subtle text-ink flex items-center justify-center hover:bg-canvas-muted transition-colors shrink-0 border border-border"
                    title="Restart"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={totalDuration}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="flex-1 accent-coral h-1.5 bg-canvas-muted rounded cursor-pointer"
                  />

                  <span className="text-xs font-mono text-ink tabular-nums">
                    {formatSeconds(currentTime)}
                  </span>
                </div>

                {/* Scene Selector Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {SAMPLE_BEATS.map((beat) => (
                    <button
                      key={beat.index}
                      type="button"
                      onClick={() => handleSeek(beat.startTime)}
                      className={cn(
                        'p-1.5 text-center rounded text-[11px] font-mono transition-colors border',
                        activeBeat.index === beat.index
                          ? 'bg-coral-soft border-coral text-coral font-semibold'
                          : 'bg-canvas-subtle border-border text-stone hover:text-ink'
                      )}
                    >
                      Scene 0{beat.index}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Note */}
              <div className="text-[11px] text-center text-stone-muted pt-1 border-t border-border">
                Sample composition demonstrating synchronous subtitle alignment.
              </div>
            </motion.div>
          </div>
        </div>

        {/* Workflow Progression Strip */}
        <div className="pt-8 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {[
              { step: '01', title: 'Idea Concept', desc: 'Curiosity gap & topic angle' },
              { step: '02', title: 'Script Draft', desc: '3-Act structure & word target' },
              { step: '03', title: 'Neural Voice', desc: 'Paced narration & cadence' },
              { step: '04', title: 'Visual Scenes', desc: 'Portrait 9:16 frame directing' },
              { step: '05', title: 'FFmpeg Render', desc: 'Kinetic subtitles & audio mix' },
              { step: '06', title: 'YouTube Shorts', desc: 'Direct authorized publishing' },
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
    </section>
  );
}
