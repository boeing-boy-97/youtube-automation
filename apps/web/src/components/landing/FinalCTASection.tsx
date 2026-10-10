import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface FinalCTASectionProps {
  onDemoClick: () => void;
}

export function FinalCTASection({ onDemoClick }: FinalCTASectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="bg-ink text-canvas rounded-xl p-8 sm:p-12 lg:p-16 border border-ink/10 shadow-lg text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-vermilion">
              ShortForge Creative Studio
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Ready to turn ideas into <br />
              <span className="font-editorial italic font-normal text-marigold">continuous output?</span>
            </h2>

            <p className="text-sm sm:text-base text-canvas/70 max-w-lg mx-auto leading-relaxed">
              Step away from tool-switching fatigue. Direct scripts, voices, scenes, and YouTube Shorts from one studio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="btn-primary h-11 px-7 text-sm"
            >
              <span>Start creating free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onDemoClick}
              className="h-11 px-6 rounded-md bg-white/10 text-white font-medium text-sm hover:bg-white/15 transition-all border border-white/20"
            >
              Explore Studio Tour
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-canvas/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-vermilion" /> Free community plan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-vermilion" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-vermilion" /> 5-minute setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
