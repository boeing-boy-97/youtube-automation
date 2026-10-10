import { useState } from 'react';
import { FileText, Clock, ArrowRight } from 'lucide-react';
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
    niche: 'Engineering & Architecture',
    title: 'The Architecture of Autonomous Pipelines',
    hook: 'If your dev team is still assembling short-form videos by hand in 2026, stop immediately.',
    wordCount: 118,
    estDuration: '44s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:04',
        dialogue: 'If your dev team is still assembling short-form videos by hand in 2026, stop immediately.',
        visualDirection: 'Rapid push-in on clean terminal showing concurrent BullMQ worker threads.',
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
    id: 'database-indexing',
    niche: 'Software Development',
    title: 'PostgreSQL Indexing: The Hidden Performance Killer',
    hook: 'Why adding more indexes to your database is actually slowing down your writes by 400%.',
    wordCount: 112,
    estDuration: '42s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:03',
        dialogue: 'Adding more indexes to your database is secretly destroying your write throughput.',
        visualDirection: 'High-contrast query plan graphic highlighting B-tree update amplification.',
      },
      {
        beat: 'ACT II: THE CONTRARIAN TRUTH',
        time: '0:03 – 0:20',
        dialogue:
          'Every index you create forces PostgreSQL to lock pages on every insert and update. For high-velocity event queues, partial indexes and BRIN indexes deliver 10x throughput with 90% less disk footprint.',
        visualDirection: 'Comparison chart of heap memory writes between standard B-tree and BRIN blocks.',
      },
      {
        beat: 'ACT III: THE PAYOFF & LOOP',
        time: '0:20 – 0:42',
        dialogue:
          'Run this simple SQL snippet in our docs to identify your 5 most expensive unused indexes before your next deployment.',
        visualDirection: 'Actionable SQL code snippet centered with highlighted drop statement and loop cue.',
      },
    ],
  },
  {
    id: 'creator-monetization',
    niche: 'Media Strategy',
    title: 'The Single-Format Trap for Vertical Creators',
    hook: 'The biggest mistake creators make on YouTube Shorts is treating it like a miniature long-form video.',
    wordCount: 124,
    estDuration: '46s',
    scenes: [
      {
        beat: 'ACT I: THE HOOK',
        time: '0:00 – 0:04',
        dialogue: 'Treating a YouTube Short like a mini long-form video is the fastest way to kill retention.',
        visualDirection: 'Dramatic red downward retention curve transitioning to a flat 95% retention line.',
      },
      {
        beat: 'ACT II: THE CONTRARIAN TRUTH',
        time: '0:04 – 0:22',
        dialogue:
          'Long-form is built on buildup and trust. Vertical video is built on pattern interruption and immediate payoff. If your viewer has not learned something surprising by second four, they have already swiped.',
        visualDirection: 'Dynamic swipe velocity animation showing viewer drop-off window in under 800ms.',
      },
      {
        beat: 'ACT III: THE PAYOFF & LOOP',
        time: '0:22 – 0:46',
        dialogue:
          'Structure your ending so the final sentence answers the question asked in the opening second. That creates the infinite loop that drives algorithm distribution.',
        visualDirection: 'Circular loop visual connecting the outro subtitle seamlessly into Act I opening.',
      },
    ],
  },
];

export function ScriptStoryWorkspaceSection() {
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const activeScript = SAMPLE_SCRIPTS[selectedScriptIndex];

  return (
    <section id="scripts" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas text-ink border-t border-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            The Script Story Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Vertical writing engineered <br />
            <span className="font-editorial italic font-normal text-coral">for retention.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            Short-form scripts must balance spoken cadence, breath timing, and instant curiosity. ShortForge writes in structured beats calibrated for 140–160 words per minute.
          </p>
        </div>

        {/* Niche Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SAMPLE_SCRIPTS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedScriptIndex(idx)}
              className={cn(
                'px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap border',
                selectedScriptIndex === idx
                  ? 'bg-surface border-coral text-coral shadow-xs font-semibold'
                  : 'bg-canvas-subtle border-border text-stone hover:text-ink'
              )}
            >
              {s.niche}
            </button>
          ))}
        </div>

        {/* Script & Storyboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Script Metadata & Full Narration Text */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-6 space-y-5 shadow-xs">
            <div className="space-y-2 border-b border-border pb-4">
              <span className="text-xs font-mono text-coral">{activeScript.niche}</span>
              <h3 className="text-lg font-bold text-ink leading-snug">{activeScript.title}</h3>
              <div className="flex items-center gap-4 text-xs text-stone font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {activeScript.estDuration}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {activeScript.wordCount} words
                </span>
                <span>~2.6 words/sec</span>
              </div>
            </div>

            {/* Opening Hook Highlight */}
            <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-coral uppercase tracking-wide">
                First-3-Second Hook
              </span>
              <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
                "{activeScript.hook}"
              </p>
            </div>

            {/* Complete Narration Flow */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                Full Screenplay Text
              </span>
              <div className="space-y-2.5 text-xs text-stone font-sans leading-relaxed">
                {activeScript.scenes.map((scene, i) => (
                  <p key={i} className="p-3 rounded-md bg-canvas-subtle/50 border border-border">
                    <strong className="text-ink font-mono text-[11px] block mb-1">{scene.beat}:</strong>
                    "{scene.dialogue}"
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Act Breakdown and Visual Direction */}
          <div className="lg:col-span-7 space-y-3">
            {activeScript.scenes.map((scene, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border rounded-xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="text-xs font-mono font-bold text-coral">{scene.beat}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-canvas-subtle border border-border text-stone">
                    {scene.time}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-ink font-medium leading-relaxed">
                    <span className="text-stone-muted block text-[11px] font-mono">VOICEOVER:</span>
                    "{scene.dialogue}"
                  </div>

                  <div className="p-3 rounded-md bg-canvas-subtle border border-border text-xs text-stone space-y-1">
                    <span className="text-[11px] font-mono font-semibold text-ink block">
                      VISUAL ART DIRECTION (9:16):
                    </span>
                    <p className="leading-relaxed font-mono">{scene.visualDirection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
