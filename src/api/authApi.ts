import apiClient from './axios';
import { User, Student, Teacher } from '../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  profile?: Student | Teacher | null;
}

export interface MeResponse {
  success: boolean;
  user: User;
  profile: Student | Teacher | null;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
  current_password?: string;
  new_password?: string;
}

/**
 * Authentication API Service interacting with Laravel Sanctum endpoints
 */
export const authApi = {
  /**
   * Login user with username (national_id/username) and password
   * POST /api/auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Fetch authenticated user information and profile
   * GET /api/auth/me
   */
  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },

  /**
   * Invalidate current Sanctum token
   * POST /api/auth/logout
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Change current user's password
   * POST /api/auth/change-password
   */
  changePassword: async (data: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  },
};

export default authApi;
