import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lightbulb,
  FileText,
  Volume2,
  Film,
  Sliders,
  Send,
  Play,
  Pause,
  Check,
  TrendingUp,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function InteractiveShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'ideas' | 'script' | 'voice' | 'visuals' | 'timeline' | 'publish'>('ideas');

  // Interactive local states for each tab
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [hookStrength, setHookStrength] = useState(94);
  const [activeVoice, setActiveVoice] = useState<'adam' | 'rachel' | 'antoni'>('adam');
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [captionPreset, setCaptionPreset] = useState<'viral' | 'minimal' | 'cyber'>('viral');

  const topics = [
    { title: 'The 3 hidden features in Claude 3.7 Sonnet', score: 96, category: 'Dev Tools' },
    { title: 'Why 1-person SaaS is now a $1M reality', score: 92, category: 'Business' },
    { title: 'Stop storing passwords with bcrypt in 2026', score: 94, category: 'Security' },
  ];

  return (
    <section id="showcase" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Interactive Studio Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Control every layer of production.
          </h2>
          <p className="text-base sm:text-lg text-stone-muted leading-relaxed">
            ShortForge gives you granular creative direction over every stage, from concept scoring to multi-track rendering.
            Switch between the modules below to test the workflow.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5 p-1.5 bg-paper-subtle rounded-xl border border-paper-border overflow-x-auto max-w-full">
            {[
              { id: 'ideas', label: '1. Concept Lab', icon: Lightbulb },
              { id: 'script', label: '2. Script Studio', icon: FileText },
              { id: 'voice', label: '3. Neural Voice', icon: Volume2 },
              { id: 'visuals', label: '4. Visual Director', icon: Film },
              { id: 'timeline', label: '5. Studio Timeline', icon: Sliders },
              { id: 'publish', label: '6. Auto-Publish', icon: Send },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150',
                    isActive
                      ? 'bg-ink text-paper shadow-sm'
                      : 'text-stone-muted hover:text-ink hover:bg-paper'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-lime' : 'text-stone-muted')} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Showcase Canvas */}
        <div className="bg-ink text-paper rounded-2xl border border-ink-border p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[460px]">
          <AnimatePresence mode="wait">
            {/* TAB 1: IDEAS */}
            {activeTab === 'ideas' && (
              <motion.div
                key="ideas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 01: CONCEPT LAB
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    Algorithmic Virality Scoring
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    ShortForge extracts breakout search trends and patterns across YouTube Shorts.
                    Every concept receives a composite score based on hook strength, novelty, clickability, and production efficiency.
                  </p>
                  <div className="pt-2 text-xs font-mono text-stone-muted space-y-1">
                    <div>• Trigram duplicate detection prevents repetitive ideas</div>
                    <div>• Customized to your brand pillars and tone guidelines</div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-ink-subtle rounded-xl border border-ink-border p-5 space-y-3">
                  <div className="text-xs font-mono text-stone-muted flex justify-between">
                    <span>TRENDING INGESTION FEED</span>
                    <span className="text-lime">LIVE SCORING</span>
                  </div>

                  {topics.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedTopic(idx)}
                      className={cn(
                        'p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between',
                        selectedTopic === idx
                          ? 'bg-ink-surface border-lime/60 text-paper'
                          : 'bg-ink border-ink-border text-stone-muted hover:border-ink-border/80'
                      )}
                    >
                      <div className="space-y-1 pr-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/20 text-lime border border-forest/30">
                          {t.category}
                        </span>
                        <div className="text-sm font-semibold text-paper mt-1">{t.title}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-mono font-bold text-lime">{t.score}/100</div>
                        <span className="text-[10px] text-stone-muted font-mono">VIRAL INDEX</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: SCRIPT */}
            {activeTab === 'script' && (
              <motion.div
                key="script"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 02: SCRIPT STUDIO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    3-Act Vertical Structure
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    Scripts are formatted sentence-per-breath with intentional pattern interrupts every 8–10 seconds.
                    Every script delivers on its hook promise without wasted filler.
                  </p>
                  <div className="bg-ink-surface p-3.5 rounded-lg border border-ink-border space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>HOOK RETENTION PREDICTION</span>
                      <span className="text-lime">{hookStrength}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="99"
                      value={hookStrength}
                      onChange={(e) => setHookStrength(Number(e.target.value))}
                      className="w-full accent-lime"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 bg-ink-subtle rounded-xl border border-ink-border p-5 space-y-3 font-mono text-xs">
                  <div className="text-stone-muted flex justify-between">
                    <span>SCRIPT BEAT BREAKDOWN</span>
                    <span className="text-lime">118 WORDS • 44 SECONDS</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded bg-ink border border-lime/40">
                      <span className="text-lime font-bold">[00:00 - 00:03] THE HOOK:</span>
                      <p className="text-paper mt-1">"If you're still configuring authentication manually in 2026, stop right now."</p>
                    </div>
                    <div className="p-3 rounded bg-ink border border-ink-border">
                      <span className="text-stone-muted font-bold">[00:03 - 00:15] PATTERN INTERRUPT:</span>
                      <p className="text-paper mt-1">"90% of tutorials teach old hashing routines that fail modern security audits."</p>
                    </div>
                    <div className="p-3 rounded bg-ink border border-ink-border">
                      <span className="text-stone-muted font-bold">[00:15 - 00:36] CONCRETE VALUE:</span>
                      <p className="text-paper mt-1">"Switch to Argon2id with 3 iterations and 64 megabytes of memory cost. Here is the single line."</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: VOICE */}
            {activeTab === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 03: NEURAL VOICE
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    Studio Voice Synthesis
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    Powered by ElevenLabs broadcast-grade voices. Speech is normalized to -14 LUFS standard,
                    with micro-pauses inserted between beats to match natural speech cadences.
                  </p>
                  <div className="flex gap-2">
                    {(['adam', 'rachel', 'antoni'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setActiveVoice(v)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg border text-xs font-mono uppercase transition-all',
                          activeVoice === v
                            ? 'bg-lime text-ink border-lime font-bold'
                            : 'bg-ink-surface text-stone-muted border-ink-border'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 bg-ink-subtle rounded-xl border border-ink-border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-paper capitalize">
                        {activeVoice} — Expressive Studio Narrator
                      </div>
                      <div className="text-xs text-stone-muted font-mono">48kHz • Stability: 0.60 • Crisp Timbre</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoicePlaying(!voicePlaying)}
                      className="h-10 w-10 rounded-full bg-lime text-ink flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {voicePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                  </div>

                  {/* Waveform graphic */}
                  <div className="flex items-center gap-1 h-14 bg-ink p-3 rounded-lg border border-ink-border">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-full transition-all duration-150',
                          voicePlaying ? 'bg-lime' : 'bg-lime/40'
                        )}
                        style={{
                          height: `${Math.max(15, (Math.sin(i * 0.5) * 40 + 50) * (voicePlaying ? 1 : 0.6))}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-stone-muted">
                    <span>AUDIO SPEC: 320 KBPS STEREO</span>
                    <span className="text-lime">ZERO CLIPPING (-0.5 dB TRUE PEAK)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: VISUALS */}
            {activeTab === 'visuals' && (
              <motion.div
                key="visuals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 04: VISUAL DIRECTOR
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    9:16 Vertical Composition
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    Visual scenes are directed with strict 9:16 aspect ratios, ensuring key elements never get obscured
                    by YouTube's UI overlays, like buttons, or title safe zones.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Scene 1: Terminal Hook', grad: 'from-emerald-950 to-slate-900', status: 'READY' },
                    { label: 'Scene 2: Data Comparison', grad: 'from-slate-900 to-indigo-950', status: 'READY' },
                    { label: 'Scene 3: Architecture Node', grad: 'from-teal-950 to-black', status: 'RENDERED' },
                  ].map((s, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div
                        className={cn(
                          'aspect-[9/16] rounded-xl border border-ink-border bg-gradient-to-b p-3 flex flex-col justify-between relative overflow-hidden',
                          s.grad
                        )}
                      >
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ink/80 text-lime w-fit">
                          {s.status}
                        </span>
                        <div className="text-[11px] font-semibold text-paper leading-tight">
                          {s.label}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-muted block text-center">1080×1920</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: TIMELINE & CAPTIONS */}
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 05: TIMELINE & CAPTIONS
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    Kinetic Subtitle Typography
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    Burn word-level synchronized captions directly into video frames. Select high-converting styling presets designed to elevate retention.
                  </p>
                  <div className="flex gap-2">
                    {[
                      { id: 'viral', label: 'Viral Punch' },
                      { id: 'minimal', label: 'Minimalist' },
                      { id: 'cyber', label: 'Cyber Glow' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setCaptionPreset(p.id as any)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all',
                          captionPreset === p.id
                            ? 'bg-lime text-ink border-lime font-bold'
                            : 'bg-ink-surface text-stone-muted border-ink-border'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 bg-ink-subtle rounded-xl border border-ink-border p-5 space-y-4">
                  <div className="text-xs font-mono text-stone-muted">MULTI-TRACK COMPOSITOR</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-3 bg-ink p-2.5 rounded border border-ink-border">
                      <span className="w-16 text-lime">VIDEO</span>
                      <div className="flex-1 h-5 bg-forest/30 rounded border border-forest/50 flex items-center px-2 text-[10px] text-paper">
                        Scene 01 → Scene 02 → Scene 03 (42s Total)
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-ink p-2.5 rounded border border-ink-border">
                      <span className="w-16 text-lime">VOICE</span>
                      <div className="flex-1 h-5 bg-lime/20 rounded border border-lime/40 flex items-center px-2 text-[10px] text-lime">
                        Voiceover_Adam_48k.aac (LUFS -14)
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-ink p-2.5 rounded border border-ink-border">
                      <span className="w-16 text-lime">CAPTIONS</span>
                      <div className="flex-1 h-5 bg-indigo-950/60 rounded border border-indigo-700/50 flex items-center px-2 text-[10px] text-indigo-300">
                        {captionPreset === 'viral' && 'Preset: Viral Punch (Inter Black, Yellow highlight)'}
                        {captionPreset === 'minimal' && 'Preset: Minimal Editorial (Helvetica Neue Light)'}
                        {captionPreset === 'cyber' && 'Preset: Cyber Glow (JetBrains Mono Neon)'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: PUBLISH */}
            {activeTab === 'publish' && (
              <motion.div
                key="publish"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-semibold text-lime uppercase tracking-wider">
                    MODULE 06: AUTONOMOUS PUBLISHER
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    Direct YouTube Synchronization
                  </h3>
                  <p className="text-sm text-stone-muted leading-relaxed">
                    Videos are uploaded directly via official Google OAuth APIs with distributed Redlock concurrency control.
                    Idempotent reconciliation ensures duplicate uploads can never occur.
                  </p>
                </div>

                <div className="lg:col-span-7 bg-ink-subtle rounded-xl border border-ink-border p-5 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-stone-muted">
                    <span className="flex items-center gap-2 text-paper font-semibold">
                      <svg className="h-4 w-4 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      CONNECTED CHANNEL: TechExplorations (142K Subs)
                    </span>
                    <span className="text-lime">VERIFIED</span>
                  </div>
                  <div className="bg-ink p-3.5 rounded border border-ink-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-muted">Next Scheduled Slot:</span>
                      <span className="text-paper">Today @ 18:30 UTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-muted">Quality Control Check:</span>
                      <span className="text-lime">PASSED (All 8 parameters)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-muted">Publishing Mode:</span>
                      <span className="text-lime">AUTONOMOUS</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
