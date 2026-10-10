import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Hand,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  GitBranch,
  Sliders,
  Send,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AutomationFlowSection() {
  const [mode, setMode] = useState<'assisted' | 'autonomous'>('assisted');

  return (
    <section id="automation" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono mb-3">
              <GitBranch className="h-3.5 w-3.5" />
              <span>Autonomous Execution Guardrails</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
              Automation on your own terms.
            </h2>
            <p className="text-base sm:text-lg text-stone-muted mt-3 leading-relaxed">
              Choose between full human-in-the-loop oversight or complete hands-free daily publishing.
              You maintain total authority over frequency, channel privacy, and brand rules.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-paper-subtle border border-paper-border rounded-xl">
            <button
              type="button"
              onClick={() => setMode('assisted')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                mode === 'assisted'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-stone-muted hover:text-ink'
              )}
            >
              <Hand className={cn('h-3.5 w-3.5', mode === 'assisted' ? 'text-lime' : '')} />
              <span>Assisted (Creator In Loop)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('autonomous')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                mode === 'autonomous'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-stone-muted hover:text-ink'
              )}
            >
              <Rocket className={cn('h-3.5 w-3.5', mode === 'autonomous' ? 'text-lime' : '')} />
              <span>Autonomous (Autopilot)</span>
            </button>
          </div>
        </div>

        {/* Interactive Flow Diagram */}
        <div className="bg-paper-subtle rounded-3xl border border-paper-border p-6 sm:p-10 space-y-8">
          <div className="flex items-center justify-between text-xs font-mono text-stone-muted pb-4 border-b border-paper-border">
            <span>PIPELINE EXECUTION GRAPH</span>
            <span className="text-forest font-bold">
              ACTIVE MODE: {mode === 'assisted' ? 'HUMAN-IN-THE-LOOP' : 'AUTONOMOUS HANDS-FREE'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1: Trigger & Research */}
            <div className="bg-paper p-5 rounded-2xl border border-paper-border space-y-2 relative">
              <span className="text-[10px] font-mono font-bold text-forest uppercase">NODE 01</span>
              <h4 className="font-bold text-sm text-ink">Schedule Trigger</h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Daily cron triggers trend ingestion and generates fresh scored concept drafts.
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-paper-muted text-stone-muted">
                BullMQ: trend-queue
              </span>
            </div>

            {/* Step 2: Production Pipeline */}
            <div className="bg-paper p-5 rounded-2xl border border-paper-border space-y-2 relative">
              <span className="text-[10px] font-mono font-bold text-forest uppercase">NODE 02</span>
              <h4 className="font-bold text-sm text-ink">Production Passes</h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Scriptwriting, voice synthesis, scene visual framing, and dual-pass FFmpeg rendering.
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-forest-soft text-forest">
                FFmpeg 60 FPS
              </span>
            </div>

            {/* Step 3: Automated QC */}
            <div className="bg-paper p-5 rounded-2xl border border-paper-border space-y-2 relative">
              <span className="text-[10px] font-mono font-bold text-forest uppercase">NODE 03</span>
              <h4 className="font-bold text-sm text-ink">Quality Gate</h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Automated inspection of audio peak levels, video bitrate, safe zones, and policy compliance.
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-paper-muted text-stone-muted">
                QC Score: 98%
              </span>
            </div>

            {/* Step 4: Decision Node (Changes based on mode!) */}
            <div
              className={cn(
                'p-5 rounded-2xl border space-y-2 transition-all duration-200 relative',
                mode === 'assisted'
                  ? 'bg-amber-500/10 border-amber-500/30 text-ink'
                  : 'bg-forest-soft border-forest/30 text-ink'
              )}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-forest">NODE 04</span>
              <h4 className="font-bold text-sm text-ink">
                {mode === 'assisted' ? 'Creator Approval' : 'Autonomous Gate'}
              </h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                {mode === 'assisted'
                  ? 'Notification sent to your dashboard. Review the video preview and approve with 1 click.'
                  : 'Automated policy verified. Content auto-approves if QC score is above 80%.'}
              </p>
              <span
                className={cn(
                  'inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded font-bold',
                  mode === 'assisted' ? 'bg-amber-500/20 text-amber-800' : 'bg-forest/20 text-forest'
                )}
              >
                {mode === 'assisted' ? 'Requires 1-Click Approval' : 'Auto-Approved'}
              </span>
            </div>

            {/* Step 5: Publishing & Reconciliation */}
            <div className="bg-ink text-paper p-5 rounded-2xl border border-ink-border space-y-2 relative">
              <span className="text-[10px] font-mono font-bold text-lime uppercase">NODE 05</span>
              <h4 className="font-bold text-sm text-paper">YouTube Upload</h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Direct OAuth upload with distributed Redlock concurrency and automated analytics reconciliation.
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-forest/20 text-lime border border-forest/30">
                Idempotent Upload
              </span>
            </div>
          </div>

          {/* Safety & Guardrail Banner */}
          <div className="p-4 rounded-xl bg-paper border border-paper-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-forest shrink-0" />
              <span className="text-stone-muted">
                <strong className="text-ink">Autonomous Safety Lock:</strong> AI never modifies frequency, channel privacy, or budget limits without your explicit confirmation.
              </span>
            </div>
            <span className="font-mono text-forest font-bold shrink-0">100% AUDIT LOGGED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
