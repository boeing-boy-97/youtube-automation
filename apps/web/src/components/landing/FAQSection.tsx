import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'Do I retain full commercial copyright to all generated videos?',
    a: 'Yes. You own 100% of all scripts, audio tracks, scene graphics, and compiled MP4 deliverables produced through your ShortForge account. You are free to monetize on YouTube, cross-post to TikTok or Instagram Reels, or use them for commercial sponsorship campaigns.',
  },
  {
    q: 'How does ShortForge protect against YouTube duplicate content or spam flags?',
    a: 'ShortForge uses a multi-stage uniqueness engine: semantic deduplication compares new script concepts against your past archive using trigram similarity, while scene pacing and visual compositions are freshly generated for every video. This ensures every short is distinct and compliant with YouTube Community Guidelines.',
  },
  {
    q: 'Can I review and approve videos before they are scheduled or published?',
    a: 'Absolutely. By default, ShortForge operates in Assisted Mode. The platform discovers ideas, drafts scripts, records voices, and renders videos, then pauses at the Review checkpoint. You inspect the 9:16 preview in Video Studio, make any manual edits if desired, and approve publication with one click.',
  },
  {
    q: 'What happens if an upstream provider (OpenAI or ElevenLabs) experiences a temporary outage?',
    a: 'Our modular architecture uses transactional Outbox event tables and BullMQ retry queues with exponential backoff. If a provider call fails due to rate limits or an outage, the job is automatically retried safely. No work is lost, and failed jobs are clearly flagged on your Queue dashboard.',
  },
  {
    q: 'Can I use custom ElevenLabs voice clones or bring my own OpenAI API keys?',
    a: 'Yes. You can supply your own ElevenLabs API key in Settings to access your custom voice clones. You can also configure custom OpenAI models (e.g. GPT-4o, Claude) and S3/R2 storage buckets.',
  },
  {
    q: 'How are my Google and YouTube channel credentials secured?',
    a: 'Authentication uses official Google OAuth 2.0 with limited scopes strictly confined to uploading videos and reading channel performance. OAuth refresh tokens are encrypted at rest with AES-256-GCM and are never returned to client-side JavaScript.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper border-t border-paper-border">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Clear answers to common questions.
          </h2>
          <p className="text-base text-stone-muted leading-relaxed">
            Everything you need to know about the pipeline, commercial rights, safety, and publishing mechanics.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border transition-all duration-150 overflow-hidden',
                  isOpen
                    ? 'bg-paper-subtle border-forest/40 shadow-xs'
                    : 'bg-paper border-paper-border hover:border-paper-border-strong'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base sm:text-lg text-ink">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200',
                      isOpen ? 'bg-ink text-paper rotate-180' : 'bg-paper-muted text-stone-muted'
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-stone-muted leading-relaxed border-t border-paper-border/60 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
