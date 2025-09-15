import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Making API request to:', config.url);
    console.log('Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Unauthorized - removing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const cardsAPI = {
  getCards: () => api.get('/cards'),
  addCard: (cardData) => api.post('/cards', cardData),
  updateCard: (id, cardData) => api.put(`/cards/${id}`, cardData),
  deleteCard: (id) => api.delete(`/cards/${id}`),
  makePayment: (id, amount) => api.post(`/cards/${id}/payment`, { amount }),
  getCardStats: (id) => api.get(`/cards/${id}/stats`),
};

export const expensesAPI = {
  getExpenses: (params) => api.get('/expenses', { params }),
  addExpense: (expenseData) => api.post('/expenses', expenseData),
  updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getExpensesByCategory: (category, params) => api.get(`/expenses/category/${category}`, { params }),
  getRecentExpenses: (limit = 10) => api.get(`/expenses/recent/${limit}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMonthlyReport: (year, month) => api.get(`/analytics/monthly/${year}/${month}`),
  getInsights: () => api.get('/analytics/insights'),
  getCategoryComparison: (months = 6) => api.get('/analytics/categories/comparison', { params: { months } }),
};

export default api;
