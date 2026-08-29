/**
 * Centralized API Client Bridge for backward compatibility with existing code.
 * Routes all requests through our standard configured Axios instance.
 */
import apiClient from '../api/axios';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  get: async <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    try {
      const response = await apiClient.get<T>(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.message || 'خطای شبکه', error.response?.data);
    }
  },

  post: async <T = any>(endpoint: string, body?: any): Promise<T> => {
    try {
      const response = await apiClient.post<T>(endpoint, body);
      return response.data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.message || 'خطای شبکه', error.response?.data);
    }
  },

  put: async <T = any>(endpoint: string, body?: any): Promise<T> => {
    try {
      const response = await apiClient.put<T>(endpoint, body);
      return response.data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.message || 'خطای شبکه', error.response?.data);
    }
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(endpoint);
      return response.data;
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.message || 'خطای شبکه', error.response?.data);
    }
  },
};

export default api;
