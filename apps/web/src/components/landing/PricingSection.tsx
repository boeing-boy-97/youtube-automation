import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'For independent creators testing vertical video workflows.',
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        '5 automated videos / month',
        '720p HD composite rendering',
        '1 connected YouTube channel',
        '3-act vertical script engine',
        'Community documentation',
      ],
      cta: 'Start Free',
      ctaClass: 'btn-secondary',
    },
    {
      name: 'Creator',
      description: 'For active creators publishing daily short-form videos.',
      priceMonthly: 29,
      priceAnnual: 24,
      popular: true,
      badge: 'RECOMMENDED',
      features: [
        '50 automated videos / month',
        '1080×1920 Full HD rendering',
        '3 connected YouTube channels',
        'ElevenLabs neural voiceover',
        'Priority BullMQ rendering queues',
        'Assisted & Scheduled auto-publish',
      ],
      cta: 'Start Creator Trial',
      ctaClass: 'btn-primary',
    },
    {
      name: 'Pro Studio',
      description: 'For media studios, agencies, and multi-channel networks.',
      priceMonthly: 79,
      priceAnnual: 64,
      popular: false,
      features: [
        'Unlimited video generations',
        'Hands-free Autonomous publishing mode',
        'Full HD FFmpeg render profiles',
        'Unlimited YouTube channels',
        'REST API & Webhook integration',
        'Custom brand presets & watermarks',
        'Direct engineering support',
      ],
      cta: 'Get Pro Studio',
      ctaClass: 'btn-secondary',
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas-subtle border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Predictable plans. <br />
            <span className="font-editorial italic font-normal text-coral">Zero hidden fees.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            Start free on our community tier. Upgrade when your channel is ready for high-frequency daily production.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-surface border border-border rounded-lg mt-4 shadow-xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                billingCycle === 'monthly' ? 'bg-ink text-canvas font-semibold shadow-xs' : 'text-stone hover:text-ink'
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                billingCycle === 'annual' ? 'bg-ink text-canvas font-semibold shadow-xs' : 'text-stone hover:text-ink'
              )}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-coral-soft text-coral text-[10px] font-mono font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.name}
                className={cn(
                  'rounded-xl border p-6 flex flex-col justify-between transition-all relative',
                  plan.popular
                    ? 'bg-surface border-coral shadow-md ring-1 ring-coral/20'
                    : 'bg-surface border-border shadow-xs'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-coral text-white text-[10px] font-mono font-bold tracking-wide shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
                    <p className="text-xs text-stone mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold text-ink tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs text-stone font-mono">
                      / month {billingCycle === 'annual' && price > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="text-[11px] font-mono text-stone-muted uppercase font-semibold">
                      Included Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-stone">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to="/signup"
                    className={cn(
                      'w-full text-center flex items-center justify-center gap-2 h-10 rounded-md font-medium text-xs transition-all',
                      plan.ctaClass
                    )}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
