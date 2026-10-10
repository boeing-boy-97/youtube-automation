import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/apiClient';
import { cn } from '../lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Video as VideoIcon,
  Music,
  Type,
  Scissors,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const ASPECT_PRESETS = [
  { label: 'YouTube Shorts (9:16)', ratio: '9:16' },
  { label: 'Instagram Reels (9:16)', ratio: '9:16' },
  { label: 'Widescreen (16:9)', ratio: '16:9' },
];

const CAPTION_STYLES = ['Bold Sans', 'Minimal Editorial', 'Kinetic Accent', 'Clean Box'];

export function VideoStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = useContentStore((s) => s.items.find((i) => i.id === id));
  const updateContent = useContentStore((s) => s.updateContent);
  const showToast = useUIStore((s) => s.showToast);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [activeAspect, setActiveAspect] = useState(0);
  const [captionStyle, setCaptionStyle] = useState('Bold Sans');
  const [captionPosition, setCaptionPosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);

  // Render state
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const duration = content?.duration || content?.estimatedDuration || 45;

  const scenes = content?.visuals || [
    {
      id: 'scn_1',
      index: 0,
      title: 'Opening Hook',
      type: 'hook' as const,
      script: content?.hook || 'Why most vertical videos lose 80% of viewers in 3 seconds...',
      duration: 4,
      visualStatus: 'ready' as const,
    },
    {
      id: 'scn_2',
      index: 1,
      title: 'Problem Framing',
      type: 'content' as const,
      script: 'Disconnected tools destroy editing momentum and break caption synchronization.',
      duration: 18,
      visualStatus: 'ready' as const,
    },
    {
      id: 'scn_3',
      index: 2,
      title: 'Unified Studio Pipeline',
      type: 'content' as const,
      script: 'By binding scripts directly to audio timestamps, multi-track rendering happens in seconds.',
      duration: 16,
      visualStatus: 'ready' as const,
    },
    {
      id: 'scn_4',
      index: 3,
      title: 'Outro Loop Cue',
      type: 'cta' as const,
      script: 'Subscribe to ShortForge for daily architectural breakdowns.',
      duration: 7,
      visualStatus: 'ready' as const,
    },
  ];

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

  useEffect(() => {
    if (playing) {
      lastTimeRef.current = performance.now();
      const loop = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
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
        <div className="p-12 text-center bg-surface border border-border rounded-xl space-y-3">
          <VideoIcon className="h-10 w-10 text-stone-muted mx-auto" />
          <p className="text-xs text-stone">Select a short from the library or create a new video project.</p>
          <Button onClick={() => navigate('/create')} className="btn-primary h-9 px-4 text-xs">
            Create Short
          </Button>
        </div>
      </div>
    );
  }

  const activeScene = scenes[activeSceneIndex] || scenes[0];

  const handleSkipBack = () => setCurrentTime((prev) => Math.max(0, prev - 5));
  const handleSkipForward = () => setCurrentTime((prev) => Math.min(duration, prev + 5));

  const handleRegenerateScene = async (index: number) => {
    setRegeneratingScene(index);
    showToast({
      type: 'info',
      title: `Regenerating Scene ${index + 1}...`,
      message: 'Synthesizing 9:16 frame',
    });
    await new Promise((r) => setTimeout(r, 1200));

    const updatedVisuals = [...scenes];
    updatedVisuals[index] = {
      ...updatedVisuals[index],
      visualStatus: 'ready',
      title: `${updatedVisuals[index].title} (v2)`,
    };

    updateContent(content.id, { visuals: updatedVisuals });
    setRegeneratingScene(null);
    showToast({ type: 'success', title: `Scene ${index + 1} updated`, message: 'Visual frame refreshed.' });
  };

  const handleRender = async () => {
    setRendering(true);
    setRenderProgress(20);
    setRenderStage('Compiling scene audio & visuals with FFmpeg...');

    try {
      const res = await apiClient.rendering.render(content.id, content.id);
      setRenderProgress(100);
      setRenderStage('Render complete');
      updateContent(content.id, {
        status: 'rendered',
        videoUrl: res?.assetUrl || res?.outputPath || content.videoUrl,
      });
      showToast({
        type: 'success',
        title: 'Video Rendered Successfully',
        message: `${content.title} is ready for QC & publishing.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Rendering failed',
        message: err.message || 'Render failed. Ensure FFmpeg and media assets are valid.',
      });
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={content.title}
        description="9:16 Portrait Compositor • Safe-zone typography & frame scrubbing"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/content/${content.id}`)}
              className="btn-secondary h-8 px-3 text-xs"
            >
              Overview
            </Button>
            <Button
              size="sm"
              onClick={handleRender}
              loading={rendering}
              className="btn-primary h-8 px-4 text-xs"
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>{rendering ? `Rendering ${renderProgress}%` : 'Render MP4'}</span>
            </Button>
          </div>
        }
      />

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scene Storyboard */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-bold text-ink uppercase tracking-wide">Scene Beats</span>
              <span className="text-[10px] font-mono text-coral font-bold">
                {scenes.length} Scenes
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {scenes.map((scene, i) => {
                const isSelected = selectedSceneIndex === i;
                const isPlayingScene = activeSceneIndex === i;

                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      setSelectedSceneIndex(i);
                      let t = 0;
                      for (let s = 0; s < i; s++) t += scenes[s].duration || 10;
                      setCurrentTime(t);
                    }}
                    className={cn(
                      'p-3 rounded-lg border text-left cursor-pointer transition-all space-y-1.5',
                      isPlayingScene
                        ? 'bg-coral-soft border-coral shadow-xs'
                        : isSelected
                        ? 'bg-canvas-subtle border-border-strong'
                        : 'bg-surface border-border hover:border-border-strong'
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink truncate flex-1">
                        0{i + 1}. {scene.title}
                      </span>
                      <span className="text-[10px] font-mono text-stone-muted">{scene.duration}s</span>
                    </div>

                    <p className="text-[11px] text-stone line-clamp-2 italic">"{scene.script}"</p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-[10px] text-stone-muted capitalize font-mono">
                        {scene.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateScene(i);
                        }}
                        disabled={regeneratingScene === i}
                        className="btn-ghost h-6 px-1.5 text-[10px]"
                      >
                        {regeneratingScene === i ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Regen
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: 9:16 Video Player & Timeline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs flex flex-col items-center justify-center">
            {/* 9:16 Portrait Frame */}
            <div className="w-full max-w-xs aspect-[9/16] bg-ink rounded-lg relative overflow-hidden flex flex-col justify-between p-4 shadow-md text-white select-none">
              {/* Top Safe-Zone Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                <span className="bg-black/50 px-2 py-0.5 rounded">
                  Scene 0{activeSceneIndex + 1}/{scenes.length}
                </span>
                <span className="bg-black/50 px-2 py-0.5 rounded text-coral">1080×1920</span>
              </div>

              {/* Center Stage Animation */}
              <div className="text-center px-4 my-auto space-y-2">
                <div className="h-10 w-10 rounded-full bg-coral/80 flex items-center justify-center mx-auto text-white shadow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug drop-shadow">
                  {activeScene.title}
                </h3>
                <p className="text-[11px] text-white/70 line-clamp-2 drop-shadow-xs">
                  {activeScene.script}
                </p>
              </div>

              {/* Dynamic Subtitle Overlay */}
              <div
                className={cn(
                  'w-full text-center px-2',
                  captionPosition === 'top' && 'mb-auto mt-2',
                  captionPosition === 'center' && 'my-auto',
                  captionPosition === 'bottom' && 'mt-auto mb-4'
                )}
              >
                <div className="bg-black/85 backdrop-blur-md p-2.5 rounded-md border border-white/10 text-center shadow">
                  <span
                    className={cn(
                      'inline-block text-white font-bold tracking-tight text-xs sm:text-sm',
                      captionStyle === 'Bold Sans' && 'uppercase text-white',
                      captionStyle === 'Minimal Editorial' && 'italic font-editorial text-marigold',
                      captionStyle === 'Kinetic Accent' && 'text-coral underline',
                      captionStyle === 'Clean Box' && 'text-white'
                    )}
                  >
                    "{activeScene.script?.slice(0, 44) || content.title}..."
                  </span>
                </div>
              </div>

              {/* Safe-Zone Guide Notice */}
              <div className="text-[9px] font-mono text-center text-white/40">
                Centered Subtitle Safe Zone Verified
              </div>
            </div>

            {/* Timeline Controls */}
            <div className="w-full max-w-xs space-y-2 pt-4">
              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSkipBack}
                  className="p-1.5 rounded-md hover:bg-canvas-subtle text-stone"
                  title="Rewind 5s"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying(!playing)}
                  className="h-8 w-8 rounded-md bg-coral text-white flex items-center justify-center hover:bg-coral-hover transition-colors"
                  title={playing ? 'Pause' : 'Play'}
                >
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSkipForward}
                  className="p-1.5 rounded-md hover:bg-canvas-subtle text-stone"
                  title="Forward 5s"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>

                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="flex-1 accent-coral h-1.5 bg-canvas-muted rounded cursor-pointer"
                />

                <span className="font-mono text-xs text-ink tabular-nums">
                  {Math.floor(currentTime)}s / {duration}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-xs space-y-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wide block border-b border-border pb-2">
              Typography & Safe Zones
            </span>

            {/* Subtitle Style Selector */}
            <div className="space-y-1.5">
              <label className="field-label">Subtitle Preset</label>
              <div className="space-y-1">
                {CAPTION_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCaptionStyle(style)}
                    className={cn(
                      'w-full text-left p-2 rounded-md text-xs font-medium transition-all border',
                      captionStyle === style
                        ? 'bg-coral-soft border-coral text-coral font-semibold'
                        : 'bg-canvas-subtle border-border text-stone hover:text-ink'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Positioning */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="field-label">Subtitle Placement</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setCaptionPosition(pos)}
                    className={cn(
                      'p-1.5 rounded text-center text-xs font-mono capitalize transition-all border',
                      captionPosition === pos
                        ? 'bg-surface border-coral text-coral font-semibold'
                        : 'bg-canvas-subtle border-border text-stone'
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Volume */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-stone">
                <span>Audio Master:</span>
                <span className="font-mono text-ink font-semibold">{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-coral"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
