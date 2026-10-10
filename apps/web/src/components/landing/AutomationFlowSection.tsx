import { useState } from 'react';
import {
  Rocket,
  Hand,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AutomationFlowSection() {
  const [mode, setMode] = useState<'assisted' | 'autonomous'>('assisted');

  return (
    <section id="automation" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas-subtle border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header & Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
              Autonomous Execution Guardrails
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Automation on <br />
              <span className="font-editorial italic font-normal text-coral">your own terms.</span>
            </h2>
            <p className="text-base text-stone leading-relaxed">
              Choose between human-in-the-loop review or scheduled hands-free publishing. You retain full control over posting frequency, budget caps, and channel privacy.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-surface border border-border rounded-lg shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setMode('assisted')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all',
                mode === 'assisted'
                  ? 'bg-ink text-canvas shadow-xs font-semibold'
                  : 'text-stone hover:text-ink'
              )}
            >
              <Hand className="h-3.5 w-3.5" />
              <span>Assisted (Creator Review)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('autonomous')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all',
                mode === 'autonomous'
                  ? 'bg-coral text-white shadow-xs font-semibold'
                  : 'text-stone hover:text-ink'
              )}
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Autonomous (Daily Cadence)</span>
            </button>
          </div>
        </div>

        {/* Workflow Comparison Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-coral">
                {mode === 'assisted' ? 'HUMAN-IN-THE-LOOP FLOW' : 'AUTONOMOUS RECURRING DISPATCH'}
              </span>
            </div>
            <span className="text-xs text-stone font-mono">
              {mode === 'assisted' ? 'Requires Approval Before Upload' : 'Publishes at Scheduled UTC Slots'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Topic Ingestion',
                assisted: 'System prepares script drafts for creator review in Script Lab.',
                autonomous: 'Scans content pillars and enqueues top candidate automatically.',
              },
              {
                step: '02',
                title: 'Production',
                assisted: 'Synthesizes voice and renders draft video with interactive preview.',
                autonomous: 'Executes voice generation, asset directing, and FFmpeg composite render.',
              },
              {
                step: '03',
                title: 'Quality Verification',
                assisted: 'Creator reviews video, timing, subtitles, and approves or edits.',
                autonomous: 'ffprobe automatically verifies audio normalization and safe-zone margins.',
              },
              {
                step: '04',
                title: 'Channel Delivery',
                assisted: 'Uploads to YouTube on creator click or schedules for specific time.',
                autonomous: 'Dispatches to YouTube OAuth API on schedule with idempotency lock.',
              },
            ].map((col) => (
              <div key={col.step} className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-coral">{col.step}</span>
                  <span className="text-xs font-semibold text-ink">{col.title}</span>
                </div>
                <p className="text-xs text-stone leading-relaxed">
                  {mode === 'assisted' ? col.assisted : col.autonomous}
                </p>
              </div>
            ))}
          </div>

          {/* Guardrails Banner */}
          <div className="p-4 rounded-md bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone">
              <Shield className="h-4 w-4 text-coral shrink-0" />
              <span>
                <strong>Safety Guardrail:</strong> AI cannot modify channel privacy, spending caps, or publishing targets without explicit workspace authorization.
              </span>
            </div>
            <span className="font-mono text-[11px] text-stone-muted shrink-0">Security Policy §4.2</span>
          </div>
        </div>
      </div>
    </section>
  );
}
