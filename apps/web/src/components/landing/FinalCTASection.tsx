import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, CheckCircle2 } from 'lucide-react';

interface FinalCTASectionProps {
  onDemoClick: () => void;
}

export function FinalCTASection({ onDemoClick }: FinalCTASectionProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-7xl mx-auto">
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-14 lg:p-20 border border-ink-border shadow-2xl relative overflow-hidden text-center space-y-8">
          {/* Subtle lime glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-forest/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/30 text-lime text-xs font-semibold tracking-wider uppercase font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Scale Your Vertical Audience</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper leading-[1.08] text-balance">
              Your audience is scrolling.{' '}
              <span className="text-lime">Start publishing tomorrow.</span>
            </h2>

            <p className="text-base sm:text-lg text-stone-muted max-w-xl mx-auto text-balance leading-relaxed">
              Eliminate the 8-hour editing grind. Set your content strategy once and let ShortForge
              produce high-retention vertical shorts on your schedule.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-lime text-ink font-bold text-sm hover:bg-lime-hover transition-all duration-150 shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Start Building Free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              type="button"
              onClick={onDemoClick}
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-ink-surface text-paper font-semibold text-sm border border-ink-border hover:bg-ink-subtle transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4 text-forest" />
              <span>Launch Live Studio</span>
            </button>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-stone-muted font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> Free community plan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> 5-minute initial setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
