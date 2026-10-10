import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { seedContent, seedIdeas, seedNotifications, seedYouTubeChannel } from '../mock/seedData';
import { storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Play as YoutubeIcon,
  Target,
  Layers,
  Sliders,
  Mic,
  Palette,
  Calendar,
  Zap,
  Rocket,
  Check,
  Loader2,
  Play,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ONBOARDING_STEPS = [
  { key: 'welcome', label: 'Welcome', icon: Sparkles },
  { key: 'channel', label: 'Connect YouTube', icon: YoutubeIcon },
  { key: 'strategy', label: 'Channel Strategy', icon: Target },
  { key: 'content', label: 'Content Pillars', icon: Layers },
  { key: 'rules', label: 'Content Rules', icon: Sliders },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'brand', label: 'Brand', icon: Palette },
  { key: 'publishing', label: 'Publishing', icon: Calendar },
  { key: 'automation', label: 'Automation', icon: Zap },
  { key: 'complete', label: 'Complete', icon: Rocket },
];

const CONTENT_PILLARS_OPTIONS = [
  'Educational', 'Entertainment', 'Motivation', 'Technology', 'Business',
  'Fitness', 'Facts', 'Storytelling', 'News', 'Tutorials', 'AI Tools', 'AI News', 'Coding', 'Career',
];

const TONE_OPTIONS = ['Professional', 'Casual', 'Energetic', 'Calm', 'Dramatic', 'Humorous'];
const HOOK_OPTIONS = ['Question', 'Shocking Stat', 'Story', 'Contrarian', 'How-to', 'List'];
const CTA_OPTIONS = ['Subscribe', 'Like & Follow', 'Comment', 'Watch Next', 'Link in Bio'];

export function Onboarding() {
  const navigate = useNavigate();
  const { step } = useParams();
  const { workspace, createWorkspace, setOnboardingComplete, connectYouTube, youtubeChannel } = useWorkspaceStore();
  const initContent = useContentStore(s => s.init);
  const showToast = useUIStore(s => s.showToast);

  const [currentStep, setCurrentStep] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Form state
  const [form, setForm] = useState({
    channelName: workspace?.channelName || 'AI Explained',
    channelUrl: workspace?.channelUrl || '',
    niche: workspace?.niche || 'AI Technology',
    targetAudience: workspace?.targetAudience || 'Tech-curious students and professionals',
    primaryLanguage: workspace?.primaryLanguage || 'en',
    country: workspace?.country || 'India',
    pillars: workspace?.pillars?.map(p => p.name) || ['AI Tools', 'Tutorials', 'AI News'],
    customPillar: '',
    videoLengthMin: 30,
    videoLengthMax: 60,
    postingFrequency: 5,
    dailyLimit: 1,
    postingDays: [1, 2, 3, 4, 5],
    hookStyle: 'question',
    ctaStyle: 'subscribe',
    tone: 'professional',
    vocabularyLevel: 'intermediate',
    voiceProvider: 'elevenlabs',
    voice: 'Antoni',
    voiceLanguage: 'en',
    voiceSpeed: 1,
    voicePitch: 1,
    brandName: workspace?.brand?.name || 'AI Explained',
    primaryAccent: '#EC5A3A',
    captionStyle: 'bold',
    captionPosition: 'bottom',
    font: 'Inter',
    publishTimes: ['19:30'],
    timezone: 'Asia/Kolkata',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
    autoPublish: false,
    approvalRequired: true,
    automationMode: 'assisted' as 'manual' | 'assisted' | 'autonomous',
  });

  useEffect(() => {
    const stepIdx = step ? ONBOARDING_STEPS.findIndex(s => s.key === step) : 0;
    setCurrentStep(Math.max(0, stepIdx === -1 ? 0 : stepIdx));
  }, [step]);

  const update = (data: Partial<typeof form>) => setForm(prev => ({ ...prev, ...data }));

  const togglePillar = (pillar: string) => {
    if (form.pillars.includes(pillar)) {
      update({ pillars: form.pillars.filter(p => p !== pillar) });
    } else {
      update({ pillars: [...form.pillars, pillar] });
    }
  };

  const addCustomPillar = () => {
    if (form.customPillar.trim() && !form.pillars.includes(form.customPillar.trim())) {
      update({ pillars: [...form.pillars, form.customPillar.trim()], customPillar: '' });
    }
  };

  const toggleDay = (day: number) => {
    if (form.postingDays.includes(day)) {
      update({ postingDays: form.postingDays.filter(d => d !== day) });
    } else {
      update({ postingDays: [...form.postingDays, day] });
    }
  };

  const goToStep = (idx: number) => {
    navigate(`/onboarding/${ONBOARDING_STEPS[idx].key}`);
  };

  const next = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
    else navigate('/');
  };

  const handleConnectYouTube = async () => {
    setConnecting(true);
    try {
      await connectYouTube();
    } catch (err: any) {
      showToast({
        type: 'warning',
        title: 'OAuth Credentials Required',
        message: err.message || 'Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to link your YouTube channel.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const playVoicePreview = () => {
    setVoicePlaying(true);
    setTimeout(() => setVoicePlaying(false), 3000);
  };

  const handleLaunch = async () => {
    setLaunching(true);

    // Create workspace with all settings
    const pillars = form.pillars.map((name, i) => ({ id: `pillar_${i}`, name }));

    createWorkspace({
      channelName: form.channelName,
      channelUrl: form.channelUrl || undefined,
      niche: form.niche,
      targetAudience: form.targetAudience,
      primaryLanguage: form.primaryLanguage,
      country: form.country,
      pillars,
      contentRules: {
        videoLength: { min: form.videoLengthMin, max: form.videoLengthMax },
        postingFrequency: form.postingFrequency,
        postingDays: form.postingDays,
        dailyLimit: form.dailyLimit,
        hookStyle: form.hookStyle,
        ctaStyle: form.ctaStyle,
        tone: form.tone,
        vocabularyLevel: form.vocabularyLevel,
      },
      voice: {
        provider: form.voiceProvider,
        voice: form.voice,
        language: form.voiceLanguage,
        speed: form.voiceSpeed,
        pitch: form.voicePitch,
      },
      brand: {
        name: form.brandName,
        primaryAccent: form.primaryAccent,
        captionStyle: form.captionStyle,
        captionPosition: form.captionPosition,
        font: form.font,
      },
      publishing: {
        publishTimes: form.publishTimes,
        timezone: form.timezone,
        visibility: form.visibility,
        autoPublish: form.autoPublish,
        approvalRequired: form.approvalRequired,
      },
      automationMode: form.automationMode,
    });

    // Seed demo data
    storageSet(STORAGE_KEYS.content, seedContent());
    storageSet(STORAGE_KEYS.ideas, seedIdeas());
    storageSet(STORAGE_KEYS.notifications, seedNotifications());
    storageSet(STORAGE_KEYS.youtube, seedYouTubeChannel());

    setOnboardingComplete();
    initContent();

    await new Promise(r => setTimeout(r, 1500));
    setLaunching(false);
    showToast({ type: 'success', title: 'Content engine launched', message: 'Welcome to ShortForge' });
    navigate('/dashboard');
  };

  const progress = ((currentStep) / (ONBOARDING_STEPS.length - 1)) * 100;

  const renderStep = () => {
    switch (ONBOARDING_STEPS[currentStep].key) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-page-title text-text-primary mb-3">Welcome to ShortForge</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
              Your autonomous content operating system. Set your strategy once, then let the engine produce and publish Shorts while you focus on creating.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
              {[
                { icon: Zap, title: 'Autonomous', desc: 'Idea to publish' },
                { icon: Target, title: 'On-brand', desc: 'Every video matches' },
                { icon: BarChart3, title: 'Learning', desc: 'Gets better daily' },
              ].map(f => (
                <div key={f.title} className="p-3 rounded-lg border border-border bg-surface">
                  <f.icon className="h-5 w-5 text-accent mb-2" />
                  <div className="text-sm font-semibold text-text-primary">{f.title}</div>
                  <div className="text-xs text-text-muted">{f.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted">Setup takes about 3 minutes</p>
          </div>
        );

      case 'channel':
        return (
          <div className="py-4">
            <h2 className="text-section-title text-text-primary mb-2">Connect YouTube</h2>
            <p className="text-sm text-text-secondary mb-6">Link your channel to enable publishing and analytics sync.</p>

            <Card className="p-6">
              {!youtubeChannel || youtubeChannel.connectionStatus === 'disconnected' ? (
                <div className="text-center py-8">
                  <YoutubeIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-primary font-medium mb-2">No channel connected</p>
                  <p className="text-sm text-text-muted mb-6">Connect your YouTube channel to start publishing</p>
                  <Button onClick={handleConnectYouTube} loading={connecting}>
                    <YoutubeIcon className="h-4 w-4" />
                    {connecting ? 'Initiating OAuth...' : 'Connect YouTube Channel'}
                  </Button>
                  <p className="text-xs text-text-muted mt-4">
                    Optional during onboarding. You can connect your channel at any time in the YouTube portal.
                  </p>
                </div>
              ) : youtubeChannel.connectionStatus === 'connected' ? (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center">
                    <YoutubeIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">{youtubeChannel.title}</p>
                    <p className="text-sm text-text-muted">{youtubeChannel.subscriberCount?.toLocaleString()} subscribers</p>
                  </div>
                  <Badge variant="success" dot>Connected</Badge>
                </div>
              ) : null}
            </Card>

            <p className="text-xs text-text-muted mt-4 text-center">Direct Google OAuth 2.0 authorization with encrypted token storage.</p>
          </div>
        );

      case 'strategy':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Channel Strategy</h2>
              <p className="text-sm text-text-secondary">Tell us about your channel.</p>
            </div>
            <Input label="Channel Name" value={form.channelName} onChange={e => update({ channelName: e.target.value })} />
            <Input label="Channel URL (optional)" value={form.channelUrl} onChange={e => update({ channelUrl: e.target.value })} placeholder="https://youtube.com/@..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Niche" value={form.niche} onChange={e => update({ niche: e.target.value })} />
              <Input label="Country" value={form.country} onChange={e => update({ country: e.target.value })} />
            </div>
            <Input label="Target Audience" value={form.targetAudience} onChange={e => update({ targetAudience: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Primary Language" value={form.primaryLanguage} onChange={e => update({ primaryLanguage: e.target.value })} />
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Content Pillars</h2>
              <p className="text-sm text-text-secondary">Select the content categories for your channel.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTENT_PILLARS_OPTIONS.map(pillar => (
                <button
                  key={pillar}
                  onClick={() => togglePillar(pillar)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm border transition-colors',
                    form.pillars.includes(pillar)
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-surface border-border text-text-secondary hover:border-border-strong'
                  )}
                >
                  {form.pillars.includes(pillar) && <Check className="h-3 w-3 inline mr-1" />}
                  {pillar}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom pillar..."
                value={form.customPillar}
                onChange={e => update({ customPillar: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPillar())}
              />
              <Button variant="secondary" onClick={addCustomPillar}>Add</Button>
            </div>
            {form.pillars.length > 0 && (
              <div>
                <p className="label mb-2">Selected Pillars ({form.pillars.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.pillars.map(p => (
                    <Badge key={p} variant="accent">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'rules':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Content Rules</h2>
              <p className="text-sm text-text-secondary">Configure how your content is produced.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1.5 block">Min Duration (seconds)</label>
                <input type="number" className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.videoLengthMin} onChange={e => update({ videoLengthMin: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label mb-1.5 block">Max Duration (seconds)</label>
                <input type="number" className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.videoLengthMax} onChange={e => update({ videoLengthMax: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label mb-1.5 block">Videos Per Week</label>
                <input type="number" className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" min={1} max={21} value={form.postingFrequency} onChange={e => update({ postingFrequency: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label mb-1.5 block">Daily Limit</label>
                <input type="number" className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" min={1} max={10} value={form.dailyLimit} onChange={e => update({ dailyLimit: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="label mb-2 block">Posting Days</label>
              <div className="flex gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={cn(
                      'h-9 w-9 rounded-md text-sm font-medium border transition-colors',
                      form.postingDays.includes(i)
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface text-text-secondary border-border hover:border-border-strong'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1.5 block">Hook Style</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.hookStyle} onChange={e => update({ hookStyle: e.target.value })}>
                  {HOOK_OPTIONS.map(h => <option key={h} value={h.toLowerCase()}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1.5 block">CTA Style</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.ctaStyle} onChange={e => update({ ctaStyle: e.target.value })}>
                  {CTA_OPTIONS.map(c => <option key={c} value={c.toLowerCase().replace(/[^a-z]/g, '_')}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1.5 block">Tone</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.tone} onChange={e => update({ tone: e.target.value })}>
                  {TONE_OPTIONS.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1.5 block">Vocabulary</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.vocabularyLevel} onChange={e => update({ vocabularyLevel: e.target.value })}>
                  <option value="simple">Simple</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Voice Configuration</h2>
              <p className="text-sm text-text-secondary">Choose the voice for your videos.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Antoni', 'Rachel', 'Josh', 'Sarah', 'Adam', 'Bella'].map(v => (
                <button
                  key={v}
                  onClick={() => update({ voice: v })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors flex items-center gap-3',
                    form.voice === v ? 'border-accent bg-accent-soft/40' : 'border-border bg-surface hover:border-border-strong'
                  )}
                >
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', form.voice === v ? 'bg-accent text-white' : 'bg-surface-subtle text-text-muted')}>
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{v}</div>
                    <div className="text-xs text-text-muted">{['Male', 'Female'][Math.abs(v.charCodeAt(0) - 'A'.charCodeAt(0)) % 2]} voice</div>
                  </div>
                </button>
              ))}
            </div>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={playVoicePreview} disabled={voicePlaying}>
                  {voicePlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {voicePlaying ? 'Playing...' : 'Preview'}
                </Button>
                <div className="flex-1 h-8 flex items-center gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 rounded-full bg-accent/30 transition-all duration-200',
                        voicePlaying ? 'bg-accent' : ''
                      )}
                      style={{
                        height: voicePlaying
                          ? `${Math.random() * 80 + 20}%`
                          : `${20 + Math.sin(i * 0.5) * 15}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2">This is a simulated voice preview.</p>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1.5 block">Speed ({form.voiceSpeed.toFixed(1)}x)</label>
                <input type="range" min={0.5} max={2} step={0.1} value={form.voiceSpeed} onChange={e => update({ voiceSpeed: Number(e.target.value) })} className="w-full accent-accent" />
              </div>
              <div>
                <label className="label mb-1.5 block">Pitch ({form.voicePitch.toFixed(1)})</label>
                <input type="range" min={0.5} max={2} step={0.1} value={form.voicePitch} onChange={e => update({ voicePitch: Number(e.target.value) })} className="w-full accent-accent" />
              </div>
            </div>
          </div>
        );

      case 'brand':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Brand Kit</h2>
              <p className="text-sm text-text-secondary">Configure your visual identity.</p>
            </div>
            <Input label="Brand Name" value={form.brandName} onChange={e => update({ brandName: e.target.value, channelName: form.channelName || e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1.5 block">Primary Accent Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.primaryAccent} onChange={e => update({ primaryAccent: e.target.value })} className="h-9 w-12 rounded-md border border-border cursor-pointer" />
                  <input type="text" className="input-base flex-1" value={form.primaryAccent} onChange={e => update({ primaryAccent: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label mb-1.5 block">Caption Style</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.captionStyle} onChange={e => update({ captionStyle: e.target.value })}>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                  <option value="karaoke">Karaoke</option>
                  <option value="highlight">Highlight</option>
                  <option value="clean">Clean</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label mb-1.5 block">Caption Position</label>
              <div className="flex gap-2">
                {['top', 'center', 'bottom'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => update({ captionPosition: pos })}
                    className={cn(
                      'flex-1 py-2 rounded-md text-sm font-medium border capitalize transition-colors',
                      form.captionPosition === pos ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface border-border text-text-secondary hover:border-border-strong'
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'publishing':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Publishing Settings</h2>
              <p className="text-sm text-text-secondary">Configure when and how your videos go live.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label mb-1.5 block">Timezone</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.timezone} onChange={e => update({ timezone: e.target.value })}>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
              <div>
                <label className="label mb-1.5 block">Visibility</label>
                <select className="h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20" value={form.visibility} onChange={e => update({ visibility: e.target.value as 'public' | 'unlisted' | 'private' })}>
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label mb-2 block">Publish Time</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-muted" />
                <input type="time" className="input-base flex-1" value={form.publishTimes[0]} onChange={e => update({ publishTimes: [e.target.value] })} />
              </div>
              <p className="text-xs text-text-muted mt-1.5">Your audience is most active around 7:30–9:00 PM.</p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.approvalRequired} onChange={e => update({ approvalRequired: e.target.checked })} className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
                <div>
                  <div className="text-sm font-medium text-text-primary">Require approval before publishing</div>
                  <div className="text-xs text-text-muted">Review every video before it goes live</div>
                </div>
              </label>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="py-4 space-y-4">
            <div>
              <h2 className="text-section-title text-text-primary mb-2">Automation Mode</h2>
              <p className="text-sm text-text-secondary">Choose how autonomous your engine should be.</p>
            </div>

            <div className="space-y-3">
              {[
                { mode: 'manual', title: 'Manual', desc: 'You control every step. Nothing is published automatically.', icon: Zap },
                { mode: 'assisted', title: 'Assisted', desc: 'System generates content and asks for your approval before publishing.', icon: Target, recommended: true },
                { mode: 'autonomous', title: 'Autonomous', desc: 'System generates, checks, schedules, and publishes automatically.', icon: Rocket },
              ].map(opt => (
                <button
                  key={opt.mode}
                  onClick={() => update({ automationMode: opt.mode as typeof form.automationMode })}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-colors flex items-start gap-4',
                    form.automationMode === opt.mode ? 'border-accent bg-accent-soft/40' : 'border-border bg-surface hover:border-border-strong'
                  )}
                >
                  <div className={cn('h-10 w-10 rounded-md flex items-center justify-center shrink-0', form.automationMode === opt.mode ? 'bg-accent text-white' : 'bg-surface-subtle text-text-muted')}>
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{opt.title}</span>
                      {opt.recommended && <Badge variant="accent">Recommended</Badge>}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={cn('h-5 w-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center', form.automationMode === opt.mode ? 'border-accent bg-accent' : 'border-border')}>
                    {form.automationMode === opt.mode && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            {launching ? (
              <>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                </div>
                <h2 className="text-section-title text-text-primary mb-2">Launching your engine...</h2>
                <p className="text-text-secondary">Setting up your workspace and seeding demo data</p>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-page-title text-text-primary mb-3">You're all set</h2>
                <p className="text-text-secondary max-w-md mx-auto mb-8">
                  Your content engine is configured. Demo content has been seeded so you can explore every feature immediately.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-left">
                  {[
                    { label: 'Channel', value: form.channelName },
                    { label: 'Mode', value: form.automationMode.charAt(0).toUpperCase() + form.automationMode.slice(1) },
                    { label: 'Pillars', value: `${form.pillars.length} selected` },
                    { label: 'Voice', value: form.voice },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg border border-border bg-surface">
                      <div className="text-xs text-text-muted">{item.label}</div>
                      <div className="text-sm font-medium text-text-primary truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
                <Button size="lg" onClick={handleLaunch} loading={launching}>
                  <Rocket className="h-4 w-4" />
                  Launch Content Engine
                </Button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-text-primary tracking-tight hidden sm:inline">ShortForge</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span className="hidden sm:inline">· ~3 min setup</span>
            </div>
          </div>
          <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </div>

        {/* Steps indicator */}
        <div className="hidden md:flex items-center justify-between mb-6">
          {ONBOARDING_STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={s.key} className="flex items-center">
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  done ? 'bg-accent text-white' : active ? 'bg-accent/10 text-accent ring-2 ring-accent/20' : 'bg-surface-subtle text-text-muted'
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div className={cn('h-px w-4 lg:w-8 mx-1', done ? 'bg-accent' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <Card className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 sm:p-8"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          {ONBOARDING_STEPS[currentStep].key !== 'complete' && (
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-border bg-surface-subtle">
              <Button variant="ghost" onClick={back} disabled={currentStep === 0}>
                {currentStep > 0 && <ArrowLeft className="h-4 w-4" />}
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button onClick={next} >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


