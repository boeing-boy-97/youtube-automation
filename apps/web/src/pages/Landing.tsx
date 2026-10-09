import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { seedContent, seedIdeas, seedNotifications, seedYouTubeChannel } from '../mock/seedData';
import { storageSet, cn } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Video,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Play as YoutubeIcon,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useState } from 'react';

function Nav({ onDemoClick }: { onDemoClick: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-text-primary tracking-tight">ShortForge</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-text-primary transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onDemoClick} className="btn-ghost btn-sm text-text-secondary hover:text-text-primary">
            Live Demo
          </button>
          <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
          <Link to="/signup" className="btn-primary btn-sm">Start Building</Link>
        </div>
      </div>
    </nav>
  );
}

function HeroProductPreview() {
  return (
    <div className="relative mt-8 mx-auto max-w-4xl">
      <div className="absolute inset-0 bg-accent-soft/40 rounded-2xl blur-3xl" />
      <div className="relative bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Fake app header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-subtle/50">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-surface rounded-md px-3 py-1 text-xs text-text-muted flex items-center gap-2 w-64">
              <span className="text-text-muted">Command Center</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0 min-h-[340px]">
          {/* Mini sidebar */}
          <div className="col-span-2 bg-surface-subtle border-r border-border p-2 space-y-1 hidden sm:block">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-accent/10 text-accent text-xs font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Dashboard
            </div>
            {['Ideas', 'Content', 'Queue', 'Analytics'].map((l, i) => (
              <div key={i} className="px-2 py-1.5 text-xs text-text-muted">{l}</div>
            ))}
          </div>

          {/* Main content */}
          <div className="col-span-12 sm:col-span-10 p-4 space-y-3">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Published', value: '12', change: '+3', color: 'text-success' },
                { label: 'Views', value: '245K', change: '+12%', color: 'text-success' },
                { label: 'Queue', value: '8', change: '2 active', color: 'text-accent' },
                { label: 'Health', value: '96%', change: 'Healthy', color: 'text-success' },
              ].map((k, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{k.label}</div>
                  <div className="text-lg font-bold text-text-primary">{k.value}</div>
                  <div className={`text-[10px] ${k.color}`}>{k.change}</div>
                </div>
              ))}
            </div>

            {/* Pipeline */}
            <div className="bg-surface border border-border rounded-lg p-3">
              <div className="text-xs font-medium text-text-secondary mb-2">Production Pipeline</div>
              <div className="flex items-center gap-1">
                {['Idea', 'Script', 'Voice', 'Visuals', 'Edit', 'QC', 'Publish'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1 flex-1">
                    <div className={`h-6 flex-1 rounded flex items-center justify-center text-[9px] font-medium ${i < 5 ? 'bg-accent/10 text-accent' : i === 5 ? 'bg-warning/10 text-warning' : 'bg-surface-subtle text-text-muted'}`}>
                      {s}
                    </div>
                    {i < 6 && <div className="h-px w-1 bg-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Queue items */}
            <div className="space-y-1.5">
              {[
                { title: '5 AI Tools Students Should Know', stage: 'Rendering', progress: 64, status: 'bg-warning/10 text-warning' },
                { title: 'Why AI Agents Are Changing Dev', stage: 'Review', progress: 100, status: 'bg-info/10 text-info' },
                { title: '3 Free AI Tools for Developers', stage: 'Scheduled', progress: 100, status: 'bg-accent/10 text-accent' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-surface border border-border rounded-lg p-2.5">
                  <div className="h-8 w-12 rounded bg-gradient-to-br from-emerald-800 to-teal-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text-primary truncate">{item.title}</div>
                    <div className="h-1 bg-surface-subtle rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.status}`}>{item.stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="p-5 rounded-lg border border-border bg-surface hover:border-border-strong transition-colors">
      <div className="h-9 w-9 rounded-md bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

const faqs = [
  { q: 'Do I need technical skills to use ShortForge?', a: 'No. ShortForge is designed for creators. Set your strategy once and the engine handles the heavy lifting: scripts, voice, visuals, editing, and publishing.' },
  { q: 'How does autonomous publishing work?', a: 'ShortForge generates content, runs quality checks, and can automatically publish to YouTube on your schedule. You stay in control with approval gates and an emergency stop.' },
  { q: 'Will my content look generic?', a: 'Your brand kit — fonts, colors, captions, intro/outro, and voice — ensures every video matches your channel identity. The learning engine adapts to what performs for you.' },
  { q: 'Can I review before publishing?', a: 'Yes. Manual mode puts you in full control, Assisted mode requires your approval, and Autonomous mode publishes with full oversight and safety controls.' },
  { q: 'Is there a free plan?', a: 'Yes. The Starter plan lets you produce up to 5 videos per month with basic automation, forever free.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-sm font-medium text-text-primary">{q}</span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-text-secondary leading-relaxed">{a}</p>}
    </div>
  );
}

export function Landing() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const setOnboardingComplete = useWorkspaceStore(s => s.setOnboardingComplete);
  const initContent = useContentStore(s => s.init);
  const showToast = useUIStore(s => s.showToast);

  const handleExploreDemo = async () => {
    try {
      await login('demo@shortforge.io', 'demo1234');
      storageSet(STORAGE_KEYS.content, seedContent());
      storageSet(STORAGE_KEYS.ideas, seedIdeas());
      storageSet(STORAGE_KEYS.notifications, seedNotifications());
      storageSet(STORAGE_KEYS.youtube, seedYouTubeChannel());
      setOnboardingComplete();
      initContent();
      showToast({ type: 'success', title: 'Demo Mode Activated', message: 'Welcome to the ShortForge Studio' });
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav onDemoClick={handleExploreDemo} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="accent" className="mb-6">
              <Sparkles className="h-3 w-3" />
              Your content engine, running on autopilot
            </Badge>
            <h1 className="text-display text-text-primary text-balance mb-4 leading-[1.1]">
              Create once.<br />Publish every day.
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto text-balance mb-8 leading-relaxed">
              ShortForge turns your content strategy into an automated production engine.
              From idea to YouTube publishing — one platform, zero busywork.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/signup" className="btn-primary btn-lg inline-flex items-center gap-2">
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleExploreDemo}
                className="btn-secondary btn-lg inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                Explore Live Demo
              </button>
            </div>
            <p className="text-xs text-text-muted mt-4">Free Starter plan. No credit card required.</p>
          </motion.div>

          <HeroProductPreview />
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 px-6 border-t border-border bg-surface-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="default" className="mb-4">The Problem</Badge>
              <h2 className="text-section-title text-text-primary mb-4">
                Short-form content is a full-time job
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Researching topics, writing scripts, recording voiceover, designing visuals, editing, adding captions, uploading, analyzing — one short video takes hours. Post daily and it becomes unsustainable.
              </p>
              <ul className="space-y-2">
                {['Endless idea generation', 'Hours of editing per video', 'Inconsistent posting schedules', 'No time for strategy'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="h-1.5 w-1.5 rounded-full bg-error" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <Badge variant="success" className="mb-4">The Solution</Badge>
              <h3 className="text-card-title font-semibold text-text-primary mb-3">
                An autonomous operating system for Shorts
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Configure your channel once. ShortForge discovers ideas, writes scripts, generates voice and visuals, renders videos, runs quality control, and publishes on your schedule.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Brain, text: 'AI idea discovery from trends' },
                  { icon: Video, text: 'Automated video production' },
                  { icon: Calendar, text: 'Smart scheduling & publishing' },
                  { icon: BarChart3, text: 'Learning from performance' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-text-primary">
                    <item.icon className="h-4 w-4 text-accent" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">How it works</Badge>
            <h2 className="text-section-title text-text-primary mb-2">From idea to published in minutes</h2>
            <p className="text-text-secondary max-w-lg mx-auto">A complete pipeline that runs autonomously while you focus on what matters.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Configure', desc: 'Set your niche, voice, brand, and posting schedule once.' },
              { step: '02', title: 'Generate', desc: 'The engine discovers trending topics and creates scripts.' },
              { step: '03', title: 'Produce', desc: 'Voice, visuals, captions, and rendering happen automatically.' },
              { step: '04', title: 'Publish', desc: 'Quality check, schedule, and publish to YouTube. Learn from results.' },
            ].map((s, i) => (
              <div key={i} className="relative p-5 rounded-lg border border-border bg-surface">
                <div className="text-2xl font-bold text-accent/20 mb-2">{s.step}</div>
                <h3 className="font-semibold text-text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-border bg-surface-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">Features</Badge>
            <h2 className="text-section-title text-text-primary mb-2">Everything you need to scale</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Production-grade tools built for serious creators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Feature icon={Zap} title="Autonomous Production" description="Set your strategy once. Ideas, scripts, voice, visuals, and rendering run on autopilot." />
            <Feature icon={Brain} title="Idea Discovery" description="Trend analysis and pattern detection find topics before they peak." />
            <Feature icon={Video} title="Video Studio" description="Lightweight editor with timeline, captions, branding, and aspect ratio presets." />
            <Feature icon={Layers} title="Content Pipeline" description="Track every video from idea to published with a visual production pipeline." />
            <Feature icon={BarChart3} title="Performance Intelligence" description="AI-powered insights learn from your data to improve every video." />
            <Feature icon={Calendar} title="Smart Scheduling" description="Publish at the times your audience is most active. Never miss a day." />
            <Feature icon={TrendingUp} title="Learning Loop" description="Every published video makes future content better. The engine learns what works." />
            <Feature icon={Clock} title="Quality Control" description="Automated checks for resolution, audio, brand consistency, and policy risk." />
            <Feature icon={YoutubeIcon} title="YouTube Native" description="Direct publishing, scheduling, analytics sync, and channel management." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">Pricing</Badge>
            <h2 className="text-section-title text-text-primary mb-2">Start free. Scale when you grow.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { name: 'Starter', price: '$0', description: 'Get started', features: ['5 videos/month', 'Basic automation', '720p rendering', '1 channel'], cta: 'Start Free', popular: false },
              { name: 'Creator', price: '$29', description: 'For serious creators', features: ['50 videos/month', 'Full automation', '1080p rendering', '3 channels', 'Priority rendering', 'Analytics'], cta: 'Start Creator', popular: true },
              { name: 'Pro', price: '$79', description: 'For agencies', features: ['Unlimited videos', 'Autonomous mode', '4K rendering', 'Unlimited channels', 'API access', 'Custom branding'], cta: 'Start Pro', popular: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-xl border p-6 ${plan.popular ? 'border-accent bg-surface shadow-lg relative' : 'border-border bg-surface'}`}>
                {plan.popular && <Badge variant="accent" className="absolute -top-3 left-6">Most Popular</Badge>}
                <h3 className="font-semibold text-text-primary">{plan.name}</h3>
                <p className="text-sm text-text-muted mb-3">{plan.description}</p>
                <div className="text-3xl font-bold text-text-primary mb-4">{plan.price}<span className="text-base font-normal text-text-muted">/mo</span></div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={cn(plan.popular ? 'btn-primary' : 'btn-secondary', 'w-full text-center inline-flex items-center justify-center')}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="default" className="mb-4">FAQ</Badge>
            <h2 className="text-section-title text-text-primary">Frequently asked questions</h2>
          </div>
          <div className="bg-surface border border-border rounded-xl px-6">
            {faqs.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-surface border border-border rounded-2xl p-12">
            <h2 className="text-section-title text-text-primary mb-3">Ready to automate your content?</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">Set up your channel in minutes. Start publishing every day without burning out.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/signup" className="btn-primary btn-lg inline-flex items-center gap-2">
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleExploreDemo}
                className="btn-secondary btn-lg inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                Explore Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-text-primary text-sm">ShortForge</span>
            <span className="text-xs text-text-muted ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
