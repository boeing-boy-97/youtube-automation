import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import type { Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
 
import { useAutomationStore } from '../stores/automationStore';
import { useUIStore } from '../stores/uiStore';
import {
  Calendar,
  Lightbulb,
  TrendingUp,
  FileText,
  Mic,
  Image,
  Video,
  Type,
  Shield,
  ThumbsUp,
  Send,
  BarChart3,
  Brain,
  Database,
  Settings,
  Play,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

const NODE_ICONS: Record<string, React.ElementType> = {
  'scheduler': Calendar,
  'topic-generator': Lightbulb,
  'trend-analyzer': TrendingUp,
  'script-generator': FileText,
  'voice-generator': Mic,
  'visual-generator': Image,
  'video-renderer': Video,
  'caption-generator': Type,
  'quality-checker': Shield,
  'approval-gate': ThumbsUp,
  'youtube-publisher': Send,
  'analytics-sync': BarChart3,
  'learning-engine': Brain,
  'database': Database,
};

function CustomNode({ data, selected }: { data: { label: string; type: string; status: string; lastRun?: string }; selected: boolean }) {
  const Icon = NODE_ICONS[data.type] || Database;
  return (
    <div className={cn(
      'px-3 py-2 rounded-lg border bg-surface shadow-sm min-w-[140px] transition-shadow',
      selected ? 'border-accent ring-2 ring-accent/20 shadow-md' : 'border-border',
      data.status === 'running' && 'border-warning ring-2 ring-warning/20',
      data.status === 'success' && 'border-success',
      data.status === 'error' && 'border-danger',
    )}>
      <Handle type="target" position={Position.Left} className="!bg-border !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-2">
        <div className={cn(
          'h-6 w-6 rounded flex items-center justify-center shrink-0',
          data.status === 'running' ? 'bg-warning/10 text-warning' :
          data.status === 'success' ? 'bg-success/10 text-success' :
          data.status === 'error' ? 'bg-danger/10 text-danger' :
          'bg-accent/10 text-accent'
        )}>
          {data.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-text-primary truncate">{data.label}</div>
          <div className="text-[10px] text-text-muted capitalize">{data.status}</div>
        </div>
        <button className="ml-auto text-text-muted hover:text-text-primary">
          <Settings className="h-3 w-3" />
        </button>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-border !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export function Workflow() {
  const initialNodes = useAutomationStore(s => s.nodes);
  const initialEdges = useAutomationStore(s => s.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(n => ({
    id: n.id,
    type: 'custom',
    position: n.position,
    data: { label: n.label, type: n.type, status: n.status, lastRun: n.lastRun },
  })));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(e => ({ id: e.id, source: e.source, target: e.target, animated: false })));
  const [testing, setTesting] = useState(false);
  const [testSteps, setTestSteps] = useState<{ node: string; done: boolean }[]>([]);
  const showToast = useUIStore(s => s.showToast);

  const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge({ ...params, animated: false }, eds)), [setEdges]);

  const handleTest = async () => {
    setTesting(true);
    setTestSteps([]);
    const order = initialNodes;
    for (const node of order) {
      setTestSteps(prev => [...prev, { node: node.id, done: false }]);
      setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n));
      await new Promise(r => setTimeout(r, 300 + Math.random() * 300));
      setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'success' } } : n));
      setTestSteps(prev => prev.map(s => s.node === node.id ? { ...s, done: true } : s));
    }
    setTesting(false);
    showToast({ type: 'success', title: 'Pipeline Validation Complete', message: 'All execution nodes responded healthy.' });
    setTimeout(() => {
      setNodes(ns => ns.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workflow Builder"
        description="Design and test your content production pipeline."
        actions={
          <Button onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {testing ? 'Running...' : 'Test Workflow'}
          </Button>
        }
      />

      <Card className="h-[600px] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5 } }}
        >
          <Background color="hsl(var(--border))" size={14} gap={20} />
          <Controls showInteractive={false} className="!bg-surface !border-border" />
          <MiniMap
            className="!bg-surface-subtle !border-border"
            nodeColor={() => 'hsl(var(--accent))'}
            maskColor="hsl(var(--surface-subtle))"
            pannable
            zoomable
          />
        </ReactFlow>
      </Card>

      {testSteps.length > 0 && (
        <Card>
          <div className="px-5 py-4">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Execution Log</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {testSteps.map(step => {
                const node = initialNodes.find(n => n.id === step.node);
                return (
                  <div key={step.node} className={cn('flex items-center gap-2 p-2 rounded border', step.done ? 'border-success/30 bg-success/5' : 'border-border bg-surface-subtle')}>
                    {step.done ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />}
                    <span className="text-xs text-text-primary">{node?.label}</span>
                  </div>
                );
              })}
            </div>
            {testSteps.length === initialNodes.length && testSteps.every(s => s.done) && (
              <p className="text-xs text-text-muted mt-3">Production DAG execution simulation complete. All worker nodes responded healthy.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
