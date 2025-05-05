import axios from 'axios';


const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-render-backend-url.onrender.com/api/v1'  // Replace with your actual Render URL
  : 'http://localhost:3000/api/v1';

// Create axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor 
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
    // Store in localStorage
    if (response.data && response.data.data && response.data.data.accessToken) {
      localStorage.setItem('authToken', response.data.data.accessToken);
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
  
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      
      localStorage.removeItem('authToken');
      return null;
    }
  },
};

// File services
export const fileService = {
  uploadFile: async (fileData, onProgress) => {
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await axios.post(`${API_URL}/files/upload`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      onUploadProgress: progressEvent => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    const filesData = await api.get('/files');
    return filesData.data;
  },
  
  getUserFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },


  syncFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },
  

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
  
  downloadFile: async (fileId, fileName) => {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return response;
  }
};


export default api;

let accessToken = null;

export function setAccessToken(token) {
    accessToken = token;
}

export async function apiFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (accessToken) {
        options.headers['Authorization'] = 'Bearer ' + accessToken;
    }
    let response = await fetch(url, options);

    if (response.status === 401) {
       
        const refreshResponse = await fetch('/refresh', { method: 'POST', credentials: 'include' });
        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setAccessToken(data.accessToken);
            
            options.headers['Authorization'] = 'Bearer ' + data.accessToken;
            response = await fetch(url, options);
        } 
    }
    return response;
}