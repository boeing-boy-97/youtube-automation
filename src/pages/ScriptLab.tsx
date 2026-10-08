import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

import { demoEngine } from '../services/demoEngine';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
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
} from 'lucide-react';

const AI_ACTIONS = [
  { label: 'Improve Hook', icon: Zap },
  { label: 'Make Shorter', icon: Type },
  { label: 'More Viral', icon: TrendingUp },
  { label: 'More Professional', icon: BookOpen },
  { label: 'Simplify', icon: RotateCcw },
  { label: 'Add Story', icon: MessageSquare },
  { label: 'Generate CTA', icon: Wand2 },
];

export function ScriptLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore(s => s.items.find(i => i.id === id));
  const _updateContent = useContentStore(s => s.updateContent); void _updateContent;
  const showToast = useUIStore(s => s.showToast);
  const [scriptText, setScriptText] = useState(content?.script?.content || '');
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState('');

  useEffect(() => {
    if (content?.script) {
      setScriptText(content.script.content);
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
  const estDuration = Math.round(wordCount / 2.5);
  const hookStrength = Math.min(95, 70 + (scriptText.includes('?') ? 15 : 0) + (scriptText.length > 100 ? 10 : 0));
  const ctaStrength = Math.min(90, scriptText.toLowerCase().includes('follow') || scriptText.toLowerCase().includes('subscribe') ? 85 : 50);
  const readability = Math.min(95, 65 + (wordCount < 130 ? 20 : 0) + (sentenceAvgLength(scriptText) < 15 ? 10 : 0));

  function sentenceAvgLength(text: string) {
    const sents = text.split(/[.!?]+/).filter(s => s.trim());
    if (sents.length === 0) return 20;
    return sents.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sents.length;
  }

  const handleGenerateScript = async () => {
    setGenerating(true);
    await demoEngine.simulateScriptGeneration(content.id, (_, stage) => setGenStage(stage));
    const updated = useContentStore.getState().getContent(content.id);
    if (updated?.script) setScriptText(updated.script.content);
    setGenerating(false);
  };

  const handleAIAction = (action: string) => {
    showToast({ type: 'info', title: `${action}...`, message: 'Demo: Script updated' });
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <PageHeader
        title={content.title}
        description="Professional script editor"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => showToast({ type: 'success', title: 'Script saved' })}>
              <Save className="h-4 w-4" />Save
            </Button>
            {content.script && (
              <Button size="sm" onClick={() => navigate(`/studio/${content.id}`)}>
                Continue to Studio<ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      {generating && (
        <Card className="mb-4 p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div>
              <div className="text-sm font-medium text-text-primary">{genStage}</div>
              <div className="text-xs text-text-muted">Writing your script...</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 flex-1 min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Script Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {!content.script ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary mb-4">Generate an AI-written script for this concept.</p>
                  <Button onClick={handleGenerateScript} loading={generating}>
                    <Sparkles className="h-4 w-4" />Generate Script
                  </Button>
                </div>
              </div>
            ) : (
              <textarea
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
                className="flex-1 w-full p-5 bg-transparent text-text-primary text-sm leading-relaxed resize-none focus:outline-none font-mono"
                placeholder="Write your script here..."
              />
            )}
          </CardContent>
          <div className="px-5 py-3 border-t border-border flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1"><Type className="h-3 w-3" />{wordCount} words</span>
            <span className="flex items-center gap-1">{charCount} chars</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{Math.floor(estDuration / 60)}:{(estDuration % 60).toString().padStart(2, '0')}</span>
          </div>
        </Card>

        <div className="space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">AI Assistant</CardTitle></CardHeader>
            <CardContent className="p-3 grid grid-cols-2 gap-1.5">
              {AI_ACTIONS.map(a => (
                <Button key={a.label} variant="ghost" size="sm" className="justify-start text-xs" onClick={() => handleAIAction(a.label)} disabled={!content.script}>
                  <a.icon className="h-3 w-3 mr-1" />{a.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Script Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-3 p-4">
              <Metric label="Hook Strength" value={hookStrength} />
              <Metric label="CTA Strength" value={ctaStrength} />
              <Metric label="Readability" value={readability} />
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-medium text-text-primary">{Math.floor(estDuration / 60)}:{(estDuration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><History className="h-3.5 w-3.5" />Versions</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-1">
              {['Version 1 (current)'].map(v => (
                <button key={v} className="w-full text-left px-3 py-2 rounded-md bg-surface-subtle/50 text-sm text-text-primary">
                  {v}
                  <span className="block text-xs text-text-muted">Just now</span>
                </button>
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
        <div className={cn('h-full rounded-full', value >= 85 ? 'bg-success' : value >= 70 ? 'bg-warning' : 'bg-error')} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
