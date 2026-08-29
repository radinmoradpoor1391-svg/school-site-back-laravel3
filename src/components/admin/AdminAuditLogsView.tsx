import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { History, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      !q ||
      (log.action?.toLowerCase() || '').includes(q) ||
      (log.details?.toLowerCase() || '').includes(q) ||
      (log.userName?.toLowerCase() || '').includes(q);

    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          دفتر ثبت رویدادها و لاگ‌های امنیتی (Audit Logs)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ردیابی تمام تغییرات نمرات، ورود دانش‌آموزان، حضور و غیاب و تصمیمات کادر آموزشی با ذکر زمان و شناسه کاربر
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در رویدادها، نام کاربر یا جزئیات عملیات..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden w-full md:w-auto"
        >
          <option value="all">همه نقش‌های کاربری</option>
          <option value="admin">مدیریت سامانه</option>
          <option value="teacher">دبیران</option>
          <option value="student">دانش‌آموزان</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ردیف</th>
                <th className="py-3 px-4">عنوان رویداد</th>
                <th className="py-3 px-4">کاربر مجری</th>
                <th className="py-3 px-4">نقش کاربری</th>
                <th className="py-3 px-4">جزئیات و شرح عملیات</th>
                <th className="py-3 px-4 text-center font-mono">زمان ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 text-center text-slate-400">{toPersianDigits(idx + 1)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{log.userName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.userRole === 'admin'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      }`}
                    >
                      {log.userRole === 'admin' ? 'مدیریت' : 'دبیر آموزشی'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-md">{log.details}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                    {toPersianDigits(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
