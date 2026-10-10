import { create } from 'zustand';
import type { Session, User } from '../types/user';
import { storageGet, storageSet, storageRemove, uid } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import { apiClient } from '../services/apiClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password?: string) => Promise<User>;
  signup: (name: string, email: string, password?: string) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
  logout: () => void;
  getSession: () => Session | null;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  init: () => {
    const session = storageGet<Session | null>(STORAGE_KEYS.session, null);
    if (session) {
      set({ user: session.user, session, isAuthenticated: true });
    }
    set({ isLoading: false });
  },

  login: async (email, password = 'password123') => {
    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        const res = await apiClient.auth.login({ email, password });
        if (res?.user) {
          const liveUser: User = {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name || email.split('@')[0],
            createdAt: res.user.createdAt || new Date().toISOString(),
            plan: 'creator',
          };
          const token = (res as any).token || `live_${res.user.id}`;
          const session: Session = { user: liveUser, token };
          if ((res as any).token) {
            localStorage.setItem('sf_auth_token', (res as any).token);
          }
          const wsId = (res as any).workspace?.id || (res as any).defaultWorkspace?.id;
          if (wsId) {
            localStorage.setItem('sf_active_workspace_id', wsId);
          }
          storageSet(STORAGE_KEYS.user, liveUser);
          storageSet(STORAGE_KEYS.session, session);
          set({ user: liveUser, session, isAuthenticated: true });
          return liveUser;
        }
      }
    } catch {
      // Fall through to local demo store
    }

    const existingUser = storageGet<User | null>(STORAGE_KEYS.user, null);
    const user: User = existingUser && existingUser.email === email
      ? existingUser
      : {
          id: uid('user'),
          email,
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          createdAt: new Date().toISOString(),
          plan: 'creator',
        };
    const session: Session = { user, token: `demo_${uid('token')}` };
    storageSet(STORAGE_KEYS.user, user);
    storageSet(STORAGE_KEYS.session, session);
    set({ user, session, isAuthenticated: true });
    return user;
  },

  signup: async (name, email, password = 'password123') => {
    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        const res = await apiClient.auth.register({ name, email, password });
        if (res?.user) {
          const liveUser: User = {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name || name,
            createdAt: res.user.createdAt || new Date().toISOString(),
            plan: 'creator',
          };
          const token = (res as any).token || `live_${res.user.id}`;
          const session: Session = { user: liveUser, token };
          if ((res as any).token) {
            localStorage.setItem('sf_auth_token', (res as any).token);
          }
          const wsId = (res as any).workspace?.id;
          if (wsId) {
            localStorage.setItem('sf_active_workspace_id', wsId);
          }
          storageSet(STORAGE_KEYS.user, liveUser);
          storageSet(STORAGE_KEYS.session, session);
          set({ user: liveUser, session, isAuthenticated: true });
          return liveUser;
        }
      }
    } catch {
      // Fall through to local demo store
    }

    const user: User = {
      id: uid('user'),
      email,
      name,
      createdAt: new Date().toISOString(),
      plan: 'creator',
    };
    const session: Session = { user, token: `demo_${uid('token')}` };
    storageSet(STORAGE_KEYS.user, user);
    storageSet(STORAGE_KEYS.session, session);
    set({ user, session, isAuthenticated: true });
    return user;
  },

  updateUser: async (data: Partial<User>) => {
    const current = get().user;
    if (!current) throw new Error('No active user');
    const updated: User = { ...current, ...data };

    try {
      const isLive = await apiClient.health.pingLive();
      if (isLive) {
        await apiClient.users.updateMe({
          name: data.name,
          avatarUrl: data.avatar || null,
        });
      }
    } catch {
      // Local mode persistence
    }

    const session = get().session;
    const newSession = session ? { ...session, user: updated } : null;
    storageSet(STORAGE_KEYS.user, updated);
    if (newSession) storageSet(STORAGE_KEYS.session, newSession);
    set({ user: updated, session: newSession });
    return updated;
  },

  logout: () => {
    apiClient.auth.logout().catch(() => undefined);
    storageRemove(STORAGE_KEYS.session);
    localStorage.removeItem('sf_auth_token');
    localStorage.removeItem('sf_active_workspace_id');
    set({ user: null, session: null, isAuthenticated: false });
  },

  getSession: () => get().session,
}));
