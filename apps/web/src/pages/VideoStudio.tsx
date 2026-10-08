import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
 
import { useContentStore } from '../stores/contentStore';
import { demoEngine } from '../services/demoEngine';
import { useUIStore } from '../stores/uiStore';
import { cn } from '../lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Video as VideoIcon,
  Music,
  Type,
  Layers,
  Settings,
  Loader2,
  Scissors,
} from 'lucide-react';

const ASPECT_PRESETS = [
  { label: 'TikTok / Shorts', ratio: '9:16', w: 9, h: 16 },
  { label: 'Instagram Reels', ratio: '9:16', w: 9, h: 16 },
  { label: 'YouTube', ratio: '16:9', w: 16, h: 9 },
];

const TIMELINE_LAYERS = [
  { id: 'video', label: 'Video', icon: VideoIcon, color: 'bg-accent' },
  { id: 'voice', label: 'Voice', icon: VideoIcon, color: 'bg-info' },
  { id: 'music', label: 'Music', icon: Music, color: 'bg-warning' },
  { id: 'captions', label: 'Captions', icon: Type, color: 'bg-success' },
  { id: 'overlay', label: 'Overlay', icon: Layers, color: 'bg-purple-500' },
];

const CAPTION_STYLES = ['Minimal', 'Bold', 'Karaoke', 'Highlight', 'Clean'];

export function VideoStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore(s => s.items.find(i => i.id === id));
  const showToast = useUIStore(s => s.showToast);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime] = useState(0);
  const [activeAspect, setActiveAspect] = useState(0);
  const [captionStyle, setCaptionStyle] = useState('Bold');
  const [activeLayer, setActiveLayer] = useState('video');
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [currentTab, setCurrentTab] = useState<'captions' | 'style' | 'settings'>('captions');

  if (!content) {
    return (
      <div className="space-y-5">
        <PageHeader title="Video Studio" description="Edit and preview your video." />
        <Card className="p-12 text-center">
          <VideoIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-4">Select content to edit in the studio.</p>
          <Button onClick={() => navigate('/create')}>Create Content</Button>
        </Card>
      </div>
    );
  }

  const duration = content.duration || content.estimatedDuration || 45;

  const handleRender = async () => {
    setRendering(true);
    const success = await demoEngine.simulateRendering(content.id, (p, stage) => {
      setRenderProgress(p);
      setRenderStage(stage);
    });
    setRendering(false);
    if (success) {
      showToast({ type: 'success', title: 'Render complete', message: content.title });
      navigate(`/content/${content.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={content.title}
        description="Video Studio"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(`/content/${content.id}`)}>Cancel</Button>
            <Button onClick={handleRender} loading={rendering}>
              <Scissors className="h-4 w-4" />
              {rendering ? `Rendering ${renderProgress}%` : 'Render Video'}
            </Button>
          </div>
        }
      />

      {rendering && (
        <Card className="p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{renderStage}</div>
              <div className="h-1 bg-surface-subtle rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
            <span className="text-xs text-text-muted">{renderProgress}%</span>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[220px_1fr_280px] gap-4 h-[calc(100vh-11rem)]">
        {/* Assets panel */}
        <Card className="overflow-y-auto hidden lg:block">
          <div className="p-3 border-b border-border">
            <span className="label">Assets</span>
          </div>
          <div className="p-2 space-y-1">
            {content.visuals?.map((scene, i) => (
              <div key={scene.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-subtle cursor-pointer">
                <div className="h-10 w-14 rounded bg-gradient-to-br from-emerald-800 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-text-primary truncate">{scene.title}</div>
                  <div className="text-[10px] text-text-muted">{scene.duration}s</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Center: Video preview */}
        <div className="flex flex-col min-h-0 gap-3">
          <Card className="flex-1 flex items-center justify-center p-6 bg-surface-subtle min-h-0 overflow-hidden">
            <div className="flex items-center justify-center w-full h-full">
              <div
                className={cn(
                  'bg-gradient-to-br from-slate-800 via-emerald-900 to-slate-900 rounded-lg shadow-2xl relative overflow-hidden',
                  activeAspect === 2 ? 'aspect-video w-full max-w-lg' : 'aspect-[9/16] h-full max-h-[500px]'
                )}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 p-6">
                  <span className="text-lg font-bold text-center leading-tight mb-4">{content.title}</span>
                  <p className="text-sm text-white/60 text-center">{content.hook}</p>

                  {/* Caption preview */}
                  <div className="absolute bottom-16 left-4 right-4 text-center">
                    <span className={cn(
                      'inline-block px-3 py-1 text-white font-bold',
                      captionStyle === 'Bold' && 'text-2xl',
                      captionStyle === 'Minimal' && 'text-base font-normal',
                      captionStyle === 'Karaoke' && 'text-xl',
                      captionStyle === 'Highlight' && 'text-xl bg-yellow-400/90 text-black rounded',
                      captionStyle === 'Clean' && 'text-lg bg-black/50 rounded-lg',
                    )}>
                      {content.hook?.slice(0, 50)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <button className="text-text-muted hover:text-text-primary"><SkipBack className="h-4 w-4" /></button>
              <button onClick={() => setPlaying(!playing)} className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button className="text-text-muted hover:text-text-primary"><SkipForward className="h-4 w-4" /></button>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-text-muted" />
                <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-20 accent-accent" />
              </div>
              <div className="flex-1">
                <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
                </div>
              </div>
              <span className="text-xs text-text-muted font-mono">0:00 / {Math.floor(duration/60)}:{(duration%60).toString().padStart(2,'0')}</span>
              <button className="text-text-muted hover:text-text-primary"><Maximize className="h-4 w-4" /></button>
            </div>

            {/* Timeline */}
            <div className="mt-3 bg-surface-subtle rounded-lg p-2 overflow-x-auto">
              <div className="min-w-[600px]">
                {TIMELINE_LAYERS.map(layer => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.id} className="flex items-center gap-2 h-8">
                      <button
                        onClick={() => setActiveLayer(layer.id)}
                        className={cn('flex items-center gap-1.5 w-20 text-xs text-text-muted hover:text-text-primary transition-colors shrink-0', activeLayer === layer.id && 'text-text-primary font-medium')}
                      >
                        <Icon className="h-3 w-3" />
                        {layer.label}
                      </button>
                      <div className="flex-1 h-5 bg-surface rounded relative">
                        <div className={cn('absolute top-0 bottom-0 left-0 rounded', layer.color, layer.id === 'video' ? 'w-full opacity-60' : layer.id === 'voice' ? 'w-[90%] opacity-50' : layer.id === 'music' ? 'w-full opacity-30' : 'w-[85%] opacity-70')} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Inspector */}
        <Card className="overflow-y-auto hidden lg:block">
          <div className="flex border-b border-border">
            {(['captions', 'style', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={cn(
                  'flex-1 px-3 py-2.5 text-xs font-medium capitalize transition-colors',
                  currentTab === tab ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-4">
            {currentTab === 'captions' && (
              <>
                <div>
                  <label className="label mb-2 block">Caption Style</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CAPTION_STYLES.map(s => (
                      <button
                        key={s}
                        onClick={() => setCaptionStyle(s)}
                        className={cn('px-2 py-1.5 rounded-md text-xs font-medium border transition-colors', captionStyle === s ? 'border-accent bg-accent-soft/40 text-accent' : 'border-border text-text-secondary hover:border-border-strong')}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label mb-1.5 block">Font Size</label>
                  <input type="range" min={12} max={48} defaultValue={28} className="w-full accent-accent" />
                </div>
              </>
            )}

            {currentTab === 'style' && (
              <>
                <div>
                  <label className="label mb-2 block">Aspect Ratio</label>
                  <div className="space-y-1.5">
                    {ASPECT_PRESETS.map((p, i) => (
                      <button
                        key={p.label}
                        onClick={() => setActiveAspect(i)}
                        className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors text-left', activeAspect === i ? 'border-accent bg-accent-soft/40' : 'border-border hover:border-border-strong')}
                      >
                        <div className={cn('border border-current rounded', i === 2 ? 'h-4 w-6' : 'h-6 w-4')} />
                        <span className="text-text-primary text-xs">{p.label}</span>
                        <span className="text-xs text-text-muted ml-auto">{p.ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label mb-1.5 block">Accent Color</label>
                  <input type="color" defaultValue="#1a7d4c" className="h-9 w-full rounded-md border border-border cursor-pointer" />
                </div>
              </>
            )}

            {currentTab === 'settings' && (
              <>
                <div className="space-y-3">
                  <Row label="Resolution" value="1080x1920" />
                  <Row label="Frame rate" value="30 fps" />
                  <Row label="Voice volume" value="100%" />
                  <Row label="Music volume" value="20%" />
                  <Row label="Transitions" value="Fade" />
                </div>
                <Button variant="secondary" size="sm" className="w-full mt-4">
                  <Settings className="h-3.5 w-3.5" />Advanced Settings
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}
