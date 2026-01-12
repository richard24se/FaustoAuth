import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9024',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
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
  },
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login if unauthorized or forbidden
      localStorage.removeItem('token');
      // Ideally dispatch a logout action, but simple redirect works for now
      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  },
);

export const backupApi = {
  downloadBackup: async () => {
    const response = await api.get('/backup/download', {
      responseType: 'blob',
    });
    return response.data;
  },
  restoreBackup: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
