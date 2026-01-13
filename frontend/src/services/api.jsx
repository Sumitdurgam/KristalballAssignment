import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Purchase API
export const purchaseAPI = {
  create: (data) => apiClient.post('/purchases', data),
  getAll: (filters) => apiClient.get('/purchases', { params: filters }),
  getById: (id) => apiClient.get(`/purchases/${id}`),
  update: (id, data) => apiClient.put(`/purchases/${id}`, data),
  delete: (id) => apiClient.delete(`/purchases/${id}`),
};

// Transfer API
export const transferAPI = {
  create: (data) => apiClient.post('/transfers', data),
  getAll: (filters) => apiClient.get('/transfers', { params: filters }),
  getById: (id) => apiClient.get(`/transfers/${id}`),
  approve: (id) => apiClient.patch(`/transfers/${id}/approve`),
  update: (id, data) => apiClient.put(`/transfers/${id}`, data),
  delete: (id) => apiClient.delete(`/transfers/${id}`),
};

// Assignment API
export const assignmentAPI = {
  create: (data) => apiClient.post('/assignments', data),
  getAll: (filters) => apiClient.get('/assignments', { params: filters }),
  getById: (id) => apiClient.get(`/assignments/${id}`),
  update: (id, data) => apiClient.put(`/assignments/${id}`, data),
  delete: (id) => apiClient.delete(`/assignments/${id}`),
};

// Expenditure API
export const expenditureAPI = {
  create: (data) => apiClient.post('/expenditures', data),
  getAll: (filters) => apiClient.get('/expenditures', { params: filters }),
  getById: (id) => apiClient.get(`/expenditures/${id}`),
  update: (id, data) => apiClient.put(`/expenditures/${id}`, data),
  delete: (id) => apiClient.delete(`/expenditures/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getMetrics: (filters) => apiClient.get('/dashboard/metrics', { params: filters }),
  getNetMovementDetails: (filters) => apiClient.get('/dashboard/net-movement-details', { params: filters }),
  getBases: () => apiClient.get('/dashboard/bases'),
  getAssetTypes: () => apiClient.get('/dashboard/asset-types'),
};

export default apiClient;
