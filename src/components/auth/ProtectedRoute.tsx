import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoginPage } from './LoginPage';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackView?: React.ReactNode;
}

/**
 * Route protection wrapper verifying authentication and role authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackView,
}) => {
  const { user, role, isAuthenticated } = useAuth();

  // 1. Not Authenticated -> Show Login Page / Prompt
  if (!isAuthenticated || !user) {
    if (fallbackView) return <>{fallbackView}</>;
    return <LoginPage defaultRole={allowedRoles?.[0] || 'student'} />;
  }

  // 2. Role restricted -> Check if user has required role
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            عدم دسترسی به این بخش
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            نقش کاربری فعلی شما ({role}) مجوز دسترسی به این صفحه را ندارد.
          </p>
        </div>
      </div>
    );
  }

  // 3. Authorized -> Render protected children
  return <>{children}</>;
};

export default ProtectedRoute;
