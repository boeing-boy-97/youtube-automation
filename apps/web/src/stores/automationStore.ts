import { create } from 'zustand';
import type { AutomationConfig, WorkflowNode, WorkflowEdge } from '../types/automation';
import { storageGet, storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import { seedWorkflowNodes, seedWorkflowEdges } from '../mock/seedData';

interface AutomationState {
  config: AutomationConfig;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isRunning: boolean;
  testRun: { active: boolean; currentNode: string | null; completedNodes: string[]; failed: boolean } | null;
  initialized: boolean;

  init: () => void;
  updateConfig: (data: Partial<AutomationConfig>) => void;
  setMode: (mode: AutomationConfig['mode']) => void;
  pauseEngine: () => void;
  resumeEngine: () => void;
  updateNodes: (nodes: WorkflowNode[]) => void;
  updateEdges: (edges: WorkflowEdge[]) => void;
  startTestRun: () => void;
  advanceTestRun: () => void;
  completeTestRun: () => void;
  stopEngine: () => void;
}

const defaultConfig: AutomationConfig = {
  mode: 'manual',
  status: 'paused',
  frequency: 'weekdays',
  publishTime: '19:30',
  niche: 'AI Technology',
  dailyLimit: 1,
  approvalMode: 'required',
  totalRuns: 0,
  totalPublished: 5,
};

export const useAutomationStore = create<AutomationState>((set, get) => ({
  config: defaultConfig,
  nodes: seedWorkflowNodes(),
  edges: seedWorkflowEdges(),
  isRunning: false,
  testRun: null,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const stored = storageGet<AutomationConfig | null>(STORAGE_KEYS.automation, null);
    set({
      config: stored || defaultConfig,
      nodes: seedWorkflowNodes(),
      edges: seedWorkflowEdges(),
      initialized: true,
    });
  },

  persist: () => {
    storageSet(STORAGE_KEYS.automation, get().config);
  },

  updateConfig: (data) => {
    set((state) => ({ config: { ...state.config, ...data } }));
    storageSet(STORAGE_KEYS.automation, get().config);
  },

  setMode: (mode) => {
    const status = mode === 'manual' ? 'paused' : 'active';
    get().updateConfig({ mode, status });
  },

  pauseEngine: () => {
    get().updateConfig({ status: 'paused' });
  },

  resumeEngine: () => {
    get().updateConfig({ status: 'active' });
  },

  updateNodes: (nodes) => set({ nodes }),
  updateEdges: (edges) => set({ edges }),

  startTestRun: () => {
    set({
      testRun: { active: true, currentNode: null, completedNodes: [], failed: false },
      isRunning: true,
    });
  },

  advanceTestRun: () => {
    const { testRun, nodes } = get();
    if (!testRun) return;
    const order = ['node_scheduler', 'node_trend', 'node_topic', 'node_script', 'node_voice', 'node_visual', 'node_render', 'node_caption', 'node_qc', 'node_approval', 'node_publisher', 'node_analytics', 'node_learning'];
    const currentIdx = testRun.currentNode ? order.indexOf(testRun.currentNode) : -1;
    const nextIdx = currentIdx + 1;
    if (nextIdx >= order.length) {
      get().completeTestRun();
      return;
    }
    const nextNode = order[nextIdx];
    set({
      testRun: { ...testRun, currentNode: nextNode, completedNodes: [...testRun.completedNodes, ...(testRun.currentNode ? [testRun.currentNode] : [])] },
      nodes: nodes.map(n => n.id === nextNode ? { ...n, status: 'running' as const } : n),
    });
  },

  completeTestRun: () => {
    const { testRun: _testRun, nodes, config } = get();
    void _testRun;
    set({
      testRun: null,
      isRunning: false,
      nodes: nodes.map(n => ({ ...n, status: 'idle' as const, lastRun: new Date().toISOString() })),
      config: { ...config, totalRuns: config.totalRuns + 1 },
    });
    storageSet(STORAGE_KEYS.automation, get().config);
  },

  stopEngine: () => {
    set({ isRunning: false, testRun: null });
    get().updateConfig({ status: 'paused' });
  },
}));
