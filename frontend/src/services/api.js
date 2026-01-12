import axios from 'axios';

// Base URL - uses environment variable or defaults to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats/overview'),
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  create: (taskId, data) => api.post(`/comments/task/${taskId}`, data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  getCount: (taskId) => api.get(`/comments/task/${taskId}/count`),
};

// Workspace API
export const workspaceAPI = {
  getCurrent: () => api.get('/workspaces/current'),
  getMembers: () => api.get('/workspaces/members'),
  createMember: (data) => api.post('/workspaces/create-member', data),
  updateMemberRole: (userId, data) => api.patch(`/workspaces/members/${userId}/role`, data),
  updateSettings: (data) => api.put('/workspaces/settings', data),
};

export default api;