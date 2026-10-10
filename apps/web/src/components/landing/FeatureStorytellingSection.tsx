import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function FeatureStorytellingSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-paper space-y-20">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Layout 1: Large Visual Feature Panel (Dark Ink Theme) */}
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 border border-ink-border shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/30 text-lime text-xs font-semibold tracking-wider uppercase font-mono">
                <Cpu className="h-3.5 w-3.5 text-lime" />
                <span>Distributed Pipeline Engine</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-paper">
                The Autonomous Production Orchestrator
              </h3>
              <p className="text-base text-stone-muted leading-relaxed">
                ShortForge executes your channel operations using an async-first modular architecture.
                Powered by 17 BullMQ worker queues and the Outbox pattern, work is persisted durably,
                locked across distributed instances, and protected against transient network drops.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink-border text-xs font-mono">
                <div>
                  <span className="text-stone-muted block">QUEUE CONCURRENCY</span>
                  <span className="text-lime font-bold text-base">17 Dedicated Queues</span>
                </div>
                <div>
                  <span className="text-stone-muted block">IDEMPOTENCY GUARANTEE</span>
                  <span className="text-lime font-bold text-base">Redis Redlock v2</span>
                </div>
              </div>
            </div>

            {/* Architecture Node Visualizer */}
            <div className="lg:col-span-6 bg-ink-subtle rounded-2xl border border-ink-border p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-stone-muted pb-2 border-b border-ink-border/80">
                <span className="flex items-center gap-1.5 text-paper">
                  <Activity className="h-4 w-4 text-lime" />
                  WORKER QUEUE MONITOR
                </span>
                <span className="text-lime">ALL WORKERS READY</span>
              </div>

              {[
                { queue: 'q:trend-research', status: 'COMPLETED', latency: '240ms', color: 'text-stone-muted' },
                { queue: 'q:script-generation', status: 'COMPLETED', latency: '1,420ms', color: 'text-stone-muted' },
                { queue: 'q:voice-synthesis', status: 'COMPLETED', latency: '3,840ms', color: 'text-stone-muted' },
                { queue: 'q:ffmpeg-render', status: 'ACTIVE (Pass 2/3)', latency: '14,200ms', color: 'text-lime animate-pulse' },
                { queue: 'q:quality-check', status: 'WAITING', latency: '—', color: 'text-stone-muted' },
                { queue: 'q:youtube-publish', status: 'WAITING', latency: '—', color: 'text-stone-muted' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded bg-ink border border-ink-border/50 text-[11px]">
                  <span className="text-paper">{row.queue}</span>
                  <span className={row.color}>{row.status}</span>
                  <span className="text-stone-muted">{row.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout 2: Two-Column Editorial Story (Light Paper Theme) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Retention Science</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Algorithmic Hook Engineering. The first 3 seconds decide everything.
            </h3>
            <p className="text-base text-stone-muted leading-relaxed">
              Standard AI scripts fail because they start with generic greetings.
              ShortForge scripts are strictly structured around scroll-stopping pattern interrupts,
              curiosity gaps, and fast-paced visual sync that lifts average viewer retention above 70%.
            </p>
            <ul className="space-y-2.5 text-sm text-stone-muted pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span>Zero introductory fluff: The hook is the first spoken syllable.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span>Micro-interrupts inserted dynamically every 8 to 10 seconds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                <span>Seamless outro transitions designed for infinite loop replays.</span>
              </li>
            </ul>
          </div>

          {/* Retention Curve Card */}
          <div className="lg:col-span-6 bg-paper-subtle rounded-3xl border border-paper-border p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-stone-muted uppercase">Retention Benchmark</span>
                <div className="text-xl font-bold text-ink">ShortForge vs. Industry Average</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-forest-soft text-forest border border-forest/30 text-xs font-mono font-bold">
                +48% RETENTION LIFT
              </span>
            </div>

            {/* Simulated retention curve graphic */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-stone-muted mb-1">
                  <span className="text-forest font-bold">ShortForge Optimized (76% Avg)</span>
                  <span>0:42 Final</span>
                </div>
                <div className="h-3 w-full bg-paper rounded-full overflow-hidden border border-paper-border">
                  <div className="h-full bg-forest rounded-full" style={{ width: '76%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-muted mb-1">
                  <span>Standard Manual Edit (46% Avg)</span>
                  <span>0:42 Final</span>
                </div>
                <div className="h-3 w-full bg-paper rounded-full overflow-hidden border border-paper-border">
                  <div className="h-full bg-stone-muted/40 rounded-full" style={{ width: '46%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-paper border border-paper-border text-xs text-stone-muted space-y-1">
              <span className="font-bold text-ink block">The Curiosity Gap Formula:</span>
              <p>Every script promises high-value insight immediately, delivers concrete utility in act 2, and lands a clear action prompt before the final frame.</p>
            </div>
          </div>
        </div>

        {/* Layout 3: Compact Technical Capability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: '60 FPS Hardware FFmpeg',
              desc: 'Dual-pass H.264 vertical rendering with accurate sub-pixel caption alignment.',
            },
            {
              icon: ShieldCheck,
              title: 'Redlock Concurrency',
              desc: 'Distributed publishing locks guarantee zero duplicate uploads to your YouTube channel.',
            },
            {
              icon: Lock,
              title: 'Argon2id + AES-256',
              desc: 'State-of-the-art password hashing and encrypted-at-rest OAuth refresh tokens.',
            },
            {
              icon: Clock,
              title: 'Real-Time SSE Feedback',
              desc: 'Server-Sent Events stream live job progress from render workers directly to your browser.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-paper border border-paper-border rounded-2xl p-5 space-y-3 hover:border-forest/50 transition-colors duration-150"
              >
                <div className="h-9 w-9 rounded-lg bg-forest-soft flex items-center justify-center text-forest">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-sm text-ink">{item.title}</h4>
                <p className="text-xs text-stone-muted leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
