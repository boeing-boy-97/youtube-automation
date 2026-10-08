import { create } from 'zustand';
import { storageGet, storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toasts: Toast[];
  activeDialog: string | null;
  dialogData: Record<string, unknown> | null;
  mobileMenuOpen: boolean;

  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  openDialog: (name: string, data?: Record<string, unknown>) => void;
  closeDialog: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: storageGet<'light' | 'dark'>(STORAGE_KEYS.theme, 'light'),
  sidebarCollapsed: storageGet(STORAGE_KEYS.sidebarCollapsed, false),
  commandPaletteOpen: false,
  toasts: [],
  activeDialog: null,
  dialogData: null,
  mobileMenuOpen: false,

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    storageSet(STORAGE_KEYS.theme, newTheme);
    set({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleSidebar: () => {
    const newVal = !get().sidebarCollapsed;
    storageSet(STORAGE_KEYS.sidebarCollapsed, newVal);
    set({ sidebarCollapsed: newVal });
  },

  setSidebarCollapsed: (collapsed) => {
    storageSet(STORAGE_KEYS.sidebarCollapsed, collapsed);
    set({ sidebarCollapsed: collapsed });
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  showToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  openDialog: (name, data) => set({ activeDialog: name, dialogData: data ?? {} }),
  closeDialog: () => set({ activeDialog: null, dialogData: null }),

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
