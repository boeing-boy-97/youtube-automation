import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/apiClient';
import { cn } from '../lib/utils';
import {
  Save,
  Wand2,
  Sparkles,
  Clock,
  Type,
  Zap,
  TrendingUp,
  BookOpen,
  RotateCcw,
  MessageSquare,
  History,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Undo,
} from 'lucide-react';

interface ScriptVersionItem {
  id: string;
  version: number;
  content: string;
  action: string;
  timestamp: string;
}

const AI_ACTIONS = [
  { label: 'Improve Hook', icon: Zap, desc: 'Strengthen the opening 3-second line' },
  { label: 'Make Shorter', icon: Type, desc: 'Trim filler words to increase pacing' },
  { label: 'More Direct', icon: TrendingUp, desc: 'Cut preamble and state findings directly' },
  { label: 'Technical Precision', icon: BookOpen, desc: 'Accurate architectural terms' },
  { label: 'Simplify Phrasing', icon: RotateCcw, desc: 'Shorter sentences under 12 words' },
  { label: 'Add Outro Loop', icon: Wand2, desc: 'Seamless loop cue connecting back to hook' },
];

export function ScriptLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore((s) => s.items.find((i) => i.id === id));
  const updateContent = useContentStore((s) => s.updateContent);
  const showToast = useUIStore((s) => s.showToast);

  const [scriptText, setScriptText] = useState(content?.script?.content || '');
  const [activeTab, setActiveTab] = useState<'text' | 'scenes'>('text');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Version History
  const [versions, setVersions] = useState<ScriptVersionItem[]>([
    {
      id: 'v1',
      version: 1,
      content: content?.script?.content || 'If you are building vertical video in 2026, stop multi-tool switching...',
      action: 'Initial draft',
      timestamp: 'Just now',
    },
  ]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

  useEffect(() => {
    if (content?.script?.content) {
      setScriptText(content.script.content);
      if (versions.length === 1 && versions[0].content !== content.script.content) {
        setVersions([
          {
            id: `v_${Date.now()}`,
            version: 1,
            content: content.script.content,
            action: 'Initial draft',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [content?.id]);

  if (!content) {
    return (
      <div className="space-y-5">
        <PageHeader title="Script Lab" description="Select a short from the library to draft narration." />
        <div className="p-12 text-center bg-surface border border-border rounded-xl space-y-3">
          <FileText className="h-10 w-10 text-stone-muted mx-auto" />
          <p className="text-xs text-stone">Open a draft or create a new short to begin screenplay writing.</p>
          <Button onClick={() => navigate('/create')} className="btn-primary h-9 px-4 text-xs">
            Create Short
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = scriptText.length;
  const estDuration = Math.max(15, Math.round(wordCount / 2.5));

  function sentenceAvgLength(text: string) {
    const sents = text.split(/[.!?]+/).filter((s) => s.trim());
    if (sents.length === 0) return 12;
    return Number(
      (sents.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sents.length).toFixed(1)
    );
  }

  const avgWordsPerSent = sentenceAvgLength(scriptText);
  const scenes = parseScriptScenes(scriptText, content.title);

  const recordNewVersion = (newContent: string, action: string) => {
    const nextVer = versions.length + 1;
    const newItem: ScriptVersionItem = {
      id: `v_${Date.now()}`,
      version: nextVer,
      content: newContent,
      action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setVersions((prev) => [newItem, ...prev]);
    setCurrentVersionIndex(0);
  };

  const handleSaveScript = async () => {
    updateContent(content.id, {
      script: {
        id: content.script?.id || `scr_${Date.now()}`,
        content: scriptText,
        wordCount,
        charCount,
        hookStrength: 90,
        ctaStrength: 85,
        readability: 88,
        estimatedDuration: estDuration,
        versions: (content.script?.versions || []).concat({
          id: `svr_${Date.now()}`,
          content: scriptText,
          wordCount,
          createdAt: new Date().toISOString(),
          label: `v${versions.length}`,
        }),
      },
      visuals: scenes.map((s, idx) => ({
        id: `scn_${idx + 1}`,
        index: idx,
        title: s.title,
        type: idx === 0 ? 'hook' : idx === scenes.length - 1 ? 'cta' : 'content',
        script: s.script,
        duration: s.duration,
        visualType: 'generated' as const,
        visualStatus: 'ready' as const,
      })),
      duration: estDuration,
      estimatedDuration: estDuration,
    });

    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        await apiClient.scripts.save(content.id, {
          title: content.title,
          body: scriptText,
          scenes: scenes.map((s, idx) => ({
            index: idx,
            durationSec: s.duration,
            narration: s.script,
            visualPrompt: s.visualPrompt,
          })),
        });
      }
    } catch {
      // Local mode fallback
    }

    showToast({ type: 'success', title: 'Script saved', message: 'Script and scenes updated.' });
  };

  const handleGenerateScript = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.scripts.generate(content.id);
      if (res?.body) {
        setScriptText(res.body);
        recordNewVersion(res.body, 'AI Generated');
        useContentStore.getState().updateContent(content.id, {
          status: 'script_ready',
          hook: res.hook || content.hook,
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
        showToast({ type: 'success', title: 'Script generated' });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Script generation failed',
        message: err.message || 'Failed to generate script. Check OPENAI_API_KEY in settings.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAIAction = (actionLabel: string) => {
    let modified = scriptText;
    const sentences = scriptText.split(/(?<=[.?!])\s+/).filter(Boolean);

    if (actionLabel === 'Improve Hook') {
      const pick = `Stop scrolling if you write code: 95% of developers are approaching this completely wrong.`;
      if (sentences.length > 0) {
        sentences[0] = pick;
        modified = sentences.join(' ');
      } else {
        modified = `${pick} Here is what actually happens.`;
      }
    } else if (actionLabel === 'Make Shorter') {
      modified = sentences
        .slice(0, Math.max(3, Math.ceil(sentences.length * 0.75)))
        .map((s) => s.replace(/\b(actually|basically|literally|honestly|just|very)\b\s*/gi, ''))
        .join(' ');
    } else if (actionLabel === 'More Direct') {
      modified = `Here is the architectural reality. ${sentences.join(' ')}`;
    } else if (actionLabel === 'Technical Precision') {
      modified = scriptText.replace(/code/g, 'system architecture').replace(/tool/g, 'pipeline module');
    } else if (actionLabel === 'Simplify Phrasing') {
      modified = sentences.map((s) => (s.length > 80 ? s.slice(0, 80) + '.' : s)).join(' ');
    } else if (actionLabel === 'Add Outro Loop') {
      modified = `${scriptText} Follow for daily engineering breakdowns.`;
    }

    setScriptText(modified);
    recordNewVersion(modified, actionLabel);
    showToast({ type: 'info', title: actionLabel, message: 'Script modified.' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={content.title}
        description="3-Act Screenplay Studio • Word-level pacing for vertical shorts"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={copyToClipboard}
              className="btn-secondary h-8 px-3 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateScript}
              loading={generating}
              className="btn-secondary h-8 px-3 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              <span>Regenerate</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSaveScript}
              className="btn-primary h-8 px-4 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Script</span>
            </Button>
          </div>
        }
      />

      {/* Main 2-Column Writing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Script Editor & Act Breakdown */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'text'
                  ? 'bg-surface text-ink font-semibold border border-border shadow-xs'
                  : 'text-stone hover:text-ink'
              )}
            >
              Narration Editor
            </button>
            <button
              onClick={() => setActiveTab('scenes')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'scenes'
                  ? 'bg-surface text-ink font-semibold border border-border shadow-xs'
                  : 'text-stone hover:text-ink'
              )}
            >
              Scene Directing ({scenes.length} beats)
            </button>
          </div>

          {activeTab === 'text' ? (
            <div className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-4">
              <textarea
                rows={12}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Write your spoken screenplay narration here..."
                className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink placeholder:text-stone-muted leading-relaxed outline-none resize-none border-0 p-0"
              />

              {/* Real Pacing Metrics Bar */}
              <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[10px]">WORDS:</span>
                  <span className="font-semibold text-ink">{wordCount} words</span>
                </div>
                <div className="p-2 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[10px]">EST. RUNTIME:</span>
                  <span className="font-semibold text-coral">~{estDuration}s</span>
                </div>
                <div className="p-2 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[10px]">AVG SENTENCE:</span>
                  <span className="font-semibold text-ink">{avgWordsPerSent} words</span>
                </div>
                <div className="p-2 rounded bg-canvas-subtle border border-border">
                  <span className="text-stone-muted block text-[10px]">PACING:</span>
                  <span className="font-semibold text-moss">~150 WPM</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-coral">{scene.title}</span>
                    <span className="px-2 py-0.5 rounded bg-canvas-subtle border border-border text-stone">
                      ~{scene.duration}s
                    </span>
                  </div>
                  <p className="text-xs text-ink font-sans leading-relaxed">"{scene.script}"</p>
                  <div className="p-2.5 rounded bg-canvas-subtle border border-border text-[11px] font-mono text-stone">
                    <strong>9:16 Art Direction:</strong> {scene.visualPrompt}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick AI Editing Actions */}
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-stone uppercase tracking-wide block">
              Quick Stylistic Adjustments
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAIAction(action.label)}
                  className="p-2.5 rounded-lg border border-border bg-canvas-subtle hover:bg-surface hover:border-coral/50 transition-all text-left space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <action.icon className="h-3.5 w-3.5 text-coral" />
                    <span>{action.label}</span>
                  </div>
                  <div className="text-[10px] text-stone leading-tight">{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Version History & Next Steps */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-bold text-ink">Revision History</span>
              <span className="text-[10px] font-mono text-stone">{versions.length} versions</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  onClick={() => {
                    setScriptText(ver.content);
                    setCurrentVersionIndex(idx);
                  }}
                  className={cn(
                    'p-2.5 rounded-md border text-left cursor-pointer transition-all space-y-1',
                    currentVersionIndex === idx
                      ? 'bg-coral-soft border-coral/40 shadow-xs'
                      : 'bg-canvas-subtle border-border hover:border-border-strong'
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">Version {ver.version}</span>
                    <span className="text-[10px] font-mono text-stone-muted">{ver.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-stone truncate">{ver.action}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-3">
            <span className="text-xs font-bold text-ink block">Next Production Step</span>
            <p className="text-xs text-stone leading-relaxed">
              Once narration is finalized, proceed to Video Studio to synthesize neural audio and preview kinetic subtitles.
            </p>
            <Button
              onClick={() => navigate(`/studio/${content.id}`)}
              className="btn-primary w-full h-9 text-xs"
            >
              <span>Launch Video Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseScriptScenes(text: string, title: string) {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length === 0) {
    return [
      {
        title: 'Act I: The Hook',
        script: text || 'Opening premise hook.',
        duration: 4,
        visualPrompt: `Vertical 9:16 cinematic establishing frame for ${title}`,
      },
    ];
  }

  const chunkCount = Math.min(4, Math.max(2, Math.ceil(sentences.length / 2)));
  const chunkSize = Math.ceil(sentences.length / chunkCount);
  const result = [];

  for (let i = 0; i < chunkCount; i++) {
    const chunkSentences = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunkSentences.length === 0) continue;
    const narration = chunkSentences.join(' ');
    const words = narration.split(/\s+/).length;
    const duration = Math.max(3, Math.round(words / 2.5));

    const labels = [
      'Act I: Curiosity Hook',
      'Act II: The Mechanism',
      'Act II: Pacing Shift',
      'Act III: Loop Outro',
    ];

    result.push({
      title: labels[i] || `Scene 0${i + 1}`,
      script: narration,
      duration,
      visualPrompt: `High-contrast 9:16 vertical scene illustrating: ${chunkSentences[0]}`,
    });
  }

  return result;
}
