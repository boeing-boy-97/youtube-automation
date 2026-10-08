import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../stores/contentStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from "../components/ui/Card";
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { seedTemplates } from '../mock/seedData';
import { FileText, Play, Copy, Archive } from 'lucide-react';

export function Templates() {
  const navigate = useNavigate();
  const createContent = useContentStore(s => s.createContent);
  const templates = seedTemplates();

  const handleUse = (template: typeof templates[0]) => {
    const content = createContent({
      title: `New ${template.name}`,
      status: 'draft',
      pillar: template.category,
      estimatedDuration: template.duration,
      hook: template.hook,
      cta: template.cta,
      thumbnailGradient: 'from-emerald-900 via-emerald-800 to-teal-700',
    });
    navigate(`/create?from=${content.id}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Templates" description="Reusable content frameworks to accelerate production." />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map(t => (
          <Card key={t.id} interactive className="p-5">
            <div className="h-32 rounded-lg bg-gradient-to-br from-emerald-900/20 to-teal-800/20 border border-border flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-accent" />
            </div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-text-primary">{t.name}</h3>
              {t.isDefault && <Badge variant="accent">Default</Badge>}
            </div>
            <p className="text-xs text-text-secondary mb-3">{t.description}</p>
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Hook:</span>
                <span className="text-text-secondary truncate">{t.hook.slice(0, 30)}...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Duration:</span>
                <span className="text-text-secondary">{t.duration}s</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Used:</span>
                <span className="text-text-secondary">{t.usageCount} times</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="flex-1" onClick={() => handleUse(t)}><Play className="h-3 w-3" />Use</Button>
              <Button variant="ghost" size="icon"><Copy className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon"><Archive className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
