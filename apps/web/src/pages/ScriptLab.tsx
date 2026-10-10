import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { demoEngine } from '../services/demoEngine';
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
  Loader2,
  FileText,
  Copy,
  Check,
  Download,
  Layers,
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
  { label: 'Improve Hook', icon: Zap, desc: 'Make first 3 seconds scroll-stopping' },
  { label: 'Make Shorter', icon: Type, desc: 'Cut 20% of words for faster pacing' },
  { label: 'More Viral', icon: TrendingUp, desc: 'Add curiosity gaps and twists' },
  { label: 'More Professional', icon: BookOpen, desc: 'Authoritative, polished tone' },
  { label: 'Simplify', icon: RotateCcw, desc: 'Shorter sentences under 12 words' },
  { label: 'Add Story Arc', icon: MessageSquare, desc: 'Problem -> Struggle -> Payoff' },
  { label: 'Generate Strong CTA', icon: Wand2, desc: 'Compelling retention/follow CTA' },
];

export function ScriptLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore(s => s.items.find(i => i.id === id));
  const updateContent = useContentStore(s => s.updateContent);
  const showToast = useUIStore(s => s.showToast);

  const [scriptText, setScriptText] = useState(content?.script?.content || '');
  const [activeTab, setActiveTab] = useState<'text' | 'scenes'>('text');
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState('');
  const [copied, setCopied] = useState(false);

  // Revisions & Version History
  const [versions, setVersions] = useState<ScriptVersionItem[]>([
    {
      id: 'v1',
      version: 1,
      content: content?.script?.content || 'Stop scrolling if you want to save 10 hours this week...',
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
        <PageHeader title="Script Lab" description="Select a piece of content to write." />
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-4">Open a draft or create new content to start writing.</p>
          <Button onClick={() => navigate('/create')}>Create Content</Button>
        </Card>
      </div>
    );
  }

  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = scriptText.length;
  const estDuration = Math.max(15, Math.round(wordCount / 2.5));
  const hookStrength = Math.min(98, 70 + (scriptText.includes('?') ? 12 : 0) + (scriptText.toLowerCase().includes('stop') || scriptText.toLowerCase().includes('why') ? 14 : 0));
  const ctaStrength = Math.min(95, scriptText.toLowerCase().includes('follow') || scriptText.toLowerCase().includes('subscribe') || scriptText.toLowerCase().includes('bookmark') ? 88 : 45);
  const readability = Math.min(96, 68 + (wordCount < 140 ? 18 : 0) + (sentenceAvgLength(scriptText) < 14 ? 10 : 0));

  function sentenceAvgLength(text: string) {
    const sents = text.split(/[.!?]+/).filter(s => s.trim());
    if (sents.length === 0) return 20;
    return sents.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sents.length;
  }

  // Derive scene structure from narration text
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
    setVersions(prev => [newItem, ...prev]);
    setCurrentVersionIndex(0);
  };

  const handleSaveScript = async () => {
    updateContent(content.id, {
      script: {
        id: content.script?.id || `scr_${Date.now()}`,
        content: scriptText,
        wordCount,
        charCount,
        hookStrength,
        ctaStrength,
        readability,
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

    showToast({ type: 'success', title: 'Script saved', message: 'Content script updated and synced.' });
  };

  const handleGenerateScript = async () => {
    setGenerating(true);
    await demoEngine.simulateScriptGeneration(content.id, (_, stage) => setGenStage(stage));
    const updated = useContentStore.getState().getContent(content.id);
    if (updated?.script) {
      setScriptText(updated.script.content);
      recordNewVersion(updated.script.content, 'AI Generated');
    }
    setGenerating(false);
  };

  const handleAIAction = (actionLabel: string) => {
    let modified = scriptText;
    const sentences = scriptText.split(/(?<=[.?!])\s+/).filter(Boolean);

    if (actionLabel === 'Improve Hook') {
      const dynamicHooks = [
        `If you are still doing this manually in 2026, you're wasting 10 hours a week.`,
        `Stop scrolling: 95% of creators are approaching this completely wrong.`,
        `Here is the one AI secret nobody is talking about yet.`,
        `You won't believe what happens when you combine these two tools.`,
      ];
      const pick = dynamicHooks[Math.floor(Math.random() * dynamicHooks.length)];
      if (sentences.length > 0) {
        sentences[0] = pick;
        modified = sentences.join(' ');
      } else {
        modified = `${pick} Here's everything you need to know.`;
      }
    } else if (actionLabel === 'Make Shorter') {
      modified = sentences
        .slice(0, Math.max(3, Math.ceil(sentences.length * 0.75)))
        .map(s => s.replace(/\b(actually|basically|literally|honestly|just|very)\b\s*/gi, ''))
        .join(' ');
    } else if (actionLabel === 'More Viral') {
      modified = `Wait, look at this. ${sentences.join(' ')} And the craziest part? It works every single time.`;
    } else if (actionLabel === 'More Professional') {
      modified = sentences
        .map(s => s.replace(/\bcool\b/gi, 'effective').replace(/\bcrazy\b/gi, 'extraordinary').replace(/\bstuff\b/gi, 'architecture'))
        .join(' ');
    } else if (actionLabel === 'Simplify') {
      modified = scriptText
        .replace(/;,/g, '.')
        .split(/(?<=[.?!])\s+/)
        .map(s => s.trim())
        .join('\n');
    } else if (actionLabel === 'Add Story Arc') {
      modified = `I used to struggle with this constantly. Every single day, hours vanished into thin air.\nUntil I discovered a single shift in workflow.\n${sentences.slice(1).join(' ')}`;
    } else if (actionLabel === 'Generate Strong CTA') {
      const ctas = [
        'Bookmark this before you lose it, and subscribe for tomorrow’s automation breakdown.',
        'Follow ShortForge for more vertical video workflows tested in production.',
        'Save this post and drop your biggest challenge in the comments.',
      ];
      const ctaPick = ctas[Math.floor(Math.random() * ctas.length)];
      modified = `${scriptText.trim()}\n\n${ctaPick}`;
    }

    setScriptText(modified);
    recordNewVersion(modified, actionLabel);
    showToast({ type: 'success', title: actionLabel, message: 'Script adapted successfully.' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    showToast({ type: 'info', title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${content.title}\n\n**Hook:** ${scenes[0]?.script || ''}\n**Estimated Duration:** ${estDuration}s\n**Word Count:** ${wordCount}\n\n---\n\n${scriptText}\n\n---\n## Scenes Breakdown\n${scenes.map((s, i) => `### Scene ${i + 1} (${s.duration}s)\n- **Narration:** ${s.script}\n- **Visual Prompt:** ${s.visualPrompt}\n`).join('\n')}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-script.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreVersion = (ver: ScriptVersionItem) => {
    setScriptText(ver.content);
    recordNewVersion(ver.content, `Restored version ${ver.version}`);
    showToast({ type: 'info', title: 'Version restored', message: `Restored version ${ver.version}.` });
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      <PageHeader
        title={content.title}
        description="Structured script lab: pacing analysis, AI prompt transforms, and scene storyboard."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadMarkdown} title="Export Markdown">
              <Download className="h-4 w-4" />Export
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSaveScript}>
              <Save className="h-4 w-4" />Save
            </Button>
            <Button size="sm" onClick={() => { handleSaveScript(); navigate(`/studio/${content.id}`); }}>
              Studio <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {generating && (
        <Card className="p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div>
              <div className="text-sm font-medium text-text-primary">{genStage}</div>
              <div className="text-xs text-text-muted">Drafting vertical video script with retention pacing...</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 flex-1 min-h-0">
        {/* Main Editor / Scene Panel */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Script Workspace
              </CardTitle>
            </div>
            <div className="flex items-center rounded-md border border-border p-0.5 bg-surface-subtle">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={cn('px-2.5 py-1 text-xs font-medium rounded', activeTab === 'text' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted')}
              >
                Narration Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scenes')}
                className={cn('px-2.5 py-1 text-xs font-medium rounded', activeTab === 'scenes' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted')}
              >
                Scene Breakdown ({scenes.length})
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {activeTab === 'text' ? (
              <div className="flex-1 flex flex-col p-4 min-h-0">
                {!scriptText ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-sm">
                      <Sparkles className="h-10 w-10 text-accent mx-auto mb-3" />
                      <h4 className="text-sm font-semibold text-text-primary mb-1">Generate AI Script</h4>
                      <p className="text-xs text-text-secondary mb-4">
                        Generate a vertical short script structured specifically for 45-60s retention.
                      </p>
                      <Button onClick={handleGenerateScript} loading={generating}>
                        <Sparkles className="h-4 w-4" />Generate Script
                      </Button>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={scriptText}
                    onChange={e => setScriptText(e.target.value)}
                    className="flex-1 w-full bg-transparent text-text-primary text-sm leading-relaxed resize-none focus:outline-none font-mono"
                    placeholder="Enter script narration..."
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {scenes.map((sc, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface-subtle space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {sc.title}
                      </span>
                      <Badge variant="neutral">{sc.duration}s</Badge>
                    </div>
                    <div className="text-xs text-text-primary bg-surface p-2.5 rounded border border-border">
                      <span className="text-[10px] font-semibold text-text-muted uppercase block mb-0.5">Spoken Narration</span>
                      "{sc.script}"
                    </div>
                    <div className="text-xs text-text-secondary flex items-start gap-1.5 pt-1">
                      <Layers className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-text-primary text-[11px]">Visual Prompt (9:16): </span>
                        <span>{sc.visualPrompt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Type className="h-3.5 w-3.5" /><strong>{wordCount}</strong> words</span>
              <span><strong>{charCount}</strong> characters</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Est. <strong>{estDuration}s</strong></span>
            </div>
            <div className="text-text-secondary font-mono text-[11px]">Pacing: ~2.5 wps</div>
          </div>
        </Card>

        {/* Sidebar: AI Transformations, Metrics, Version History */}
        <div className="space-y-4 overflow-y-auto">
          {/* AI Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                AI Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              {AI_ACTIONS.map(a => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => handleAIAction(a.label)}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-subtle transition-colors text-left border border-border/50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <a.icon className="h-3.5 w-3.5 text-accent" />
                    <span className="font-medium text-text-primary">{a.label}</span>
                  </div>
                  <Wand2 className="h-3 w-3 text-text-muted" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Retention Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Retention Quality Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <Metric label="Hook Strength (0-3s)" value={hookStrength} />
              <Metric label="CTA Conversion Score" value={ctaStrength} />
              <Metric label="Pacing & Readability" value={readability} />
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-accent" />
                Version History ({versions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
              {versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  className={cn(
                    'p-2 rounded border text-xs flex items-center justify-between transition-colors',
                    idx === currentVersionIndex ? 'border-accent bg-accent/5' : 'border-border bg-surface-subtle/50'
                  )}
                >
                  <div>
                    <div className="font-semibold text-text-primary">v{ver.version}: {ver.action}</div>
                    <div className="text-[10px] text-text-muted">{ver.timestamp}</div>
                  </div>
                  {idx !== currentVersionIndex && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreVersion(ver)}
                      className="text-[10px] h-7 px-2"
                      title="Revert to this version"
                    >
                      <Undo className="h-3 w-3 mr-1" /> Restore
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="font-medium text-text-primary">{value}%</span>
      </div>
      <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-danger')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function parseScriptScenes(text: string, title: string) {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length === 0) {
    return [
      { title: 'Hook Scene', duration: 3, script: 'Hook line to stop the scroll.', visualPrompt: `Cinematic vertical opening showing ${title}` },
      { title: 'Core Demonstration', duration: 35, script: 'Explanation and value delivery.', visualPrompt: 'Clear demonstration of the core workflow' },
      { title: 'Call to Action', duration: 7, script: 'Subscribe and follow for daily videos.', visualPrompt: 'Dynamic logo outro and social handles' },
    ];
  }

  if (sentences.length <= 2) {
    return [
      { title: 'Opening Hook', duration: 5, script: sentences[0], visualPrompt: `Dynamic visual introducing ${title}` },
      { title: 'Core Insight', duration: 35, script: sentences[1] || sentences[0], visualPrompt: 'Clear engaging presentation of main idea' },
    ];
  }

  const hook = sentences[0];
  const cta = sentences[sentences.length - 1];
  const body = sentences.slice(1, -1);

  return [
    { title: 'Hook (0-3s)', duration: 4, script: hook, visualPrompt: `Scroll-stopping close-up visual representing ${title}` },
    { title: 'Problem & Context', duration: 12, script: body.slice(0, Math.ceil(body.length / 2)).join(' '), visualPrompt: 'Visual depicting workflow friction and common mistakes' },
    { title: 'Solution & Breakthrough', duration: 22, script: body.slice(Math.ceil(body.length / 2)).join(' '), visualPrompt: 'Clean modern interface demonstrating the solution' },
    { title: 'Call to Action', duration: 7, script: cta, visualPrompt: 'Engaging prompt asking viewer to follow and save' },
  ];
}
