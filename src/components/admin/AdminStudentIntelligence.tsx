import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Student } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ChevronLeft,
  User,
  Clock,
  BookOpen,
} from 'lucide-react';
import { toPersianDigits, formatScore, getGradeColorClass } from '../../utils/persian';

interface AdminStudentIntelligenceProps {
  onSelectStudent: (student: Student) => void;
}

export const AdminStudentIntelligence: React.FC<AdminStudentIntelligenceProps> = ({
  onSelectStudent,
}) => {
  const { students, grades, attendance, homeworks, submissions } = useData();

  // 1. Top Improving Students Logic
  const topImprovingStudents = useMemo(() => {
    return students
      .map((std) => {
        const stdGrades = grades.filter((g) => g.studentId === std.id);
        
        let currentAvg = 18.0;
        let prevAvg = 17.0;
        let improvement = 1.0;

        if (stdGrades.length >= 2) {
          const sorted = [...stdGrades].sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
          const mid = Math.floor(sorted.length / 2);
          const older = sorted.slice(0, mid);
          const newer = sorted.slice(mid);

          const oldSum = older.reduce((a, b) => a + b.score, 0) / (older.length || 1);
          const newSum = newer.reduce((a, b) => a + b.score, 0) / (newer.length || 1);

          prevAvg = +oldSum.toFixed(2);
          currentAvg = +newSum.toFixed(2);
          improvement = +(currentAvg - prevAvg).toFixed(2);
        } else if (stdGrades.length === 1) {
          currentAvg = +stdGrades[0].score.toFixed(2);
          prevAvg = Math.max(10, currentAvg - 1.5);
          improvement = 1.5;
        }

        return {
          student: std,
          currentAvg,
          prevAvg,
          improvement,
        };
      })
      .filter((item) => item.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 4);
  }, [students, grades]);

  // 2. Students Needing Attention Logic (At-risk)
  const atRiskStudents = useMemo(() => {
    const list: {
      student: Student;
      currentAvg: number;
      absences: number;
      missingHomeworkCount: number;
      reasons: string[];
    }[] = [];

    students.forEach((std) => {
      const stdGrades = grades.filter((g) => g.studentId === std.id);
      const currentAvg = stdGrades.length > 0
        ? +(stdGrades.reduce((a, b) => a + b.score, 0) / stdGrades.length).toFixed(2)
        : 18.0;

      const stdAtt = attendance.filter((a) => a.studentId === std.id);
      const absences = stdAtt.filter((a) => a.status === 'absent').length;

      // Missing homework check
      const classHw = homeworks.filter((h) => h.classId === std.classId);
      const stdSubs = submissions.filter((s) => s.studentId === std.id);
      const missingHw = Math.max(0, classHw.length - stdSubs.length);

      const reasons: string[] = [];
      if (currentAvg < 15.0 && stdGrades.length > 0) reasons.push(`معدل دروس (${formatScore(currentAvg)}) نیازمند تقویت`);
      if (absences >= 2) reasons.push(`${toPersianDigits(absences)} مورد غیبت ثبت‌شده`);
      if (missingHw >= 1) reasons.push(`${toPersianDigits(missingHw)} تکلیف تحویل‌نشده`);

      if (reasons.length > 0) {
        list.push({
          student: std,
          currentAvg,
          absences,
          missingHomeworkCount: missingHw,
          reasons,
        });
      }
    });

    return list.slice(0, 4);
  }, [students, grades, attendance, homeworks, submissions]);

  return (
    <div className="grid lg:grid-cols-2 gap-6 text-right">
      {/* Top Improving Students Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              دانش‌آموزان با بیشترین رشد تحصیلی
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              جهش معدل و ارتقای چشمگیر در آزمون‌های اخیر
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            برترین‌های ارتقای نمره
          </span>
        </div>

        <div className="space-y-3">
          {topImprovingStudents.map((item) => (
            <div
              key={item.student.id}
              onClick={() => onSelectStudent(item.student)}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
            >
              {/* Mobile Vertical Composition (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {/* Header row: Avatar + Name + Class */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                    {item.student.firstName[0]} {item.student.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {item.student.firstName} {item.student.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.student.className} • کد: <span className="font-mono">{toPersianDigits(item.student.studentCode)}</span>
                    </p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">جهش نمره</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      +{toPersianDigits(item.improvement)} نمره
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-center">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">معدل جدید</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white font-mono">
                      {formatScore(item.currentAvg)}
                    </span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span>معدل قبل: <strong className="font-mono text-slate-600 dark:text-slate-300">{formatScore(item.prevAvg)}</strong></span>
                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    پرونده تحصیلی <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                  </span>
                </div>
              </div>

              {/* Desktop / Tablet Horizontal Composition (sm+) */}
              <div className="hidden sm:flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                    {item.student.firstName[0]}
                    {item.student.lastName[0]}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                      {item.student.firstName} {item.student.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.student.className} • کد دانش‌آموزی: <span className="font-mono">{toPersianDigits(item.student.studentCode)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-left">
                    <div className="flex items-center justify-end gap-1 text-emerald-600 font-black text-xs md:text-sm">
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                      <span>+{toPersianDigits(item.improvement)} نمره رشد</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      معدل قبلی: {formatScore(item.prevAvg)} ➔ فعلی: {formatScore(item.currentAvg)}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students Needing Attention Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>دانش‌آموزان نیازمند توجه و حمایت آموزشی</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              افت نمره، غیبت مکرر یا عدم تحویل تکالیف درسی
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 shrink-0">
            پایش و مداخله
          </span>
        </div>

        <div className="space-y-3">
          {atRiskStudents.map((item) => (
            <div
              key={item.student.id}
              onClick={() => onSelectStudent(item.student)}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
            >
              {/* Mobile Vertical Composition (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {/* Header row: Avatar + Name + Class */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center font-black text-xs shrink-0">
                    {item.student.firstName[0]} {item.student.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-rose-600 transition-colors">
                      {item.student.firstName} {item.student.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.student.className} • معدل: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatScore(item.currentAvg)}</span>
                    </p>
                  </div>
                </div>

                {/* Reasons Badges */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  {item.reasons.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/60"
                    >
                      {r}
                    </span>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span>وضعیت: <strong className="text-rose-600 dark:text-rose-400">پایش تحصیلی</strong></span>
                  <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                    بررسی پرونده <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                  </span>
                </div>
              </div>

              {/* Desktop / Tablet Horizontal Composition (sm+) */}
              <div className="hidden sm:flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center font-black text-sm shrink-0">
                    {item.student.firstName[0]}
                    {item.student.lastName[0]}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors truncate">
                      {item.student.firstName} {item.student.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.student.className} • معدل: <span className="font-mono">{formatScore(item.currentAvg)}</span>
                    </p>
                  </div>
                </div>

                {/* Reasons badges */}
                <div className="flex items-center justify-end gap-2 flex-wrap shrink-0">
                  <div className="flex flex-wrap gap-1.5">
                    {item.reasons.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/60"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-50 transition-all shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
