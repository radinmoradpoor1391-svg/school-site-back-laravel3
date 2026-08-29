import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL configured for API (fallback to /api or environment variable)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Pre-configured Axios instance with Sanctum Token interceptors and error handling.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized & auto logout
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      // 401 Unauthorized: Expired or invalid token
      if (status === 401) {
        localStorage.removeItem('auth_token');
        // Notify application of auth state expiration
        window.dispatchEvent(new CustomEvent('auth_unauthorized', { detail: { message: data?.message || 'نشست شما منقضی شده است.' } }));
        window.dispatchEvent(new Event('auth_state_changed'));
      }

      const customErrorMessage = data?.message || data?.error || `خطای سرور (${status})`;
      return Promise.reject(new Error(customErrorMessage));
    } else if (error.request) {
      // Network error or connection refused
      return Promise.reject(
        new Error('عدم امکان برقراری ارتباط با سرور سامانه (Network Connection Error).')
      );
    } else {
      return Promise.reject(new Error(error.message || 'خطای نامشخص در ارسال درخواست.'));
    }
  }
);

export default apiClient;
