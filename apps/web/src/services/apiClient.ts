/**
 * ShortForge API Client
 * Typed HTTP client for Fastify modular monolith backend
 */

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export class ApiClientError extends Error {
  code: string;
  requestId?: string;
  details?: Record<string, unknown>;
  statusCode: number;

  constructor(payload: ApiErrorPayload, statusCode: number) {
    super(payload.message || 'API request failed');
    this.name = 'ApiClientError';
    this.code = payload.code || 'UNKNOWN_ERROR';
    this.requestId = payload.requestId;
    this.details = payload.details;
    this.statusCode = statusCode;
  }
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'offline';
  service?: string;
  checks?: {
    api?: 'ok' | 'fail';
    db?: 'ok' | 'fail';
    redis?: 'ok' | 'fail';
  };
  details?: Record<string, unknown>;
  ts?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const storedToken = localStorage.getItem('sf_auth_token');
  if (storedToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const workspaceId = localStorage.getItem('sf_active_workspace_id');
  if (workspaceId && !headers['X-Workspace-Id']) {
    headers['X-Workspace-Id'] = workspaceId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorPayload: ApiErrorPayload = data?.error || {
      code: `HTTP_${response.status}`,
      message: typeof data === 'string' ? data : response.statusText,
    };
    throw new ApiClientError(errorPayload, response.status);
  }

  return (data?.data !== undefined ? data.data : data) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),

  health: {
    async check(): Promise<HealthStatus> {
      try {
        const res = await fetch('/health/ready', { credentials: 'omit', signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const json = await res.json();
          return { status: json.status || 'ok', checks: json.checks, details: json.details, ts: json.ts };
        }
        return { status: 'degraded' };
      } catch {
        return { status: 'offline' };
      }
    },
    async pingLive(): Promise<boolean> {
      try {
        const res = await fetch('/health', { credentials: 'omit', signal: AbortSignal.timeout(2000) });
        return res.ok;
      } catch {
        return false;
      }
    },
  },

  auth: {
    login: (body: { email: string; password?: string }) =>
      apiClient.post<{ user: any; workspace: any }>('/auth/login', body),
    register: (body: { name?: string; email: string; password?: string }) =>
      apiClient.post<{ user: any; workspace: any }>('/auth/register', body),
    logout: () => apiClient.post<{ ok: boolean }>('/auth/logout'),
  },

  users: {
    getMe: () => apiClient.get<any>('/users/me'),
    updateMe: (data: { name?: string; timeZone?: string; avatarUrl?: string | null }) =>
      apiClient.patch<any>('/users/me', data),
  },

  workspaces: {
    list: () => apiClient.get<Array<{ role: string; workspace: any }>>('/workspaces'),
    getCurrent: () => apiClient.get<any>('/workspaces/current'),
    updateCurrent: (data: { name?: string; slug?: string; avatarUrl?: string | null; settings?: Record<string, any> }) =>
      apiClient.patch<any>('/workspaces/current', data),
    create: (data: { name: string; slug?: string }) => apiClient.post<any>('/workspaces', data),
  },

  ideas: {
    list: (params?: { strategyId?: string; approved?: boolean; limit?: number; cursor?: string }) => {
      const q = new URLSearchParams();
      if (params?.strategyId) q.append('strategyId', params.strategyId);
      if (params?.approved !== undefined) q.append('approved', String(params.approved));
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.cursor) q.append('cursor', params.cursor);
      return apiClient.get<any[]>(`/ideas?${q.toString()}`);
    },
    generate: (strategyId: string, count: number = 5) =>
      apiClient.post<any[]>('/ideas/generate', { strategyId, count }),
    approve: (id: string) => apiClient.post<any>(`/ideas/${id}/approve`),
    reject: (id: string, reason?: string) => apiClient.post<any>(`/ideas/${id}/reject`, { reason }),
  },

  content: {
    list: (params?: { state?: string; limit?: number; cursor?: string }) => {
      const q = new URLSearchParams();
      if (params?.state) q.append('state', params.state);
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.cursor) q.append('cursor', params.cursor);
      return apiClient.get<any[]>(`/content?${q.toString()}`);
    },
    create: (data: string | { title: string; hook?: string; targetDurationSec?: number; tags?: string[]; ideaId?: string }) => {
      const body = typeof data === 'string' ? { ideaId: data } : data;
      return apiClient.post<any>('/content', body);
    },
    get: (id: string) => apiClient.get<any>(`/content/${id}`),
    generateScript: (id: string) => apiClient.post<any>(`/content/${id}/generate-script`),
    advance: (id: string, to: string) => apiClient.post<any>(`/content/${id}/advance`, { to }),
    publish: (id: string) => apiClient.post<any>(`/content/${id}/publish`),
  },

  projects: {
    list: (params?: { limit?: number; cursor?: string }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.cursor) q.append('cursor', params.cursor);
      return apiClient.get<any[]>(`/projects?${q.toString()}`);
    },
    get: (id: string) => apiClient.get<any>(`/projects/${id}`),
    create: (data: { contentId: string; width?: number; height?: number; fps?: number; aspectRatio?: string; templateId?: string }) =>
      apiClient.post<any>('/projects', data),
    delete: (id: string) => apiClient.delete<any>(`/projects/${id}`),
  },

  scripts: {
    get: (contentId: string) => apiClient.get<any>(`/scripts/${contentId}`),
    getVersions: (contentId: string) => apiClient.get<any[]>(`/scripts/${contentId}/versions`),
    save: (contentId: string, data: { title?: string; hook?: string; body: string; cta?: string; scenes?: any[] }) =>
      apiClient.post<any>(`/scripts/${contentId}`, data),
    generate: (contentId: string) => apiClient.post<any>(`/scripts/${contentId}/generate`),
  },

  voices: {
    list: () => apiClient.get<any[]>('/voices'),
    generate: (contentId: string) => apiClient.post<any>('/voices/generate', { contentId }),
  },

  visuals: {
    generate: (contentId: string) => apiClient.post<any>('/visuals/generate', { contentId }),
  },

  rendering: {
    render: (contentId: string, projectId: string) =>
      apiClient.post<any>('/rendering/render', { contentId, projectId }),
  },

  scheduling: {
    list: () => apiClient.get<any[]>('/schedules'),
    create: (body: { contentId: string; channelId: string; scheduledAt: string; privacyStatus?: 'public' | 'unlisted' | 'private' }) =>
      apiClient.post<any>('/schedules', body),
    cancel: (contentId: string) => apiClient.delete<any>(`/schedules/${contentId}`),
  },

  youtube: {
    listChannels: () => apiClient.get<any[]>('/youtube/channels'),
    getChannel: (id: string) => apiClient.get<any>(`/youtube/channels/${id}`),
    connect: (redirectUri?: string) => apiClient.post<{ authUrl: string }>('/youtube/connect', { redirectUri }),
    callback: (code: string, state: string, redirectUri?: string) =>
      apiClient.post<{ channels: any[] }>('/youtube/callback', { code, state, redirectUri }),
    disconnect: (id: string) => apiClient.delete<{ ok: boolean }>(`/youtube/channels/${id}`),
  },

  jobs: {
    get: (id: string) => apiClient.get<any>(`/jobs/${id}`),
    list: () => apiClient.get<any[]>('/jobs'),
  },

  qc: {
    get: (contentId: string) => apiClient.get<any[]>(`/qc/${contentId}`),
  },
};
