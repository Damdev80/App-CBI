import { getToken, removeToken } from './auth';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  // Use Next.js API routes (which proxy to NestJS)
  const response = await fetch(`/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle PDF responses
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/pdf')) {
    return response.blob() as Promise<T>;
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

// API methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Auth API (no longer needed, handled by useAuth hook)
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
};

// Profile API
export const profileApi = {
  get: () => api.get('/profile'),
  getWithGroups: () => api.get('/profile/with-groups'),
  update: (data: Record<string, unknown>) => api.patch('/profile', data),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
};

// Dashboard API
export const dashboardApi = {
  getRoleSummary: () => api.get('/dashboard/role-summary'),
  getNumberUser: () => api.get<number>('/dashboard/numberUser'),
  getBautized: () => api.get<number>('/dashboard/bautized'),
  getWomenRegistered: () => api.get<number>('/dashboard/womenRegistered'),
  getCountUnpaid: () => api.get<number>('/dashboard/countUnpaid'),
};

// Groups API
export const groupsApi = {
  getAll: () => api.get('/groups'),
  getById: (id: string) => api.get(`/groups/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/groups', data),
};

// Members API
export const membersApi = {
  getAll: () => api.get('/groups'),
  getByGroup: (groupId: string) => api.get(`/groups/${groupId}`),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
};

// Users Event API
export const usersEventApi = {
  getAll: () => api.get('/users-event'),
  getById: (id: string) => api.get(`/users-event/${id}`),
  getByEvent: (eventId: string) => api.get(`/users-event?eventId=${eventId}`),
  create: (data: Record<string, unknown>) => api.post('/users-event', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users-event/${id}`, data),
  delete: (id: string) => api.delete(`/users-event/${id}`),
};

// Sessions API
export const sessionsApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  getByGroup: (groupId: string) => api.get(`/events?groupId=${groupId}`),
  create: (data: { title: string; description?: string; date?: string; groupId: string }) =>
    api.post('/events', data),
};

// Forum API
export const forumApi = {
  getPosts: (groupId?: string) =>
    api.get(`/forum${groupId ? `?groupId=${groupId}` : ''}`),
  createPost: (data: { groupId: string; title: string; content: string; authorId?: string; authorName?: string }) =>
    api.post('/forum', data),
};

// Teachers Service API
export const teachersServiceApi = {
  getAll: () => api.get('/teachers-service'),
  getById: (id: string) => api.get(`/teachers-service/${id}`),
  create: (data: { name: string; number?: string }) => api.post('/teachers-service', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/teachers-service/${id}`, data),
  delete: (id: string) => api.delete(`/teachers-service/${id}`),
};

// Users Service API (Social Service Students)
export const usersServiceApi = {
  getAll: () => api.get('/users-service'),
  getById: (id: string) => api.get(`/users-service/${id}`),
  getByTeacher: (teacherId: string) => api.get(`/users-service?teacherId=${teacherId}`),
  create: (data: Record<string, unknown>) => api.post('/users-service', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users-service/${id}`, data),
  delete: (id: string) => api.delete(`/users-service/${id}`),
};

// Student Groups API
export const studentGroupsApi = {
  getAll: (teacherId?: string) =>
    api.get(`/student-groups${teacherId ? `?teacherId=${teacherId}` : ''}`),
  getById: (id: string) => api.get(`/student-groups/${id}`),
  create: (data: { name: string; number?: string; teacherId?: string }) =>
    api.post('/student-groups', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/student-groups/${id}`, data),
  delete: (id: string) => api.delete(`/student-groups/${id}`),
};

// Attendance API
export const attendanceApi = {
  getByDate: (date: string, teacherId: string) =>
    api.get(`/attendance?date=${date}&teacherId=${teacherId}`),
  bulk: (data: { date: string; teacherId: string; records: { studentId: string; present: boolean }[] }) =>
    api.post('/attendance', data),
  getSummary: (date: string, teacherId?: string) =>
    api.get(`/attendance/summary?date=${date}${teacherId ? `&teacherId=${teacherId}` : ''}`),
  getHistory: (teacherId: string, from?: string, to?: string) =>
    api.get(`/attendance/history?teacherId=${teacherId}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`),
  getAbsenceCounts: (teacherId: string) =>
    api.get(`/attendance/absence-counts?teacherId=${teacherId}`),
};

// Money Collection API
export const moneyCollectionApi = {
  getAll: (params?: { studentId?: string; teacherId?: string; groupId?: string; from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.teacherId) searchParams.set('teacherId', params.teacherId);
    if (params?.groupId) searchParams.set('groupId', params.groupId);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    const query = searchParams.toString();
    return api.get(`/money-collections${query ? `?${query}` : ''}`);
  },
  create: (data: { date: string; amount: number; studentId: string; notes?: string; targetAmount?: number }) =>
    api.post('/money-collections', data),
  getTotal: (params?: { studentId?: string; teacherId?: string; groupId?: string; from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.teacherId) searchParams.set('teacherId', params.teacherId);
    if (params?.groupId) searchParams.set('groupId', params.groupId);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    const query = searchParams.toString();
    return api.get<number>(`/money-collections/total${query ? `?${query}` : ''}`);
  },
  getDebtStatus: (expectedAmount: number, params?: { studentId?: string; teacherId?: string; groupId?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('expectedAmount', expectedAmount.toString());
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.teacherId) searchParams.set('teacherId', params.teacherId);
    if (params?.groupId) searchParams.set('groupId', params.groupId);
    return api.get(`/money-collections/debt-status?${searchParams.toString()}`);
  },
  getInvoice: (id: string) =>
    api.get<Blob>(`/money-collections/${id}/invoice`),
};

// Visitors API
export const visitorsApi = {
  getAll: () => api.get('/visitors'),
  create: (data: { name: string; dateBorn: string; phone: string }) =>
    api.post('/visitors', data),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  resetPassword: (id: string, password?: string) =>
    api.post(`/admin/users/${id}/reset-password`, { password }),
  setActive: (id: string, isActive: boolean) =>
    api.post(`/admin/users/${id}/set-active`, { isActive }),
  setRole: (id: string, role: string) =>
    api.post(`/admin/users/${id}/set-role`, { role }),
};
