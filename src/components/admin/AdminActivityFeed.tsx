import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { AuditLog } from '../../types';
import {
  Activity,
  Award,
  Clock,
  UserPlus,
  Bell,
  FileSpreadsheet,
  Layers,
  Calendar,
  Filter,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface AdminActivityFeedProps {
  maxItems?: number;
  showHeader?: boolean;
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  maxItems = 8,
  showHeader = true,
}) => {
  const { auditLogs } = useData();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    let list = auditLogs;
    if (categoryFilter !== 'all') {
      list = list.filter((log) => log.targetType === categoryFilter);
    }
    return list.slice(0, maxItems);
  }, [auditLogs, categoryFilter, maxItems]);

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'grade':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'student':
      case 'teacher':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'report':
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
      case 'announcement':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'attendance':
        return <Clock className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTargetBg = (targetType: string) => {
    switch (targetType) {
      case 'grade':
        return 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900/60';
      case 'student':
      case 'teacher':
        return 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900/60';
      case 'report':
        return 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-900/60';
      case 'announcement':
        return 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900/60';
      case 'attendance':
        return 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-right">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              رویدادها و فعالیت‌های اخیر سامانه (Timeline)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              لاگ زنده تغییرات نمرات، گزارش‌ها، عملیات کاربری و ثبت رویدادها
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">همه دسته‌ها</option>
              <option value="grade">نمرات و ارزشیابی</option>
              <option value="student">دانش‌آموزان</option>
              <option value="teacher">دبیران</option>
              <option value="report">کارنامه‌ها</option>
              <option value="announcement">اعلان‌ها</option>
            </select>
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="relative border-r-2 border-slate-100 dark:border-slate-800 mr-3.5 space-y-4 py-1">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            رویدادی در این دسته‌بندی یافت نشد.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="relative pr-6 group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -right-[13px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${getTargetBg(
                  log.targetType
                )}`}
              >
                {getTargetIcon(log.targetType)}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {toPersianDigits(log.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {log.details}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    کاربر عامل: {log.userName} ({log.userRole === 'admin' ? 'مدیریت کل' : log.userRole === 'teacher' ? 'دبیر' : 'سیستم'})
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
