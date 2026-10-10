import { create } from 'zustand';
import type { Workspace, AutomationMode } from '../types/workspace';
import type { YouTubeChannel } from '../types/youtube';
import { storageGet, storageSet } from '../lib/utils';
import { STORAGE_KEYS, DEFAULT_PILLARS, DEFAULT_CONTENT_RULES, DEFAULT_VOICE, DEFAULT_BRAND, DEFAULT_PUBLISHING } from '../lib/constants';
import { seedYouTubeChannel } from '../mock/seedData';
import { apiClient } from '../services/apiClient';

interface WorkspaceState {
  workspace: Workspace | null;
  youtubeChannel: YouTubeChannel | null;
  workspaces: { id: string; name: string }[];
  activeWorkspaceId: string;

  initWorkspace: () => void;
  createWorkspace: (data: Partial<Workspace>) => Workspace;
  updateWorkspace: (data: Partial<Workspace>) => Promise<void>;
  setOnboardingComplete: () => void;
  setAutomationMode: (mode: AutomationMode) => void;
  connectYouTube: () => Promise<void>;
  connectYouTubeOAuth: () => Promise<{ authUrl?: string; error?: string }>;
  setConnectedChannel: (channel: YouTubeChannel) => void;
  disconnectYouTube: () => Promise<void>;
  switchWorkspace: (id: string) => void;
  resetDemoData: () => void;
}

const defaultWorkspace = (): Workspace => ({
  id: 'ws_default',
  name: 'ShortForge Production',
  channelName: 'AI Shorts Studio',
  niche: 'AI & Automation',
  targetAudience: 'Creators & Tech Enthusiasts',
  primaryLanguage: 'en',
  pillars: DEFAULT_PILLARS,
  contentRules: DEFAULT_CONTENT_RULES,
  voice: DEFAULT_VOICE,
  brand: { ...DEFAULT_BRAND, name: 'ShortForge' },
  publishing: DEFAULT_PUBLISHING,
  automationMode: 'manual',
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
});

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: null,
  youtubeChannel: null,
  workspaces: [{ id: 'ws_default', name: 'ShortForge Production' }],
  activeWorkspaceId: 'ws_default',

  initWorkspace: () => {
    const stored = storageGet<Workspace | null>(STORAGE_KEYS.workspace, null);
    const yt = storageGet<YouTubeChannel | null>(STORAGE_KEYS.youtube, null);
    if (stored) {
      set({ workspace: stored, youtubeChannel: yt });
    } else {
      const initial = defaultWorkspace();
      storageSet(STORAGE_KEYS.workspace, initial);
      set({ workspace: initial, youtubeChannel: yt });
    }
  },

  createWorkspace: (data) => {
    const ws: Workspace = { ...defaultWorkspace(), ...data, id: `ws_${Date.now()}`, createdAt: new Date().toISOString() };
    storageSet(STORAGE_KEYS.workspace, ws);
    set({ workspace: ws });
    return ws;
  },

  updateWorkspace: async (data) => {
    const current = get().workspace;
    if (!current) return;
    const updated = { ...current, ...data };
    storageSet(STORAGE_KEYS.workspace, updated);
    set({ workspace: updated });

    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        await apiClient.workspaces.updateCurrent({
          name: updated.name,
          settings: {
            channelName: updated.channelName,
            niche: updated.niche,
            targetAudience: updated.targetAudience,
            primaryLanguage: updated.primaryLanguage,
            pillars: updated.pillars,
            contentRules: updated.contentRules,
            voice: updated.voice,
            brand: updated.brand,
            publishing: updated.publishing,
            automationMode: updated.automationMode,
          },
        });
      }
    } catch {
      // Local mode fallback
    }
  },

  setOnboardingComplete: () => {
    get().updateWorkspace({ onboardingComplete: true });
  },

  setAutomationMode: (mode) => {
    get().updateWorkspace({ automationMode: mode });
  },

  connectYouTubeOAuth: async () => {
    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        const res = await apiClient.youtube.connect();
        if (res?.authUrl) {
          return { authUrl: res.authUrl };
        }
      }
      return { error: 'API service offline or Google OAuth credentials not configured in backend .env' };
    } catch (err: any) {
      return { error: err?.message || 'Failed to initiate OAuth flow' };
    }
  },

  connectYouTube: async () => {
    const res = await get().connectYouTubeOAuth();
    if (res?.authUrl) {
      window.location.href = res.authUrl;
      return;
    }
    throw new Error(res?.error || 'Failed to initiate Google OAuth. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  },

  setConnectedChannel: (channel: YouTubeChannel) => {
    storageSet(STORAGE_KEYS.youtube, channel);
    set({ youtubeChannel: channel });
  },

  disconnectYouTube: async () => {
    const yt = get().youtubeChannel;
    if (yt?.channelId) {
      try {
        await apiClient.youtube.disconnect(yt.channelId);
      } catch {
        // Continue to clear local
      }
    }
    localStorage.removeItem(STORAGE_KEYS.youtube);
    set({ youtubeChannel: null });
  },

  switchWorkspace: (id) => {
    localStorage.setItem('sf_active_workspace_id', id);
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
    const ws = defaultWorkspace();
    storageSet(STORAGE_KEYS.workspace, ws);
    localStorage.removeItem(STORAGE_KEYS.youtube);
    set({ workspace: ws, youtubeChannel: null });
  },
}));
