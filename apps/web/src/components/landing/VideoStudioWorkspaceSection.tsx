import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Type,
  Volume2,
  Sliders,
  Play,
  Pause,
  Layers,
  Sparkles,
  Cpu,
  Monitor,
  Maximize2,
  Square,
  Smartphone,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function VideoStudioWorkspaceSection() {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [captionPreset, setCaptionPreset] = useState<'viral' | 'minimal' | 'cyber'>('viral');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'video' | 'audio' | 'captions'>('video');

  return (
    <section id="studio" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-subtle border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono mb-3">
            <Film className="h-3.5 w-3.5" />
            <span>Studio Production Environment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            The creative workspace you actually enjoy using.
          </h2>
          <p className="text-base sm:text-lg text-stone-muted mt-3 leading-relaxed">
            A full-fidelity video workstation designed exclusively for high-velocity vertical shorts.
            Fine-tune scene durations, switch typography presets, and re-order storyboard blocks without bloated desktop software.
          </p>
        </div>

        {/* Studio Shell Mockup */}
        <div className="bg-ink text-paper rounded-3xl border border-ink-border p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-lime">WORKSPACE / STUDIO</span>
              <span className="text-xs text-stone-muted hidden sm:inline">|</span>
              <span className="text-xs text-paper font-semibold hidden sm:inline">
                Project: 5 AI Automation Secrets
              </span>
            </div>

            {/* Controls: Aspect Ratio + Caption Style Switchers */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-stone-muted mr-1 hidden sm:inline">CANVAS:</span>
              {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    'px-2.5 py-1 rounded border transition-colors',
                    aspectRatio === ratio
                      ? 'bg-lime text-ink border-lime font-bold'
                      : 'bg-ink-surface text-stone-muted border-ink-border hover:text-paper'
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Main Visualizer Area: Canvas + Layer Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Dynamic Aspect Ratio Canvas */}
            <div className="lg:col-span-5 flex items-center justify-center p-4 bg-ink-subtle rounded-2xl border border-ink-border min-h-[380px]">
              <div
                className={cn(
                  'rounded-xl border border-ink-border bg-gradient-to-b from-emerald-950 via-ink to-black flex flex-col justify-between p-4 relative overflow-hidden shadow-xl transition-all duration-300',
                  aspectRatio === '9:16'
                    ? 'w-56 aspect-[9/16]'
                    : aspectRatio === '16:9'
                    ? 'w-full max-w-sm aspect-[16/9]'
                    : 'w-64 aspect-square'
                )}
              >
                {/* Safe zone overlay */}
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-muted">
                  <span className="bg-ink/80 px-2 py-0.5 rounded border border-ink-border">1080×1920</span>
                  <span className="text-lime font-bold">60 FPS</span>
                </div>

                {/* Subtitle demonstration */}
                <div className="my-auto text-center px-2 space-y-2">
                  <div
                    className={cn(
                      'text-sm sm:text-base font-bold transition-all duration-200',
                      captionPreset === 'viral' && 'text-paper uppercase tracking-tight drop-shadow-md',
                      captionPreset === 'minimal' && 'text-paper tracking-normal font-medium',
                      captionPreset === 'cyber' && 'text-lime font-mono tracking-wider'
                    )}
                  >
                    "This single line of code automated my entire week."
                  </div>
                  <div className="text-[10px] font-mono text-stone-muted">
                    Active Preset: {captionPreset.toUpperCase()}
                  </div>
                </div>

                {/* Bottom audio indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-ink-border/40 text-[10px] font-mono text-stone-muted">
                  <span>AUDIO: -14.2 LUFS</span>
                  <span className="text-lime">VOICE: ADAM</span>
                </div>
              </div>
            </div>

            {/* Right: Studio Controls & Caption Customizer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-ink-subtle rounded-2xl border border-ink-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    CAPTIONS & TYPOGRAPHY
                  </span>
                  <span className="text-[10px] text-stone-muted font-mono">SUBTITLE BURN-IN</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { id: 'viral', label: 'Viral Punch', desc: 'High-contrast bold font with bright accents' },
                    { id: 'minimal', label: 'Minimalist', desc: 'Understated editorial font with subtle shadow' },
                    { id: 'cyber', label: 'Cyber Neon', desc: 'Monospace terminal typography with glow' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCaptionPreset(p.id as any)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        captionPreset === p.id
                          ? 'bg-ink-surface border-lime text-paper'
                          : 'bg-ink border-ink-border text-stone-muted hover:border-ink-border/80'
                      )}
                    >
                      <div className={cn('font-bold mb-1', captionPreset === p.id ? 'text-lime' : 'text-paper')}>
                        {p.label}
                      </div>
                      <div className="text-[10px] text-stone-muted line-clamp-2">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware Render Specification */}
              <div className="bg-ink-subtle rounded-2xl border border-ink-border p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-stone-muted">
                  <span className="flex items-center gap-2 text-paper font-semibold">
                    <Cpu className="h-4 w-4 text-forest" />
                    FFMPEG HARDWARE PIPELINE
                  </span>
                  <span className="text-lime">READY TO DISPATCH</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded bg-ink border border-ink-border">
                    <span className="text-stone-muted block">CODEC</span>
                    <span className="text-paper font-bold">libx264</span>
                  </div>
                  <div className="p-2.5 rounded bg-ink border border-ink-border">
                    <span className="text-stone-muted block">PIXEL FORMAT</span>
                    <span className="text-paper font-bold">yuv420p</span>
                  </div>
                  <div className="p-2.5 rounded bg-ink border border-ink-border">
                    <span className="text-stone-muted block">COLOR SPACE</span>
                    <span className="text-paper font-bold">bt709</span>
                  </div>
                  <div className="p-2.5 rounded bg-ink border border-ink-border">
                    <span className="text-stone-muted block">AUDIO PEAK</span>
                    <span className="text-lime font-bold">-0.5 dB TP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Track Timeline */}
          <div className="space-y-2 pt-2 border-t border-ink-border">
            <div className="flex items-center justify-between text-xs font-mono text-stone-muted mb-1">
              <span>MULTITRACK TIMELINE</span>
              <span>TOTAL RUNTIME: 00:42.00</span>
            </div>

            {/* Video track */}
            <div className="flex items-center gap-3 bg-ink-subtle p-2.5 rounded-xl border border-ink-border text-xs font-mono">
              <span className="w-20 text-lime flex items-center gap-1.5 font-bold">
                <Film className="h-3.5 w-3.5" /> VIDEO
              </span>
              <div className="flex-1 grid grid-cols-4 gap-1.5 h-7">
                <div className="bg-forest/40 border border-forest/60 rounded flex items-center px-2 text-[10px] text-paper truncate">
                  01. Hook Beat (3.2s)
                </div>
                <div className="bg-forest/40 border border-forest/60 rounded flex items-center px-2 text-[10px] text-paper truncate">
                  02. Problem Setup (11.6s)
                </div>
                <div className="bg-forest/40 border border-forest/60 rounded flex items-center px-2 text-[10px] text-paper truncate">
                  03. Solution Demo (19.2s)
                </div>
                <div className="bg-forest/40 border border-forest/60 rounded flex items-center px-2 text-[10px] text-paper truncate">
                  04. Viral CTA (8.0s)
                </div>
              </div>
            </div>

            {/* Voice track */}
            <div className="flex items-center gap-3 bg-ink-subtle p-2.5 rounded-xl border border-ink-border text-xs font-mono">
              <span className="w-20 text-lime flex items-center gap-1.5 font-bold">
                <Volume2 className="h-3.5 w-3.5" /> VOICE
              </span>
              <div className="flex-1 bg-lime/15 border border-lime/30 rounded h-7 flex items-center px-3 text-[10px] text-lime">
                ElevenLabs Adam • Expressive Pacing (48kHz AAC Stereo)
              </div>
            </div>

            {/* Captions track */}
            <div className="flex items-center gap-3 bg-ink-subtle p-2.5 rounded-xl border border-ink-border text-xs font-mono">
              <span className="w-20 text-lime flex items-center gap-1.5 font-bold">
                <Type className="h-3.5 w-3.5" /> CUES
              </span>
              <div className="flex-1 bg-indigo-950/40 border border-indigo-700/40 rounded h-7 flex items-center px-3 text-[10px] text-indigo-300">
                114 Subtitle Cues • Synchronized to True Word Timestamps
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
