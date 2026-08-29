import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { toPersianDigits, formatScore } from '../../utils/persian';

export const StudentAttendanceView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { attendance } = useData();

  if (!currentStudent) return null;

  const studentRecords = attendance.filter((a) => a.studentId === currentStudent.id);

  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'excused'>('all');

  const filteredRecords = studentRecords.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const presentCount = studentRecords.filter((r) => r.status === 'present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'absent').length;
  const excusedCount = studentRecords.filter((r) => r.status === 'excused').length;
  const lateCount = studentRecords.filter((r) => r.status === 'late').length;

  const totalSessions = studentRecords.length || 1;
  const attendanceRate = +((presentCount / totalSessions) * 100).toFixed(1);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-indigo-600" />
          دفتر گزارش حضور و غیاب
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          مشاهده وضعیت روزانه حضور در کلاس، غیبت‌های موجه/غیرموجه و تاخیرهای ثبت‌شده
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">حضور منظم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {toPersianDigits(presentCount)} <span className="text-xs font-normal">روز</span>
          </p>
          <p className="text-[10px] text-emerald-600">نرخ حضور: {toPersianDigits(attendanceRate)}٪</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">غیبت غیرموجه</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
            {toPersianDigits(absentCount)} <span className="text-xs font-normal">روز</span>
          </p>
          <p className="text-[10px] text-rose-600">عدم حضور بدون گواهی</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">غیبت موجه</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
            {toPersianDigits(excusedCount)} <span className="text-xs font-normal">روز</span>
          </p>
          <p className="text-[10px] text-blue-600">همراه با گواهی پزشکی/ولی</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-right space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">تاخیر ورود</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {toPersianDigits(lateCount)} <span className="text-xs font-normal">مورد</span>
          </p>
          <p className="text-[10px] text-amber-600">ورود پس از زنگ آغازین</p>
        </div>
      </div>

      {/* Filter Tabs & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            فهرست روزهای ثبت‌شده ({toPersianDigits(filteredRecords.length)} روز)
          </span>

          <div className="flex gap-1.5">
            {(['all', 'present', 'absent', 'late', 'excused'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {st === 'all'
                  ? 'همه'
                  : st === 'present'
                  ? 'حاضر'
                  : st === 'absent'
                  ? 'غایب'
                  : st === 'late'
                  ? 'تاخیر'
                  : 'موجه'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRecords.map((rec) => {
            const statusConfig = {
              present: { label: 'حاضر در کلاس', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' },
              absent: { label: 'غایب غیرموجه', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300' },
              excused: { label: 'غایب موجه', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300' },
              late: { label: 'ورود با تاخیر', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300' },
            }[rec.status];

            return (
              <div
                key={rec.id}
                className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                    تاریخ: {toPersianDigits(rec.date)}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {rec.note ? `توضیحات: ${rec.note}` : 'توضیحات خاصی ثبت نشده است.'}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${statusConfig.bg}`}>
                  {statusConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
