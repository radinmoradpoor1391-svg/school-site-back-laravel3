import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Award, Search, Filter, Layers, BookOpen, TrendingUp, Download } from 'lucide-react';
import { toPersianDigits, formatScore, getGradeQualityLabel } from '../../utils/persian';

export const AdminGradeOversight: React.FC = () => {
  const { grades, classes, subjects, students } = useData();

  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const monthsList = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'];

  const filteredGrades = grades.filter((g) => {
    const std = students.find((s) => s.id === g.studentId);
    const stdName = std ? `${std.firstName} ${std.lastName}` : '';
    const nationalId = std ? std.nationalId : '';

    const matchesSearch =
      !searchQuery ||
      stdName.includes(searchQuery) ||
      nationalId.includes(searchQuery);

    const matchesClass = selectedClassFilter === 'all' || g.classId === selectedClassFilter;
    const matchesSubject = selectedSubjectFilter === 'all' || g.subjectId === selectedSubjectFilter;
    const matchesMonth = selectedMonthFilter === 'all' || g.month === selectedMonthFilter;

    return matchesSearch && matchesClass && matchesSubject && matchesMonth;
  });

  // Calculate statistics
  const totalScores = filteredGrades.reduce((acc, curr) => acc + curr.score, 0);
  const averageGPA = filteredGrades.length > 0 ? +(totalScores / filteredGrades.length).toFixed(2) : 0;
  const excellentCount = filteredGrades.filter((g) => g.score >= 17).length;
  const needHelpCount = filteredGrades.filter((g) => g.score < 12).length;

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            نظارت کلی بر نمرات و ارزیابی‌های آموزشی
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            دفتر کل نمرات ثبت‌شده توسط تمام دبیران به تفکیک پایه، ماه و وضعیت عملکرد تحصیلی
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تعداد کل ارزیابی‌های فیلترشده</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{toPersianDigits(filteredGrades.length)}</p>
          <p className="text-[11px] text-slate-400">رکورد نمره ثبت‌شده</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">میانگین نمرات</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatScore(averageGPA)}</p>
          <p className="text-[11px] text-emerald-600">از سقف نمره ۲۰</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">سطح خیلی خوب و عالی (&ge; ۱۷)</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{toPersianDigits(excellentCount)}</p>
          <p className="text-[11px] text-indigo-500">نمره برتر</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نیازمند تلاش و جبران (&lt; ۱۲)</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{toPersianDigits(needHelpCount)}</p>
          <p className="text-[11px] text-rose-500">دانش‌آموز نیازمند ارجاع به مشاور</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام یا کد ملی..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="all">همه کلاس‌ها</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="all">همه دروس</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="all">همه ماه‌ها</option>
            {monthsList.map((m) => (
              <option key={m} value={m}>
                ماه {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ردیف</th>
                <th className="py-3 px-4">دانش‌آموز</th>
                <th className="py-3 px-4">کلاس</th>
                <th className="py-3 px-4">درس</th>
                <th className="py-3 px-4">دوره / ماه</th>
                <th className="py-3 px-4 text-center">نمره (از ۲۰)</th>
                <th className="py-3 px-4 text-center">ارزیابی کیفی</th>
                <th className="py-3 px-4">ملاحظات دبیر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.slice(0, 50).map((g, idx) => {
                const std = students.find((s) => s.id === g.studentId);
                const sub = subjects.find((s) => s.id === g.subjectId);
                const cls = classes.find((c) => c.id === g.classId);
                const quality = getGradeQualityLabel(g.score);

                return (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">{toPersianDigits(idx + 1)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {std ? `${std.firstName} ${std.lastName}` : 'نامشخص'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{cls?.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{sub?.title}</td>
                    <td className="py-3 px-4 text-slate-500">ماه {g.month}</td>
                    <td className="py-3 px-4 text-center font-black font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {formatScore(g.score)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${quality.badgeBg}`}>
                        {quality.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{g.teacherNote || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
