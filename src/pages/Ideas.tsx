import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/common/EmptyState';
import { demoEngine } from '../services/demoEngine';
import { cn, formatRelativeTime } from '../lib/utils';
import type { Idea } from '../types/content';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Bookmark,
  X,
  Wand2,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'generated', label: 'Generated' },
  { key: 'saved', label: 'Saved' },
  { key: 'used', label: 'Used' },
  { key: 'rejected', label: 'Rejected' },
] as const;

type TabKey = typeof TABS[number]['key'];

export function Ideas() {
  const navigate = useNavigate();
  const ideas = useContentStore(s => s.ideas);
  const addIdea = useContentStore(s => s.addIdea);
  const updateIdea = useContentStore(s => s.updateIdea);
  const deleteIdea = useContentStore(s => s.deleteIdea);
  const moveIdeaToContent = useContentStore(s => s.moveIdeaToContent);
  const showToast = useUIStore(s => s.showToast);

  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState({ progress: 0, stage: '' });
  const [genForm, setGenForm] = useState({ topic: '', audience: 'Students and developers', niche: 'AI Technology', pillar: 'AI Tools', tone: 'professional', count: 5 });

  const filtered = ideas.filter(i => i.status === activeTab);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress({ progress: 0, stage: 'Starting...' });
    try {
      await demoEngine.simulateIdeaGeneration(genForm, (progress, stage) => {
        setGenProgress({ progress, stage });
      });
      setActiveTab('generated');
    } finally {
      setGenerating(false);
      setShowGenerator(false);
    }
  };

  const handleMoveToProduction = (ideaId: string) => {
    const content = moveIdeaToContent(ideaId);
    if (content) {
      navigate(`/content/${content.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ideas Hub"
        description="Discover, generate, and refine content concepts."
        actions={
          <Button onClick={() => setShowGenerator(true)}>
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const count = ideas.filter(i => i.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
                activeTab === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
              {count > 0 && <span className="ml-1.5 text-xs text-text-muted">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={`No ${activeTab} ideas`}
          description={activeTab === 'trending' ? 'Trending topics will appear here as the engine analyzes patterns.' : 'Generate new ideas to get started.'}
          action={{ label: 'Generate Ideas', onClick: () => setShowGenerator(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onMoveToProduction={() => handleMoveToProduction(idea.id)}
              onSave={() => { updateIdea(idea.id, { status: idea.status === 'saved' ? 'generated' : 'saved' }); }}
              onReject={() => { updateIdea(idea.id, { status: 'rejected' }); }}
              onDelete={() => deleteIdea(idea.id)}
              onRemix={() => {
                addIdea({
                  title: idea.title + ' (Remix)',
                  hook: idea.hook,
                  angle: 'Remixed angle: ' + idea.angle,
                  pillar: idea.pillar,
                  whyItWorks: 'Remixed variation',
                  suggestedDuration: idea.suggestedDuration,
                  cta: idea.cta,
                  potential: Math.min(99, idea.potential + 5),
                  freshness: 95,
                  difficulty: idea.difficulty,
                  estimatedRetention: idea.estimatedRetention,
                  source: 'Remix',
                  status: 'generated',
                });
                showToast({ type: 'success', title: 'Remix created' });
              }}
            />
          ))}
        </div>
      )}

      {/* Generator panel */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !generating && setShowGenerator(false)}>
          <Card className="w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                AI Idea Generator
              </h3>
              {!generating && <button onClick={() => setShowGenerator(false)} className="text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>}
            </div>

            {generating ? (
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-6 w-6 text-accent animate-spin" />
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">{genProgress.stage}</p>
                <div className="mt-4 h-1.5 bg-surface-subtle rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${genProgress.progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <Input label="Topic (optional)" placeholder="e.g., AI coding tools" value={genForm.topic} onChange={e => setGenForm({ ...genForm, topic: e.target.value })} />
                <Input label="Audience" value={genForm.audience} onChange={e => setGenForm({ ...genForm, audience: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Niche" value={genForm.niche} onChange={e => setGenForm({ ...genForm, niche: e.target.value })} />
                  <Input label="Content Pillar" value={genForm.pillar} onChange={e => setGenForm({ ...genForm, pillar: e.target.value })} />
                </div>
                <div>
                  <label className="label mb-1.5 block">Number of ideas</label>
                  <input type="range" min={1} max={10} value={genForm.count} onChange={e => setGenForm({ ...genForm, count: Number(e.target.value) })} className="w-full accent-accent" />
                  <div className="text-xs text-text-muted mt-1 text-center">{genForm.count} ideas</div>
                </div>
                <Button onClick={handleGenerate} className="w-full">
                  <Wand2 className="h-4 w-4" />
                  Generate {genForm.count} Ideas
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, onMoveToProduction, onSave, onRemix, onDelete }: {
  idea: Idea;
  onMoveToProduction: () => void;
  onSave: () => void;
  onReject: () => void;
  onRemix: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const saved = idea.status === 'saved';

  return (
    <Card interactive className="p-5 relative" onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>
      <div className="flex items-start gap-2 mb-3">
        <Badge variant={idea.status === 'trending' ? 'warning' : idea.status === 'saved' ? 'accent' : 'default'}>
          {idea.status === 'trending' && <TrendingUp className="h-3 w-3" />}
          {idea.pillar}
        </Badge>
        <div className="ml-auto flex items-center gap-1">
          {showActions && (
            <>
              <button onClick={onSave} className="btn-icon" title={saved ? 'Unsave' : 'Save'}>
                <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-accent text-accent')} />
              </button>
              <button onClick={onRemix} className="btn-icon" title="Remix">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="btn-icon text-danger hover:text-danger" title="Delete">
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <h4 className="font-semibold text-text-primary text-sm mb-2 leading-snug">{idea.title}</h4>
      <p className="text-xs text-text-secondary mb-3 line-clamp-2">{idea.hook}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <MetricBar label="Potential" value={idea.potential} />
        <MetricBar label="Freshness" value={idea.freshness} />
        <MetricBar label="Retention" value={idea.estimatedRetention} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{formatRelativeTime(idea.createdAt)}</span>
        <Button size="sm" onClick={onMoveToProduction}>
          Move to Production
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-error';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-medium text-text-primary">{value}</span>
      </div>
      <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
