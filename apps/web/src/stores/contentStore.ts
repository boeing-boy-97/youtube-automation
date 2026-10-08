import { create } from 'zustand';
import type { ContentItem, Idea, ContentStatus, ActivityItem, ActivityType } from '../types/content';
import type { ProductionJob, Template } from '../types/production';
import type { Notification } from '../types/automation';
import { storageGet, storageSet, uid } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import { seedContent, seedIdeas, seedNotifications, seedTemplates } from '../mock/seedData';
import { useUIStore } from './uiStore';

interface ContentState {
  items: ContentItem[];
  ideas: Idea[];
  jobs: ProductionJob[];
  notifications: Notification[];
  templates: Template[];
  initialized: boolean;

  init: () => void;
  persist: () => void;

  // Content CRUD
  getContent: (id: string) => ContentItem | undefined;
  createContent: (data: Partial<ContentItem>) => ContentItem;
  updateContent: (id: string, data: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  duplicateContent: (id: string) => ContentItem | null;
  archiveContent: (id: string) => void;

  // Content state transitions
  updateStatus: (id: string, status: ContentStatus, metadata?: Partial<ContentItem>) => void;
  addActivity: (contentId: string, type: ActivityType, message: string, metadata?: Record<string, unknown>) => void;

  // Ideas
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => Idea;
  updateIdea: (id: string, data: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  moveIdeaToContent: (ideaId: string) => ContentItem | null;

  // Jobs
  getJob: (id: string) => ProductionJob | undefined;
  getJobByContent: (contentId: string) => ProductionJob | undefined;
  createJob: (contentId: string, stage: ProductionJob['stage']) => ProductionJob;
  updateJob: (id: string, data: Partial<ProductionJob>) => void;
  addJobLog: (jobId: string, message: string, level?: 'info' | 'success' | 'warning' | 'error') => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Bulk
  bulkUpdateStatus: (ids: string[], status: ContentStatus) => void;
  bulkDelete: (ids: string[]) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  items: [],
  ideas: [],
  jobs: [],
  notifications: [],
  templates: [],
  initialized: false,

  persist: () => {
    storageSet(STORAGE_KEYS.content, get().items);
    storageSet(STORAGE_KEYS.ideas, get().ideas);
    storageSet(STORAGE_KEYS.jobs, get().jobs);
    storageSet(STORAGE_KEYS.notifications, get().notifications);
  },

  init: () => {
    if (get().initialized) return;
    const items = storageGet<ContentItem[]>(STORAGE_KEYS.content, []);
    const ideas = storageGet<Idea[]>(STORAGE_KEYS.ideas, []);
    const jobs = storageGet<ProductionJob[]>(STORAGE_KEYS.jobs, []);
    const notifications = storageGet<Notification[]>(STORAGE_KEYS.notifications, []);

    set({
      items: items.length > 0 ? items : seedContent(),
      ideas: ideas.length > 0 ? ideas : seedIdeas(),
      jobs,
      notifications: notifications.length > 0 ? notifications : seedNotifications(),
      templates: seedTemplates(),
      initialized: true,
    });
    get().persist();
  },

  getContent: (id) => get().items.find(i => i.id === id),

  createContent: (data) => {
    const now = new Date().toISOString();
    const item: ContentItem = {
      id: uid('content'),
      title: data.title || 'Untitled',
      status: 'draft',
      voiceStatus: 'idle',
      visuals: data.visuals || [],
      activity: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'user',
      hashtags: data.hashtags || ['#ai', '#tech', '#shorts'],
      ...data,
    };
    set((state) => ({ items: [item, ...state.items] }));
    get().persist();
    return item;
  },

  updateContent: (id, data) => {
    set((state) => ({
      items: state.items.map(i => i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i),
    }));
    get().persist();
  },

  deleteContent: (id) => {
    set((state) => ({ items: state.items.filter(i => i.id !== id) }));
    get().persist();
  },

  duplicateContent: (id) => {
    const original = get().getContent(id);
    if (!original) return null;
    return get().createContent({
      ...original,
      title: original.title + ' (Copy)',
      status: 'draft',
      publishedAt: undefined,
      scheduledAt: undefined,
      youtubeId: undefined,
      youtubeUrl: undefined,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      activity: [],
    });
  },

  archiveContent: (id) => {
    get().updateContent(id, { status: 'draft' });
  },

  updateStatus: (id, status, metadata) => {
    const update: Partial<ContentItem> = { status, ...metadata };

    if (status === 'rendering') {
      update.progress = 0;
    }
    if (status === 'rendered') {
      update.progress = 100;
    }
    if (status === 'published') {
      update.publishedAt = new Date().toISOString();
      update.youtubeId = `yt_${uid()}`;
      update.youtubeUrl = 'https://youtube.com/shorts/demo';
      update.views = 0;
      update.likes = 0;
      update.comments = 0;
      update.shares = 0;
      update.retention = 70;
    }

    set((state) => ({
      items: state.items.map(i => i.id === id ? { ...i, ...update, updatedAt: new Date().toISOString() } : i),
    }));
    get().persist();
  },

  addActivity: (contentId, type, message, metadata) => {
    const activity: ActivityItem = {
      id: uid('act'),
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    set((state) => ({
      items: state.items.map(i => i.id === contentId ? { ...i, activity: [activity, ...i.activity] } : i),
    }));
    get().persist();
  },

  addIdea: (idea) => {
    const newIdea: Idea = {
      id: uid('idea'),
      createdAt: new Date().toISOString(),
      ...idea,
    };
    set((state) => ({ ideas: [newIdea, ...state.ideas] }));
    get().persist();
    return newIdea;
  },

  updateIdea: (id, data) => {
    set((state) => ({
      ideas: state.ideas.map(i => i.id === id ? { ...i, ...data } : i),
    }));
    get().persist();
  },

  deleteIdea: (id) => {
    set((state) => ({ ideas: state.ideas.filter(i => i.id !== id) }));
    get().persist();
  },

  moveIdeaToContent: (ideaId) => {
    const idea = get().ideas.find(i => i.id === ideaId);
    if (!idea) return null;
    const content = get().createContent({
      title: idea.title,
      hook: idea.hook,
      angle: idea.angle,
      pillar: idea.pillar,
      cta: idea.cta,
      estimatedDuration: idea.suggestedDuration,
      audience: '',
      status: 'draft',
    });
    get().updateIdea(ideaId, { status: 'used' });
    get().addActivity(content.id, 'idea_generated', `Idea "${idea.title}" moved to production`);
    useUIStore.getState().showToast({ type: 'success', title: 'Moved to production', message: idea.title });
    return content;
  },

  getJob: (id) => get().jobs.find(j => j.id === id),
  getJobByContent: (contentId) => get().jobs.find(j => j.contentId === contentId),

  createJob: (contentId, stage) => {
    const job: ProductionJob = {
      id: uid('job'),
      contentId,
      stage,
      status: 'queued',
      progress: 0,
      logs: [],
      startedAt: new Date().toISOString(),
    };
    set((state) => ({ jobs: [job, ...state.jobs] }));
    get().persist();
    return job;
  },

  updateJob: (id, data) => {
    set((state) => ({
      jobs: state.jobs.map(j => j.id === id ? { ...j, ...data } : j),
    }));
    get().persist();
  },

  addJobLog: (jobId, message, level = 'info') => {
    const log = { id: uid('log'), timestamp: new Date().toISOString(), message, level };
    set((state) => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, logs: [...j.logs, log] } : j),
    }));
    get().persist();
  },

  addNotification: (notification) => {
    const n: Notification = {
      id: uid('notif'),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    set((state) => ({ notifications: [n, ...state.notifications] }));
    get().persist();
    useUIStore.getState().showToast({ type: notification.type, title: notification.title, message: notification.message });
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
    get().persist();
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
    get().persist();
  },

  getUnreadCount: () => get().notifications.filter(n => !n.read).length,

  bulkUpdateStatus: (ids, status) => {
    set((state) => ({
      items: state.items.map(i => ids.includes(i.id) ? { ...i, status, updatedAt: new Date().toISOString() } : i),
    }));
    get().persist();
  },

  bulkDelete: (ids) => {
    set((state) => ({ items: state.items.filter(i => !ids.includes(i.id)) }));
    get().persist();
  },
}));
