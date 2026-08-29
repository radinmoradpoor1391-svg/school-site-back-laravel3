import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, UserRole } from '../types';
import { authApi } from '../services/schoolApi';
import { toEnglishDigits } from '../utils/persian';

/**
 * Normalizes user object from backend (handling Laravel snake_case & minimal auth payloads)
 */
function normalizeUser(rawUser: any): User {
  if (!rawUser) return rawUser;
  const username = rawUser.username || rawUser.national_id || rawUser.nationalId || 'admin';
  const role = (rawUser.role as UserRole) || 'admin';

  let defaultFirstName = 'کاربر';
  let defaultLastName = '';
  if (role === 'admin') {
    defaultFirstName = 'مدیر';
    defaultLastName = 'سامانه';
  } else if (role === 'teacher') {
    defaultFirstName = 'دبیر';
    defaultLastName = 'محترم';
  } else if (role === 'student') {
    defaultFirstName = 'دانش‌آموز';
  }

  return {
    id: String(rawUser.id || '1'),
    username: rawUser.username || username,
    nationalId: rawUser.nationalId || rawUser.national_id || username,
    firstName: rawUser.firstName || rawUser.first_name || defaultFirstName,
    lastName: rawUser.lastName || rawUser.last_name || defaultLastName,
    role,
    email: rawUser.email || undefined,
    phone: rawUser.phone || rawUser.phone_number || undefined,
    avatarUrl: rawUser.avatarUrl || rawUser.avatar_url || rawUser.avatar || undefined,
    isActive: rawUser.isActive !== undefined ? Boolean(rawUser.isActive) : (rawUser.is_active !== undefined ? Boolean(rawUser.is_active) : true),
    firstLogin: Boolean(rawUser.firstLogin ?? rawUser.first_login ?? false),
    createdAt: rawUser.createdAt || rawUser.created_at || undefined,
    updatedAt: rawUser.updatedAt || rawUser.updated_at || undefined,
  };
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (
    nationalId: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchDemoUser: (role: UserRole, targetId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Authenticate and fetch current user profile via Sanctum token on load
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setCurrentUser(null);
      setCurrentStudent(null);
      setCurrentTeacher(null);
      setIsInitializing(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        const user = normalizeUser(res.user);
        setCurrentUser(user);
        if (user.role === 'student' && res.profile) {
          setCurrentStudent(res.profile as Student);
          setCurrentTeacher(null);
        } else if (user.role === 'teacher' && res.profile) {
          setCurrentTeacher(res.profile as Teacher);
          setCurrentStudent(null);
        } else {
          setCurrentStudent(null);
          setCurrentTeacher(null);
        }
      } else {
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
      }
    } catch {
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      setCurrentStudent(null);
      setCurrentTeacher(null);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (
    nationalIdInput: string,
    passwordInput: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }> => {
    const username = toEnglishDigits(nationalIdInput).trim();
    const password = toEnglishDigits(passwordInput).trim();

    if (!username || !password) {
      return { success: false, error: 'لطفاً کد ملی و رمز عبور را وارد نمایید.' };
    }

    try {
      const res = await authApi.login({ username, password });

      if (res.success && res.token && res.user) {
        const user = normalizeUser(res.user);

        if (expectedRole && user.role !== expectedRole) {
          const roleLabels: Record<string, string> = {
            admin: 'مدیریت',
            teacher: 'دبیران',
            student: 'دانش‌آموزان',
          };
          return {
            success: false,
            error: `این حساب متعلق به سطح دسترسی ${roleLabels[user.role] || user.role} است؛ لطفاً از زبانه مربوطه وارد شوید.`,
          };
        }

        localStorage.setItem('auth_token', res.token);
        setCurrentUser(user);

        if (user.role === 'student' && res.profile) {
          setCurrentStudent(res.profile as Student);
          setCurrentTeacher(null);
        } else if (user.role === 'teacher' && res.profile) {
          setCurrentTeacher(res.profile as Teacher);
          setCurrentStudent(null);
        } else {
          setCurrentStudent(null);
          setCurrentTeacher(null);
        }

        window.dispatchEvent(new Event('auth_state_changed'));

        return {
          success: true,
          requiresPasswordChange: user.firstLogin,
        };
      }

      return {
        success: false,
        error: res.message || 'نام کاربری یا رمز عبور اشتباه است.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'خطا در برقراری ارتباط با سامانه احراز هویت.',
      };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' };
    }

    try {
      const res = await authApi.changePassword({ newPassword, new_password: newPassword });
      if (res.success) {
        if (currentUser) {
          setCurrentUser({ ...currentUser, firstLogin: false });
        }
        return { success: true };
      }
      return { success: false, error: res.message || 'خطا در تغییر کلمه عبور.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطا در تغییر رمز عبور.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      setCurrentStudent(null);
      setCurrentTeacher(null);
      window.dispatchEvent(new Event('auth_state_changed'));
    }
  };

  const switchDemoUser = async (targetRole: UserRole, targetId?: string) => {
    if (targetRole === 'admin') {
      await login('admin', '1234', 'admin');
    } else if (targetRole === 'teacher') {
      await login('2222222222', '1234', 'teacher');
    } else if (targetRole === 'student') {
      await login('1111111111', '1234', 'student');
    }
  };

  if (isInitializing) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        currentStudent,
        currentTeacher,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        logout,
        updatePassword,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
