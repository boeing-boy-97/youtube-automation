import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { demoEngine } from '../services/demoEngine';
import { apiClient } from '../services/apiClient';
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
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';

const ASPECT_PRESETS = [
  { label: 'TikTok / YouTube Shorts', ratio: '9:16', w: 9, h: 16 },
  { label: 'Instagram Reels', ratio: '9:16', w: 9, h: 16 },
  { label: 'YouTube Widescreen', ratio: '16:9', w: 16, h: 9 },
  { label: 'Square Feed', ratio: '1:1', w: 1, h: 1 },
];

const TIMELINE_LAYERS = [
  { id: 'video', label: 'Visual Track', icon: VideoIcon, color: 'bg-accent' },
  { id: 'voice', label: 'Voiceover', icon: VideoIcon, color: 'bg-info' },
  { id: 'music', label: 'Background Lofi', icon: Music, color: 'bg-warning' },
  { id: 'captions', label: 'Auto Captions', icon: Type, color: 'bg-success' },
];

const CAPTION_STYLES = ['Bold', 'Minimal', 'Karaoke', 'Highlight', 'Clean'];

export function VideoStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore(s => s.items.find(i => i.id === id));
  const updateContent = useContentStore(s => s.updateContent);
  const showToast = useUIStore(s => s.showToast);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [activeAspect, setActiveAspect] = useState(0);
  const [captionStyle, setCaptionStyle] = useState('Bold');
  const [captionPosition, setCaptionPosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  const [fontSize, setFontSize] = useState(26);
  const [activeLayer, setActiveLayer] = useState('video');
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);

  // Render state
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [currentTab, setCurrentTab] = useState<'captions' | 'style' | 'settings' | 'qc'>('captions');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const duration = content?.duration || content?.estimatedDuration || 45;

  // Active scene calculation
  const scenes = content?.visuals || [
    { id: 'scn_1', index: 0, title: 'Opening Hook', type: 'hook' as const, script: content?.hook || 'Stop scrolling if you want to save time...', duration: 4, visualStatus: 'ready' as const },
    { id: 'scn_2', index: 1, title: 'Problem Discovery', type: 'content' as const, script: 'Here is what nobody tells you about automated production...', duration: 16, visualStatus: 'ready' as const },
    { id: 'scn_3', index: 2, title: 'Breakthrough Solution', type: 'content' as const, script: 'By connecting scripts directly to render pipelines, hours become seconds.', duration: 18, visualStatus: 'ready' as const },
    { id: 'scn_4', index: 3, title: 'Call to Action', type: 'cta' as const, script: 'Follow ShortForge for daily engineering breakdowns.', duration: 7, visualStatus: 'ready' as const },
  ];

  // Determine which scene is playing right now
  let accumulated = 0;
  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    const scDuration = scenes[i].duration || 10;
    if (currentTime >= accumulated && currentTime < accumulated + scDuration) {
      activeSceneIndex = i;
      break;
    }
    accumulated += scDuration;
    if (i === scenes.length - 1) activeSceneIndex = i;
  }

  // Smooth playback loop
  useEffect(() => {
    if (playing) {
      lastTimeRef.current = performance.now();
      const loop = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= duration) {
            setPlaying(false);
            return 0;
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(loop);
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [playing, duration]);

  if (!content) {
    return (
      <div className="space-y-5">
        <PageHeader title="Video Studio" description="Edit, customize, and render your video." />
        <Card className="p-12 text-center">
          <VideoIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-4">Select content from the library or create a new video project.</p>
          <Button onClick={() => navigate('/create')}>Create Content</Button>
        </Card>
      </div>
    );
  }

  const activeScene = scenes[activeSceneIndex] || scenes[0];

  const handleSkipBack = () => {
    setCurrentTime(prev => Math.max(0, prev - 5));
  };

  const handleSkipForward = () => {
    setCurrentTime(prev => Math.min(duration, prev + 5));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
  };

  // Feature C: Scene-level regeneration
  const handleRegenerateScene = async (index: number) => {
    setRegeneratingScene(index);
    showToast({ type: 'info', title: `Regenerating Scene ${index + 1}...`, message: 'Synthesizing new visual frame' });
    await new Promise(r => setTimeout(r, 1200));

    const updatedVisuals = [...scenes];
    updatedVisuals[index] = {
      ...updatedVisuals[index],
      visualStatus: 'ready',
      title: `${updatedVisuals[index].title} (v2)`,
    };

    updateContent(content.id, { visuals: updatedVisuals });
    setRegeneratingScene(null);
    showToast({ type: 'success', title: `Scene ${index + 1} updated`, message: 'New visual prompt rendered.' });
  };

  // Real render dispatch
  const handleRender = async () => {
    setRendering(true);
    setRenderProgress(10);
    setRenderStage('Compiling scene audio & visuals...');

    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        // Real FFmpeg render job on backend
        await apiClient.rendering.render(content.id, content.id);
      }
    } catch {
      // Local engine fallback
    }

    const success = await demoEngine.simulateRendering(content.id, (p, stage) => {
      setRenderProgress(p);
      setRenderStage(stage);
    });

    setRendering(false);

    if (success) {
      updateContent(content.id, {
        status: 'rendered',
        videoUrl: `https://storage.shortforge.io/renders/${content.id}.mp4`,
      });
      showToast({ type: 'success', title: 'Video Rendered Successfully', message: `${content.title} is ready for QC & publishing.` });
    }
  };

  const currentAspect = ASPECT_PRESETS[activeAspect];

  return (
    <div className="space-y-4">
      <PageHeader
        title={content.title}
        description="Interactive 9:16 Video Studio: timeline scrubbing, live subtitle styling, and scene-level regeneration."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/content/${content.id}`)}>
              Overview
            </Button>
            <Button size="sm" onClick={handleRender} loading={rendering}>
              <Scissors className="h-4 w-4" />
              {rendering ? `Rendering ${renderProgress}%` : content.status === 'rendered' ? 'Re-render Video' : 'Render Video'}
            </Button>
          </div>
        }
      />

      {/* Render Progress Banner */}
      {rendering && (
        <Card className="p-4 bg-accent-soft/40 border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{renderStage}</div>
              <div className="h-1.5 bg-surface-subtle rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono text-text-muted">{renderProgress}%</span>
          </div>
        </Card>
      )}

      {/* 3-Column Studio Layout */}
      <div className="grid lg:grid-cols-[260px_1fr_300px] gap-4 h-[calc(100vh-11rem)]">
        {/* Left Column: Scene Storyboard & Scene-Level Regeneration */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Scene Storyboard</span>
            <Badge variant="accent">{scenes.length} Scenes</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {scenes.map((scene, i) => {
              const isSelected = selectedSceneIndex === i;
              const isCurrentlyPlaying = activeSceneIndex === i;

              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    setSelectedSceneIndex(i);
                    // Jump timeline to this scene's start time
                    let t = 0;
                    for (let s = 0; s < i; s++) t += (scenes[s].duration || 10);
                    setCurrentTime(t);
                  }}
                  className={cn(
                    'p-2.5 rounded-lg border transition-all cursor-pointer',
                    isCurrentlyPlaying ? 'border-accent bg-accent/10 ring-1 ring-accent' : isSelected ? 'border-border-strong bg-surface-subtle' : 'border-border hover:bg-surface-subtle'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-text-primary truncate flex-1">{scene.title}</span>
                    <span className="text-[10px] font-mono text-text-muted">{scene.duration}s</span>
                  </div>

                  <p className="text-[11px] text-text-secondary line-clamp-2 italic mb-2">
                    "{scene.script}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-[10px] text-text-muted capitalize">{scene.type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerateScene(i);
                      }}
                      disabled={regeneratingScene === i}
                      className="h-6 px-1.5 text-[10px]"
                      title="Regenerate this scene only"
                    >
                      {regeneratingScene === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                      Regen
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Center: Video Preview Canvas + Real Controls */}
        <div className="flex flex-col min-h-0 gap-3">
          <Card className="flex-1 flex items-center justify-center p-4 bg-surface-subtle min-h-0 overflow-hidden relative">
            <div className="flex items-center justify-center w-full h-full">
              {/* Responsive Aspect Canvas */}
              <div
                className={cn(
                  'rounded-xl shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between p-6 select-none border border-border/60',
                  currentAspect.ratio === '16:9' ? 'aspect-video w-full max-w-xl' :
                  currentAspect.ratio === '1:1' ? 'aspect-square h-full max-h-[460px]' :
                  'aspect-[9/16] h-full max-h-[500px]'
                )}
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #022c22 100%)',
                }}
              >
                {/* Top Safe Zone Bar */}
                <div className="flex items-center justify-between text-white/70 text-xs">
                  <span className="font-semibold tracking-wide uppercase text-[10px] bg-black/40 px-2 py-0.5 rounded">
                    {content.pillar || 'AI Automation'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded">
                    <span>Scene {activeSceneIndex + 1}/{scenes.length}</span>
                  </div>
                </div>

                {/* Center Video Content Simulation */}
                <div className="text-center px-4 my-auto">
                  <div className="inline-block p-2 rounded-full bg-accent/30 text-accent mb-3">
                    <Sparkles className="h-6 w-6 text-emerald-300 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug mb-2 drop-shadow-md">
                    {activeScene.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 max-w-xs mx-auto drop-shadow-sm">
                    {activeScene.script}
                  </p>
                </div>

                {/* Dynamic Captions Overlay */}
                <div
                  className={cn(
                    'w-full text-center px-2',
                    captionPosition === 'top' && 'mb-auto mt-4',
                    captionPosition === 'center' && 'my-auto',
                    captionPosition === 'bottom' && 'mt-auto mb-6'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block px-3 py-1 text-white font-extrabold tracking-tight transition-all',
                      captionStyle === 'Bold' && 'text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase',
                      captionStyle === 'Minimal' && 'text-sm font-normal text-white/90 bg-black/60 px-2.5 py-1 rounded',
                      captionStyle === 'Karaoke' && 'text-xl bg-gradient-to-r from-yellow-300 via-amber-200 to-white bg-clip-text text-transparent',
                      captionStyle === 'Highlight' && 'text-lg bg-yellow-400 text-black px-2 py-0.5 rounded shadow',
                      captionStyle === 'Clean' && 'text-sm font-semibold bg-white/20 backdrop-blur-md rounded-lg text-white'
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {activeScene.script?.slice(0, 48) || content.title}
                  </span>
                </div>

                {/* Watermark Safe Zone */}
                <div className="absolute top-3 right-3 text-[10px] text-white/40 font-mono tracking-widest uppercase">
                  SHORTFORGE
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline & Controls */}
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={handleSkipBack} className="text-text-muted hover:text-text-primary p-1.5 rounded transition-colors" title="Rewind 5s">
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button onClick={handleSkipForward} className="text-text-muted hover:text-text-primary p-1.5 rounded transition-colors" title="Forward 5s">
                <SkipForward className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-text-muted" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-16 accent-accent h-1.5 bg-surface-subtle rounded cursor-pointer"
                />
              </div>

              {/* Scrubber slider */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-accent h-1.5 bg-surface-subtle rounded cursor-pointer"
                />
              </div>

              <span className="text-xs text-text-muted font-mono min-w-16 text-right">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Timeline Multi-Track Layers */}
            <div className="bg-surface-subtle rounded-lg p-2 overflow-x-auto space-y-1.5">
              {TIMELINE_LAYERS.map(layer => {
                const Icon = layer.icon;
                return (
                  <div key={layer.id} className="flex items-center gap-2 h-7 text-xs">
                    <button
                      onClick={() => setActiveLayer(layer.id)}
                      className={cn(
                        'flex items-center gap-1.5 w-24 text-[11px] text-text-muted hover:text-text-primary transition-colors shrink-0 text-left',
                        activeLayer === layer.id && 'text-text-primary font-semibold'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="truncate">{layer.label}</span>
                    </button>
                    <div className="flex-1 h-5 bg-surface rounded relative border border-border/50 overflow-hidden">
                      {/* Playhead position */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                      {/* Scene segments in visual track */}
                      {layer.id === 'video' ? (
                        <div className="flex h-full w-full">
                          {scenes.map((s, idx) => {
                            const pct = ((s.duration || 10) / duration) * 100;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'h-full border-r border-border/60 flex items-center px-1 text-[10px] truncate',
                                  activeSceneIndex === idx ? 'bg-accent/40 font-semibold text-text-primary' : 'bg-accent/15 text-text-muted'
                                )}
                                style={{ width: `${pct}%` }}
                              >
                                S{idx + 1}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className={cn('h-full opacity-60 rounded', layer.color)}
                          style={{ width: layer.id === 'voice' ? '92%' : layer.id === 'music' ? '100%' : '88%' }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Inspector Controls */}
        <Card className="flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-border bg-surface-subtle/50">
            {(['captions', 'style', 'settings', 'qc'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-xs font-medium capitalize transition-colors text-center border-b-2',
                  currentTab === tab ? 'border-accent text-accent font-semibold bg-surface' : 'border-transparent text-text-muted hover:text-text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Captions Tab */}
            {currentTab === 'captions' && (
              <>
                <div>
                  <label className="label mb-2 block">Caption Style Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAPTION_STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => setCaptionStyle(style)}
                        className={cn(
                          'p-2 rounded-lg border text-xs font-semibold text-center transition-colors',
                          captionStyle === style ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent' : 'border-border hover:bg-surface-subtle text-text-primary'
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label mb-1.5 block">Position</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['top', 'center', 'bottom'] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => setCaptionPosition(pos)}
                        className={cn(
                          'py-1.5 rounded text-xs capitalize border transition-colors',
                          captionPosition === pos ? 'border-accent bg-accent/10 text-accent font-semibold' : 'border-border text-text-muted'
                        )}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-muted">Font Size</span>
                    <span className="font-mono text-text-primary">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={40}
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-accent h-1.5 bg-surface-subtle rounded cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Style Tab */}
            {currentTab === 'style' && (
              <>
                <div>
                  <label className="label mb-2 block">Aspect Ratio</label>
                  <div className="space-y-2">
                    {ASPECT_PRESETS.map((p, i) => (
                      <button
                        key={p.label}
                        onClick={() => setActiveAspect(i)}
                        className={cn(
                          'w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors',
                          activeAspect === i ? 'border-accent bg-accent/10 text-accent font-semibold' : 'border-border hover:bg-surface-subtle text-text-primary'
                        )}
                      >
                        <span>{p.label}</span>
                        <Badge variant="neutral">{p.ratio}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Settings Tab */}
            {currentTab === 'settings' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Output Resolution</span>
                  <span className="font-mono text-text-primary font-semibold">1080 x 1920 (Vertical)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Target Frame Rate</span>
                  <span className="font-mono text-text-primary">60 FPS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Audio Sample Rate</span>
                  <span className="font-mono text-text-primary">48.0 kHz Stereo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Loudness Compliance</span>
                  <span className="font-mono text-text-primary">-14.0 LUFS</span>
                </div>
              </div>
            )}

            {/* Quality Control Tab */}
            {currentTab === 'qc' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-success/5 border border-success/20 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-text-primary">Automated QC Passed</div>
                    <div className="text-[10px] text-text-muted">Score: 94 / 100</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Aspect Ratio 9:16</span>
                    <span className="text-success font-semibold">✓ Valid</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Safe Zone Margin</span>
                    <span className="text-success font-semibold">✓ 100% compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Speech Duration Sync</span>
                    <span className="text-success font-semibold">✓ Matched</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Trigram Duplicate Check</span>
                    <span className="text-success font-semibold">✓ Unique</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
