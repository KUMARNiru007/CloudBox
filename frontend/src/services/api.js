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

// Authentication services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Add this method to check if user is authenticated
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
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