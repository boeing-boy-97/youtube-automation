import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { cn } from '../lib/utils';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Music,
  Mic,
  Layers,
  CheckCircle,
  Save,
  Sparkles,
  Settings,
} from 'lucide-react';

export function BrandKit() {
  const navigate = useNavigate();
  const workspace = useWorkspaceStore(s => s.workspace);
  const updateWorkspace = useWorkspaceStore(s => s.updateWorkspace);
  const showToast = useUIStore(s => s.showToast);

  const [brandName, setBrandName] = useState(workspace?.brand?.name || 'ShortForge');
  const [primaryColor, setPrimaryColor] = useState(workspace?.brand?.primaryAccent || '#10b981');
  const [font, setFont] = useState(workspace?.brand?.font || 'Inter');
  const [captionStyle, setCaptionStyle] = useState(workspace?.brand?.captionStyle || 'Bold');
  const [watermark, setWatermark] = useState(workspace?.brand?.watermark || '');
  const [saving, setSaving] = useState(false);

  const factors = [
    { label: 'Brand name defined', done: !!brandName },
    { label: 'Primary accent set', done: !!primaryColor },
    { label: 'Typography selected', done: !!font },
    { label: 'Caption style configured', done: !!captionStyle },
    { label: 'Watermark text set', done: !!watermark },
    { label: 'Voice persona assigned', done: true },
  ];

  const score = Math.round((factors.filter(f => f.done).length / factors.length) * 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWorkspace({
        brand: {
          name: brandName,
          primaryAccent: primaryColor,
          font,
          captionStyle,
          captionPosition: 'bottom',
          watermark: watermark || undefined,
        },
      });
      showToast({ type: 'success', title: 'Brand Kit Updated', message: 'Identity rules saved across production pipelines.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Brand Kit"
        description="Configure typography, color palettes, caption presets, and watermarks enforced across automated video pipelines."
        actions={
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save Brand Kit
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Left Column: Brand Health Score & Live 9:16 Watermark Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Brand Consistency Health</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="relative h-24 w-24 mx-auto mb-3">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" className="stroke-border" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    className="stroke-accent transition-all duration-500"
                    strokeWidth="4"
                    strokeDasharray={`${90 * (score / 100) * Math.PI * 0.88} ${90 * Math.PI}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-primary">{score}%</span>
                </div>
              </div>
              <div className="space-y-1.5 text-left border-t border-border pt-3">
                {factors.map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-xs">
                    {f.done ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> : <div className="h-3.5 w-3.5 rounded-full border border-text-muted shrink-0" />}
                    <span className={f.done ? 'text-text-primary' : 'text-text-muted'}>{f.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 9:16 Live Preview */}
          <Card className="p-4 flex flex-col items-center justify-center bg-surface-subtle">
            <span className="text-[11px] font-semibold text-text-muted uppercase mb-3">Brand Output Preview</span>
            <div
              className="aspect-[9/16] w-48 rounded-lg relative overflow-hidden flex flex-col justify-between p-3 select-none shadow"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <div className="flex justify-between items-center text-[10px] text-white/50">
                <span>9:16</span>
                <span className="font-mono uppercase tracking-wider">{watermark || brandName}</span>
              </div>
              <div className="text-center my-auto">
                <div className="h-8 w-8 rounded-full bg-accent/30 text-accent mx-auto mb-2 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="text-[11px] font-bold text-white drop-shadow">{brandName}</div>
              </div>
              <div className="text-center mb-2">
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 text-white font-bold text-[11px]',
                    captionStyle === 'Bold' && 'text-xs uppercase drop-shadow',
                    captionStyle === 'Highlight' && 'bg-yellow-400 text-black rounded',
                    captionStyle === 'Minimal' && 'bg-black/60 rounded text-[10px]'
                  )}
                  style={{ fontFamily: font }}
                >
                  Subtitles Preview
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Brand Rules */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identity Parameters</CardTitle>
              <CardDescription>Rules injected into AI prompts and FFmpeg render graphs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Brand / Channel Name"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. ShortForge Studio"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1.5 block">Primary Accent</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded border border-border cursor-pointer bg-surface"
                    />
                    <span className="text-xs font-mono text-text-primary uppercase">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="label mb-1.5 block">Default Subtitle Typography</label>
                  <select
                    value={font}
                    onChange={e => setFont(e.target.value)}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Inter">Inter (Sans-Serif Modern)</option>
                    <option value="Montserrat">Montserrat (Impact Heavy)</option>
                    <option value="Poppins">Poppins (Geometric)</option>
                    <option value="Roboto">Roboto (Clean Neutral)</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1.5 block">Default Caption Style</label>
                  <select
                    value={captionStyle}
                    onChange={e => setCaptionStyle(e.target.value)}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Bold">Bold (High-contrast uppercase)</option>
                    <option value="Minimal">Minimal (Clean transparent box)</option>
                    <option value="Karaoke">Karaoke (Word-by-word pulse)</option>
                    <option value="Highlight">Highlight (Yellow marker emphasis)</option>
                    <option value="Clean">Clean (Frosted glass pill)</option>
                  </select>
                </div>

                <Input
                  label="Watermark Text (Corner Overlay)"
                  value={watermark}
                  onChange={e => setWatermark(e.target.value)}
                  placeholder="e.g. @ShortForge"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" /> Save Brand Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
