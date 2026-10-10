import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { seedTemplates } from '../mock/seedData';
import { FileText, Play, Copy, Archive, Check } from 'lucide-react';

export function Templates() {
  const navigate = useNavigate();
  const createContent = useContentStore(s => s.createContent);
  const showToast = useUIStore(s => s.showToast);
  const [templates, setTemplates] = useState(seedTemplates());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUse = (template: typeof templates[0]) => {
    const content = createContent({
      title: `${template.name} Draft`,
      status: 'draft',
      pillar: template.category,
      estimatedDuration: template.duration,
      hook: template.hook,
      cta: template.cta,
      thumbnailGradient: 'from-emerald-900 via-emerald-800 to-teal-700',
    });
    showToast({ type: 'success', title: 'Template Applied', message: `Created project from ${template.name}` });
    navigate(`/create`);
  };

  const handleCopyTemplate = (t: typeof templates[0]) => {
    const text = `Template: ${t.name}\nCategory: ${t.category}\nDuration: ${t.duration}s\nHook: ${t.hook}\nCTA: ${t.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(t.id);
    showToast({ type: 'info', title: 'Copied to Clipboard', message: `${t.name} outline copied.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleArchiveTemplate = (id: string, name: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast({ type: 'info', title: 'Template Archived', message: `${name} moved to archive.` });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Content Templates"
        description="Pre-tested structural frameworks engineered for 45-60s retention on vertical algorithms."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="p-5 flex flex-col justify-between border border-border">
            <div>
              <div className="h-28 rounded-lg bg-surface-subtle border border-border flex items-center justify-center mb-3">
                <FileText className="h-7 w-7 text-accent" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-xs text-text-primary">{t.name}</h3>
                {t.isDefault && <Badge variant="accent">Standard</Badge>}
              </div>
              <p className="text-[11px] text-text-secondary mb-3">{t.description}</p>
              <div className="space-y-1 text-xs border-t border-border pt-2 mb-4">
                <div className="flex justify-between text-text-muted">
                  <span>Category</span>
                  <span className="text-text-primary font-medium">{t.category}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Target Time</span>
                  <span className="text-text-primary font-mono">{t.duration}s</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Tested Pacing</span>
                  <span className="text-text-primary font-mono">{t.usageCount} productions</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 pt-2">
              <Button size="sm" className="flex-1" onClick={() => handleUse(t)}>
                <Play className="h-3 w-3" /> Apply
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyTemplate(t)}
                title="Copy template text"
              >
                {copiedId === t.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleArchiveTemplate(t.id, t.name)}
                title="Archive template"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
