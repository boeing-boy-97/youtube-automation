import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { cn } from '../lib/utils';
import {
  Palette,
  Save,
  CheckCircle,
} from 'lucide-react';

export function BrandKit() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const showToast = useUIStore((s) => s.showToast);

  const [brandName, setBrandName] = useState(workspace?.brand?.name || 'Creative Studio');
  const [primaryColor, setPrimaryColor] = useState(workspace?.brand?.primaryAccent || '#EC5A3A');
  const [font, setFont] = useState(workspace?.brand?.font || 'Inter');
  const [captionStyle, setCaptionStyle] = useState(workspace?.brand?.captionStyle || 'Clean Sans');
  const [watermark, setWatermark] = useState(workspace?.brand?.watermark || 'SHORTFORGE');
  const [saving, setSaving] = useState(false);

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
      showToast({ type: 'success', title: 'Brand Kit Updated', message: 'Presets applied to all future generations.' });
    } catch {
      showToast({ type: 'error', title: 'Update Failed', message: 'Could not persist brand kit.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Kit & Visual Identity"
        description="Standardize typography, brand color accents, subtitle presets, and safe-zone watermarks."
        actions={
          <Button
            onClick={handleSave}
            loading={saving}
            className="btn-primary h-9 px-4 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Brand Kit</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-surface border border-border shadow-xs space-y-4">
            <span className="text-xs font-mono font-bold text-coral uppercase tracking-wide block border-b border-border pb-2">
              Brand Attributes
            </span>

            <Input
              label="Brand / Channel Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <div>
              <label className="field-label">Primary Studio Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 rounded border border-border cursor-pointer bg-surface p-1"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input-field text-xs font-mono uppercase max-w-[120px]"
                />
                <span className="text-xs text-stone">Used for kinetic typography and thumbnail accents</span>
              </div>
            </div>

            <div>
              <label className="field-label">Primary Subtitle Typeface</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Inter">Inter (Clean modern sans-serif)</option>
                <option value="Newsreader">Newsreader (Editorial literary serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (Technical monospace)</option>
                <option value="Montserrat">Montserrat (Impact uppercase)</option>
              </select>
            </div>

            <div>
              <label className="field-label">Default Caption Preset</label>
              <select
                value={captionStyle}
                onChange={(e) => setCaptionStyle(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Clean Sans">Clean Sans (High contrast with dark drop shadow)</option>
                <option value="Bold Sans">Bold Sans (Kinetic uppercase punch)</option>
                <option value="Minimal Editorial">Minimal Editorial (Refined serif)</option>
                <option value="Highlight Box">Highlight Box (Solid color background)</option>
              </select>
            </div>

            <Input
              label="Watermark Text (Optional)"
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              placeholder="e.g. SHORTFORGE"
            />
          </div>
        </div>

        {/* Right: Live 9:16 Visual Safe-Zone Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs w-full max-w-sm space-y-3">
            <span className="text-xs font-mono font-bold text-stone uppercase tracking-wide block border-b border-border pb-2">
              Live Safe-Zone Preview
            </span>

            <div className="aspect-[9/16] bg-ink rounded-lg relative p-4 flex flex-col justify-between text-white overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                <span>{brandName}</span>
                <span style={{ color: primaryColor }}>1080×1920</span>
              </div>

              <div className="my-auto text-center space-y-2 px-3">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase"
                  style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                >
                  Brand Styling
                </span>
                <p className="text-xs text-white/80">
                  Sample composition using {font} and {primaryColor}.
                </p>
              </div>

              <div className="bg-black/80 backdrop-blur-md p-2.5 rounded text-center border border-white/10 mb-2">
                <p
                  className="text-xs font-bold leading-snug"
                  style={{ fontFamily: font, color: '#FFFFFF' }}
                >
                  "Why 90% of developers fail the first three seconds."
                </p>
              </div>

              {watermark && (
                <div className="text-[9px] font-mono text-white/40 tracking-widest text-right uppercase">
                  {watermark}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
