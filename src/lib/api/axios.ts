import axios from 'axios';

// Create pre-configured Axios instance for FinTrack API requests
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 Unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fintrack_token');
      // If not already on login, dispatch custom event or allow ProtectedRoute to handle
      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new CustomEvent('fintrack_unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
