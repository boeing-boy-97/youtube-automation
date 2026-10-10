import { useState } from 'react';
import {
  Film,
  Type,
  Volume2,
  Sliders,
  Play,
  Pause,
  Layers,
  Smartphone,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function VideoStudioWorkspaceSection() {
  const [captionPreset, setCaptionPreset] = useState<'clean' | 'impact' | 'editorial'>('clean');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'video' | 'audio' | 'captions'>('video');

  return (
    <section id="studio-env" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas-subtle border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            Studio Production Environment
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            A creative workstation <br />
            <span className="font-editorial italic font-normal text-coral">built for vertical flow.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            Fine-tune scene durations, switch typography presets, and re-order storyboard blocks without switching between heavyweight desktop software.
          </p>
        </div>

        {/* Studio Shell */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-xs space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-coral">STUDIO WORKSPACE</span>
              <span className="text-border">•</span>
              <span className="text-xs text-ink font-medium">9:16 Vertical Master</span>
            </div>

            {/* Subtitle Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone hidden sm:inline">Caption Style:</span>
              <div className="flex p-1 bg-canvas-subtle border border-border rounded-md">
                {(['clean', 'impact', 'editorial'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCaptionPreset(preset)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded capitalize transition-all',
                      captionPreset === preset
                        ? 'bg-surface text-ink font-semibold shadow-xs border border-border'
                        : 'text-stone hover:text-ink'
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main 2-Column Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: 9:16 Video Stage Monitor */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-xs aspect-[9/16] bg-ink rounded-lg relative overflow-hidden flex flex-col justify-between p-4 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                  <span className="bg-black/40 px-2 py-0.5 rounded">Preview Frame</span>
                  <span className="text-coral">1080×1920</span>
                </div>

                <div className="text-center space-y-2 my-auto px-4">
                  <div className="text-white text-xs font-mono opacity-80">
                    Scene 02: Pacing Shift
                  </div>
                  <div className="inline-block p-2 bg-black/60 rounded text-[11px] text-white/90 font-mono">
                    Macro lens tracking movement
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-black/80 rounded border border-white/10 text-center">
                    <p className="text-xs font-bold text-white">
                      "Why 90% of creators fail before second four."
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>H.264 / AAC</span>
                    <span>0:14 / 0:45</span>
                  </div>
                </div>
              </div>

              {/* Scrubber Playback Controls */}
              <div className="w-full max-w-xs flex items-center justify-between pt-3 text-xs text-stone">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-primary h-8 px-3 text-xs"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <span className="font-mono text-xs text-ink">00:14 / 00:45</span>
              </div>
            </div>

            {/* Right: Multi-Track Timeline & Beat Inspector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone border-b border-border pb-2">
                <span className="font-semibold text-ink">Timeline Tracks</span>
                <span className="font-mono text-[11px]">3 Synced Layers</span>
              </div>

              {/* Track 1: Visual Scene Track */}
              <div
                onClick={() => setSelectedTrack('video')}
                className={cn(
                  'p-3.5 rounded-lg border transition-all cursor-pointer space-y-2',
                  selectedTrack === 'video'
                    ? 'bg-canvas-subtle border-coral/50 shadow-xs'
                    : 'bg-surface border-border hover:border-border-strong'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-coral" />
                    Visual Track (3 Scenes)
                  </span>
                  <span className="font-mono text-[11px] text-stone">1080×1920</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-center">
                  <div className="p-2 rounded bg-surface border border-border text-ink">
                    Scene 1 (4s)
                  </div>
                  <div className="p-2 rounded bg-coral-soft border border-coral/30 text-coral font-semibold">
                    Scene 2 (20s)
                  </div>
                  <div className="p-2 rounded bg-surface border border-border text-ink">
                    Scene 3 (21s)
                  </div>
                </div>
              </div>

              {/* Track 2: Voiceover Track */}
              <div
                onClick={() => setSelectedTrack('audio')}
                className={cn(
                  'p-3.5 rounded-lg border transition-all cursor-pointer space-y-2',
                  selectedTrack === 'audio'
                    ? 'bg-canvas-subtle border-coral/50 shadow-xs'
                    : 'bg-surface border-border hover:border-border-strong'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-coral" />
                    Speech Track (ElevenLabs)
                  </span>
                  <span className="font-mono text-[11px] text-stone">48kHz Master</span>
                </div>
                <div className="p-2 rounded bg-surface border border-border text-xs text-stone font-mono">
                  Adam (Authoritative Tech) • 145 words/minute • -14.2 LUFS
                </div>
              </div>

              {/* Track 3: Subtitles Track */}
              <div
                onClick={() => setSelectedTrack('captions')}
                className={cn(
                  'p-3.5 rounded-lg border transition-all cursor-pointer space-y-2',
                  selectedTrack === 'captions'
                    ? 'bg-canvas-subtle border-coral/50 shadow-xs'
                    : 'bg-surface border-border hover:border-border-strong'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-coral" />
                    Subtitles (Safe-Zone Burned)
                  </span>
                  <span className="font-mono text-[11px] text-stone">WebVTT Synced</span>
                </div>
                <div className="p-2 rounded bg-surface border border-border text-xs text-stone font-mono">
                  Word cues synchronized with zero drift.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
