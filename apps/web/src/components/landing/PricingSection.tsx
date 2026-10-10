import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for independent creators testing automated workflows.',
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        '5 automated videos / month',
        '720p HD composite rendering',
        '1 connected YouTube channel',
        '3-act vertical script engine',
        'Community support',
      ],
      cta: 'Start Free',
      ctaClass: 'btn-secondary',
    },
    {
      name: 'Creator',
      description: 'For serious creators publishing daily high-retention shorts.',
      priceMonthly: 29,
      priceAnnual: 24,
      popular: true,
      badge: 'RECOMMENDED FOR CREATORS',
      features: [
        '50 automated videos / month',
        '1080×1920 60 FPS Full HD rendering',
        '3 connected YouTube channels',
        'ElevenLabs broadcast neural voices',
        'Priority BullMQ rendering queues',
        'Full retention analytics sync',
        'Assisted & Scheduled auto-publish',
      ],
      cta: 'Start Creator Free Trial',
      ctaClass: 'bg-ink text-lime hover:bg-ink-surface',
    },
    {
      name: 'Pro Studio',
      description: 'For media studios, agencies, and high-volume automated channels.',
      priceMonthly: 79,
      priceAnnual: 64,
      popular: false,
      features: [
        'Unlimited video generations',
        'Hands-free Autonomous publishing mode',
        '4K Ultra HD FFmpeg render profiles',
        'Unlimited YouTube channels',
        'REST API & Webhook integration',
        'Custom brand watermark & caption presets',
        'Dedicated SLA & direct engineering support',
      ],
      cta: 'Get Pro Studio',
      ctaClass: 'btn-secondary',
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-subtle border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Predictable plans. Zero hidden fees.
          </h2>
          <p className="text-base sm:text-lg text-stone-muted leading-relaxed">
            Start free on our community tier. Upgrade when your channel is ready for high-frequency daily production.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-paper border border-paper-border rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                billingCycle === 'monthly' ? 'bg-ink text-paper shadow-sm' : 'text-stone-muted hover:text-ink'
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                billingCycle === 'annual' ? 'bg-ink text-paper shadow-sm' : 'text-stone-muted hover:text-ink'
              )}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-lime text-ink text-[10px] font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.name}
                className={cn(
                  'rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative',
                  plan.popular
                    ? 'bg-ink text-paper border-2 border-forest shadow-2xl scale-[1.02]'
                    : 'bg-paper text-ink border border-paper-border shadow-xs'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-8 px-3 py-1 rounded-full bg-lime text-ink text-[11px] font-mono font-bold tracking-wider uppercase shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={cn('text-2xl font-bold', plan.popular ? 'text-paper' : 'text-ink')}>
                      {plan.name}
                    </h3>
                    <p className={cn('text-xs mt-1.5 leading-relaxed', plan.popular ? 'text-stone-muted' : 'text-stone-muted')}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={cn('text-4xl sm:text-5xl font-mono font-bold tracking-tight', plan.popular ? 'text-lime' : 'text-ink')}>
                      ${price}
                    </span>
                    <span className={cn('text-sm font-mono', plan.popular ? 'text-stone-muted' : 'text-stone-muted')}>
                      /month {billingCycle === 'annual' && price > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  <div className={cn('h-px w-full', plan.popular ? 'bg-ink-border' : 'bg-paper-border')} />

                  {/* Feature checklist */}
                  <ul className="space-y-3 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className={cn('h-4 w-4 shrink-0 mt-0.5', plan.popular ? 'text-lime' : 'text-forest')} />
                        <span className={plan.popular ? 'text-stone-subtle' : 'text-ink'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to={`/signup?plan=${plan.name.toLowerCase()}`}
                    className={cn(
                      'w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150',
                      plan.popular
                        ? 'bg-lime text-ink hover:bg-lime-hover shadow-md font-bold'
                        : 'bg-ink text-paper hover:bg-ink-surface'
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
