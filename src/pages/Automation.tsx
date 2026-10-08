import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutomationStore } from '../stores/automationStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { demoEngine } from '../services/demoEngine';
import { cn } from '../lib/utils';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Settings,
  Clock,
  Calendar,
  Target,
  Play as YoutubeIcon,
  CheckCircle,
  X,
  Shield,
  Rocket,
  Hand,
  UserCheck,
  Loader2,
} from 'lucide-react';

const MODES = [
  { mode: 'manual', label: 'Manual', icon: Hand, desc: 'You control every step. Nothing is published automatically.', color: 'text-text-secondary' },
  { mode: 'assisted', label: 'Assisted', icon: UserCheck, desc: 'System generates content and asks for your approval before publishing.', color: 'text-accent' },
  { mode: 'autonomous', label: 'Autonomous', icon: Rocket, desc: 'System generates, checks, schedules, and publishes automatically.', color: 'text-warning' },
];

export function Automation() {
  const navigate = useNavigate();
  const { config, updateConfig, pauseEngine, resumeEngine, startTestRun, testRun, advanceTestRun, completeTestRun } = useAutomationStore();
  const workspace = useWorkspaceStore(s => s.workspace);
  const youtube = useWorkspaceStore(s => s.youtubeChannel);
  const setAutomationMode = useWorkspaceStore(s => s.setAutomationMode);
  const showToast = useUIStore(s => s.showToast);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleModeChange = (mode: string) => {
    if (mode === 'autonomous') {
      setConfirmDialog('autonomous');
    } else {
      setAutomationMode(mode as 'manual' | 'assisted' | 'autonomous');
      if (mode === 'manual') pauseEngine();
      else { resumeEngine(); updateConfig({ mode: mode as 'manual' | 'assisted' | 'autonomous' }); }
    }
  };

  const handleEnableAutonomous = () => {
    setAutomationMode('autonomous');
    resumeEngine();
    updateConfig({ mode: 'autonomous' });
    setConfirmDialog(null);
    showToast({ type: 'warning', title: 'Autonomous mode enabled', message: 'The engine will publish automatically' });
  };

  const handleStopEngine = () => {
    useAutomationStore.getState().stopEngine();
    setAutomationMode('manual');
    showToast({ type: 'info', title: 'Engine stopped' });
  };

  const handleRunNow = async () => {
    if (!youtube || youtube.connectionStatus !== 'connected') {
      showToast({ type: 'error', title: 'Cannot run', message: 'Connect YouTube first' });
      return;
    }
    setRunning(true);
    await demoEngine.runFullAutomation();
    setRunning(false);
  };

  const handleTestWorkflow = async () => {
    startTestRun();
    const nodes = ['node_scheduler', 'node_trend', 'node_topic', 'node_script', 'node_voice', 'node_visual', 'node_render', 'node_caption', 'node_qc', 'node_approval', 'node_publisher', 'node_analytics', 'node_learning'];
    for (const _ of nodes) {
      advanceTestRun();
      await new Promise(r => setTimeout(r, 400));
    }
    completeTestRun();
    showToast({ type: 'success', title: 'Workflow completed', message: 'Demo publication simulated.' });
  };

  const isActive = config.status === 'active';
  const isError = config.status === 'error';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Command Center"
        description="Control your autonomous content engine."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleTestWorkflow} disabled={running}>
              <RotateCcw className="h-4 w-4" />
              Test Workflow
            </Button>
            <Button onClick={handleRunNow} loading={running} disabled={!youtube || youtube.connectionStatus !== 'connected'}>
              <Play className="h-4 w-4" />
              Run Now
            </Button>
          </div>
        }
      />

      {/* Engine status */}
      <Card className={cn(
        'border-l-4',
        isActive ? 'border-l-success' : isError ? 'border-l-danger' : 'border-l-text-muted'
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
            <div className="flex items-start gap-4">
              <div className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center',
                isActive ? 'bg-success/10' : isError ? 'bg-danger/10' : 'bg-surface-subtle'
              )}>
                {isActive ? <Zap className={cn('h-6 w-6', isActive ? 'text-success animate-pulse-slow' : 'text-text-muted')} /> : <Pause className="h-6 w-6 text-text-muted" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {isActive ? 'Engine Active' : isError ? 'Engine Error' : 'Engine Paused'}
                  </h2>
                  <Badge variant={isActive ? 'success' : isError ? 'error' : 'default'} dot>
                    {config.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Mode: <span className="font-medium text-text-primary capitalize">{config.mode}</span>
                  {' · '}
                  {config.totalPublished} videos published via automation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <>
                  <Button variant="secondary" onClick={pauseEngine}><Pause className="h-4 w-4" />Pause</Button>
                  {workspace?.automationMode === 'autonomous' && (
                    <Button variant="danger" onClick={handleStopEngine}><AlertTriangle className="h-4 w-4" />STOP ENGINE</Button>
                  )}
                </>
              ) : (
                <Button onClick={resumeEngine} disabled={!youtube || youtube.connectionStatus !== 'connected'}><Play className="h-4 w-4" />Resume Engine</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {MODES.map(m => {
          const Icon = m.icon;
          const active = workspace?.automationMode === m.mode;
          return (
            <Card
              key={m.mode}
              className={cn('p-5 cursor-pointer transition-all', active && 'border-accent ring-1 ring-accent/20')}
              onClick={() => handleModeChange(m.mode)}
            >
              <div className="flex items-start gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', active ? 'bg-accent/10' : 'bg-surface-subtle')}>
                  <Icon className={cn('h-5 w-5', active ? 'text-accent' : 'text-text-muted')} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{m.label}</h3>
                    {active && <CheckCircle className="h-4 w-4 text-accent" />}
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" />Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigRow icon={Calendar} label="Frequency" value={config.frequency} />
            <ConfigRow icon={Clock} label="Publish Time" value={config.publishTime} />
            <ConfigRow icon={Target} label="Niche" value={config.niche} />
            <ConfigRow icon={Shield} label="Daily Limit" value={`${config.dailyLimit} video${config.dailyLimit > 1 ? 's' : ''}`} />
            <ConfigRow icon={UserCheck} label="Approval" value={config.approvalMode === 'required' ? 'Required' : config.approvalMode === 'always' ? 'All content' : 'None'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><YoutubeIcon className="h-4 w-4" />Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PrereqCheck label="YouTube connected" passed={youtube?.connectionStatus === 'connected'} />
            <PrereqCheck label="AI provider configured" passed={true} />
            <PrereqCheck label="Voice provider configured" passed={true} />
            <PrereqCheck label="Visual provider configured" passed={true} />
            <PrereqCheck label="Rendering provider configured" passed={true} />
            <PrereqCheck label="Content pillars defined" passed={!!workspace?.pillars.length} />
          </CardContent>
        </Card>
      </div>

      {/* Test execution panel */}
      {testRun?.active && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Workflow Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['node_scheduler', 'node_trend', 'node_topic', 'node_script', 'node_voice', 'node_visual', 'node_render', 'node_caption', 'node_qc', 'node_approval', 'node_publisher', 'node_analytics', 'node_learning'].map((nodeId, i) => {
                const labels: Record<string, string> = {
                  node_scheduler: 'Scheduler', node_trend: 'Trend Analyzer', node_topic: 'Topic Generator',
                  node_script: 'Script Generator', node_voice: 'Voice Generator', node_visual: 'Visual Generator',
                  node_render: 'Video Renderer', node_caption: 'Caption Generator', node_qc: 'Quality Checker',
                  node_approval: 'Approval Gate', node_publisher: 'YouTube Publisher', node_analytics: 'Analytics Sync',
                  node_learning: 'Learning Engine',
                };
                const isCompleted = testRun.completedNodes.includes(nodeId) || testRun.currentNode && ['node_scheduler', 'node_trend', 'node_topic', 'node_script', 'node_voice', 'node_visual', 'node_render', 'node_caption', 'node_qc', 'node_approval', 'node_publisher', 'node_analytics', 'node_learning'].indexOf(testRun.currentNode) > i;
                const isCurrent = testRun.currentNode === nodeId;
                return (
                  <div key={nodeId} className="flex items-center gap-3 p-2 rounded-md bg-surface-subtle/30">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-accent animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-border" />
                    )}
                    <span className={cn('text-sm', isCompleted || isCurrent ? 'text-text-primary' : 'text-text-muted')}>{labels[nodeId]}</span>
                    {isCurrent && <span className="text-xs text-accent ml-auto">Running...</span>}
                    {isCompleted && nodeId === 'node_publisher' && <span className="text-xs text-text-muted ml-auto">Demo publication simulated.</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Autonomous confirmation */}
      <Dialog open={confirmDialog === 'autonomous'} onClose={() => setConfirmDialog(null)}>
        <DialogHeader>
          <DialogTitle>Enable Autonomous Publishing?</DialogTitle>
          <DialogDescription>
            In autonomous mode, ShortForge will generate and publish content without manual approval.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-md bg-warning/10 border border-warning/20 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-text-secondary">This means videos will be published to your YouTube channel automatically.</p>
            </div>
            <div className="space-y-2">
              <SummaryRow label="Frequency" value={`${config.frequency}`} />
              <SummaryRow label="Publish Time" value={config.publishTime} />
              <SummaryRow label="Visibility" value={workspace?.publishing.visibility || 'public'} />
              <SummaryRow label="Approval" value="None — fully autonomous" />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleEnableAutonomous}>Enable Autonomous Publishing</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function ConfigRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Icon className="h-4 w-4 text-text-muted" />
      <span className="text-sm text-text-secondary flex-1">{label}</span>
      <span className="text-sm font-medium text-text-primary capitalize">{value}</span>
    </div>
  );
}

function PrereqCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? <CheckCircle className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-danger" />}
      <span className={cn('text-sm', passed ? 'text-text-primary' : 'text-text-muted')}>{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary capitalize">{value}</span>
    </div>
  );
}
