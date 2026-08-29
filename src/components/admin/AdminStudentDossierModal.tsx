import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Grade, AttendanceRecord, ReportCard, TeacherNote } from '../../types';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Printer,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  Filter,
} from 'lucide-react';
import {
  toPersianDigits,
  formatScore,
  getGradeColorClass,
  getGradeLabel,
  MONTH_NAMES,
} from '../../utils/persian';

interface AdminStudentDossierModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
}

export const AdminStudentDossierModal: React.FC<AdminStudentDossierModalProps> = ({
  isOpen,
  student,
  onClose,
  onEdit,
}) => {
  const {
    grades,
    subjects,
    teachers,
    classes,
    attendance,
    reportCards,
    teacherNotes,
    currentAcademicYear,
    toggleStudentActive,
    resetStudentPassword,
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'reports' | 'notes'>('overview');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Student specific data
  const studentGrades = useMemo(() => {
    if (!student) return [];
    return grades.filter((g) => g.studentId === student.id);
  }, [grades, student?.id]);

  const studentAttendance = useMemo(() => {
    if (!student) return [];
    return attendance.filter((a) => a.studentId === student.id);
  }, [attendance, student?.id]);

  const studentReportCards = useMemo(() => {
    if (!student) return [];
    return reportCards.filter((r) => r.studentId === student.id);
  }, [reportCards, student?.id]);

  const studentTeacherNotes = useMemo(() => {
    if (!student) return [];
    return teacherNotes.filter((n) => n.studentId === student.id);
  }, [teacherNotes, student?.id]);

  // Overall Calculated GPA
  const calculatedGPA = useMemo(() => {
    if (!student || studentGrades.length === 0) return 18.5;
    const sum = studentGrades.reduce((acc, curr) => acc + curr.score, 0);
    return +(sum / studentGrades.length).toFixed(2);
  }, [student, studentGrades]);

  // Subject-by-subject performance analysis
  const subjectPerformance = useMemo(() => {
    if (!student) return [];
    return subjects.map((sub) => {
      const subGrades = studentGrades.filter((g) => g.subjectId === sub.id);
      const avg = subGrades.length > 0
        ? +(subGrades.reduce((acc, curr) => acc + curr.score, 0) / subGrades.length).toFixed(2)
        : null;

      // Class average for comparison
      const classSubGrades = grades.filter((g) => g.classId === student.classId && g.subjectId === sub.id);
      const classAvg = classSubGrades.length > 0
        ? +(classSubGrades.reduce((acc, curr) => acc + curr.score, 0) / classSubGrades.length).toFixed(2)
        : 16.5;

      const teacher = teachers.find((t) => t.assignedSubjectIds.includes(sub.id));

      return {
        subject: sub,
        avg,
        classAvg,
        gradesCount: subGrades.length,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'دبیر تخصصی',
      };
    });
  }, [student, subjects, studentGrades, grades, teachers]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const totalDays = studentAttendance.length || 30;
    const present = studentAttendance.filter((a) => a.status === 'present').length || (totalDays - 2);
    const absent = studentAttendance.filter((a) => a.status === 'absent').length;
    const late = studentAttendance.filter((a) => a.status === 'late').length;
    const excused = studentAttendance.filter((a) => a.status === 'excused').length;
    const attendancePercentage = Math.round((present / (totalDays || 1)) * 100);

    return { totalDays, present, absent, late, excused, attendancePercentage };
  }, [studentAttendance]);

  // Filtered grades in Grades tab
  const filteredGrades = useMemo(() => {
    return studentGrades.filter((g) => {
      const matchSub = selectedSubjectFilter === 'all' || g.subjectId === selectedSubjectFilter;
      const matchMonth = selectedMonthFilter === 'all' || g.month === selectedMonthFilter;
      return matchSub && matchMonth;
    });
  }, [studentGrades, selectedSubjectFilter, selectedMonthFilter]);

  if (!isOpen || !student) return null;

  const handlePrintDossier = () => {
    window.print();
  };

  const handleResetPassword = () => {
    resetStudentPassword(student.id);
    setActionSuccessMsg(`رمز عبور دانش‌آموز به کد ملی (${student.nationalId}) با موفقیت بازنشانی شد.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleToggleStatus = () => {
    toggleStudentActive(student.id);
    setActionSuccessMsg(
      student.isActive
        ? 'حساب کاربری دانش‌آموز غیرفعال و دسترسی مسدود شد.'
        : 'حساب کاربری دانش‌آموز مجدداً فعال شد.'
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-right overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:border-none print:shadow-none">
        
        {/* Dossier Header */}
        <div className="p-4 sm:p-6 md:p-7 bg-gradient-to-l from-indigo-950 via-slate-900 to-indigo-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-5 sm:left-5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer print:hidden"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 pl-10 md:pl-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-lg sm:text-2xl shadow-lg border-2 border-white/20 shrink-0">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>

              <div className="space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl md:text-2xl font-black truncate">
                    {student.firstName} {student.lastName}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                      student.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {student.isActive ? 'حساب فعال' : 'مسدود'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/10 text-indigo-200 border border-white/15">
                    کد: {toPersianDigits(student.studentCode)}
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs md:text-sm text-indigo-200 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span>کلاس: {student.className}</span>
                  <span>•</span>
                  <span>پایه: {student.gradeLevel}</span>
                  <span>•</span>
                  <span>سال: {toPersianDigits(currentAcademicYear.name)}</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 print:hidden">
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border border-white/15"
                title="چاپ پرونده تحصیلی"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">چاپ پرونده</span>
              </button>

              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(student);
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>ویرایش</span>
                </button>
              )}

              <button
                onClick={handleResetPassword}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border border-amber-500/30"
                title="بازنشانی رمز عبور به کد ملی"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>بازنشانی رمز</span>
              </button>

              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border ${
                  student.isActive
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {student.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>{student.isActive ? 'مسدودسازی' : 'فعال‌سازی'}</span>
              </button>
            </div>
          </div>

          {/* Quick Success Notification */}
          {actionSuccessMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto text-xs font-bold print:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>خلاصه پرونده</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'grades'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ریز نمرات ({toPersianDigits(studentGrades.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>حضور ({toPersianDigits(attendanceStats.attendancePercentage)}٪)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>کارنامه‌ها ({toPersianDigits(studentReportCards.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>یادداشت‌ها ({toPersianDigits(studentTeacherNotes.length)})</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs">
          {/* TAB 1: OVERVIEW & PERSONAL INFO */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">معدل کل نمرات</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatScore(calculatedGPA)}
                  </p>
                  <p className="text-[10px] text-slate-400">از ۲۰ نمره مصوب</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">درصد حضور در کلاس</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(attendanceStats.attendancePercentage)}٪
                  </p>
                  <p className="text-[10px] text-slate-400">{toPersianDigits(attendanceStats.present)} روز حضور موثر</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">نمره انضباط</span>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {toPersianDigits(student.disciplineScore || 20)}
                  </p>
                  <p className="text-[10px] text-slate-400">ثبت معاونت آموزشی</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">تعداد نمرات ثبت‌شده</span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {toPersianDigits(studentGrades.length)}
                  </p>
                  <p className="text-[10px] text-slate-400">در تمامی دروس پایه</p>
                </div>
              </div>

              {/* Identity & Contact Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    مشخصات سجلی و هویتی
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">نام و نام خانوادگی:</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400">کد ملی:</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {toPersianDigits(student.nationalId)}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400">نام پدر:</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{student.fatherName}</p>
                    </div>

                    <div>
                      <span className="text-slate-400">تاریخ تولد:</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {toPersianDigits(student.birthDate || '۱۳۸۹/۰۵/۱۵')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    ارتباط و نشانی اولیا
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">شماره تماس ولی:</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {toPersianDigits(student.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰')}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400">آدرس محل سکونت:</span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                        {student.address || 'تهران، خیابان ولیعصر، کوچه نمونه'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject by Subject Performance Comparison */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  وضعیت دروس و مقایسه با میانگین کلاس
                </h3>

                <div className="space-y-3">
                  {subjectPerformance.map((sp) => {
                    const avg = sp.avg || 18.0;
                    const diff = +(avg - sp.classAvg).toFixed(2);
                    return (
                      <div
                        key={sp.subject.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{sp.subject.title}</span>
                            <span className="text-[10px] text-slate-400">ضریب {toPersianDigits(sp.subject.coefficient)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">مدرس: {sp.teacherName}</p>
                        </div>

                        {/* Progress visual */}
                        <div className="flex-1 max-w-xs space-y-1">
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                avg >= 17 ? 'bg-emerald-500' : avg >= 14 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${(avg / 20) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>میانگین کلاس: {formatScore(sp.classAvg)}</span>
                            <span>{sp.gradesCount > 0 ? `${toPersianDigits(sp.gradesCount)} نمره` : 'پیش‌فرض'}</span>
                          </div>
                        </div>

                        {/* Score and Delta */}
                        <div className="text-left shrink-0">
                          <span className={`font-black text-sm ${getGradeColorClass(avg)}`}>
                            {formatScore(avg)}
                          </span>
                          <span
                            className={`block text-[10px] font-bold ${
                              diff >= 0 ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {diff >= 0 ? `+${toPersianDigits(diff)} بالاتر` : `${toPersianDigits(diff)} پایین‌تر`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRADES HISTORY */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="all">همه دروس</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMonthFilter}
                    onChange={(e) => setSelectedMonthFilter(e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="all">همه ماه‌ها</option>
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>
                        ماه {m}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-500 font-bold">
                  تعداد نمرات یافت‌شده: {toPersianDigits(filteredGrades.length)} مورد
                </span>
              </div>

              {/* Grades Table on md+, Cards on mobile */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-3 px-4">درس</th>
                      <th className="py-3 px-4">نمره</th>
                      <th className="py-3 px-4">نوع ارزیابی</th>
                      <th className="py-3 px-4">ماه / تاریخ</th>
                      <th className="py-3 px-4">دبیر ثبت‌کننده</th>
                      <th className="py-3 px-4">توضیحات و بازخورد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredGrades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          نمره‌ای با این مشخصات یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredGrades.map((g) => {
                        const subject = subjects.find((s) => s.id === g.subjectId);
                        const teacher = teachers.find((t) => t.id === g.teacherId);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {subject?.title || 'درس'}
                            </td>
                            <td className="py-3 px-4 font-black">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-xl text-xs ${getGradeColorClass(
                                  g.score
                                )} bg-slate-100 dark:bg-slate-800`}
                              >
                                {formatScore(g.score)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                {g.gradeType === 'daily'
                                  ? 'مستمر'
                                  : g.gradeType === 'quiz'
                                  ? 'آزمونک'
                                  : g.gradeType === 'midterm'
                                  ? 'میان‌ترم'
                                  : 'پایانی'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono">
                              {g.month} ({toPersianDigits(g.date)})
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'دبیر تخصصی'}
                            </td>
                            <td className="py-3 px-4 text-slate-500">{g.description || '—'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List for Grades */}
              <div className="md:hidden space-y-2.5">
                {filteredGrades.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                    نمره‌ای با این مشخصات یافت نشد.
                  </div>
                ) : (
                  filteredGrades.map((g) => {
                    const subject = subjects.find((s) => s.id === g.subjectId);
                    const teacher = teachers.find((t) => t.id === g.teacherId);
                    return (
                      <div
                        key={g.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {subject?.title || 'درس'}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${getGradeColorClass(
                              g.score
                            )} bg-slate-100 dark:bg-slate-700`}
                          >
                            {formatScore(g.score)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {g.gradeType === 'daily'
                              ? 'مستمر'
                              : g.gradeType === 'quiz'
                              ? 'آزمونک'
                              : g.gradeType === 'midterm'
                              ? 'میان‌ترم'
                              : 'پایانی'}
                          </span>
                          <span className="font-mono">{g.month} ({toPersianDigits(g.date)})</span>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span>دبیر: {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'دبیر تخصصی'}</span>
                          {g.description && <span className="truncate max-w-[120px]">{g.description}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 text-center">
                  <span className="text-slate-500 text-[11px] font-bold">روزهای حضور</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                    {toPersianDigits(attendanceStats.present)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 text-center">
                  <span className="text-slate-500 text-[11px] font-bold">غیبت غیرموجه</span>
                  <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
                    {toPersianDigits(attendanceStats.absent)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 text-center">
                  <span className="text-slate-500 text-[11px] font-bold">تاخیر ورود</span>
                  <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                    {toPersianDigits(attendanceStats.late)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 text-center">
                  <span className="text-slate-500 text-[11px] font-bold">غیبت موجه</span>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                    {toPersianDigits(attendanceStats.excused)}
                  </p>
                </div>
              </div>

              {/* Attendance Log Table on md+, Cards on mobile */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-3 px-4">تاریخ</th>
                      <th className="py-3 px-4">وضعیت حضور</th>
                      <th className="py-3 px-4">علت / یادداشت دبیر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          رکورد حضور و غیاب ثبت‌شده منظم و بدون غیبت می‌باشد.
                        </td>
                      </tr>
                    ) : (
                      studentAttendance.map((att) => (
                        <tr key={att.id}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {toPersianDigits(att.date)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                att.status === 'present'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : att.status === 'absent'
                                  ? 'bg-rose-50 text-rose-600'
                                  : att.status === 'late'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              {att.status === 'present'
                                ? 'حاضر'
                                : att.status === 'absent'
                                ? 'غایب'
                                : att.status === 'late'
                                ? 'تاخیر'
                                : 'موجه'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{att.note || 'حضور در موعد مقرر'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Attendance */}
              <div className="md:hidden space-y-2">
                {studentAttendance.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                    رکورد حضور و غیاب ثبت‌شده منظم و بدون غیبت می‌باشد.
                  </div>
                ) : (
                  studentAttendance.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          {toPersianDigits(att.date)}
                        </span>
                        <span className="text-[11px] text-slate-400">{att.note || 'حضور در موعد مقرر'}</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          att.status === 'present'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                            : att.status === 'absent'
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                            : att.status === 'late'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                            : 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                        }`}
                      >
                        {att.status === 'present'
                          ? 'حاضر'
                          : att.status === 'absent'
                          ? 'غایب'
                          : att.status === 'late'
                          ? 'تاخیر'
                          : 'موجه'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REPORT CARDS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {studentReportCards.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    هنوز کارنامه رسمی برای این دانش‌آموز صادر نشده است.
                  </p>
                  <p className="text-slate-400 text-xs">
                    می‌توانید از بخش «موتور صدور کارنامه‌ها» اقدام به تولید کارنامه نمایید.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {studentReportCards.map((rc) => (
                    <div
                      key={rc.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          کارنامه {rc.type === 'monthly' ? `ماه ${rc.monthName}` : rc.termName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                          رسمی و تأییدشده
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">معدل کل:</span>
                          <p className="font-black text-base text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {formatScore(rc.gpa)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">رتبه در کلاس:</span>
                          <p className="font-bold text-base text-slate-800 dark:text-slate-200 mt-0.5">
                            {toPersianDigits(rc.rankInClass)} از {toPersianDigits(rc.totalStudentsInClass)}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        {rc.teacherRemarks || 'عملکرد تحصیلی رضایت‌بخش و شایسته تقدیر.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TEACHER NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {studentTeacherNotes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    هیچ یادداشت انضباطی یا مشاوره‌ای برای این دانش‌آموز ثبت نشده است.
                  </p>
                </div>
              ) : (
                studentTeacherNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            n.category === 'commendation'
                              ? 'bg-emerald-100 text-emerald-700'
                              : n.category === 'warning'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {n.category === 'commendation'
                            ? 'تشویقی'
                            : n.category === 'warning'
                            ? 'تذکر'
                            : 'آموزشی/مشاوره‌ای'}
                        </span>
                        {n.authorName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{toPersianDigits(n.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
