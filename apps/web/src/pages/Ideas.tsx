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
import { apiClient } from '../services/apiClient';
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
  Clock,
  Layers,
} from 'lucide-react';

const TABS = [
  { key: 'trending', label: 'Trending Concepts' },
  { key: 'generated', label: 'Drafted Ideas' },
  { key: 'saved', label: 'Saved' },
  { key: 'used', label: 'In Production' },
  { key: 'rejected', label: 'Archived' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function Ideas() {
  const navigate = useNavigate();
  const ideas = useContentStore((s) => s.ideas);
  const addIdea = useContentStore((s) => s.addIdea);
  const updateIdea = useContentStore((s) => s.updateIdea);
  const deleteIdea = useContentStore((s) => s.deleteIdea);
  const moveIdeaToContent = useContentStore((s) => s.moveIdeaToContent);
  const showToast = useUIStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState({ progress: 0, stage: '' });
  const [genForm, setGenForm] = useState({
    topic: '',
    audience: 'Engineers and tech creators',
    niche: 'AI & Engineering',
    pillar: 'System Architecture',
    count: 4,
  });

  const filtered = ideas.filter((i) => i.status === activeTab);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress({ progress: 20, stage: 'Connecting to AI concept generator...' });
    try {
      const res = await apiClient.ideas.generate(undefined as any, genForm.count);
      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          addIdea({
            title: item.title,
            hook: item.hook,
            angle: item.angle || 'Technical Insight',
            pillar: genForm.pillar,
            whyItWorks: item.summary || 'Direct contrast with standard industry practice',
            suggestedDuration: item.targetDurationSec || 45,
            cta: 'Subscribe for daily architectural breakdowns',
            potential: 90,
            freshness: 90,
            difficulty: 50,
            estimatedRetention: 75,
            source: 'Studio Generator',
            status: 'generated',
          });
        });
      }
      showToast({
        type: 'success',
        title: 'Ideas generated',
        message: `Created ${genForm.count} new concepts.`,
      });
      setActiveTab('generated');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Idea generation failed',
        message: err.message || 'Ensure OPENAI_API_KEY is configured in backend environment.',
      });
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
        title="Idea Concept Lab"
        description="Curiosity hooks, content angles, and vertical video hypotheses."
        actions={
          <Button
            onClick={() => setShowGenerator(true)}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Concepts</span>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const count = ideas.filter((i) => i.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
                activeTab === tab.key
                  ? 'border-vermilion text-vermilion font-semibold'
                  : 'border-transparent text-stone hover:text-ink'
              )}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-canvas-subtle border border-border text-[10px] font-mono text-stone">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={`No ${activeTab} ideas found`}
          description={
            activeTab === 'trending'
              ? 'Trending concepts appear here as you curate or generate topic pillars.'
              : 'Generate new video concepts with the studio generator.'
          }
          action={{ label: 'Generate Ideas', onClick: () => setShowGenerator(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onMoveToProduction={() => handleMoveToProduction(idea.id)}
              onSave={() => {
                updateIdea(idea.id, {
                  status: idea.status === 'saved' ? 'generated' : 'saved',
                });
              }}
              onReject={() => {
                updateIdea(idea.id, { status: 'rejected' });
              }}
              onDelete={() => deleteIdea(idea.id)}
              onRemix={() => {
                addIdea({
                  title: idea.title + ' (Variation)',
                  hook: idea.hook,
                  angle: 'Variation: ' + idea.angle,
                  pillar: idea.pillar,
                  whyItWorks: 'Remixed beat angle',
                  suggestedDuration: idea.suggestedDuration,
                  cta: idea.cta,
                  potential: idea.potential,
                  freshness: idea.freshness,
                  difficulty: idea.difficulty,
                  estimatedRetention: idea.estimatedRetention,
                  source: 'Remix',
                  status: 'generated',
                });
                showToast({ type: 'success', title: 'Concept variation created' });
              }}
            />
          ))}
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => !generating && setShowGenerator(false)}
        >
          <div
            className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-vermilion" />
                <span>Concept Generation Studio</span>
              </h3>
              {!generating && (
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-stone hover:text-ink p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {generating ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="h-6 w-6 text-vermilion animate-spin mx-auto" />
                <p className="text-xs font-semibold text-ink">{genProgress.stage}</p>
                <p className="text-[11px] text-stone">Synthesizing curiosity hooks and 3-act pacing...</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <Input
                  label="Seed Topic (Optional)"
                  placeholder="e.g. SQLite database performance at scale"
                  value={genForm.topic}
                  onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                />
                <Input
                  label="Target Audience"
                  value={genForm.audience}
                  onChange={(e) => setGenForm({ ...genForm, audience: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Niche"
                    value={genForm.niche}
                    onChange={(e) => setGenForm({ ...genForm, niche: e.target.value })}
                  />
                  <Input
                    label="Content Pillar"
                    value={genForm.pillar}
                    onChange={(e) => setGenForm({ ...genForm, pillar: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Number of Concepts ({genForm.count})</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={genForm.count}
                    onChange={(e) => setGenForm({ ...genForm, count: Number(e.target.value) })}
                    className="w-full accent-vermilion"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <Button
                    variant="secondary"
                    onClick={() => setShowGenerator(false)}
                    className="btn-secondary h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    className="btn-primary h-9 text-xs"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Generate Concepts</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  onMoveToProduction,
  onSave,
  onRemix,
  onDelete,
}: {
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
    <div
      className="p-5 rounded-lg bg-surface border border-border shadow-xs hover:border-vermilion/50 transition-all space-y-3 flex flex-col justify-between"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-canvas-subtle border border-border text-stone">
            {idea.pillar || 'General'}
          </span>
          <div className="flex items-center gap-1">
            {showActions ? (
              <>
                <button
                  onClick={onSave}
                  className="p-1 rounded text-stone hover:text-ink"
                  title={saved ? 'Unsave' : 'Save'}
                >
                  <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-vermilion text-vermilion')} />
                </button>
                <button
                  onClick={onRemix}
                  className="p-1 rounded text-stone hover:text-ink"
                  title="Variation"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 rounded text-stone hover:text-danger"
                  title="Delete"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <span className="text-[10px] text-stone-muted font-mono">
                {idea.suggestedDuration || 45}s
              </span>
            )}
          </div>
        </div>

        <h4 className="font-semibold text-ink text-sm leading-snug">{idea.title}</h4>

        <div className="p-2.5 rounded bg-canvas-subtle border border-border space-y-1">
          <span className="text-[10px] font-mono font-bold text-vermilion uppercase block">
            Opening Hook
          </span>
          <p className="text-xs text-stone leading-relaxed italic">"{idea.hook}"</p>
        </div>

        {idea.whyItWorks && (
          <p className="text-[11px] text-stone-muted leading-relaxed">
            <strong className="text-ink font-medium">Angle:</strong> {idea.whyItWorks}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-stone-muted font-mono">
          {formatRelativeTime(idea.createdAt)}
        </span>
        <Button
          size="sm"
          onClick={onMoveToProduction}
          className="btn-primary h-7 px-3 text-xs"
        >
          <span>To Studio</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
