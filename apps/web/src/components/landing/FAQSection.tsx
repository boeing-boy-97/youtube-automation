import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
    a: 'Yes. By default, ShortForge operates in Assisted Mode. The platform discovers ideas, drafts scripts, records voices, and renders videos, then pauses at the Review checkpoint. You inspect the 9:16 preview in Video Studio, make any manual edits if desired, and approve publication with one click.',
  },
  {
    q: 'What happens if an upstream provider (OpenAI or ElevenLabs) experiences a temporary outage?',
    a: 'Our modular architecture uses transactional Outbox event tables and BullMQ retry queues with exponential backoff. If a provider call fails due to rate limits or an outage, the job is retried safely. No work is lost, and failed jobs are clearly flagged on your Queue dashboard.',
  },
  {
    q: 'Can I use custom ElevenLabs voice clones or bring my own OpenAI API keys?',
    a: 'Yes. You can supply your own ElevenLabs API key in Settings to access your custom voice clones. You can also configure custom OpenAI models and S3/R2 storage buckets in workspace settings.',
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
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Clear answers to <br />
            <span className="font-editorial italic font-normal text-coral">common questions.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            Everything you need to know about ownership, architecture, and YouTube integration.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-surface border border-border rounded-lg overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-ink hover:text-coral transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-stone shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-coral'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-stone leading-relaxed border-t border-border mt-1">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
