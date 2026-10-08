import { create } from 'zustand';
import type { Workspace, AutomationMode } from '../types/workspace';
import type { YouTubeChannel } from '../types/youtube';
import { storageGet, storageSet } from '../lib/utils';
import { STORAGE_KEYS, DEFAULT_PILLARS, DEFAULT_CONTENT_RULES, DEFAULT_VOICE, DEFAULT_BRAND, DEFAULT_PUBLISHING } from '../lib/constants';
import { seedYouTubeChannel } from '../mock/seedData';

interface WorkspaceState {
  workspace: Workspace | null;
  youtubeChannel: YouTubeChannel | null;
  workspaces: { id: string; name: string }[];
  activeWorkspaceId: string;

  initWorkspace: () => void;
  createWorkspace: (data: Partial<Workspace>) => Workspace;
  updateWorkspace: (data: Partial<Workspace>) => void;
  setOnboardingComplete: () => void;
  setAutomationMode: (mode: AutomationMode) => void;
  connectYouTube: () => Promise<void>;
  disconnectYouTube: () => void;
  switchWorkspace: (id: string) => void;
  resetDemoData: () => void;
}

const defaultWorkspace = (): Workspace => ({
  id: 'ws_default',
  name: 'My Channel',
  channelName: '',
  niche: '',
  targetAudience: '',
  primaryLanguage: 'en',
  pillars: DEFAULT_PILLARS,
  contentRules: DEFAULT_CONTENT_RULES,
  voice: DEFAULT_VOICE,
  brand: { ...DEFAULT_BRAND, name: '' },
  publishing: DEFAULT_PUBLISHING,
  automationMode: 'manual',
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
});

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: null,
  youtubeChannel: null,
  workspaces: [{ id: 'ws_default', name: 'My Channel' }, { id: 'ws_test', name: 'Test Channel' }],
  activeWorkspaceId: 'ws_default',

  initWorkspace: () => {
    const stored = storageGet<Workspace | null>(STORAGE_KEYS.workspace, null);
    const yt = storageGet<YouTubeChannel | null>(STORAGE_KEYS.youtube, null);
    if (stored) {
      set({ workspace: stored, youtubeChannel: yt });
    } else {
      set({ workspace: defaultWorkspace() });
    }
  },

  createWorkspace: (data) => {
    const ws: Workspace = { ...defaultWorkspace(), ...data, id: `ws_${Date.now()}`, createdAt: new Date().toISOString() };
    storageSet(STORAGE_KEYS.workspace, ws);
    set({ workspace: ws });
    return ws;
  },

  updateWorkspace: (data) => {
    const current = get().workspace;
    if (!current) return;
    const updated = { ...current, ...data };
    storageSet(STORAGE_KEYS.workspace, updated);
    set({ workspace: updated });
  },

  setOnboardingComplete: () => {
    get().updateWorkspace({ onboardingComplete: true });
  },

  setAutomationMode: (mode) => {
    get().updateWorkspace({ automationMode: mode });
  },

  connectYouTube: async () => {
    set({ youtubeChannel: { ...seedYouTubeChannel(), connectionStatus: 'connecting' } });
    await new Promise(r => setTimeout(r, 2000));
    const channel = { ...seedYouTubeChannel(), connectionStatus: 'connected' as const };
    storageSet(STORAGE_KEYS.youtube, channel);
    set({ youtubeChannel: channel });
  },

  disconnectYouTube: () => {
    localStorage.removeItem(STORAGE_KEYS.youtube);
    set({ youtubeChannel: null });
  },

  switchWorkspace: (id) => {
    set({ activeWorkspaceId: id });
  },

  resetDemoData: () => {
    const keysToReset = [
      STORAGE_KEYS.content,
      STORAGE_KEYS.ideas,
      STORAGE_KEYS.jobs,
      STORAGE_KEYS.automation,
      STORAGE_KEYS.notifications,
      STORAGE_KEYS.analytics,
    ];
    keysToReset.forEach(k => localStorage.removeItem(k));
    // Keep workspace/user but reset onboarding
    const ws = defaultWorkspace();
    storageSet(STORAGE_KEYS.workspace, ws);
    localStorage.removeItem(STORAGE_KEYS.youtube);
    set({ workspace: ws, youtubeChannel: null });
  },
}));
