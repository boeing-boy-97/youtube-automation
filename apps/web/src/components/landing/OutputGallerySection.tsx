import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Film,
  Clock,
  TrendingUp,
  Volume2,
  X,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface VideoSample {
  id: string;
  title: string;
  hook: string;
  category: string;
  duration: string;
  wordCount: number;
  retention: string;
  voice: string;
  gradient: string;
  scriptSnippet: string;
}

const GALLERY_SAMPLES: VideoSample[] = [
  {
    id: 'sample_01',
    title: 'The 3 Flags That Make Claude 3.7 Code Like a Senior Dev',
    hook: 'Stop scrolling if you write Python or TypeScript.',
    category: 'Developer Tools',
    duration: '0:42',
    wordCount: 112,
    retention: '78%',
    voice: 'Adam (ElevenLabs)',
    gradient: 'from-emerald-950 via-slate-900 to-black',
    scriptSnippet:
      'Stop scrolling if you write code. Most developers prompt Claude like it is 2023, asking general questions. But if you activate the architectural reasoning flag and constrain output tokens to strict diff blocks, your debugging time drops by 80%. Here is the exact parameter.',
  },
  {
    id: 'sample_02',
    title: 'Why 1-Person Micro-SaaS Startups Hit $1M in 2026',
    hook: 'You no longer need 10 engineers to build scalable software.',
    category: 'Business Automation',
    duration: '0:38',
    wordCount: 98,
    retention: '74%',
    voice: 'Rachel (ElevenLabs)',
    gradient: 'from-slate-950 via-teal-950 to-black',
    scriptSnippet:
      'You no longer need a 10-person dev team to hit seven figures. Modern solopreneurs run automated outbox queues, serverless edge workers, and AI customer reconciliation. One creator manages 4 micro-products without touching customer tickets.',
  },
  {
    id: 'sample_03',
    title: 'Stop Storing Passwords with bcrypt in 2026',
    hook: 'Your database might be failing modern security audits right now.',
    category: 'Cybersecurity',
    duration: '0:44',
    wordCount: 120,
    retention: '81%',
    voice: 'Antoni (ElevenLabs)',
    gradient: 'from-zinc-950 via-stone-900 to-black',
    scriptSnippet:
      'If your backend still hashes passwords with bcrypt, your authentication layer is vulnerable to GPU-accelerated dictionary attacks. Modern standards require Argon2id with at least 64 megabytes of memory cost. Here is the migration in 2 steps.',
  },
  {
    id: 'sample_04',
    title: 'How Neural Video Renderers Beat Traditional Editors',
    hook: 'Why spend 6 hours in Premiere when FFmpeg renders in 20 seconds?',
    category: 'Video Engineering',
    duration: '0:36',
    wordCount: 94,
    retention: '76%',
    voice: 'Adam (ElevenLabs)',
    gradient: 'from-emerald-900 via-ink to-slate-950',
    scriptSnippet:
      'Why spend six hours keyframing captions when dual-pass FFmpeg compiles 60 FPS vertical video with sub-pixel alignment in 20 seconds? Here is how automated outbox pipelines render broadcast-grade shorts on demand.',
  },
];

export function OutputGallerySection() {
  const [inspectedSample, setInspectedSample] = useState<VideoSample | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-subtle border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono mb-3">
              <Film className="h-3.5 w-3.5" />
              <span>Curated Deliverables</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
              Sample video outputs.
            </h2>
            <p className="text-base sm:text-lg text-stone-muted mt-3 leading-relaxed">
              Explore actual vertical short-form productions compiled with ShortForge's automated FFmpeg and neural audio pipeline.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-muted bg-paper px-3 py-1.5 rounded-lg border border-paper-border shrink-0">
            1080×1920 60 FPS • Real Render Examples
          </span>
        </div>

        {/* 4-Card Vertical Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => setInspectedSample(sample)}
              className="bg-paper border border-paper-border rounded-2xl p-4 space-y-4 hover:border-forest/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              {/* 9:16 Vertical Video Poster Frame */}
              <div
                className={cn(
                  'aspect-[9/16] rounded-xl bg-gradient-to-b border border-paper-border p-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-200',
                  sample.gradient
                )}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="bg-ink/80 text-lime px-2 py-0.5 rounded border border-ink-border">
                    {sample.category}
                  </span>
                  <span className="bg-ink/80 text-paper px-2 py-0.5 rounded border border-ink-border">
                    {sample.duration}
                  </span>
                </div>

                {/* Center play icon overlay on hover */}
                <div className="my-auto text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-paper/20 backdrop-blur-sm text-paper flex items-center justify-center mx-auto group-hover:bg-lime group-hover:text-ink transition-colors shadow-lg">
                    <Play className="h-5 w-5 ml-0.5 fill-current" />
                  </div>
                  <p className="text-xs font-bold text-paper text-balance drop-shadow-md px-2">
                    "{sample.hook}"
                  </p>
                </div>

                {/* Bottom stats */}
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-muted pt-2 border-t border-paper-border/20">
                  <span className="text-lime flex items-center gap-1 font-bold">
                    <TrendingUp className="h-3 w-3" /> {sample.retention} Retention
                  </span>
                  <span className="text-paper">{sample.wordCount} words</span>
                </div>
              </div>

              {/* Title & Metadata Details */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-ink group-hover:text-forest transition-colors line-clamp-2">
                  {sample.title}
                </h4>
                <div className="flex items-center justify-between text-xs font-mono text-stone-muted pt-2 border-t border-paper-border/60">
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-forest" />
                    {sample.voice.split(' ')[0]}
                  </span>
                  <span className="text-forest font-semibold flex items-center gap-0.5">
                    Inspect <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Inspection Modal */}
        {inspectedSample && (
          <Dialog open={!!inspectedSample} onClose={() => setInspectedSample(null)} size="lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-forest" />
                <DialogTitle>{inspectedSample.title}</DialogTitle>
              </div>
              <DialogDescription>
                {inspectedSample.category} • Runtime: {inspectedSample.duration} • Predicted Retention: {inspectedSample.retention}
              </DialogDescription>
            </DialogHeader>

            <DialogContent className="space-y-4">
              <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-2">
                <span className="text-xs font-mono font-bold text-forest uppercase">Full Narration Script</span>
                <p className="text-sm text-ink leading-relaxed">
                  {inspectedSample.scriptSnippet}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 rounded-lg border border-paper-border bg-paper">
                  <span className="text-stone-muted block">DURATION</span>
                  <span className="text-ink font-bold">{inspectedSample.duration}</span>
                </div>
                <div className="p-3 rounded-lg border border-paper-border bg-paper">
                  <span className="text-stone-muted block">WORDS</span>
                  <span className="text-ink font-bold">{inspectedSample.wordCount} words</span>
                </div>
                <div className="p-3 rounded-lg border border-paper-border bg-paper">
                  <span className="text-stone-muted block">VOICE MODEL</span>
                  <span className="text-ink font-bold">{inspectedSample.voice}</span>
                </div>
                <div className="p-3 rounded-lg border border-paper-border bg-paper">
                  <span className="text-stone-muted block">FFMPEG STATUS</span>
                  <span className="text-forest font-bold">1080×1920 60fps</span>
                </div>
              </div>
            </DialogContent>

            <DialogFooter>
              <Button onClick={() => setInspectedSample(null)}>Close Inspector</Button>
            </DialogFooter>
          </Dialog>
        )}
      </div>
    </section>
  );
}
