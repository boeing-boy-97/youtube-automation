import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Sliders,
  Volume2,
  VolumeX,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  Maximize2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeroSectionProps {
  onDemoClick: () => void;
}

interface SceneBeat {
  index: number;
  timeRange: string;
  startTime: number;
  endTime: number;
  title: string;
  cue: string;
  subtitle: string;
  gradient: string;
  visualPrompt: string;
}

const PRODUCTION_BEATS: SceneBeat[] = [
  {
    index: 1,
    timeRange: '0:00 – 0:04',
    startTime: 0,
    endTime: 4,
    title: 'The Scroll-Stop Hook',
    cue: 'FAST ZOOM • HIGH CONTRAST CODE HUD',
    subtitle: 'If your creative team is still assembling short-form videos by hand in 2026...',
    gradient: 'from-zinc-900 via-stone-900 to-black',
    visualPrompt: 'High-speed code terminal rendering 4K vertical node tree, cinematic emerald lighting',
  },
  {
    index: 2,
    timeRange: '0:04 – 0:14',
    startTime: 4,
    endTime: 14,
    title: 'The Bottleneck Diagnosis',
    cue: 'SPLIT SCREEN • MULTI-APP FATIGUE',
    subtitle: '...you are losing 80% of your production momentum to disconnected tools.',
    gradient: 'from-emerald-950 via-zinc-900 to-black',
    visualPrompt: 'Isometric workstation showing 5 fragmented browser tabs collapsing into one unified pipeline',
  },
  {
    index: 3,
    timeRange: '0:14 – 0:30',
    startTime: 14,
    endTime: 30,
    title: 'The Autonomous Engine',
    cue: 'TIMELINE ACCELERATION • COMPOSITOR IN MOTION',
    subtitle: 'ShortForge generates structured scripts, synthesizes neural voices, and composites with native FFmpeg.',
    gradient: 'from-zinc-900 via-emerald-900/40 to-black',
    visualPrompt: 'Multi-track timeline with synchronous audio waveforms, kinetic typography, and b-roll cuts',
  },
  {
    index: 4,
    timeRange: '0:30 – 0:45',
    startTime: 30,
    endTime: 45,
    title: 'The Final Export',
    cue: 'FINAL FRAME • 1080x1920 BROADCAST MP4',
    subtitle: 'From first concept to scheduled YouTube Shorts without leaving your creative workspace.',
    gradient: 'from-stone-950 via-zinc-900 to-black',
    visualPrompt: 'Pristine 9:16 vertical video player with burned-in dynamic captions and verified ffprobe QC metadata',
  },
];

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(6);
  const [isMuted, setIsMuted] = useState(true);
  const totalDuration = 45;

  // Active scene beat calculation based on scrubber position
  const activeBeat =
    PRODUCTION_BEATS.find((b) => currentTime >= b.startTime && currentTime < b.endTime) ||
    PRODUCTION_BEATS[PRODUCTION_BEATS.length - 1];

  // Playhead interval timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) return 0;
        return Number((prev + 0.5).toFixed(1));
      });
    }, 500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 bg-paper overflow-hidden">
      {/* Subtle Studio Geometry Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, #111310 1px, transparent 1px), linear-gradient(to bottom, #111310 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Top Header Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-border pb-4 text-xs font-mono text-stone-muted">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
            <span className="font-semibold text-ink uppercase tracking-wider">ShortForge Studio</span>
            <span className="hidden sm:inline text-stone-muted/60">/</span>
            <span className="hidden sm:inline">Autonomous Shorts Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>1080×1920 Native Compositor</span>
            <span className="text-stone-muted/40">•</span>
            <span>2026 Production Edition</span>
          </div>
        </div>

        {/* Hero Narrative & Visual Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Bold Editorial Typography & Vision */}
          <div className="lg:col-span-6 space-y-8 lg:pr-4">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-paper-subtle border border-paper-border text-xs font-mono text-forest uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-forest" />
                <span>The Video Operating System</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.06] text-balance">
                From first thought <br />
                <span className="font-editorial italic font-normal text-forest">to final frame.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-muted leading-relaxed max-w-xl text-balance">
                ShortForge transforms raw creator concepts into high-retention vertical films. An integrated production environment uniting 3-act screenplays, neural voice direction, kinetic captioning, and local FFmpeg rendering into one uninterrupted workflow.
              </p>
            </div>

            {/* Direct Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/signup"
                className="h-12 px-7 rounded-lg bg-ink text-lime font-semibold text-sm hover:bg-ink-surface transition-all duration-150 shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>Start Creating</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={onDemoClick}
                className="h-12 px-6 rounded-lg bg-paper-subtle text-ink font-semibold text-sm border border-paper-border hover:bg-paper-muted transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Play className="h-3.5 w-3.5 text-forest fill-forest" />
                <span>Explore Studio Tour</span>
              </button>
            </div>

            {/* Micro Credibility Guarantee */}
            <div className="pt-4 border-t border-paper-border/60 flex flex-wrap items-center gap-6 text-xs text-stone-muted font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                <span>Zero Mock Render Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                <span>Real FFmpeg + ffprobe QC</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                <span>Native Google OAuth v3</span>
              </div>
            </div>
          </div>

          {/* Right Column: The Cinematic Production Canvas */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-ink rounded-2xl p-4 sm:p-5 shadow-2xl border border-ink-border text-paper">
              {/* Studio Canvas Titlebar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-semibold text-paper/90 truncate">PROJECT_01 // AUTONOMOUS_PIPELINES.MP4</span>
                </div>
                <div className="flex items-center gap-2 text-stone-subtle text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-lime font-mono">9:16 PREVIEW</span>
                  <span className="hidden sm:inline">SAMPLE OUTPUT</span>
                </div>
              </div>

              {/* Main Player + Storyboard Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 items-center">
                {/* 9:16 Vertical Video Frame */}
                <div className="md:col-span-7 flex justify-center">
                  <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden bg-black border border-white/15 shadow-inner flex flex-col justify-between p-3.5 group">
                    {/* Background Dynamic Frame Texture */}
                    <div className={cn('absolute inset-0 bg-gradient-to-b transition-colors duration-700', activeBeat.gradient)} />
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle at center, rgba(213,243,106,0.15) 0%, transparent 70%)`,
                      }}
                    />

                    {/* Top Player HUD */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white/70">
                      <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                        BEAT 0{activeBeat.index} / 04
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-6 w-6 rounded bg-black/60 flex items-center justify-center text-white/80 hover:text-white"
                        title={isMuted ? 'Unmute preview' : 'Mute preview'}
                      >
                        {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-lime" />}
                      </button>
                    </div>

                    {/* Center Visual Abstract Narrative */}
                    <div className="relative z-10 text-center my-auto px-2 space-y-2">
                      <div className="text-[10px] font-mono text-lime tracking-widest uppercase">
                        {activeBeat.cue}
                      </div>
                      <div className="h-10 flex items-center justify-center">
                        <div className="flex items-end gap-1 h-6">
                          {[40, 65, 30, 85, 95, 45, 75, 55, 90, 60, 35, 70].map((h, i) => (
                            <span
                              key={i}
                              className={cn(
                                'w-1 rounded-full transition-all duration-200',
                                isPlaying ? 'bg-lime animate-pulse' : 'bg-white/30'
                              )}
                              style={{
                                height: isPlaying ? `${(h * ((currentTime * 5 + i * 3) % 100)) / 100}%` : `${h * 0.4}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Burned-in Kinetic Captions Overlay */}
                    <div className="relative z-10 space-y-2">
                      <div className="bg-black/75 backdrop-blur-md p-2.5 rounded-lg border border-white/10 text-center shadow-lg">
                        <p className="text-xs font-extrabold text-white leading-snug tracking-tight font-sans">
                          {activeBeat.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-white/50">
                        <span>1080×1920</span>
                        <span>{formatTimecode(currentTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Scene Cues & Screenplay Excerpt */}
                <div className="md:col-span-5 space-y-3 text-xs">
                  <div className="text-[11px] font-mono text-stone-subtle uppercase tracking-wider font-semibold border-b border-white/10 pb-1">
                    Screenplay Scene Beats
                  </div>

                  <div className="space-y-1.5">
                    {PRODUCTION_BEATS.map((beat) => {
                      const isActive = activeBeat.index === beat.index;
                      return (
                        <button
                          key={beat.index}
                          type="button"
                          onClick={() => handleSeek(beat.startTime)}
                          className={cn(
                            'w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1',
                            isActive
                              ? 'bg-white/10 border-lime text-paper shadow-xs'
                              : 'bg-white/5 border-white/5 text-stone-muted hover:bg-white/8 hover:text-paper'
                          )}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={cn('font-semibold', isActive ? 'text-lime' : 'text-stone-subtle')}>
                              SCENE 0{beat.index}
                            </span>
                            <span className="text-stone-subtle">{beat.timeRange}</span>
                          </div>
                          <div className="font-medium text-[11px] line-clamp-1">{beat.title}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Scene Prompt Inspector */}
                  <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-stone-muted space-y-1">
                    <div className="text-white/80 font-semibold">DIRECTOR PROMPT:</div>
                    <div className="text-white/60 line-clamp-2 leading-relaxed">
                      {activeBeat.visualPrompt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Scrubber & Controls */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-8 w-8 rounded-lg bg-lime text-ink flex items-center justify-center font-bold hover:bg-lime-hover transition-colors shrink-0"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="h-8 w-8 rounded-lg bg-white/10 text-paper flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  {/* Range Scrubber */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={totalDuration}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full accent-lime h-1.5 bg-white/20 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="text-xs font-mono text-lime tabular-nums shrink-0">
                    {formatTimecode(currentTime)} / 00:45.0
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Caption Note */}
            <div className="text-center text-xs text-stone-muted font-mono flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" />
              <span>Interactive preview demonstrates synchronous kinetic subtitle & scene sequencing.</span>
            </div>
          </div>
        </div>

        {/* Lower Edge: Chronological Production Sequence Horizon */}
        <div className="pt-10 border-t border-paper-border">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-muted mb-4 font-semibold">
            Chronological Content Architecture
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: '01', title: 'Trend Ingestion', desc: 'Niche topic & curiosity hook scoring' },
              { num: '02', title: '3-Act Script Lab', desc: 'Screenplay drafting with retention pacing' },
              { num: '03', title: 'Neural Voice', desc: 'ElevenLabs voice synthesis & cadence' },
              { num: '04', title: 'Visual Director', desc: 'Vertical 9:16 scene composition' },
              { num: '05', title: 'FFmpeg Compositor', desc: 'Kinetic caption burn & multi-track mux' },
              { num: '06', title: 'Auto-Publish', desc: 'Verified Google OAuth upload to Shorts' },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="p-3.5 rounded-xl bg-paper-subtle border border-paper-border space-y-1.5 hover:border-forest/40 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-forest">{step.num}</div>
                <div className="font-semibold text-ink text-xs">{step.title}</div>
                <div className="text-[11px] text-stone-muted leading-tight">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
