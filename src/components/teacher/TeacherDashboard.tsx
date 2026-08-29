import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Award,
  CalendarCheck,
  BookOpen,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ChevronLeft,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentTeacher } = useAuth();
  const { classes, subjects, students, grades, homeworks, submissions, announcements } = useData();

  if (!currentTeacher) return null;

  // Filter classes and subjects assigned to this teacher
  const assignedClasses = classes.filter((c) =>
    currentTeacher.assignedClassIds.includes(c.id)
  );

  const assignedSubjects = subjects.filter((s) =>
    currentTeacher.assignedSubjectIds.includes(s.id)
  );

  // Total students taught
  const totalStudentsCount = assignedClasses.reduce((acc, c) => acc + (c.studentIds?.length || 30), 0);

  // Teacher grades recorded
  const teacherGradesCount = grades.filter((g) =>
    assignedSubjects.some((s) => s.id === g.subjectId)
  ).length;

  // Homeworks created by this teacher
  const teacherHomeworks = homeworks.filter((h) => h.teacherId === currentTeacher.id);

  // Submissions waiting for grading
  const pendingSubmissions = submissions.filter((s) => {
    const hw = teacherHomeworks.find((h) => h.id === s.homeworkId);
    return hw && s.status === 'submitted';
  });

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-l from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>میز کار اختصاصی دبیران و کادر آموزشی</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              استاد گرامی، {currentTeacher.firstName} {currentTeacher.lastName}
            </h1>
            <p className="text-xs md:text-sm text-indigo-200">
              دبیر تخصصی: {currentTeacher.specialty} | {currentTeacher.degree}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('grading')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>ثبت نمرات کلاسی</span>
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>ثبت حضور و غیاب امروز</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">کلاس‌های تدریس</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(assignedClasses.length)} <span className="text-xs font-normal text-slate-400">کلاس</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {toPersianDigits(totalStudentsCount)} دانش‌آموز تحت آموزش
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نمرات ثبت‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {toPersianDigits(teacherGradesCount)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            ارزیابی‌های مستمر جاری
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تکالیف ارسالی دانش‌آموزان</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {toPersianDigits(pendingSubmissions.length)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            در انتظار تصحیح و نمره‌دهی
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تکالیف فعال</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {toPersianDigits(teacherHomeworks.length)}
          </p>
          <button
            onClick={() => onNavigate('homework')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            تعریف تکلیف جدید &larr;
          </button>
        </div>
      </div>

      {/* Assigned Classes Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            کلاس‌ها و گروه‌های درسی محوله
          </h3>
          <span className="text-xs text-slate-400">{toPersianDigits(assignedClasses.length)} کلاس فعال</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClasses.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  پایه {cls.gradeLevel}
                </span>
                <span className="text-xs text-slate-400 font-mono">اتاق {toPersianDigits(cls.roomNumber)}</span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">{cls.name}</h4>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                تعداد دانش‌آموزان: <span className="font-bold text-slate-800 dark:text-slate-200">{toPersianDigits(30)} نفر</span>
              </p>

              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => onNavigate('grading')}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  دفتر نمرات
                </button>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  حضور و غیاب
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
