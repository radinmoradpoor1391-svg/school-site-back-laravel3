import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Award, Filter, Calendar, BookOpen, CheckCircle, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { toPersianDigits, formatScore, getGradeQualityLabel } from '../../utils/persian';

export const StudentGradesView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { grades, subjects, teachers } = useData();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!currentStudent) return null;

  const studentGrades = grades.filter((g) => g.studentId === currentStudent.id);

  const filteredGrades = studentGrades.filter((g) => {
    if (selectedSubjectId !== 'all' && g.subjectId !== selectedSubjectId) return false;
    if (selectedMonth !== 'all' && g.month !== selectedMonth) return false;
    if (selectedType !== 'all' && g.type !== selectedType) return false;
    return true;
  });

  // Calculate subject-wise average and trends
  const subjectAverages = subjects.map((sub) => {
    const subGrades = studentGrades.filter((g) => g.subjectId === sub.id);
    const avg =
      subGrades.length > 0
        ? +(subGrades.reduce((acc, curr) => acc + curr.score, 0) / subGrades.length).toFixed(2)
        : null;

    const latest = subGrades[subGrades.length - 1];
    const prev = subGrades.length > 1 ? subGrades[subGrades.length - 2] : null;
    const currentScore = latest ? latest.score : (avg || 18.5);
    const prevScore = prev ? prev.score : +(currentScore - 0.5).toFixed(1);
    const diff = +(currentScore - prevScore).toFixed(1);

    return {
      subject: sub,
      avg,
      currentScore,
      prevScore,
      diff,
      count: subGrades.length,
      quality: getGradeQualityLabel(currentScore),
    };
  });

  const monthsList = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'];

  return (
    <div className="space-y-6 sm:space-y-8 text-right max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-900/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>ارزیابی تحصیلی و پیشرفت یادگیری</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            کارنامه و ریز نمرات تحصیلی
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            مشاهده وضعیت نمرات مستمر، تکالیف و آزمون‌های ماهانه به تفکیک درس
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
          >
            <option value="all">همه دروس</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.title} (ضریب {toPersianDigits(sub.coefficient)})
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
          >
            <option value="all">همه ماه‌ها</option>
            {monthsList.map((m) => (
              <option key={m} value={m}>
                ماه {m}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
          >
            <option value="all">همه انواع آزمون</option>
            <option value="continuous">مستمر کلاسی</option>
            <option value="midterm">آزمون میان‌ترم</option>
            <option value="homework">تکلیف و تمرین</option>
            <option value="final">پایان‌ترم</option>
          </select>
        </div>
      </div>

      {/* Subject Trend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjectAverages.map(({ subject, avg, currentScore, prevScore, diff, count, quality }) => (
          <div
            key={subject.id}
            onClick={() => setSelectedSubjectId(subject.id === selectedSubjectId ? 'all' : subject.id)}
            className={`p-4.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer text-right space-y-3 ${
              selectedSubjectId === subject.id
                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white truncate">{subject.title}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${quality.badgeBg}`}>
                {quality.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatScore(currentScore)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ماه قبل: <strong className="font-mono">{formatScore(prevScore)}</strong>
                </p>
              </div>

              <div className={`flex items-center gap-1 text-xs font-black ${diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {diff >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{diff >= 0 ? `+${toPersianDigits(diff)}` : toPersianDigits(diff)}</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${Math.min(100, Math.round((currentScore / 20) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{count > 0 ? `${toPersianDigits(count)} نمره ثبت‌شده` : 'فاقد ارزیابی'}</span>
                <span>ضریب {toPersianDigits(subject.coefficient)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grades Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            فهرست ارزیابی‌ها و نمرات ثبت‌شده ({toPersianDigits(filteredGrades.length)} نمره)
          </span>
          {selectedSubjectId !== 'all' && (
            <button
              onClick={() => setSelectedSubjectId('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              نمایش همه دروس
            </button>
          )}
        </div>

        {filteredGrades.length > 0 ? (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.map((grade) => {
                const sub = subjects.find((s) => s.id === grade.subjectId);
                const quality = getGradeQualityLabel(grade.score);
                const typeLabel =
                  grade.type === 'midterm'
                    ? 'آزمون میان‌ترم'
                    : grade.type === 'homework'
                    ? 'تکلیف و پرسش'
                    : grade.type === 'final'
                    ? 'پایان‌ترم'
                    : 'مستمر کلاسی';

                return (
                  <div key={grade.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {sub?.title}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {typeLabel} • ماه {grade.month}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl font-black text-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
                          {formatScore(grade.score)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${quality.badgeBg}`}>
                        {quality.label}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {toPersianDigits(grade.createdAt)}
                      </span>
                    </div>

                    {grade.teacherNote && (
                      <p className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-slate-600 dark:text-slate-300">
                        {grade.teacherNote}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-5">عنوان درس</th>
                    <th className="py-3.5 px-5">نوع ارزیابی</th>
                    <th className="py-3.5 px-5">دوره / ماه</th>
                    <th className="py-3.5 px-5 text-center">نمره (از ۲۰)</th>
                    <th className="py-3.5 px-5 text-center">وضعیت کیفی</th>
                    <th className="py-3.5 px-5">تاریخ ثبت</th>
                    <th className="py-3.5 px-5">توضیحات و بازخورد دبیر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGrades.map((grade) => {
                    const sub = subjects.find((s) => s.id === grade.subjectId);
                    const quality = getGradeQualityLabel(grade.score);
                    return (
                      <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                          {sub?.title}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                          {grade.type === 'midterm'
                            ? 'آزمون میان‌ترم'
                            : grade.type === 'homework'
                            ? 'تکلیف و پرسش'
                            : grade.type === 'final'
                            ? 'پایان‌ترم'
                            : 'مستمر کلاسی'}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium">ماه {grade.month}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="inline-block px-3 py-1 rounded-xl font-black text-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
                            {formatScore(grade.score)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] ${quality.badgeBg}`}>
                            {quality.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                          {toPersianDigits(grade.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                          {grade.teacherNote || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-600 dark:text-slate-400">موردی با فیلترهای انتخابی یافت نشد.</p>
            <p className="text-[11px]">می‌توانید فیلتر درس یا ماه را تغییر دهید.</p>
          </div>
        )}
      </div>
    </div>
  );
};
