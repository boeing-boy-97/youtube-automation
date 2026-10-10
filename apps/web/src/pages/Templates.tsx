import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { seedTemplates } from '../mock/seedData';
import { FileText, Copy, Check, ArrowRight } from 'lucide-react';

export function Templates() {
  const navigate = useNavigate();
  const createContent = useContentStore((s) => s.createContent);
  const showToast = useUIStore((s) => s.showToast);
  const [templates, setTemplates] = useState(seedTemplates());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUse = (template: (typeof templates)[0]) => {
    createContent({
      title: `${template.name} Draft`,
      status: 'draft',
      pillar: template.category,
      estimatedDuration: template.duration,
      hook: template.hook,
      cta: template.cta,
      thumbnailGradient: 'from-stone-900 via-stone-800 to-black',
    });
    showToast({
      type: 'success',
      title: 'Template Applied',
      message: `Created project from ${template.name}`,
    });
    navigate(`/create`);
  };

  const handleCopyTemplate = (t: (typeof templates)[0]) => {
    const text = `Template: ${t.name}\nCategory: ${t.category}\nDuration: ${t.duration}s\nHook: ${t.hook}\nCTA: ${t.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(t.id);
    showToast({ type: 'info', title: 'Copied', message: `${t.name} outline copied.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Screenplay Templates"
        description="Structural 3-act narrative frameworks calibrated for 45-60s retention on vertical algorithms."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-xl bg-surface border border-border shadow-xs hover:border-coral/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-canvas-subtle border border-border text-[10px] font-mono text-stone">
                  {t.category}
                </span>
                <span className="font-mono text-xs text-coral font-bold">{t.duration}s</span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-ink">{t.name}</h3>
                <p className="text-xs text-stone mt-1 line-clamp-2">{t.description}</p>
              </div>

              <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-1">
                <span className="text-[10px] font-mono font-bold text-coral uppercase block">
                  Hook Structure
                </span>
                <p className="text-xs text-stone italic leading-relaxed">"{t.hook}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyTemplate(t)}
                className="btn-ghost h-8 px-2 text-xs text-stone hover:text-ink"
                title="Copy framework"
              >
                {copiedId === t.id ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <Button
                size="sm"
                onClick={() => handleUse(t)}
                className="btn-primary h-8 px-3 text-xs"
              >
                <span>Use Template</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
