import { useState } from 'react';
import {
  Play,
  Film,
  Clock,
  Volume2,
  X,
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
  pacing: string;
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
    pacing: '160 WPM',
    voice: 'Adam (ElevenLabs)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    scriptSnippet:
      'Stop scrolling if you write code. Most developers prompt Claude like it is 2023, asking general questions. But if you activate the architectural reasoning flag and constrain output tokens to strict diff blocks, your debugging time drops significantly. Here is the exact parameter.',
  },
  {
    id: 'sample_02',
    title: 'Why 1-Person Micro-SaaS Startups Hit Scale in 2026',
    hook: 'You no longer need 10 engineers to build scalable software.',
    category: 'Architecture',
    duration: '0:38',
    wordCount: 98,
    pacing: '155 WPM',
    voice: 'Rachel (ElevenLabs)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    scriptSnippet:
      'You no longer need a 10-person dev team to operate scalable services. Modern solopreneurs run automated outbox queues, serverless edge workers, and AI customer reconciliation.',
  },
  {
    id: 'sample_03',
    title: 'Stop Storing Passwords with bcrypt in 2026',
    hook: 'Your database might be failing modern security audits right now.',
    category: 'Security',
    duration: '0:44',
    wordCount: 120,
    pacing: '163 WPM',
    voice: 'Antoni (ElevenLabs)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    scriptSnippet:
      'If your backend still hashes passwords with bcrypt, your authentication layer is vulnerable to GPU-accelerated dictionary attacks. Modern standards require Argon2id with memory cost protection.',
  },
  {
    id: 'sample_04',
    title: 'How Neural Video Renderers Beat Traditional Editors',
    hook: 'Why spend 6 hours in Premiere when FFmpeg renders in seconds?',
    category: 'Media Engineering',
    duration: '0:36',
    wordCount: 94,
    pacing: '157 WPM',
    voice: 'Adam (ElevenLabs)',
    gradient: 'from-stone-900 via-stone-800 to-black',
    scriptSnippet:
      'Why spend six hours keyframing captions when dual-pass FFmpeg compiles vertical video with sub-pixel alignment in seconds? Here is how automated outbox pipelines render broadcast-grade shorts on demand.',
  },
];

export function OutputGallerySection() {
  const [inspectedSample, setInspectedSample] = useState<VideoSample | null>(null);

  return (
    <section id="output" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-vermilion">
              Sample Deliverables
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Sample video outputs <br />
              <span className="font-editorial italic font-normal text-vermilion">from real pipelines.</span>
            </h2>
            <p className="text-base text-stone leading-relaxed">
              Every video below was synthesized from a text premise using ShortForge’s script generator, neural voiceover, and server-side FFmpeg rendering.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-muted shrink-0">1080×1920 • 9:16 Vertical</span>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GALLERY_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => setInspectedSample(sample)}
              className="group bg-surface rounded-lg border border-border overflow-hidden hover:border-vermilion/50 transition-all cursor-pointer shadow-xs flex flex-col"
            >
              {/* Vertical Card Preview */}
              <div className={cn('aspect-[9/16] p-4 flex flex-col justify-between text-white relative bg-gradient-to-b', sample.gradient)}>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs text-marigold">
                    {sample.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/50 text-white/70">
                    {sample.duration}
                  </span>
                </div>

                {/* Middle Play Button Overlay */}
                <div className="my-auto text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-vermilion/90 text-white mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                  <span className="text-[11px] font-medium text-white/80 block">
                    Inspect Composition
                  </span>
                </div>

                {/* Bottom Hook & Specs */}
                <div className="space-y-2">
                  <p className="text-xs font-bold leading-snug line-clamp-2 text-white">
                    "{sample.hook}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60 border-t border-white/10 pt-1.5">
                    <span>{sample.pacing}</span>
                    <span>{sample.wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-3.5 space-y-1 bg-surface border-t border-border flex-1 flex flex-col justify-between">
                <h3 className="text-xs font-semibold text-ink line-clamp-2 leading-snug">
                  {sample.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-stone-muted pt-2 border-t border-border">
                  <span>{sample.voice}</span>
                  <span className="text-vermilion font-medium group-hover:underline">Details &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspect Dialog */}
      <Dialog open={!!inspectedSample} onClose={() => setInspectedSample(null)} size="xl">
        {inspectedSample && (
          <div>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-vermilion uppercase">
                  {inspectedSample.category}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs text-stone font-mono">{inspectedSample.duration}</span>
              </div>
              <DialogTitle>
                {inspectedSample.title}
              </DialogTitle>
              <DialogDescription>
                Generated screenplay composition and narration metrics.
              </DialogDescription>
            </DialogHeader>

            <DialogContent className="space-y-4">
              <div className="p-3.5 rounded-md bg-canvas-subtle border border-border space-y-1">
                <span className="text-[11px] font-mono font-bold text-vermilion uppercase block">
                  Opening Hook
                </span>
                <p className="text-xs font-medium text-ink">
                  "{inspectedSample.hook}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone uppercase tracking-wide font-mono">
                  Full Narration Script
                </span>
                <div className="p-3 rounded-md bg-canvas-subtle border border-border text-xs text-ink leading-relaxed font-mono">
                  {inspectedSample.scriptSnippet}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Voice Engine:</span>
                  <span className="font-medium text-ink">{inspectedSample.voice}</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Word Target:</span>
                  <span className="font-medium text-ink">{inspectedSample.wordCount} words ({inspectedSample.pacing})</span>
                </div>
                <div className="p-2.5 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[11px]">Format:</span>
                  <span className="font-medium text-ink">1080×1920 MP4</span>
                </div>
              </div>
            </DialogContent>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setInspectedSample(null)} className="btn-secondary text-xs">
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </section>
  );
}
