import { useState } from 'react';
import { Layers, Clock, AlertTriangle, ArrowRight, Zap, Check, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function CreativeProblemSection() {
  const [activeFriction, setActiveFriction] = useState(0);

  const FRICTIONS = [
    {
      id: 'fragmentation',
      title: 'Tool Fragmentation Fatigue',
      summary: 'Creators waste hours copying and pasting between 5 disconnected applications.',
      detail:
        'A typical short-form workflow requires prompting an LLM in one tab, downloading MP3s from a voice tool in a second, generating b-roll images in a third, aligning keyframes in a video editor, and manually scheduling in YouTube Studio. Every handover introduces friction and format mismatches.',
      metric: '5 Separate Subscriptions',
      impact: 'High Context-Switching Overhead',
    },
    {
      id: 'pacing',
      title: 'The First-3-Second Retention Wall',
      summary: 'Generic scripts lose 60% of viewers before the first premise is delivered.',
      detail:
        'Vertical viewers swipe away in under 800 milliseconds. Without disciplined 3-act story structure, curiosity gaps, and frame-accurate word-level subtitles, even great ideas suffer from catastrophic drop-off before the value payoff.',
      metric: '800ms Decision Window',
      impact: 'Severe Algorithm Penalty',
    },
    {
      id: 'sync',
      title: 'Desynchronized Timelines',
      summary: 'One small script revision forces complete re-editing of audio and captions.',
      detail:
        'When you edit a single sentence in traditional editing software, voiceover timing shifts, captions desynchronize, and background music markers break. In an integrated operating system, text, speech, and frames are bound to the same temporal data model.',
      metric: 'Manual Re-alignments',
      impact: 'Compounding Edit Delay',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-subtle border-t border-paper-border text-ink">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest">
            02 // The Production Bottleneck
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Why short-form video creation <br />
            <span className="font-editorial italic font-normal text-forest">breaks creative momentum.</span>
          </h2>
          <p className="text-base sm:text-lg text-stone-muted leading-relaxed">
            The barrier to daily publishing isn’t lack of ideas. It is the friction of stitching disconnected AI wrappers, audio exports, and timeline editors together by hand.
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
                    'p-6 rounded-2xl border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-paper border-forest/40 shadow-sm'
                      : 'bg-paper/50 border-paper-border hover:bg-paper hover:border-paper-border/80'
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-mono font-bold text-forest">0{idx + 1}</span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-paper-subtle border border-paper-border text-stone-muted">
                      {f.metric}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-1">{f.title}</h3>
                  <p className="text-sm text-stone-muted leading-relaxed">{f.summary}</p>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-paper-border text-xs text-stone-muted leading-relaxed space-y-2">
                      <p>{f.detail}</p>
                      <div className="font-mono text-forest text-[11px] font-semibold">
                        CONSEQUENCE: {f.impact}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Traditional Chaos vs ShortForge Unified Flow */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-ink text-paper border border-ink-border space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-3">
                <span className="text-stone-subtle uppercase">Pipeline Comparison</span>
                <span className="text-lime">ARCHITECTURAL AUDIT</span>
              </div>

              {/* The Disconnected Stack */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-red-400 font-semibold flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5" />
                  <span>TRADITIONAL MULTI-APP STACK</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Idea $\rightarrow$ Scripting</span>
                    <span className="text-red-400">Browser Tab 1 (ChatGPT)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voice Narration</span>
                    <span className="text-red-400">Browser Tab 2 (Manual Export)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scene Visuals</span>
                    <span className="text-red-400">Browser Tab 3 (Image Generator)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timeline & Subtitles</span>
                    <span className="text-red-400">Desktop Editor (Manual Sync)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Export & YouTube Upload</span>
                    <span className="text-red-400">YouTube Studio (Manual Form)</span>
                  </div>
                </div>
              </div>

              {/* The ShortForge Operating System */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-lime font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-lime" />
                  <span>SHORTFORGE CREATIVE OPERATING SYSTEM</span>
                </div>
                <div className="p-4 rounded-xl bg-forest/20 border border-lime/30 space-y-2.5 text-xs font-mono text-paper">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-paper">Single Content Model:</span>
                    <span className="text-lime">1 Workspace</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Script + Scene Breakdown:</span>
                    <span className="text-white/80">Structured 3-Act JSON</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Speech + Syllable Alignment:</span>
                    <span className="text-white/80">Automated Timestamp Sync</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rendering Engine:</span>
                    <span className="text-lime">Native Server-Side FFmpeg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Publishing & Analytics:</span>
                    <span className="text-white/80">Authorized Google OAuth v3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/70">Average Production Time:</span>
              <span className="text-lime font-bold">2 Minutes vs 90 Minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
