import { useState } from 'react';
import { Layers, Clock, AlertTriangle, ArrowRight, Zap, Check, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function CreativeProblemSection() {
  const [activeFriction, setActiveFriction] = useState(0);

  const FRICTIONS = [
    {
      id: 'fragmentation',
      title: 'Tool Fragmentation Fatigue',
      summary: 'Creators spend hours copying and pasting between five disconnected web tools.',
      detail:
        'A typical short-form workflow requires writing in one tab, downloading MP3s from a voice tool in a second, generating b-roll images in a third, aligning keyframes in a video editor, and manually uploading to YouTube. Every handover introduces friction and format mismatches.',
      metric: '5 Tools',
      impact: 'High Context-Switching Overhead',
    },
    {
      id: 'pacing',
      title: 'The First-3-Second Retention Wall',
      summary: 'Generic scripts lose viewers before the core premise is ever delivered.',
      detail:
        'Vertical viewers swipe away in seconds. Without disciplined 3-act story structure, curiosity gaps, and frame-accurate word subtitles, even great ideas suffer from sharp drop-off before the value payoff.',
      metric: 'Fast Drop-off',
      impact: 'Algorithm Distribution Penalty',
    },
    {
      id: 'sync',
      title: 'Desynchronized Timelines',
      summary: 'One small script revision forces complete re-editing of audio and captions.',
      detail:
        'When you edit a single sentence in traditional editing software, voiceover timing shifts, captions desynchronize, and background audio cuts break. In an integrated studio, text, speech, and frames are bound to the same timeline model.',
      metric: 'Compounding Delay',
      impact: 'Hours Lost Per Revision',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas-subtle border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            The Creative Problem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Why short-form video creation <br />
            <span className="font-editorial italic font-normal text-coral">breaks creative momentum.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            The barrier to consistent publishing is rarely lack of ideas. It is the friction of stitching disconnected AI wrappers, audio downloads, and timeline editors together by hand.
          </p>
        </div>

        {/* Side-by-Side Architectural Contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: The 3 Core Frictions Interactive Tabs */}
          <div className="lg:col-span-6 space-y-3">
            {FRICTIONS.map((f, idx) => {
              const isSelected = activeFriction === idx;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFriction(idx)}
                  className={cn(
                    'p-5 rounded-lg border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-surface border-coral/50 shadow-xs'
                      : 'bg-surface/50 border-border hover:bg-surface hover:border-border-strong'
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-mono font-bold text-coral">0{idx + 1}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-canvas-subtle border border-border text-stone">
                      {f.metric}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-ink mb-1">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-stone leading-relaxed">{f.summary}</p>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-border text-xs text-stone-muted leading-relaxed space-y-1.5">
                      <p>{f.detail}</p>
                      <div className="font-mono text-coral text-[11px] font-semibold">
                        CONSEQUENCE: {f.impact}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Traditional Chaos vs ShortForge Unified Flow */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 rounded-lg bg-surface border border-border shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border pb-2.5">
                <span className="font-semibold text-ink uppercase">Workflow Contrast</span>
                <span className="text-coral font-mono text-[11px]">STUDIO PIPELINE</span>
              </div>

              {/* The Disconnected Stack */}
              <div className="space-y-2">
                <div className="text-xs text-stone font-semibold flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5 text-danger" />
                  <span>Traditional Multi-App Approach</span>
                </div>
                <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-1.5 text-xs text-stone">
                  <div className="flex items-center justify-between">
                    <span>Drafting Script:</span>
                    <span className="text-danger font-mono text-[11px]">Browser Tab 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voice Synthesis:</span>
                    <span className="text-danger font-mono text-[11px]">Browser Tab 2 (Manual Export)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visual Assets:</span>
                    <span className="text-danger font-mono text-[11px]">Browser Tab 3 (Image Tool)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timeline & Subtitles:</span>
                    <span className="text-danger font-mono text-[11px]">Desktop Editor (Manual Sync)</span>
                  </div>
                </div>
              </div>

              {/* The ShortForge Operating System */}
              <div className="space-y-2 pt-1">
                <div className="text-xs text-ink font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span>The ShortForge Studio Pipeline</span>
                </div>
                <div className="p-3.5 rounded-md bg-canvas border border-border-strong space-y-2 text-xs text-ink">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Unified Content Model:</span>
                    <span className="text-coral font-semibold">1 Workspace</span>
                  </div>
                  <div className="flex items-center justify-between text-stone">
                    <span>Structured 3-Act Script:</span>
                    <span>Automated Pacing</span>
                  </div>
                  <div className="flex items-center justify-between text-stone">
                    <span>Speech & Syllable Sync:</span>
                    <span>Direct Timestamp Match</span>
                  </div>
                  <div className="flex items-center justify-between text-stone">
                    <span>Rendering & QC:</span>
                    <span>Server-Side FFmpeg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-canvas-subtle border border-border flex items-center justify-between text-xs">
              <span className="text-stone">Production Time Per Short:</span>
              <span className="text-coral font-bold font-mono">2 Minutes vs 90 Minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
