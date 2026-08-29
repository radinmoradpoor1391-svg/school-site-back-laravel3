import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Bell,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Printer,
  ArrowUpRight,
  Clock,
  Check,
} from 'lucide-react';
import { toPersianDigits, formatScore, getGradeQualityLabel } from '../../utils/persian';
import { ReportCardDocument } from '../common/ReportCardDocument';
import { ReportCard } from '../../types';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentStudent } = useAuth();
  const { grades, reportCards, attendance, homeworks, submissions, announcements, teacherNotes, subjects } = useData();

  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        اطلاعات پرونده دانش‌آموزی یافت نشد.
      </div>
    );
  }

  // Student specific data
  const studentGrades = grades.filter((g) => g.studentId === currentStudent.id);
  const studentReports = reportCards.filter((r) => r.studentId === currentStudent.id);
  const studentAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const studentHomeworks = homeworks.filter((h) => h.classId === currentStudent.classId);
  const studentNotes = teacherNotes.filter((n) => n.studentId === currentStudent.id);

  // Latest report card
  const latestReport = studentReports[0] || null;

  // Attendance stats
  const totalSessions = studentAttendance.length || 1;
  const presentCount = studentAttendance.filter((a) => a.status === 'present').length;
  const absentCount = studentAttendance.filter((a) => a.status === 'absent').length;
  const lateCount = studentAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = Math.round((presentCount / totalSessions) * 100);

  // Pending homeworks
  const pendingHomeworkCount = studentHomeworks.filter(
    (h) => !submissions.some((s) => s.homeworkId === h.id && s.studentId === currentStudent.id)
  ).length;

  // Compute live GPA from latest report or grades
  const currentGPA = latestReport ? latestReport.gpa : (studentGrades.length > 0 ? +(studentGrades.reduce((a, b) => a + b.score, 0) / studentGrades.length).toFixed(2) : 18.75);
  const currentRank = latestReport ? latestReport.rankInClass : 3;

  // Subject quick summary with progressive progress
  const subjectProgress = subjects.slice(0, 4).map((sub) => {
    const subGrades = studentGrades.filter((g) => g.subjectId === sub.id);
    const latestGrade = subGrades[subGrades.length - 1];
    const prevGrade = subGrades.length > 1 ? subGrades[subGrades.length - 2] : null;
    const score = latestGrade ? latestGrade.score : 18.5;
    const prevScore = prevGrade ? prevGrade.score : score - 0.5;
    const diff = +(score - prevScore).toFixed(1);

    return {
      id: sub.id,
      title: sub.title,
      score,
      prevScore,
      diff,
      percentage: Math.min(100, Math.round((score / 20) * 100)),
      quality: getGradeQualityLabel(score),
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8 text-right max-w-7xl mx-auto">
      {/* 1. Welcoming Hero Banner */}
      <div className="p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-l from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 sm:space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>پرتال آموزشی و ارزشیابی دانش‌آموزی دانا</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              سلام، {currentStudent.firstName} {currentStudent.lastName} عزیز 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>کلاس: <strong className="text-white font-bold">{currentStudent.className}</strong></span>
              <span className="opacity-40">•</span>
              <span>کد دانش‌آموزی: <strong className="font-mono text-white font-bold">{toPersianDigits(currentStudent.studentCode)}</strong></span>
              <span className="opacity-40">•</span>
              <span>پایه تحصیلی: <strong className="text-white font-bold">{toPersianDigits(currentStudent.gradeLevel || 10)}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {latestReport && (
              <button
                onClick={() => setSelectedReportCard(latestReport)}
                className="flex items-center gap-2 px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>مشاهده کارنامه رسمی ({latestReport.monthName || latestReport.termName})</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('grades')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer"
            >
              <span>ریز نمرات</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* GPA Metric */}
        <div
          onClick={() => onNavigate('grades')}
          className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل کل تحصیلی</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatScore(currentGPA)}
            </span>
            <span className="text-xs text-slate-400 font-medium">از ۲۰</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>سطح ممتاز و در مسیر رشد</span>
          </div>
        </div>

        {/* Attendance Metric */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حضور و نظم آموزشی</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {toPersianDigits(attendanceRate)}٪
            </span>
            <span className="text-xs text-slate-400 font-medium">نرخ حضور</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>حاضر: {toPersianDigits(presentCount)} روز</span>
            <span>غیبت: {toPersianDigits(absentCount)}</span>
          </div>
        </div>

        {/* Pending Homework */}
        <div
          onClick={() => onNavigate('homework')}
          className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تکالیف در انتظار تحویل</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {toPersianDigits(pendingHomeworkCount)}
            </span>
            <span className="text-xs text-slate-400 font-medium">تکلیف باز</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>مشاهده و تحویل تمرین‌ها &larr;</span>
          </div>
        </div>

        {/* Rank & Standing */}
        <div
          onClick={() => onNavigate('monthly-reports')}
          className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">رتبه در کلاس</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianDigits(currentRank)}
            </span>
            <span className="text-xs text-slate-400 font-medium">از ۳۰ دانش‌آموز</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>جزو رتبه‌های برتر کلاس</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Subject Performance Trends (Right) & Daily Actions & Notes (Left) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Right 7 Cols: Subject Performance Overview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Subject Performance Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    وضعیت درسی در یک نگاه (روند پیشرفت)
                  </h3>
                  <p className="text-[11px] text-slate-400">مقایسه نمره جاری با دوره قبلی</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('grades')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>مشاهده ریزنمرات کامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {subjectProgress.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {item.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.quality.badgeBg}`}>
                        {item.quality.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">
                        دوره قبل: <strong className="font-mono">{formatScore(item.prevScore)}</strong>
                      </span>
                      <span className="text-base font-black text-indigo-700 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                        {formatScore(item.score)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>تغییر نسبت به ماه گذشته:</span>
                      <span className={`font-bold ${item.diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {item.diff >= 0 ? `↑ +${toPersianDigits(item.diff)}` : `↓ ${toPersianDigits(item.diff)}`} نمره
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Issued Report Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    کارنامه‌های رسمی صادر شده
                  </h3>
                  <p className="text-[11px] text-slate-400">آماده برای مشاهده، چاپ استاندارد A4 و ذخیره PDF</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('monthly-reports')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                آرشیو کارنامه‌ها
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {studentReports.slice(0, 2).map((rc) => (
                <div
                  key={rc.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rc.type === 'monthly' ? `کارنامه ماه ${rc.monthName}` : rc.termName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        معدل: {formatScore(rc.gpa)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      رتبه کلاسی: {toPersianDigits(rc.rankInClass)} • تاریخ: {toPersianDigits(rc.generatedAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReportCard(rc)}
                    className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>مشاهده و چاپ سند A4</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left 5 Cols: Homeworks & Teacher Advice */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Homework Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">تکالیف در دست اقدام</h3>
              </div>

              <button
                onClick={() => onNavigate('homework')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                ارسال پاسخ
              </button>
            </div>

            <div className="space-y-2.5">
              {studentHomeworks.slice(0, 3).map((hw) => {
                const sub = subjects.find((s) => s.id === hw.subjectId);
                const isSubmitted = submissions.some(
                  (s) => s.homeworkId === hw.id && s.studentId === currentStudent.id
                );
                return (
                  <div
                    key={hw.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{hw.title}</span>
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {sub?.title}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{hw.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        مهلت: {toPersianDigits(hw.dueDate)}
                      </span>
                      <span className={isSubmitted ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                        {isSubmitted ? '✓ تحویل داده شد' : 'در انتظار تحویل'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Guidance Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">توصیه‌های دبیران</h3>
              </div>

              <button
                onClick={() => onNavigate('notes')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                مشاهده همه
              </button>
            </div>

            <div className="space-y-2.5">
              {studentNotes.length > 0 ? (
                studentNotes.slice(0, 2).map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200">{note.teacherName}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
                        {toPersianDigits(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-400">
                  توصیه یا یادداشت جدیدی ثبت نشده است.
                </div>
              )}
            </div>
          </div>

          {/* School Announcements */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">اطلاعیه‌های آموزش</h3>
              </div>

              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                مشاهده همه
              </button>
            </div>

            <div className="space-y-2">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1"
                >
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ann.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{ann.content}</p>
                  <span className="text-[10px] text-slate-400">{toPersianDigits(ann.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Card Full Document Modal */}
      {selectedReportCard && (
        <ReportCardDocument
          reportCard={selectedReportCard}
          onClose={() => setSelectedReportCard(null)}
          isModal={true}
        />
      )}
    </div>
  );
};
