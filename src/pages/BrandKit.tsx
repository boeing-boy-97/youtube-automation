import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { Palette, Type, Image as ImageIcon, Music, Mic, Layers, CheckCircle } from 'lucide-react';

export function BrandKit() {
  const workspace = useWorkspaceStore(s => s.workspace);
  const score = 92;

  const factors = [
    { label: 'Logo uploaded', done: false },
    { label: 'Brand color set', done: true },
    { label: 'Font selected', done: true },
    { label: 'Caption style configured', done: true },
    { label: 'Watermark set', done: false },
    { label: 'Default music selected', done: true },
    { label: 'Voice configured', done: true },
    { label: 'Intro/outro uploaded', done: false },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Brand Kit" description="Maintain consistent visual identity across all content." />

      <div className="grid md:grid-cols-3 gap-5">
        <Card>
          <CardHeader><CardTitle>Brand Consistency</CardTitle></CardHeader>
          <CardContent className="text-center">
            <div className="relative h-28 w-28 mx-auto mb-3">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" className="stroke-border" strokeWidth="4" />
                <circle cx="32" cy="32" r="26" fill="none" className="stroke-accent" strokeWidth="4" strokeDasharray={`${90 * (score/100) * Math.PI * 0.88} ${90 * Math.PI}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-text-primary">{score}%</span>
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              {factors.map(f => (
                <div key={f.label} className="flex items-center gap-2 text-xs">
                  {f.done ? <CheckCircle className="h-3 w-3 text-success" /> : <div className="h-3 w-3 rounded-full border border-text-muted" />}
                  <span className={f.done ? 'text-text-primary' : 'text-text-muted'}>{f.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Palette className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="text-xs text-text-muted">Colors</div>
                  <div className="flex gap-1 mt-1">
                    <div className="h-5 w-5 rounded bg-emerald-700 border border-border" />
                    <div className="h-5 w-5 rounded bg-slate-800 border border-border" />
                    <div className="h-5 w-5 rounded bg-white border border-border" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Type className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="text-xs text-text-muted">Typography</div>
                  <div className="text-sm font-semibold text-text-primary">{workspace?.brand.font || 'Inter'}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Mic className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="text-xs text-text-muted">Voice</div>
                  <div className="text-sm font-semibold text-text-primary">{workspace?.voice.voice || 'Antoni'}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Music className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="text-xs text-text-muted">Music</div>
                  <div className="text-sm font-semibold text-text-primary">Ambient (default)</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button>Edit Brand Kit</Button>
        </div>
      </div>
    </div>
  );
}
