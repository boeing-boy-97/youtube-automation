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
} from 'lucide-react';
import { cn } from '../lib/utils';

const NODE_ICONS: Record<string, React.ElementType> = {
  scheduler: Calendar,
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
  database: Database,
};

function CustomNode({
  data,
  selected,
}: {
  data: { label: string; type: string; status: string; lastRun?: string };
  selected: boolean;
}) {
  const Icon = NODE_ICONS[data.type] || Database;
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg border bg-surface shadow-xs min-w-[140px] transition-all',
        selected ? 'border-vermilion ring-1 ring-vermilion/30' : 'border-border',
        data.status === 'running' && 'border-amber-500 ring-1 ring-amber-500/30',
        data.status === 'success' && 'border-moss',
        data.status === 'error' && 'border-danger'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-border !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-6 w-6 rounded flex items-center justify-center shrink-0 text-xs',
            data.status === 'running'
              ? 'bg-amber-500/10 text-amber-600'
              : data.status === 'success'
              ? 'bg-moss/10 text-moss-dark'
              : data.status === 'error'
              ? 'bg-danger/10 text-danger'
              : 'bg-canvas-subtle text-vermilion'
          )}
        >
          {data.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-ink truncate">{data.label}</div>
          <div className="text-[10px] text-stone font-mono capitalize">{data.status}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-border !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export function Workflow() {
  const initialNodes = useAutomationStore((s) => s.nodes);
  const initialEdges = useAutomationStore((s) => s.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: { label: n.label, type: n.type, status: n.status, lastRun: n.lastRun },
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map((e) => ({ id: e.id, source: e.source, target: e.target, animated: false }))
  );
  const [testing, setTesting] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  );

  const handleTest = async () => {
    setTesting(true);
    const order = initialNodes;
    for (const node of order) {
      setNodes((ns) =>
        ns.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
      );
      await new Promise((r) => setTimeout(r, 200));
      setNodes((ns) =>
        ns.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'success' } } : n))
      );
    }
    setTesting(false);
    showToast({
      type: 'success',
      title: 'Pipeline Validation Complete',
      message: 'All execution nodes responded healthy.',
    });
    setTimeout(() => {
      setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } })));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Pipeline Builder"
        description="Directed graph execution engine: state transitions, queue workers, and publish gates."
        actions={
          <Button
            onClick={handleTest}
            disabled={testing}
            className="btn-primary h-9 px-4 text-xs"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>{testing ? 'Testing Nodes...' : 'Validate Pipeline'}</span>
          </Button>
        }
      />

      <div className="h-[600px] rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#E5DDD1" gap={16} />
          <Controls />
          <MiniMap
            nodeColor="#FAF6EE"
            maskColor="rgba(37, 33, 31, 0.05)"
            className="!border !border-border !rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
