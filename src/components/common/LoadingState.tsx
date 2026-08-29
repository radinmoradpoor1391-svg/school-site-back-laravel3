import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'در حال دریافت اطلاعات از سرور...',
  className = 'py-12',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-950/60 border-t-indigo-600 animate-spin" />
        <Loader2 className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
