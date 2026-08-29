import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'خطا در بارگذاری داده‌ها',
  message = 'عدم امکان دریافت اطلاعات از سرور Laravel API. لطفاً اتصال اینترنت یا وضعیت سرور را بررسی کنید.',
  onRetry,
  className = 'py-10',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 max-w-lg mx-auto space-y-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
          {title}
        </h4>
        <p className="text-xs text-rose-600 dark:text-rose-300/80 leading-relaxed max-w-sm">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تلاش مجدد</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
