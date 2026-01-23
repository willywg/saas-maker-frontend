import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Determine API base URL with runtime fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach access token and handle FormData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // If data is FormData or URLSearchParams, remove default Content-Type
    // so Axios sets it correctly (multipart/form-data or application/x-www-form-urlencoded)
    if (config.data instanceof FormData || config.data instanceof URLSearchParams) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      // No refresh token, logout
      handleLogout();
      return Promise.reject(error);
    }

    try {
      // Use axios directly to avoid interceptors loop
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);

      // Process queue of pending requests
      processQueue(null, access_token);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed, logout
      processQueue(refreshError as Error, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Logout function (clears tokens and redirects)
function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default apiClient;
export { API_BASE_URL };
