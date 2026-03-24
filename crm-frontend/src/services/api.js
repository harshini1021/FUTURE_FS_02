// src/services/api.js
// Central Axios instance — all API calls go through here.
// Auto-attaches JWT, handles token refresh on 401, redirects on auth failure.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,           // send cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// On 401: attempt token refresh once, then retry original request
let isRefreshing = false;
let refreshQueue = []; // queued requests waiting for new token

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Retry queued requests
        refreshQueue.forEach(({ resolve }) => resolve(newToken));
        refreshQueue = [];
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        // Refresh failed — log out
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── AUTH ENDPOINTS ──────────────────────────────────────────────────────────

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  getMe: () =>
    api.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
};

// ─── LEADS ENDPOINTS ─────────────────────────────────────────────────────────

export const leadsAPI = {
  // GET /api/leads?status=new&page=1&search=priya
  getAll: (params = {}) =>
    api.get('/leads', { params }),

  // GET /api/leads/stats
  getStats: () =>
    api.get('/leads/stats'),

  // GET /api/leads/:id
  getOne: (id) =>
    api.get(`/leads/${id}`),

  // POST /api/leads
  create: (data) =>
    api.post('/leads', data),

  // PUT /api/leads/:id
  update: (id, data) =>
    api.put(`/leads/${id}`, data),

  // PATCH /api/leads/:id/status
  updateStatus: (id, status) =>
    api.patch(`/leads/${id}/status`, { status }),

  // DELETE /api/leads/:id  (soft-deletes / archives)
  delete: (id) =>
    api.delete(`/leads/${id}`),

  // POST /api/leads/:id/notes
  addNote: (id, text) =>
    api.post(`/leads/${id}/notes`, { text }),

  // DELETE /api/leads/:id/notes/:noteId
  deleteNote: (id, noteId) =>
    api.delete(`/leads/${id}/notes/${noteId}`),

  // Public contact form (no auth)
  publicSubmit: (data) =>
    api.post('/leads/public/submit', data),
};

export default api;
