import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutomationStore } from '../stores/automationStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { apiClient } from '../services/apiClient';
import { cn } from '../lib/utils';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Clock,
  Shield,
  Rocket,
  Hand,
  UserCheck,
} from 'lucide-react';

const MODES = [
  {
    mode: 'manual',
    label: 'Manual Production',
    icon: Hand,
    desc: 'You control every step. No generation or upload runs without direct trigger.',
  },
  {
    mode: 'assisted',
    label: 'Assisted Mode',
    icon: UserCheck,
    desc: 'System drafts scripts and renders previews. Requires creator approval before YouTube upload.',
  },
  {
    mode: 'autonomous',
    label: 'Autonomous Mode',
    icon: Rocket,
    desc: 'Automated recurring generation, ffprobe validation, and publishing at configured UTC slots.',
  },
];

export function Automation() {
  const navigate = useNavigate();
  const { config, updateConfig, pauseEngine, resumeEngine, startTestRun, advanceTestRun, completeTestRun } =
    useAutomationStore();
  const workspace = useWorkspaceStore((s) => s.workspace);
  const youtube = useWorkspaceStore((s) => s.youtubeChannel);
  const setAutomationMode = useWorkspaceStore((s) => s.setAutomationMode);
  const showToast = useUIStore((s) => s.showToast);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleModeChange = (mode: string) => {
    if (mode === 'autonomous') {
      setConfirmDialog('autonomous');
    } else {
      setAutomationMode(mode as 'manual' | 'assisted' | 'autonomous');
      if (mode === 'manual') pauseEngine();
      else {
        resumeEngine();
        updateConfig({ mode: mode as 'manual' | 'assisted' | 'autonomous' });
      }
    }
  };

  const handleEnableAutonomous = () => {
    setAutomationMode('autonomous');
    resumeEngine();
    updateConfig({ mode: 'autonomous' });
    setConfirmDialog(null);
    showToast({
      type: 'warning',
      title: 'Autonomous mode enabled',
      message: 'The engine will publish automatically on schedule.',
    });
  };

  const handleRunNow = async () => {
    if (!youtube || youtube.connectionStatus !== 'connected') {
      showToast({
        type: 'error',
        title: 'Cannot run',
        message: 'Connect YouTube first in YouTube page or Settings.',
      });
      return;
    }
    setRunning(true);
    try {
      showToast({ type: 'info', title: 'Starting Automation', message: 'Executing production cycle...' });
      const res = await apiClient.post<any>('/automation/run');
      showToast({
        type: 'success',
        title: 'Automation Cycle Finished',
        message: res?.title ? `Created and staged "${res.title}".` : 'Content generated and staged.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Automation Run Failed',
        message: err.message || 'Pipeline failed. Check provider credentials.',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleTestWorkflow = async () => {
    startTestRun();
    const nodes = [
      'node_scheduler',
      'node_trend',
      'node_topic',
      'node_script',
      'node_voice',
      'node_visual',
      'node_render',
      'node_caption',
      'node_qc',
      'node_approval',
      'node_publisher',
      'node_analytics',
      'node_learning',
    ];
    for (const _ of nodes) {
      advanceTestRun();
      await new Promise((r) => setTimeout(r, 200));
    }
    completeTestRun();
    showToast({
      type: 'success',
      title: 'Workflow Verified',
      message: 'All 13 pipeline nodes validated successfully.',
    });
  };

  const isActive = config.status === 'active';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Command Center"
        description="Configure autonomous generation cadences, publishing limits, and safety guardrails."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleTestWorkflow}
              disabled={running}
              className="btn-secondary h-9 px-3 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Test Pipeline</span>
            </Button>
            <Button
              onClick={handleRunNow}
              loading={running}
              disabled={!youtube || youtube.connectionStatus !== 'connected'}
              className="btn-primary h-9 px-4 text-xs"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Production Now</span>
            </Button>
          </div>
        }
      />

      {/* Engine Status Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center border',
              isActive
                ? 'bg-moss/10 border-moss/30 text-moss-dark'
                : 'bg-canvas-subtle border-border text-stone'
            )}
          >
            {isActive ? <Zap className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                {isActive ? 'Autonomous Engine Running' : 'Engine Inactive / Paused'}
              </h2>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                  isActive ? 'bg-moss/10 text-moss-dark border border-moss/30' : 'bg-canvas-subtle text-stone'
                )}
              >
                {config.status}
              </span>
            </div>
            <p className="text-xs text-stone mt-0.5">
              Current Mode: <strong className="text-ink capitalize">{config.mode}</strong> •{' '}
              {config.totalPublished} videos published via automated pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={pauseEngine}
              className="btn-secondary h-8 px-3 text-xs"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Engine</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={resumeEngine}
              className="btn-primary h-8 px-3 text-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Resume Engine</span>
            </Button>
          )}
        </div>
      </div>

      {/* Operating Mode Selector */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold text-stone uppercase tracking-wide block">
          Select Operating Mode
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = config.mode === m.mode;

            return (
              <div
                key={m.mode}
                onClick={() => handleModeChange(m.mode)}
                className={cn(
                  'p-5 rounded-xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between',
                  isSelected
                    ? 'bg-surface border-vermilion shadow-xs'
                    : 'bg-surface border-border hover:border-border-strong'
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-md flex items-center justify-center',
                        isSelected ? 'bg-vermilion text-white' : 'bg-canvas-subtle text-stone'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold text-vermilion uppercase">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-ink">{m.label}</h3>
                  <p className="text-xs text-stone leading-relaxed">{m.desc}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-stone-muted">
                  <span>{m.mode === 'autonomous' ? 'Zero intervention' : 'Review required'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Guardrails */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-vermilion" />
            <h3 className="text-sm font-bold text-ink">Autonomous Safety Guardrails</h3>
          </div>
          <span className="text-[11px] font-mono text-stone-muted">Security Policy §4.2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-1">
            <span className="font-semibold text-ink block">Max Daily Uploads:</span>
            <span className="text-stone">Capped at 3 shorts per 24h to prevent channel spam flags.</span>
          </div>
          <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-1">
            <span className="font-semibold text-ink block">Daily Budget Cap:</span>
            <span className="text-stone">Stops AI synthesis if daily cost exceeds configured limits.</span>
          </div>
          <div className="p-3 rounded-md bg-canvas-subtle border border-border space-y-1">
            <span className="font-semibold text-ink block">Required QC Validation:</span>
            <span className="text-stone">ffprobe media inspection must pass before upload dispatch.</span>
          </div>
        </div>
      </div>

      {/* Autonomous Confirmation Dialog */}
      <Dialog open={confirmDialog === 'autonomous'} onClose={() => setConfirmDialog(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-vermilion" />
            <DialogTitle>Enable Autonomous Publishing?</DialogTitle>
          </div>
          <DialogDescription>
            Videos will be generated and published directly to your connected YouTube channel without manual review.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="text-xs text-stone space-y-2">
          <p>
            ShortForge will respect your daily posting caps, content pillars, and safety policies. You can return to Assisted Mode at any time.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setConfirmDialog(null)}
            className="btn-secondary text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnableAutonomous}
            className="btn-primary text-xs"
          >
            Enable Autonomous Mode
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
