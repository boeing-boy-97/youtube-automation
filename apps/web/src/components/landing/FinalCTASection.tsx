import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Play, Film, Sparkles, Mic } from 'lucide-react';
import { useMotionSafe, motionTokens } from '../../lib/motion';

interface FinalCTASectionProps {
  onDemoClick: () => void;
}

export function FinalCTASection({ onDemoClick }: FinalCTASectionProps) {
  const { shouldReduce } = useMotionSafe();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-dark-surface text-canvas rounded-2xl p-8 sm:p-14 lg:p-20 border border-white/10 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Studio Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green/10 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Product Object Left: 9:16 Vertical Render Preview Frame */}
          <motion.div
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, x: -30, rotate: -4 }}
            whileInView={shouldReduce ? { opacity: 1 } : { opacity: 0.9, x: 0, rotate: -4 }}
            viewport={{ once: true }}
            transition={{ duration: motionTokens.duration.spatial }}
            className="hidden xl:block absolute left-10 top-1/2 -translate-y-1/2 w-44 aspect-[9/16] rounded-xl bg-ink-pure border border-white/15 p-3 shadow-xl select-none pointer-events-none"
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mb-2">
              <span className="text-butter font-bold">1080×1920</span>
              <span>0:42</span>
            </div>
            <div className="h-full flex flex-col justify-between pb-6">
              <div className="h-8 w-8 rounded-full bg-coral/80 text-white flex items-center justify-center mx-auto my-auto shadow-md">
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              </div>
              <div className="p-2 rounded bg-black/60 border border-white/10 text-[10px] text-white/90 font-medium text-center">
                "Stop scrolling if you write code."
              </div>
            </div>
          </motion.div>

          {/* Floating Product Object Right: Studio Pipeline Telemetry */}
          <motion.div
            initial={shouldReduce ? { opacity: 1 } : { opacity: 0, x: 30, rotate: 4 }}
            whileInView={shouldReduce ? { opacity: 1 } : { opacity: 0.9, x: 0, rotate: 4 }}
            viewport={{ once: true }}
            transition={{ duration: motionTokens.duration.spatial, delay: 0.1 }}
            className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 w-48 rounded-xl bg-ink-pure border border-white/15 p-3.5 shadow-xl select-none pointer-events-none space-y-2.5 text-left"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <span>FFmpeg Dual-Pass Ready</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-white/60 block">Subtitle Preset:</span>
              <span className="text-xs font-semibold text-white block">Clean Editorial</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-white/60 block">Audio Normalization:</span>
              <span className="text-xs font-semibold text-white block">-14 LUFS Stereo</span>
            </div>
          </motion.div>

          {/* Center Call to Action Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-medium text-butter">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Independent Creative Studio</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Give every idea <br />
              <span className="font-editorial italic font-normal text-butter">
                its next frame.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-canvas/70 max-w-lg mx-auto leading-relaxed text-balance">
              Stop switching between five disconnected AI tools. Direct scripts, neural voiceovers, vertical scenes, and YouTube Shorts from one cohesive studio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/signup"
                className="btn-primary h-12 px-8 text-sm w-full sm:w-auto justify-center"
              >
                <span>Start creating free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onDemoClick}
                className="h-12 px-6 rounded-md bg-white/10 text-white font-medium text-sm hover:bg-white/15 transition-all border border-white/20 w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current text-coral" />
                <span>Explore Studio Tour</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-canvas/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-coral" /> Free community plan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-coral" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-coral" /> Real FFmpeg outputs
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
