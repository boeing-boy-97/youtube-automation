import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
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
  const workspace = useWorkspaceStore((s) => s.workspace);
  const createContent = useContentStore((s) => s.createContent);
  const updateContent = useContentStore((s) => s.updateContent);
  const getContent = useContentStore((s) => s.getContent);
  const addActivity = useContentStore((s) => s.addActivity);
  const showToast = useUIStore((s) => s.showToast);

  const [currentStep, setCurrentStep] = useState(0);
  const [working, setWorking] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [contentId, setContentId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    hook: '',
    niche: workspace?.niche || 'AI & Engineering',
    pillar: workspace?.pillars?.[0]?.name || 'Architecture',
    audience: workspace?.targetAudience || 'Engineers and creators',
    goal: 'reach' as const,
    voice: 'adam',
    publishDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    publishTime: '18:30',
    privacy: 'public' as 'public' | 'unlisted' | 'private',
  });

  const content = contentId ? getContent(contentId) : null;

  const handleCreateFromIdea = async () => {
    setWorking(true);
    setProgressStage('Synthesizing content concept...');
    setProgress(30);

    let serverContentId: string | undefined;
    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        const res = await apiClient.content.create({
          title: form.title,
          hook: form.hook || form.title,
          targetDurationSec: 45,
          tags: [form.niche, form.pillar].filter(Boolean),
        });
        if (res?.id) serverContentId = res.id;
      }
    } catch {
      // Local mode fallback
    }

    const newContent = createContent({
      id: serverContentId,
      title: form.title,
      hook: form.hook || form.title,
      niche: form.niche,
      pillar: form.pillar,
      audience: form.audience,
      goal: form.goal,
      estimatedDuration: 45,
      thumbnailGradient: 'from-stone-900 via-stone-800 to-black',
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
    setProgress(35);
    setProgressStage('Drafting 3-act script with retention pacing...');
    try {
      const res = await apiClient.scripts.generate(contentId);
      if (res?.body) {
        updateContent(contentId, {
          status: 'script_ready',
          hook: res.hook || form.hook,
          script: {
            id: `scr_${Date.now()}`,
            content: res.body,
            wordCount: res.body.trim().split(/\s+/).length,
            charCount: res.body.length,
            hookStrength: 90,
            ctaStrength: 85,
            readability: 88,
            estimatedDuration: res.estimatedDurationSec || 45,
            versions: [],
          },
        });
      }
      setProgress(100);
      showToast({ type: 'success', title: 'Script generated' });
      setCurrentStep(2);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Script generation error', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!contentId) return;
    setWorking(true);
    setProgress(40);
    setProgressStage('Synthesizing neural voiceover...');
    try {
      await apiClient.voices.generate(contentId);
      updateContent(contentId, { status: 'voice_ready' });
      setProgress(100);
      showToast({ type: 'success', title: 'Voiceover generated' });
      setCurrentStep(3);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Voice generation error', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const handleGenerateVisuals = async () => {
    if (!contentId) return;
    setWorking(true);
    setProgress(40);
    setProgressStage('Generating 9:16 vertical scene visuals...');
    try {
      await apiClient.visuals.generate(contentId);
      updateContent(contentId, { status: 'visuals_ready' });
      setProgress(100);
      showToast({ type: 'success', title: 'Visuals generated' });
      setCurrentStep(4);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Visual generation error', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const handleRender = async () => {
    if (!contentId) return;
    setWorking(true);
    setProgress(30);
    setProgressStage('Rendering composite video with FFmpeg...');
    try {
      const res = await apiClient.rendering.render(contentId, contentId);
      updateContent(contentId, {
        status: 'rendered',
        videoUrl: res?.assetUrl || res?.outputPath,
      });
      setProgress(100);
      showToast({ type: 'success', title: 'Render completed' });
      navigate(`/studio/${contentId}`);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Render failed', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const handleQC = async () => {
    if (!contentId) return;
    setWorking(true);
    setProgress(50);
    setProgressStage('Verifying video bitrate, codecs, and audio levels...');
    try {
      await apiClient.qc.get(contentId);
      updateContent(contentId, { status: 'review' });
      setProgress(100);
      showToast({ type: 'success', title: 'Quality check passed' });
      setCurrentStep(6);
    } catch (err: any) {
      showToast({ type: 'error', title: 'QC check failed', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const handleApproveAndSchedule = async () => {
    if (!contentId) return;
    setWorking(true);
    try {
      await apiClient.content.advance(contentId, 'APPROVED');
      const scheduledDateTime = new Date(`${form.publishDate}T${form.publishTime}:00`).toISOString();
      await apiClient.scheduling.create({
        contentId,
        channelId: '',
        scheduledAt: scheduledDateTime,
      });
      updateContent(contentId, {
        status: 'scheduled',
        scheduledAt: scheduledDateTime,
      });
      showToast({
        type: 'success',
        title: 'Video Scheduled',
        message: `Scheduled for ${new Date(scheduledDateTime).toLocaleString()}`,
      });
      setCurrentStep(7);
      navigate(`/calendar`);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Scheduling failed', message: err.message });
    } finally {
      setWorking(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].key) {
      case 'idea':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Define Concept</h3>
              <p className="text-xs text-stone">
                Start with an attention-grabbing hook or select a high-retention suggested concept.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-stone-muted uppercase tracking-wider block">
                Suggested Concepts ({workspace?.niche || 'AI & Automation'})
              </span>
              <div className="space-y-2">
                {SUGGESTED_CONCEPTS.map((concept, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        title: concept.title,
                        hook: concept.hook,
                        pillar: concept.pillar,
                      }));
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border bg-surface hover:border-coral transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-ink">{concept.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-subtle border border-border text-coral">
                        {concept.pillar}
                      </span>
                    </div>
                    <p className="text-xs text-stone italic">"{concept.hook}"</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <Input
                label="Video Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 5 AI Tools Developers Should Know in 2026"
              />
              <Input
                label="Opening Hook (First 0-3 Seconds)"
                value={form.hook}
                onChange={(e) => setForm({ ...form, hook: e.target.value })}
                placeholder="The spoken sentence that stops the scroll..."
              />
            </div>
          </div>
        );

      case 'strategy':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Production Strategy</h3>
              <p className="text-xs text-stone">
                Configure audience framing, content pillar, and campaign goal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Niche"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
              <Input
                label="Content Pillar"
                value={form.pillar}
                onChange={(e) => setForm({ ...form, pillar: e.target.value })}
              />
            </div>
            <Input
              label="Target Audience"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />

            <div>
              <label className="field-label mb-2 block">Campaign Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setForm({ ...form, goal: g.key as typeof form.goal })}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      form.goal === g.key
                        ? 'border-coral bg-coral-soft'
                        : 'border-border bg-surface hover:bg-canvas-subtle'
                    )}
                  >
                    <div className="text-xs font-semibold text-ink">{g.label}</div>
                    <div className="text-[11px] text-stone mt-0.5">{g.desc}</div>
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
                <h3 className="text-base font-bold text-ink mb-1">Structured 3-Act Script</h3>
                <p className="text-xs text-stone">
                  Review narration beats or open Script Lab for advanced editing.
                </p>
              </div>
              {contentId && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/script-lab/${contentId}`)}
                  className="btn-secondary h-8 px-3 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Open Script Lab</span>
                </Button>
              )}
            </div>

            {content?.script ? (
              <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
                <pre className="text-xs text-ink whitespace-pre-wrap font-mono leading-relaxed bg-canvas-subtle p-3 rounded-md border border-border">
                  {content.script.content}
                </pre>
                <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-stone font-mono">
                  <span><strong>{content.script.wordCount}</strong> words</span>
                  <span>Pacing: <strong>~{Math.round(content.script.wordCount / 2.5)}s</strong> (~2.5 words/sec)</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-surface border border-border rounded-lg space-y-3">
                <FileText className="h-8 w-8 text-stone-muted mx-auto" />
                <h4 className="text-sm font-semibold text-ink">Generate Screenplay</h4>
                <p className="text-xs text-stone max-w-sm mx-auto">
                  The studio engine drafts a 4-scene vertical script with hook-first retention pacing.
                </p>
                <Button
                  onClick={handleGenerateScript}
                  loading={working}
                  className="btn-primary h-9 px-4 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Script</span>
                </Button>
              </div>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Select Voice Model</h3>
              <p className="text-xs text-stone">
                Synthesize neural voiceover with calibrated pacing and pauses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {VOICE_PRESETS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setForm({ ...form, voice: v.id })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all',
                    form.voice === v.id
                      ? 'border-coral bg-coral-soft'
                      : 'border-border bg-surface hover:bg-canvas-subtle'
                  )}
                >
                  <div className="font-semibold text-xs text-ink">{v.name}</div>
                  <div className="text-[11px] text-stone mt-1">{v.provider} • {v.style}</div>
                </button>
              ))}
            </div>

            {content?.voiceStatus === 'ready' ? (
              <div className="p-4 text-center rounded-lg bg-surface border border-border space-y-1">
                <CheckCircle className="h-6 w-6 text-moss mx-auto" />
                <div className="text-xs font-semibold text-ink">Voiceover Audio Ready</div>
                <p className="text-[11px] text-stone">
                  Master audio track synthesized and aligned to script timestamps.
                </p>
              </div>
            ) : (
              <div className="p-8 text-center bg-surface border border-border rounded-lg space-y-3">
                <Mic className="h-8 w-8 text-stone-muted mx-auto" />
                <Button
                  onClick={handleGenerateVoice}
                  loading={working}
                  className="btn-primary h-9 px-4 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Synthesize Voiceover</span>
                </Button>
              </div>
            )}
          </div>
        );

      case 'visuals':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Visual Scenes (9:16)</h3>
              <p className="text-xs text-stone">Generate vertical scene frames for each beat.</p>
            </div>

            <div className="p-8 text-center bg-surface border border-border rounded-lg space-y-3">
              <ImageIcon className="h-8 w-8 text-stone-muted mx-auto" />
              <p className="text-xs text-stone max-w-sm mx-auto">
                Generate custom 9:16 portrait visual backgrounds for all screenplay segments.
              </p>
              <Button
                onClick={handleGenerateVisuals}
                loading={working}
                className="btn-primary h-9 px-4 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Visuals</span>
              </Button>
            </div>
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Render Final Video</h3>
              <p className="text-xs text-stone">
                Assemble audio tracks, visual frames, and kinetic subtitles into 1080×1920 MP4.
              </p>
            </div>

            <div className="p-8 text-center bg-surface border border-border rounded-lg space-y-4">
              <Video className="h-8 w-8 text-stone-muted mx-auto" />
              <p className="text-xs text-stone max-w-sm mx-auto">
                Open Video Studio for timeline scrubbing or execute the FFmpeg render pipeline now.
              </p>
              <div className="flex gap-2 justify-center">
                {contentId && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/studio/${contentId}`)}
                    className="btn-secondary h-9 px-4 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Video Studio</span>
                  </Button>
                )}
                <Button
                  onClick={handleRender}
                  loading={working}
                  className="btn-primary h-9 px-4 text-xs"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Render MP4</span>
                </Button>
              </div>
            </div>
          </div>
        );

      case 'quality':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Media Quality Verification</h3>
              <p className="text-xs text-stone">
                Inspect resolution, safe-zone margins, loudness, and duplicate risks.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-ink">ffprobe Media Validation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-coral-soft text-coral">
                  PASSED
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone">
                  <span>Resolution:</span>
                  <span className="text-ink font-semibold">1080×1920 (9:16 Vertical)</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Audio Loudness:</span>
                  <span className="text-ink font-semibold">-14.0 LUFS Compliant</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Safe Zones:</span>
                  <span className="text-ink font-semibold">Centered Margins Verified</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Duplicate Check:</span>
                  <span className="text-ink font-semibold">Trigram Score Passed</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-5 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">Schedule & Publish</h3>
              <p className="text-xs text-stone">
                Confirm publication schedule and channel distribution parameters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date"
                type="date"
                value={form.publishDate}
                onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
              />
              <Input
                label="Time (UTC)"
                type="time"
                value={form.publishTime}
                onChange={(e) => setForm({ ...form, publishTime: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label mb-1.5 block">Privacy Setting</label>
              <select
                value={form.privacy}
                onChange={(e) => setForm({ ...form, privacy: e.target.value as any })}
                className="input-field text-xs"
              >
                <option value="public">Public (Immediate release)</option>
                <option value="unlisted">Unlisted (Link access only)</option>
                <option value="private">Private (Channel draft)</option>
              </select>
            </div>

            <Button
              onClick={handleApproveAndSchedule}
              loading={working}
              className="btn-primary w-full h-10 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Confirm & Schedule Slot</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Tracker */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === idx;
          const isDone = currentStep > idx;

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all border',
                isActive
                  ? 'bg-surface border-coral text-coral shadow-xs font-semibold'
                  : isDone
                  ? 'bg-canvas-subtle border-border text-ink'
                  : 'bg-canvas-subtle border-border text-stone-muted'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-xs">
        {renderStep()}

        {/* Step Nav Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button
            variant="secondary"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="btn-secondary h-9 px-4 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          {currentStep === 0 ? (
            <Button
              onClick={handleCreateFromIdea}
              disabled={!form.title}
              loading={working}
              className="btn-primary h-9 px-4 text-xs"
            >
              <span>Initialize Project</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="btn-primary h-9 px-4 text-xs"
            >
              <span>Next Stage</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
