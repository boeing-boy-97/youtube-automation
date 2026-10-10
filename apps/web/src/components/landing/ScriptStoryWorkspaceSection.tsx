import { useState } from 'react';
import { FileText, Sparkles, Clock, Type, Zap, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScriptSample {
  id: string;
  niche: string;
  title: string;
  hook: string;
  wordCount: number;
  estDuration: string;
  scenes: {
    beat: string;
    time: string;
    dialogue: string;
    visualDirection: string;
  }[];
}

const SAMPLE_SCRIPTS: ScriptSample[] = [
  {
    id: 'autonomous-pipelines',
    niche: 'Engineering & AI',
    title: 'The Architecture of Autonomous Pipelines',
    hook: 'If your dev team is still assembling short-form videos by hand in 2026, stop immediately.',
    wordCount: 118,
    estDuration: '44s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:04',
        dialogue: 'If your dev team is still assembling short-form videos by hand in 2026, stop immediately.',
        visualDirection: 'Rapid push-in on dual vertical terminal showing concurrent BullMQ worker threads.',
      },
      {
        beat: 'ACT II: THE CONTRARIAN TRUTH',
        time: '0:04 – 0:18',
        dialogue:
          'Most creators spend ninety minutes per short jumping between five different browser tabs. In reality, a short is just a four-beat state machine: prompt, voice, timeline, and FFmpeg render.',
        visualDirection: 'Split composition showing messy multi-app tabs collapsing into a single clean timeline.',
      },
      {
        beat: 'ACT III: THE PAYOFF & LOOP',
        time: '0:18 – 0:44',
        dialogue:
          'When you bind speech timestamps directly to kinetic subtitle frames, you eliminate manual keyframing completely. That is how top channels publish three broadcast-grade shorts every day.',
        visualDirection: 'Frame-accurate audio waveform overlay with highlighted kinetic syllables and outro loop cue.',
      },
    ],
  },
  {
    id: 'retention-science',
    niche: 'Creator Economy',
    title: 'The 3-Second Retention Law',
    hook: 'Why 90% of vertical shorts fail before the viewer even hears the premise.',
    wordCount: 112,
    estDuration: '42s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:03',
        dialogue: 'The first three seconds decide whether your short gets five hundred views or five hundred thousand.',
        visualDirection: 'Dramatic countdown timer with retention curve dropping steeply at second 2.8.',
      },
      {
        beat: 'ACT II: PACING MECHANICS',
        time: '0:03 – 0:22',
        dialogue:
          'Never start with "Hey guys" or your logo. Open mid-action with a curiosity gap. Use kinetic subtitle pop-ins every one-point-two seconds to reset viewer cognitive attention.',
        visualDirection: 'Side-by-side retention graph showing talking-head dropoff vs kinetic visual pacing.',
      },
      {
        beat: 'ACT III: THE SEAMLESS LOOP',
        time: '0:22 – 0:42',
        dialogue:
          'Finally, end on an incomplete cadence that feeds directly back into the opening sentence for an endless replay loop.',
        visualDirection: 'Infinite Möbius strip animation seamlessly matching the opening frame.',
      },
    ],
  },
  {
    id: 'quantum-computing',
    niche: 'Science & Education',
    title: 'Quantum Superposition in 45 Seconds',
    hook: 'A coin spinning in mid-air is the simplest way to understand quantum computing.',
    wordCount: 124,
    estDuration: '46s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:04',
        dialogue: 'A coin spinning in mid-air is the simplest way to understand quantum computing.',
        visualDirection: 'Ultra slow-motion spinning metallic coin suspended in a laser-illuminated laboratory.',
      },
      {
        beat: 'ACT II: THE INTELLECTUAL LIFT',
        time: '0:04 – 0:24',
        dialogue:
          'While spinning, it is not heads and it is not tails. It is a mathematical blend of both possibilities at once. That is quantum superposition. Instead of binary bits, quantum computers use qubits.',
        visualDirection: 'Bloch sphere 3D wireframe rotating with probability amplitude vectors.',
      },
      {
        beat: 'ACT III: REAL-WORLD IMPACT',
        time: '0:24 – 0:46',
        dialogue:
          'This allows them to test millions of molecular combinations simultaneously, solving drug discovery in hours rather than decades.',
        visualDirection: 'Complex protein folding simulation resolving into a stable synthetic antibody.',
      },
    ],
  },
];

export function ScriptStoryWorkspaceSection() {
  const [selectedScriptId, setSelectedScriptId] = useState('autonomous-pipelines');
  const [viewMode, setViewMode] = useState<'screenplay' | 'director'>('screenplay');

  const activeScript = SAMPLE_SCRIPTS.find((s) => s.id === selectedScriptId) || SAMPLE_SCRIPTS[0];

  return (
    <section id="scripts" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper text-ink border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-paper-border pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest">
              04 // Screenplay & Story Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Screenplays engineered <br />
              <span className="font-editorial italic font-normal text-forest">for vertical retention.</span>
            </h2>
            <p className="text-base text-stone-muted leading-relaxed">
              Every vertical video lives or dies by its first three seconds. ShortForge’s Script Studio structures raw premises into rigorous 3-act scripts with calculated word pacing and frame-specific visual directions.
            </p>
          </div>

          {/* Script Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_SCRIPTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedScriptId(s.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all',
                  selectedScriptId === s.id
                    ? 'bg-ink text-lime shadow-xs font-semibold'
                    : 'bg-paper-subtle border border-paper-border text-stone-muted hover:text-ink'
                )}
              >
                {s.niche}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Mockup Studio Canvas */}
        <div className="bg-paper-subtle rounded-2xl border border-paper-border p-6 lg:p-8 space-y-6 shadow-sm">
          {/* Editor Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper-border pb-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-forest" />
              <span className="font-bold text-ink uppercase">{activeScript.title}</span>
              <span className="text-stone-muted">({activeScript.niche})</span>
            </div>

            <div className="flex items-center gap-4 text-stone-muted text-[11px]">
              <span className="flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-forest" />
                <span>{activeScript.wordCount} words</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-forest" />
                <span>Target: {activeScript.estDuration} (145 WPM)</span>
              </span>
              <div className="flex items-center bg-paper rounded border border-paper-border p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('screenplay')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] transition-colors',
                    viewMode === 'screenplay' ? 'bg-ink text-paper font-semibold' : 'text-stone-muted'
                  )}
                >
                  Screenplay View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('director')}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] transition-colors',
                    viewMode === 'director' ? 'bg-ink text-paper font-semibold' : 'text-stone-muted'
                  )}
                >
                  Director Cues
                </button>
              </div>
            </div>
          </div>

          {/* Script Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Screenplay Beats */}
            <div className="lg:col-span-8 space-y-4 font-mono text-xs">
              {activeScript.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-paper border border-paper-border space-y-3 hover:border-forest/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-muted border-b border-paper-border pb-2">
                    <span className="font-bold text-forest">{scene.beat}</span>
                    <span className="text-stone-muted">{scene.time}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-stone-muted uppercase tracking-wider font-semibold">
                      VOICEOVER DIALOGUE (NEURAL NARRATION)
                    </div>
                    <p className="text-sm font-sans font-medium text-ink leading-relaxed">
                      "{scene.dialogue}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-paper-border/60 flex items-start gap-2 text-[11px] text-stone-muted">
                    <span className="text-forest font-bold shrink-0">DIRECTOR:</span>
                    <span className="font-mono text-ink/80">{scene.visualDirection}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Retention Science Telemetry */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-xl bg-ink text-paper border border-ink-border space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-stone-subtle uppercase">Retention Diagnostics</span>
                  <span className="text-lime">VERIFIED</span>
                </div>

                <div className="space-y-3 text-[11px]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70">Hook Intrigue Rating</span>
                      <span className="text-lime font-bold">92 / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-lime rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70">Pacing Velocity (WPM)</span>
                      <span className="text-white font-bold">148 WPM (Optimal)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-forest rounded-full w-[85%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70">Replay Loop Potential</span>
                      <span className="text-lime font-bold">High (Cadence Loop)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-lime rounded-full w-[88%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-[10px] text-white/60 space-y-1">
                  <div className="font-semibold text-paper">STRUCTURE ADHERENCE:</div>
                  <p>3-Act micro-drama designed to eliminate mid-video retention dropoff on vertical feeds.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-paper border border-paper-border text-xs text-stone-muted space-y-2">
                <div className="font-semibold text-ink flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-forest" />
                  <span>Real Script Lab Integration</span>
                </div>
                <p className="leading-relaxed">
                  Every script generated in ShortForge can be edited, versioned, or regenerated line-by-line in the authenticated Script Lab.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Label */}
          <div className="text-center text-xs text-stone-muted font-mono pt-2">
            Illustrative screenplay demonstrator. Real production scripts are managed in the ShortForge Script Lab.
          </div>
        </div>
      </div>
    </section>
  );
}
