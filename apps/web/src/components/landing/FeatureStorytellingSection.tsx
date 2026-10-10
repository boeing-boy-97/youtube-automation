import { Cpu, Layers, TrendingUp, ShieldCheck, Zap, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function FeatureStorytellingSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas-subtle border-t border-border space-y-16">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Layout 1: Primary Feature Story (Orchestration Architecture) */}
        <div className="p-8 sm:p-10 rounded-xl bg-surface border border-border shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
                Architecture & Reliability
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Built as a durable production engine, <br />
                <span className="font-editorial italic font-normal text-coral">not a shallow AI wrapper.</span>
              </h3>
              <p className="text-sm sm:text-base text-stone leading-relaxed">
                ShortForge handles generation, audio processing, and rendering through background queue workers. The database remains the source of truth, jobs survive restarts, and publish operations are protected by distributed locking to prevent duplicate uploads.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                <div>
                  <span className="text-stone-muted block">Background Execution:</span>
                  <span className="font-semibold text-ink text-sm">BullMQ Worker Queues</span>
                </div>
                <div>
                  <span className="text-stone-muted block">Publishing Safety:</span>
                  <span className="font-semibold text-ink text-sm">Redis Redlock v2</span>
                </div>
              </div>
            </div>

            {/* Architecture Features */}
            <div className="lg:col-span-6 space-y-2.5">
              {[
                { title: 'Durable Outbox Pattern', desc: 'Render jobs are saved to PostgreSQL before dispatch so network hiccups never lose work.' },
                { title: 'Strict ffprobe Quality Control', desc: 'No video is marked ready until ffprobe verifies codec, resolution, and valid audio tracks.' },
                { title: 'Argon2id & Encrypted Tokens', desc: 'OAuth credentials and refresh tokens are AES-256 encrypted at rest; passwords use Argon2id.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-md bg-canvas-subtle border border-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <CheckCircle2 className="h-3.5 w-3.5 text-moss" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-stone pl-5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout 2: Editorial Split Panel (Retention Science) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
              Retention Science
            </span>
            <h4 className="text-xl font-bold text-ink">The First-3-Second Dynamic</h4>
            <p className="text-sm text-stone leading-relaxed">
              Every millisecond counts. ShortForge structures scripts to start immediately with curiosity gaps and bold claims, bypassing greeting pleasantries that cause viewers to swipe away.
            </p>
            <div className="p-3.5 rounded-md bg-canvas-subtle border border-border text-xs space-y-1">
              <span className="font-semibold text-ink block">Opening Pacing Rule:</span>
              <span className="text-stone">High-impact question or contrarian statement delivered within 12 syllables.</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
              Kinetic Typography
            </span>
            <h4 className="text-xl font-bold text-ink">Burned-in Subtitle Safe Zones</h4>
            <p className="text-sm text-stone leading-relaxed">
              Captions are automatically aligned to voiceover word timings and placed inside the verified safe area, avoiding YouTube Shorts interface buttons and title overlays.
            </p>
            <div className="p-3.5 rounded-md bg-canvas-subtle border border-border text-xs space-y-1">
              <span className="font-semibold text-ink block">Format Guarantee:</span>
              <span className="text-stone">1080×1920 MP4 with centered 80% safe zone margins.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
