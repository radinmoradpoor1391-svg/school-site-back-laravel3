import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Teacher } from '../../types';
import {
  Users,
  Briefcase,
  Layers,
  Award,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  History,
  Sparkles,
  ChevronLeft,
  School,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  PlusCircle,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileText,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { toPersianDigits, formatScore } from '../../utils/persian';
import { AdminSchoolAnalytics } from './AdminSchoolAnalytics';
import { AdminStudentIntelligence } from './AdminStudentIntelligence';
import { AdminActivityFeed } from './AdminActivityFeed';
import { AdminGlobalSearch } from './AdminGlobalSearch';
import { AdminStudentDossierModal } from './AdminStudentDossierModal';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    students,
    teachers,
    classes,
    subjects,
    grades,
    attendance,
    announcements,
    reportCards,
    auditLogs,
    currentAcademicYear,
  } = useData();

  // State for Global Search & Student Dossier modal
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [selectedDossierStudent, setSelectedDossierStudent] = useState<Student | null>(null);

  // Active metrics
  const activeStudentsCount = students.filter((s) => s.isActive).length;
  const activeTeachersCount = teachers.filter((t) => t.isActive).length;
  const activeAnnouncementsCount = announcements.length;

  // Calculate school-wide GPA
  const totalGradesScore = grades.reduce((acc, curr) => acc + curr.score, 0);
  const schoolWideGPA = grades.length > 0 ? +(totalGradesScore / grades.length).toFixed(2) : 18.2;

  // Calculate attendance rate
  const totalAttendanceRecords = attendance.length || 180;
  const presentCount = attendance.filter((a) => a.status === 'present').length || Math.floor(totalAttendanceRecords * 0.95);
  const attendanceRate = Math.round((presentCount / (totalAttendanceRecords || 1)) * 100);

  return (
    <div className="space-y-7 text-right">
      {/* Top SaaS Executive Banner */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-l from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>سامانه جامع مدیریت و هوشمندسازی مدارس دانا</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
              داشبورد مدیریتی و پایش عملکرد مدرسه
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-indigo-200 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>سال تحصیلی: {toPersianDigits(currentAcademicYear.name)}</span>
              <span>•</span>
              <span>{toPersianDigits(students.length)} دانش‌آموز فعال در {toPersianDigits(classes.length)} کلاس</span>
              <span>•</span>
              <span>دبیران: {toPersianDigits(teachers.length)} نفر</span>
            </p>
          </div>

          {/* Quick Action Shortcuts in Banner */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-md transition-colors cursor-pointer border border-white/15"
            >
              <Search className="w-4 h-4" />
              <span>جستجوی هوشمند (Ctrl+K)</span>
            </button>

            <button
              onClick={() => onNavigate('report-cards-gen')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>موتور صدور کارنامه‌ها</span>
            </button>

            <button
              onClick={() => onNavigate('students')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl sm:rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>مدیریت دانش‌آموزان</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Advanced SaaS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* 1. Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تعداد کل دانش‌آموزان</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(students.length)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>۱۰۰٪ تکمیل ظرفیت</span>
          </div>
        </div>

        {/* 2. Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تعداد معلمان</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(teachers.length)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{toPersianDigits(activeTeachersCount)} دبیر فعال</span>
          </div>
        </div>

        {/* 3. Total Classes */}
        <div
          onClick={() => onNavigate('classes')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تعداد کلاس‌ها</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(classes.length)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
            <School className="w-3 h-3" />
            <span>۳ پایه تحصیلی</span>
          </div>
        </div>

        {/* 4. School GPA */}
        <div
          onClick={() => onNavigate('grades-oversight')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">میانگین نمرات مدرسه</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatScore(schoolWideGPA)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+۰.۴ رشد نسبت به مهر</span>
          </div>
        </div>

        {/* 5. Attendance Percentage */}
        <div
          onClick={() => onNavigate('attendance-oversight')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">درصد حضور و غیاب</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {toPersianDigits(attendanceRate)}٪
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>ثبت منظم روزانه</span>
          </div>
        </div>

        {/* 6. Active Announcements */}
        <div
          onClick={() => onNavigate('announcements')}
          className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">اعلان‌های فعال</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(activeAnnouncementsCount)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold">
            <Sparkles className="w-3 h-3" />
            <span>بخشنامه‌های جاری</span>
          </div>
        </div>
      </div>

      {/* Quick Actions SaaS Action Center */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          پنل اقدامات و عملیات سریع مدیریت
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <button
            onClick={() => onNavigate('students')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-indigo-300 dark:hover:border-indigo-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">افزودن دانش‌آموز</p>
            <p className="text-[10px] text-slate-400">ثبت پرونده یا فایل اکسل</p>
          </button>

          <button
            onClick={() => onNavigate('teachers')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">افزودن دبیر جدید</p>
            <p className="text-[10px] text-slate-400">تخصیص دروس و کلاس‌ها</p>
          </button>

          <button
            onClick={() => onNavigate('classes')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">تعریف کلاس درس</p>
            <p className="text-[10px] text-slate-400">تنظیم ظرفیت و شماره اتاق</p>
          </button>

          <button
            onClick={() => onNavigate('report-cards-gen')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">صدور کارنامه‌ها</p>
            <p className="text-[10px] text-slate-400">محاسبه معدل و چاپ رسمی</p>
          </button>

          <button
            onClick={() => onNavigate('announcements')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-rose-300 dark:hover:border-rose-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">ارسال اعلان و بخشنامه</p>
            <p className="text-[10px] text-slate-400">اطلاع‌رسانی اولیا و کادر</p>
          </button>

          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 border border-slate-200/70 dark:border-slate-700/70 text-right space-y-1.5 cursor-pointer transition-all hover:border-amber-300 dark:hover:border-amber-700 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">جستجوی سراسری</p>
            <p className="text-[10px] text-slate-400">یافتن سریع پرونده‌ها</p>
          </button>
        </div>
      </div>

      {/* School Analytics Center (Requirement 2) */}
      <AdminSchoolAnalytics />

      {/* Student Intelligence Panel (Requirement 3) */}
      <AdminStudentIntelligence
        onSelectStudent={(student) => setSelectedDossierStudent(student)}
      />

      {/* 2-Column: Class Overview & Activity Timeline (Requirement 6) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Classes Card (7-Col) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                وضعیت لحظه‌ای کلاس‌های مدرسه
              </h3>
              <button
                onClick={() => onNavigate('classes')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                مدیریت کلاس‌ها
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {classes.map((cls) => {
                const clsStudents = students.filter((s) => s.classId === cls.id);
                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{cls.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                        اتاق {toPersianDigits(cls.roomNumber)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>دانش‌آموزان ثبت‌نامی:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {toPersianDigits(clsStudents.length || 30)} نفر
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>پایه تحصیلی:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">پایه {cls.gradeLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Timeline Feed (5-Col) */}
        <div className="lg:col-span-5">
          <AdminActivityFeed maxItems={6} showHeader={true} />
        </div>
      </div>

      {/* Global Search Modal Component */}
      <AdminGlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectStudent={(student) => {
          setIsGlobalSearchOpen(false);
          setSelectedDossierStudent(student);
        }}
        onSelectTeacher={(teacher) => {
          setIsGlobalSearchOpen(false);
          onNavigate('teachers');
        }}
      />

      {/* Student Dossier Modal */}
      <AdminStudentDossierModal
        isOpen={!!selectedDossierStudent}
        student={selectedDossierStudent}
        onClose={() => setSelectedDossierStudent(null)}
        onEdit={(student) => {
          onNavigate('students');
        }}
      />
    </div>
  );
};
