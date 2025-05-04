import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      // Only reload if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Store token in localStorage
    if (response.data && response.data.data && response.data.data.accessToken) {
      localStorage.setItem('authToken', response.data.data.accessToken);
    }
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    // Clear token on logout
    localStorage.removeItem('authToken');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Clear token if verification fails
      localStorage.removeItem('authToken');
      return null;
    }
  },
};

// File services
export const fileService = {
  uploadFile: async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await axios.post(`${API_URL}/files/upload`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add automatic sync after upload
    const filesData = await api.get('/files');
    return filesData.data;
  },
  
  getUserFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  // Add this new method
  syncFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },
};

export default api;