import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Sliders,
  Volume2,
  Film,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeroSectionProps {
  onDemoClick: () => void;
}

const HERO_SCENES = [
  { index: 1, title: 'Scroll-Stopping Hook', duration: '0:00 – 0:03', visual: 'High-contrast text glitch overlay', status: 'ready' },
  { index: 2, title: 'The Problem Diagnosis', duration: '0:03 – 0:14', visual: 'Split-screen workflow comparison', status: 'ready' },
  { index: 3, title: 'Algorithmic Solution', duration: '0:14 – 0:34', visual: 'Fluid code & timeline acceleration', status: 'active' },
  { index: 4, title: 'Call To Action & Loop', duration: '0:34 – 0:42', visual: 'Brand watermarked outro card', status: 'queued' },
];

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(18);
  const [selectedScene, setSelectedScene] = useState(2);

  // Subtle scrub animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackTime((prev) => (prev >= 42 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-paper">
      {/* Editorial background grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#111310 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Editorial Messaging */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            {/* Status eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wide uppercase font-mono"
            >
              <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
              <span>Autonomous Video Engine</span>
            </motion.div>

            {/* Editorial Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold text-ink tracking-tight leading-[1.08] text-balance"
            >
              From one idea to an{' '}
              <span className="text-forest relative underline decoration-lime decoration-wavy decoration-2 underline-offset-4">
                entire content
              </span>{' '}
              pipeline.
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-stone-muted leading-relaxed text-balance max-w-xl"
            >
              ShortForge turns creator strategies into automated video production lines.
              Trend-driven concept scoring, 3-act scripts, neural voiceovers, vertical scene directing,
              and scheduled YouTube Shorts publishing—all executed with real FFmpeg and verified APIs.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <Link
                to="/signup"
                className="h-12 px-6 rounded-xl bg-ink text-lime font-semibold text-sm hover:bg-ink-surface transition-all duration-150 shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Start Building Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={onDemoClick}
                className="h-12 px-6 rounded-xl bg-paper-subtle text-ink font-semibold text-sm border border-paper-border hover:bg-paper-muted transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 text-forest" />
                <span>Explore Interactive Studio</span>
              </button>
            </motion.div>

            {/* Trust and Technical Credentials Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 border-t border-paper-border/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-muted"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <span>1080×1920 60 FPS FFmpeg</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-600 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Native Google OAuth v3</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Lock className="h-4 w-4 text-ink shrink-0" />
                <span>Argon2id + AES-256</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Immersive Interactive Workspace Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-7"
          >
            <div className="relative mx-auto max-w-2xl bg-ink text-paper rounded-2xl p-4 sm:p-5 shadow-2xl border border-ink-border">
              {/* Studio Window Chrome Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-stone-muted ml-2">
                    shortforge-studio / proj_viral_ai_04
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-forest/20 text-lime border border-forest/30">
                    PASS 2: AUDIO SYNC
                  </span>
                  <span className="text-stone-muted hidden sm:inline">1080×1920 60fps</span>
                </div>
              </div>

              {/* Main Workspace Grid: Vertical Player (9:16) + Scene Director */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* 9:16 Vertical Monitor */}
                <div className="sm:col-span-6 bg-ink-subtle rounded-xl border border-ink-border p-3 flex flex-col justify-between aspect-[9/16] relative overflow-hidden group">
                  {/* Dynamic Gradient Backdrop simulating generative video frame */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-ink-subtle to-slate-950 z-0" />

                  {/* Top HUD */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-stone-muted">
                    <span className="bg-ink/80 px-2 py-0.5 rounded border border-ink-border">
                      SCENE 0{selectedScene}
                    </span>
                    <span className="text-lime flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                      REC 00:{playbackTime.toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Center Vertical Content Preview */}
                  <div className="relative z-10 my-auto text-center px-4 space-y-3">
                    <div className="inline-block px-2.5 py-1 rounded bg-forest/30 border border-forest/40 text-[11px] font-semibold text-lime">
                      Hook Viral Score: 94%
                    </div>
                    {/* Simulated High-Retention Animated Caption */}
                    <p className="text-base sm:text-lg font-bold tracking-tight text-paper text-balance uppercase drop-shadow-md">
                      "95% of creators quit because editing takes{' '}
                      <span className="bg-lime text-ink px-1 rounded">8 hours</span> a video."
                    </p>
                    <div className="text-[11px] text-stone-muted font-mono">
                      ElevenLabs Adam • Expressive Pacing
                    </div>
                  </div>

                  {/* Bottom Video Scrub & Player Controls */}
                  <div className="relative z-10 space-y-2 pt-2 border-t border-ink-border/50">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-muted">
                      <span>00:{playbackTime.toString().padStart(2, '0')}</span>
                      <span>00:42</span>
                    </div>
                    <div className="h-1.5 w-full bg-ink-surface rounded-full overflow-hidden cursor-pointer">
                      <div
                        className="h-full bg-lime rounded-full transition-all duration-300"
                        style={{ width: `${(playbackTime / 42) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-7 px-2.5 rounded bg-ink-surface text-lime hover:bg-forest transition-colors text-xs flex items-center gap-1 font-mono"
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-muted font-mono">
                        <Volume2 className="h-3.5 w-3.5 text-lime" />
                        <span>-14 LUFS NORMALIZED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Multi-Track Scene Director */}
                <div className="sm:col-span-6 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-muted uppercase tracking-wider font-mono">
                      <span>Storyboard Beats</span>
                      <span>4 Scenes</span>
                    </div>

                    {HERO_SCENES.map((scene) => (
                      <div
                        key={scene.index}
                        onClick={() => setSelectedScene(scene.index)}
                        className={cn(
                          'p-2.5 rounded-lg border transition-all duration-150 cursor-pointer text-left',
                          selectedScene === scene.index
                            ? 'bg-ink-surface border-lime/50 text-paper'
                            : 'bg-ink-subtle border-ink-border/80 text-stone-muted hover:border-ink-border'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-mono font-semibold text-lime">
                            SCENE {scene.index}
                          </span>
                          <span className="text-[10px] font-mono text-stone-muted">
                            {scene.duration}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-paper truncate">
                          {scene.title}
                        </div>
                        <div className="text-[10px] text-stone-muted truncate mt-0.5">
                          {scene.visual}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Neural Voice Track Visualizer */}
                  <div className="bg-ink-subtle border border-ink-border rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-muted">
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3 text-lime" />
                        Voiceover Track (48kHz AAC)
                      </span>
                      <span className="text-lime">SYNCHRONIZED</span>
                    </div>
                    {/* Audio wave bars */}
                    <div className="flex items-center gap-0.5 h-6">
                      {[18, 45, 60, 20, 85, 95, 40, 70, 80, 55, 30, 90, 100, 75, 40, 60, 85, 30, 65, 90, 45, 70, 85, 20, 50, 75, 95, 60].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-lime/60 rounded-full transition-all duration-200"
                            style={{
                              height: isPlaying ? `${Math.max(15, (h * ((playbackTime % 5) + 3)) / 8)}%` : `${h}%`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Render Engine Output Pill */}
                  <div className="p-2.5 rounded-lg bg-forest-soft border border-forest/30 flex items-center justify-between text-xs text-forest font-medium">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-forest" />
                      <span>Ready to compile MP4</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-forest">00:42 DURATION</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
