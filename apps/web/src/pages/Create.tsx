import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { demoEngine } from '../services/demoEngine';
import { apiClient } from '../services/apiClient';
import { cn } from '../lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Target,
  FileText,
  Mic,
  Image as ImageIcon,
  Video,
  Shield,
  Send,
  Sparkles,
  CheckCircle,
  Loader2,
  Save,
  Volume2,
  Calendar,
  Layers,
  Edit3,
  ExternalLink,
  Scissors,
} from 'lucide-react';

const STEPS = [
  { key: 'idea', label: 'Idea Concept', icon: Lightbulb },
  { key: 'strategy', label: 'Strategy & Goal', icon: Target },
  { key: 'script', label: 'Script Lab', icon: FileText },
  { key: 'voice', label: 'Voiceover', icon: Mic },
  { key: 'visuals', label: 'Visual Scenes', icon: ImageIcon },
  { key: 'edit', label: 'Video Render', icon: Video },
  { key: 'quality', label: 'Quality Control', icon: Shield },
  { key: 'publish', label: 'Publish & Schedule', icon: Send },
];

const GOALS = [
  { key: 'reach', label: 'Reach & Virality', desc: 'Maximize vertical impressions' },
  { key: 'subscribers', label: 'Audience Growth', desc: 'Convert viewers to followers' },
  { key: 'education', label: 'Deep Utility', desc: 'Teach high-value skills' },
  { key: 'engagement', label: 'High Retention', desc: 'Drive comments & bookmarks' },
];

const SUGGESTED_CONCEPTS = [
  {
    title: '5 AI Tools Engineering Teams Are Using in 2026',
    hook: 'If your dev team is still writing boilerplate by hand in 2026, stop immediately.',
    pillar: 'AI Tools',
  },
  {
    title: 'How Autonomous Video Pipelines Actually Work',
    hook: 'Here is the step-by-step architecture behind channels publishing 3 shorts a day.',
    pillar: 'Automation',
  },
  {
    title: 'Why 90% of AI Shorts Fail the Retention Test',
    hook: 'The first 3 seconds decide whether your video gets 500 views or 500,000.',
    pillar: 'Workflow Hacks',
  },
];

const VOICE_PRESETS = [
  { id: 'adam', name: 'Adam (Deep & Authoritative)', provider: 'ElevenLabs', style: 'Tech Narration' },
  { id: 'rachel', name: 'Rachel (Clear & Conversational)', provider: 'ElevenLabs', style: 'Storytelling' },
  { id: 'nicole', name: 'Nicole (Fast-Paced & Energetic)', provider: 'ElevenLabs', style: 'Shorts Hook' },
  { id: 'brian', name: 'Brian (British Documentary)', provider: 'ElevenLabs', style: 'Educational' },
];

export function Create() {
  const navigate = useNavigate();
  const workspace = useWorkspaceStore(s => s.workspace);
  const createContent = useContentStore(s => s.createContent);
  const updateContent = useContentStore(s => s.updateContent);
  const getContent = useContentStore(s => s.getContent);
  const addActivity = useContentStore(s => s.addActivity);
  const showToast = useUIStore(s => s.showToast);

  const [currentStep, setCurrentStep] = useState(0);
  const [working, setWorking] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [contentId, setContentId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    hook: '',
    niche: workspace?.niche || 'AI Technology',
    pillar: workspace?.pillars?.[0]?.name || 'AI Tools',
    audience: workspace?.targetAudience || 'Developers and creators',
    goal: 'reach' as const,
    voice: 'adam',
    publishDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    publishTime: '18:30',
    privacy: 'public' as 'public' | 'unlisted' | 'private',
  });

  const content = contentId ? getContent(contentId) : null;

  const stepCompleted = (stepKey: string): boolean => {
    if (!content) return false;
    switch (stepKey) {
      case 'idea': return true;
      case 'strategy': return true;
      case 'script': return content.script != null;
      case 'voice': return content.voiceStatus === 'ready';
      case 'visuals': return !!(content.visuals && content.visuals.length > 0 && content.visuals.every((v: { visualStatus: string }) => v.visualStatus === 'ready'));
      case 'edit': return !!(content.videoUrl || ['rendered','review','published','scheduled','approved','publishing'].includes(content.status));
      case 'quality': return content.qcStatus != null;
      case 'publish': return content.status === 'scheduled' || content.status === 'published';
      default: return false;
    }
  };

  const handleCreateFromIdea = async () => {
    setWorking(true);
    setProgressStage('Synthesizing content concept...');
    setProgress(30);
    await new Promise(r => setTimeout(r, 600));

    const newContent = createContent({
      title: form.title,
      hook: form.hook || form.title,
      niche: form.niche,
      pillar: form.pillar,
      audience: form.audience,
      goal: form.goal,
      estimatedDuration: 45,
      thumbnailGradient: 'from-emerald-900 via-emerald-800 to-teal-700',
    });

    addActivity(newContent.id, 'idea_generated', 'Content concept generated');
    setContentId(newContent.id);
    setProgress(100);
    setWorking(false);
    setCurrentStep(1);
  };

  const handleGenerateScript = async () => {
    if (!contentId) return;
    setWorking(true);
    await demoEngine.simulateScriptGeneration(contentId, (p, stage) => {
      setProgress(p);
      setProgressStage(stage);
    });
    setWorking(false);
    setCurrentStep(2);
  };

  const handleGenerateVoice = async () => {
    if (!contentId) return;
    setWorking(true);
    await demoEngine.simulateVoiceGeneration(contentId, (p, stage) => {
      setProgress(p);
      setProgressStage(stage);
    });
    setWorking(false);
    setCurrentStep(3);
  };

  const handleGenerateVisuals = async () => {
    if (!contentId) return;
    setWorking(true);
    await demoEngine.simulateVisualGeneration(contentId, (p, stage) => {
      setProgress(p);
      setProgressStage(stage);
    });
    setWorking(false);
    setCurrentStep(4);
  };

  const handleRender = async () => {
    if (!contentId) return;
    setWorking(true);
    await demoEngine.simulateRendering(contentId, (p, stage) => {
      setProgress(p);
      setProgressStage(stage);
    });
    setWorking(false);
    navigate(`/studio/${contentId}`);
  };

  const handleQC = async () => {
    if (!contentId) return;
    setWorking(true);
    await demoEngine.simulateQualityCheck(contentId, (p, stage) => {
      setProgress(p);
      setProgressStage(stage);
    });
    setWorking(false);
    setCurrentStep(6);
  };

  const handleApproveAndSchedule = async () => {
    if (!contentId) return;
    await demoEngine.simulateApproval(contentId);
    const scheduledDateTime = new Date(`${form.publishDate}T${form.publishTime}:00`).toISOString();
    await demoEngine.simulateScheduling(contentId, scheduledDateTime);
    showToast({ type: 'success', title: 'Video Scheduled', message: `Scheduled for ${new Date(scheduledDateTime).toLocaleString()}` });
    setCurrentStep(7);
    navigate(`/calendar`);
  };

  const renderStep = () => {
    switch (STEPS[currentStep].key) {
      case 'idea':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Define Concept</h3>
              <p className="text-sm text-text-secondary">Start with an attention-grabbing hook or select a high-retention suggested concept.</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                Suggested Concepts ({workspace?.niche || 'AI & Automation'})
              </span>
              <div className="space-y-2">
                {SUGGESTED_CONCEPTS.map((concept, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, title: concept.title, hook: concept.hook, pillar: concept.pillar }));
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-accent hover:bg-surface-subtle transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary">{concept.title}</span>
                      <Badge variant="accent">{concept.pillar}</Badge>
                    </div>
                    <p className="text-xs text-text-secondary italic">"{concept.hook}"</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <Input
                label="Video Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 5 AI Tools Students Should Know in 2026"
              />
              <Input
                label="Opening Hook (First 0-3 Seconds)"
                value={form.hook}
                onChange={e => setForm({ ...form, hook: e.target.value })}
                placeholder="The spoken sentence that stops the scroll..."
              />
            </div>

            {form.title && form.hook && (
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <Badge variant="accent" className="mb-2"><Sparkles className="h-3 w-3" />Concept Preview</Badge>
                  <p className="text-sm font-semibold text-text-primary mb-1">{form.title}</p>
                  <p className="text-xs text-text-secondary italic">"{form.hook}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'strategy':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Production Strategy</h3>
              <p className="text-sm text-text-secondary">Configure audience framing, content pillar, and algorithmic goal.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Niche" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} />
              <Input label="Content Pillar" value={form.pillar} onChange={e => setForm({ ...form, pillar: e.target.value })} />
            </div>
            <Input label="Target Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />

            <div>
              <label className="label mb-2 block">Campaign Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setForm({ ...form, goal: g.key as typeof form.goal })}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-colors',
                      form.goal === g.key ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border hover:bg-surface-subtle'
                    )}
                  >
                    <div className="text-sm font-medium text-text-primary">{g.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-text-primary mb-1">Structured Script</h3>
                <p className="text-sm text-text-secondary">Review generated narration or open full ScriptLab for advanced revision tools.</p>
              </div>
              {contentId && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/script-lab/${contentId}`)}>
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Open ScriptLab
                </Button>
              )}
            </div>

            {content?.script ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border">
                    {content.script.content}
                  </pre>
                  <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-text-muted">
                    <span><strong>{content.script.wordCount}</strong> words</span>
                    <span>Hook Score: <strong>{content.script.hookStrength}%</strong></span>
                    <span>Pacing: <strong>~{Math.round(content.script.wordCount / 2.5)}s</strong></span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-text-primary mb-1">Generate AI Script</h4>
                <p className="text-xs text-text-secondary mb-4">The engine will write a 4-scene vertical script with hook-first pacing.</p>
                <Button onClick={handleGenerateScript} loading={working}>
                  <Sparkles className="h-4 w-4" /> Generate Script
                </Button>
              </Card>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Select Voice Model</h3>
              <p className="text-sm text-text-secondary">Synthesize neural multi-lingual speech with natural prosody.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {VOICE_PRESETS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setForm({ ...form, voice: v.id })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors',
                    form.voice === v.id ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border hover:bg-surface-subtle'
                  )}
                >
                  <div className="font-semibold text-xs text-text-primary">{v.name}</div>
                  <div className="text-[11px] text-text-muted mt-1">{v.provider} • {v.style}</div>
                </button>
              ))}
            </div>

            {content?.voiceStatus === 'ready' ? (
              <Card className="p-5 text-center bg-success/5 border-success/20">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-sm font-semibold text-text-primary">Voiceover Audio Ready</div>
                <p className="text-xs text-text-muted mt-1">Multi-scene audio track synthesized and aligned to script timestamps.</p>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Mic className="h-8 w-8 text-text-muted mx-auto mb-3" />
                <Button onClick={handleGenerateVoice} loading={working}>
                  <Sparkles className="h-4 w-4" /> Synthesize Voiceover
                </Button>
              </Card>
            )}
          </div>
        );

      case 'visuals':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Visual Scenes (9:16)</h3>
              <p className="text-sm text-text-secondary">Generate vertical visual backgrounds for each scene.</p>
            </div>

            {content?.visuals && content.visuals.length > 0 && content.visuals.every(v => v.visualStatus === 'ready') ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {content.visuals.map((scene, i) => (
                  <div key={scene.id} className="p-3 rounded-lg border border-border bg-surface-subtle flex items-start gap-3">
                    <div className="h-14 w-10 rounded bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-text-primary truncate">{scene.title}</span>
                        <Badge variant="success">Ready</Badge>
                      </div>
                      <p className="text-[11px] text-text-secondary line-clamp-2">
                        {scene.script}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <ImageIcon className="h-8 w-8 text-text-muted mx-auto mb-3" />
                <p className="text-xs text-text-secondary mb-4">Generate custom 9:16 visual scenes for all script segments.</p>
                <Button onClick={handleGenerateVisuals} loading={working}>
                  <Sparkles className="h-4 w-4" /> Generate Visuals
                </Button>
              </Card>
            )}
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Render Final Video</h3>
              <p className="text-sm text-text-secondary">Assemble audio tracks, visual frames, and auto-captions into a 1080x1920 MP4.</p>
            </div>

            <Card className="p-8 text-center">
              <Video className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <p className="text-xs text-text-secondary mb-5">Open the full Studio for timeline scrubbing or execute the render pipeline now.</p>
              <div className="flex gap-2 justify-center">
                {contentId && (
                  <Button variant="secondary" onClick={() => navigate(`/studio/${contentId}`)}>
                    <ExternalLink className="h-4 w-4" /> Open Video Studio
                  </Button>
                )}
                <Button onClick={handleRender} loading={working}>
                  <Scissors className="h-4 w-4" /> Render MP4
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'quality':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Automated Quality Assurance</h3>
              <p className="text-sm text-text-secondary">Inspect pre-export metrics: resolution, safe margins, loudness, and duplicate risks.</p>
            </div>

            {content?.qcStatus ? (
              <Card className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-extrabold text-accent">{content.qcStatus.score || 94}</div>
                  <div className="text-xs text-text-muted">Automated QC Score / 100</div>
                </div>
                <div className="space-y-2 text-xs border-t border-border pt-3">
                  <div className="flex justify-between"><span>Resolution</span><span className="text-success font-semibold">1080x1920 (9:16)</span></div>
                  <div className="flex justify-between"><span>Audio Loudness</span><span className="text-success font-semibold">-14 LUFS compliant</span></div>
                  <div className="flex justify-between"><span>Safe Zones</span><span className="text-success font-semibold">100% compliant</span></div>
                  <div className="flex justify-between"><span>Duplicate Trigram Check</span><span className="text-success font-semibold">Passed (Unique)</span></div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Shield className="h-8 w-8 text-text-muted mx-auto mb-3" />
                <Button onClick={handleQC} loading={working}>
                  <Shield className="h-4 w-4" /> Run Quality Check
                </Button>
              </Card>
            )}
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-1">Schedule & Publish</h3>
              <p className="text-sm text-text-secondary">Confirm publication schedule and channel distribution parameters.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date"
                type="date"
                value={form.publishDate}
                onChange={e => setForm({ ...form, publishDate: e.target.value })}
              />
              <Input
                label="Time"
                type="time"
                value={form.publishTime}
                onChange={e => setForm({ ...form, publishTime: e.target.value })}
              />
            </div>

            <div>
              <label className="label mb-1.5 block">Privacy Visibility</label>
              <select
                value={form.privacy}
                onChange={e => setForm({ ...form, privacy: e.target.value as any })}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="public">Public (Immediate reach)</option>
                <option value="unlisted">Unlisted (Review link only)</option>
                <option value="private">Private (Workspace only)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button onClick={handleApproveAndSchedule} className="w-full">
                <CheckCircle className="h-4 w-4" /> Approve & Schedule Video
              </Button>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return !!(form.title && form.hook);
    return stepCompleted(STEPS[currentStep].key);
  };

  const handleNext = async () => {
    if (currentStep === 0 && !contentId) {
      await handleCreateFromIdea();
      return;
    }
    if (currentStep === 2 && !content?.script) {
      await handleGenerateScript();
      return;
    }
    if (currentStep === 3 && content?.voiceStatus !== 'ready') {
      await handleGenerateVoice();
      return;
    }
    if (currentStep === 4 && (!content?.visuals || !content.visuals.every(v => v.visualStatus === 'ready'))) {
      await handleGenerateVisuals();
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Content Creation Pipeline</h1>
          <p className="text-xs text-text-secondary mt-1">Multi-stage vertical video production studio</p>
        </div>
      </div>

      {working && (
        <Card className="p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-text-primary">{progressStage}</div>
              <div className="h-1 bg-surface-subtle rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono text-text-muted">{Math.round(progress)}%</span>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Stepper Nav */}
        <nav className="hidden lg:block">
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = stepCompleted(step.key) || (contentId && i < currentStep);
              const active = i === currentStep;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => done && setCurrentStep(i)}
                  disabled={!done && !active}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left',
                    active ? 'bg-accent/10 text-accent font-semibold' : done ? 'text-text-primary hover:bg-surface-subtle' : 'text-text-muted'
                  )}
                >
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[11px]',
                    done ? 'bg-accent text-white' : active ? 'bg-accent/20 text-accent ring-2 ring-accent/30' : 'bg-surface-subtle'
                  )}>
                    {done ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Card */}
        <Card>
          <CardContent className="p-6">
            {renderStep()}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/dashboard')}
                disabled={working}
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button onClick={handleNext} disabled={!canProceed() || working}>
                {currentStep === STEPS.length - 1 ? 'Finish & Schedule' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
