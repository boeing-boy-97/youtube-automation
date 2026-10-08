import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { demoEngine } from '../services/demoEngine';
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
} from 'lucide-react';

const STEPS = [
  { key: 'idea', label: 'Idea', icon: Lightbulb },
  { key: 'strategy', label: 'Strategy', icon: Target },
  { key: 'script', label: 'Script', icon: FileText },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'visuals', label: 'Visuals', icon: ImageIcon },
  { key: 'edit', label: 'Edit', icon: Video },
  { key: 'quality', label: 'Quality', icon: Shield },
  { key: 'publish', label: 'Publish', icon: Send },
];

const GOALS = [
  { key: 'reach', label: 'Reach', desc: 'Maximize views' },
  { key: 'subscribers', label: 'Subscribers', desc: 'Grow your audience' },
  { key: 'education', label: 'Education', desc: 'Teach something valuable' },
  { key: 'engagement', label: 'Engagement', desc: 'Drive comments & shares' },
];

export function Create() {
  const navigate = useNavigate();
  const workspace = useWorkspaceStore(s => s.workspace);
  const createContent = useContentStore(s => s.createContent);
  const getContent = useContentStore(s => s.getContent);
  const addActivity = useContentStore(s => s.addActivity);
  const [currentStep, setCurrentStep] = useState(0);
  const [working, setWorking] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [contentId, setContentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    hook: '',
    niche: workspace?.niche || 'AI Technology',
    pillar: workspace?.pillars?.[0]?.name || 'AI Tools',
    audience: workspace?.targetAudience || 'Students and professionals',
    goal: 'reach' as const,
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
    setProgressStage('Creating concept...');
    setProgress(20);
    await new Promise(r => setTimeout(r, 800));

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
    addActivity(newContent.id, 'idea_generated', 'Content concept created');
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
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    await demoEngine.simulateScheduling(contentId, tomorrow);
    setCurrentStep(7);
    navigate(`/calendar`);
  };

  const renderStep = () => {
    switch (STEPS[currentStep].key) {
      case 'idea':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Generate a concept</h3>
              <p className="text-sm text-text-secondary">Start with a content idea or let the engine suggest one.</p>
            </div>

            <div>
              <Button variant="secondary" className="w-full justify-start gap-3" onClick={() => {
                setForm(prev => ({ ...prev, title: '5 AI Tools Students Should Know in 2026', hook: 'Students are using these AI tools to cut study time in half' }));
              }}>
                <Sparkles className="h-4 w-4 text-accent" />
                AI Generate a concept
              </Button>
            </div>

            <div className="space-y-4">
              <Input label="Video Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter a title..." />
              <Input label="Hook / Opening Line" value={form.hook} onChange={e => setForm({ ...form, hook: e.target.value })} placeholder="The first line viewers hear..." />
            </div>

            {form.title && form.hook && (
              <Card className="bg-accent-soft/40 border-accent/20">
                <CardContent className="p-4">
                  <Badge variant="accent" className="mb-2"><Sparkles className="h-3 w-3" />Preview</Badge>
                  <p className="text-sm font-semibold text-text-primary mb-1">{form.title}</p>
                  <p className="text-sm text-text-secondary italic">"{form.hook}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'strategy':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Content Strategy</h3>
              <p className="text-sm text-text-secondary">Configure the approach for this video.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Niche" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} />
              <Input label="Content Pillar" value={form.pillar} onChange={e => setForm({ ...form, pillar: e.target.value })} />
            </div>
            <Input label="Target Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />

            <div>
              <label className="label mb-2 block">Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setForm({ ...form, goal: g.key as typeof form.goal })}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-colors',
                      form.goal === g.key ? 'border-accent bg-accent-soft/40' : 'border-border hover:border-border-strong'
                    )}
                  >
                    <div className="text-sm font-medium text-text-primary">{g.label}</div>
                    <div className="text-xs text-text-muted">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-surface-subtle/50">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-text-primary mb-2">System recommendations</div>
                <div className="space-y-1 text-xs text-text-secondary">
                  <div>• Ideal duration: 38–48 seconds</div>
                  <div>• Recommended hook: Question-based</div>
                  <div>• Best posting window: 7:30–9:00 PM</div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Generate Script</h3>
              <p className="text-sm text-text-secondary">The engine will write a complete script based on your concept.</p>
            </div>
            {content?.script ? (
              <Card>
                <CardContent className="p-4">
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">{content.script.content}</pre>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-text-muted">
                    <span>{content.script.wordCount} words</span>
                    <span>Hook: {content.script.hookStrength}%</span>
                    <span>Readability: {content.script.readability}%</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Ready to generate the script for this concept.</p>
                <Button onClick={handleGenerateScript} loading={working}>
                  <Sparkles className="h-4 w-4" />
                  Generate Script
                </Button>
              </Card>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Generate Voice</h3>
              <p className="text-sm text-text-secondary">Synthesize voiceover from your script.</p>
            </div>
            {content?.voiceStatus === 'ready' ? (
              <Card className="p-6 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">Voice generated</p>
                <p className="text-xs text-text-muted">Using {workspace?.voice.voice} ({workspace?.voice.provider})</p>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Mic className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Voice: {workspace?.voice.voice}</p>
                <Button onClick={handleGenerateVoice} loading={working}>
                  <Sparkles className="h-4 w-4" />
                  Generate Voice
                </Button>
              </Card>
            )}
          </div>
        );

      case 'visuals':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Generate Visuals</h3>
              <p className="text-sm text-text-secondary">Create visuals for each scene.</p>
            </div>
            {content?.visuals && content.visuals.length > 0 && content.visuals.every(v => v.visualStatus === 'ready') ? (
              <div className="space-y-2">
                {content.visuals.map((scene, i) => (
                  <div key={scene.id} className="flex items-center gap-3 p-3 rounded-md border border-border">
                    <div className="h-12 w-20 rounded bg-gradient-to-br from-emerald-800 to-teal-600 flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{scene.title}</div>
                      <div className="text-xs text-text-muted">{scene.script.slice(0, 60)}...</div>
                    </div>
                    <Badge variant="success">Ready</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <ImageIcon className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Generate visuals for 5 scenes</p>
                <Button onClick={handleGenerateVisuals} loading={working}>
                  <Sparkles className="h-4 w-4" />
                  Generate Visuals
                </Button>
              </Card>
            )}
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Render Video</h3>
              <p className="text-sm text-text-secondary">Assemble and render the final video.</p>
            </div>
            <Card className="p-8 text-center">
              <Video className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary mb-4">Open the studio to edit, then render.</p>
              <div className="flex gap-2 justify-center">
                {content?.visuals && content.visuals.length > 0 && content.visuals.every((v: { visualStatus: string }) => v.visualStatus === "ready") && !content.videoUrl && (
                  <Button onClick={() => navigate(`/studio/${contentId}`)}>
                    <Video className="h-4 w-4" />
                    Open Studio
                  </Button>
                )}
                <Button variant={content?.videoUrl ? 'secondary' : 'primary'} onClick={handleRender} loading={working}>
                  {content?.videoUrl ? <CheckCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  {content?.videoUrl ? 'Rendered' : 'Render Video'}
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'quality':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Quality Check</h3>
              <p className="text-sm text-text-secondary">Run automated quality control.</p>
            </div>
            {content?.qcStatus ? (
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-text-primary mb-1">{content.qcStatus.score}</div>
                <div className="text-xs text-text-muted mb-3">QC Score / 100</div>
                <Badge variant={content.qcStatus.status === 'ready' ? 'success' : 'warning'}>{content.qcStatus.status}</Badge>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Shield className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Run quality control checks before approval.</p>
                <Button onClick={handleQC} loading={working}>
                  <Shield className="h-4 w-4" />
                  Run Quality Check
                </Button>
              </Card>
            )}
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-section-title text-text-primary mb-2">Schedule & Publish</h3>
              <p className="text-sm text-text-secondary">Approve and schedule your video.</p>
            </div>
            {content?.status === 'scheduled' || content?.status === 'published' ? (
              <Card className="p-6 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">
                  {content.status === 'published' ? 'Published!' : 'Scheduled!'}
                </p>
                <Button className="mt-4" onClick={() => navigate(`/content/${contentId}`)}>View Content</Button>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Send className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-4">Approve this video and schedule it for publishing.</p>
                <Button onClick={handleApproveAndSchedule}>
                  <CheckCircle className="h-4 w-4" />
                  Approve & Schedule
                </Button>
              </Card>
            )}
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title text-text-primary">Create Content</h1>
          <p className="text-sm text-text-secondary mt-1">Guided production workspace</p>
        </div>
        <Button variant="ghost" size="sm"><Save className="h-4 w-4" />Save Draft</Button>
      </div>

      {working && (
        <Card className="mb-4 p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{progressStage}</div>
              <div className="h-1 bg-surface-subtle rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-xs text-text-muted">{Math.round(progress)}%</span>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Stepper */}
        <nav className="hidden lg:block">
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = stepCompleted(step.key) || (contentId && i < currentStep);
              const active = i === currentStep;
              return (
                <button
                  key={step.key}
                  onClick={() => done && setCurrentStep(i)}
                  disabled={!done && !active}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
                    active ? 'bg-accent/10 text-accent' : done ? 'text-text-primary hover:bg-surface-subtle' : 'text-text-muted'
                  )}
                >
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
                    done ? 'bg-accent/10 text-accent' : active ? 'bg-accent/10 text-accent ring-2 ring-accent/20' : 'bg-surface-subtle'
                  )}>
                    {done ? <CheckCircle className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  {step.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {renderStep()}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/dashboard')} disabled={working}>
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button onClick={handleNext} disabled={!canProceed() || working}>
                {currentStep === STEPS.length - 1 ? 'Finish' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
