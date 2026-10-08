import { create } from 'zustand';
import type { Session, User } from '../types/user';
import { storageGet, storageSet, storageRemove, uid } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
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

  login: async (email, _password) => {
    // Mock login - accept any valid email
    await new Promise(r => setTimeout(r, 600));
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

  signup: async (name, email, _password) => {
    await new Promise(r => setTimeout(r, 800));
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

  logout: () => {
    storageRemove(STORAGE_KEYS.session);
    set({ user: null, session: null, isAuthenticated: false });
  },

  getSession: () => get().session,
}));
