import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  KeyRound,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Award,
  Layers,
} from 'lucide-react';
import {
  toPersianDigits,
  validateIranianNationalId,
  toEnglishDigits,
  formatScore,
  getGradeColorClass,
  SAMPLE_STUDENT_CSV,
} from '../../utils/persian';
import { Student, CSVImportPreviewRow } from '../../types';
import { AdminStudentDossierModal } from './AdminStudentDossierModal';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminStudentManagement: React.FC = () => {
  const {
    students,
    classes,
    grades,
    attendance,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentActive,
    resetStudentPassword,
    bulkImportStudents,
  } = useData();

  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPerformanceTier, setSelectedPerformanceTier] = useState<'all' | 'top' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'nationalId' | 'code' | 'gpa' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Dialogs state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dossierStudent, setDossierStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Single Student Form state
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formParentPhone, setFormParentPhone] = useState('۰۹۱۲۰۰۰۰۰۰۰');
  const [formDiscipline, setFormDiscipline] = useState('20');
  const [formAddress, setFormAddress] = useState('تهران، خیابان ولیعصر');
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import State
  const [csvRawText, setCsvRawText] = useState(SAMPLE_STUDENT_CSV);
  const [importPreview, setImportPreview] = useState<CSVImportPreviewRow[]>([]);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  // Calculate student GPA & Attendance map for fast lookups
  const studentMetricsMap = useMemo(() => {
    const map = new Map<string, { gpa: number; attendanceRate: number }>();
    
    students.forEach((s) => {
      const stdGrades = grades.filter((g) => g.studentId === s.id);
      const gpa = stdGrades.length > 0
        ? +(stdGrades.reduce((a, b) => a + b.score, 0) / stdGrades.length).toFixed(2)
        : 18.2;

      const stdAtt = attendance.filter((a) => a.studentId === s.id);
      const totalDays = stdAtt.length || 30;
      const present = stdAtt.filter((a) => a.status === 'present').length || (totalDays - 1);
      const attendanceRate = Math.round((present / (totalDays || 1)) * 100);

      map.set(s.id, { gpa, attendanceRate });
    });

    return map;
  }, [students, grades, attendance]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const q = (searchQuery || '').trim().toLowerCase();
        const engDigits = toEnglishDigits(q);
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const nationalId = s.nationalId ? toEnglishDigits(s.nationalId) : '';
        const code = s.studentCode ? toEnglishDigits(s.studentCode).toLowerCase() : '';

        const matchesSearch =
          !q ||
          fullName.includes(q) ||
          nationalId.includes(engDigits) ||
          code.includes(engDigits) ||
          (s.className || '').toLowerCase().includes(q);

        const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
        const matchesGrade = selectedGradeFilter === 'all' || s.gradeLevel === selectedGradeFilter;
        const matchesStatus =
          selectedStatusFilter === 'all' ||
          (selectedStatusFilter === 'active' && s.isActive) ||
          (selectedStatusFilter === 'inactive' && !s.isActive);

        const metrics = studentMetricsMap.get(s.id) || { gpa: 18.0, attendanceRate: 95 };
        let matchesTier = true;
        if (selectedPerformanceTier === 'top') matchesTier = metrics.gpa >= 18;
        if (selectedPerformanceTier === 'medium') matchesTier = metrics.gpa >= 14 && metrics.gpa < 18;
        if (selectedPerformanceTier === 'low') matchesTier = metrics.gpa < 14;

        return matchesSearch && matchesClass && matchesGrade && matchesStatus && matchesTier;
      })
      .sort((a, b) => {
        const metricsA = studentMetricsMap.get(a.id) || { gpa: 18.0, attendanceRate: 95 };
        const metricsB = studentMetricsMap.get(b.id) || { gpa: 18.0, attendanceRate: 95 };

        let compare = 0;
        if (sortBy === 'name') {
          compare = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fa');
        } else if (sortBy === 'nationalId') {
          compare = (a.nationalId || '').localeCompare(b.nationalId || '');
        } else if (sortBy === 'code') {
          compare = (a.studentCode || '').localeCompare(b.studentCode || '');
        } else if (sortBy === 'gpa') {
          compare = metricsA.gpa - metricsB.gpa;
        } else if (sortBy === 'attendance') {
          compare = metricsA.attendanceRate - metricsB.attendanceRate;
        }

        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [
    students,
    searchQuery,
    selectedClassFilter,
    selectedGradeFilter,
    selectedStatusFilter,
    selectedPerformanceTier,
    sortBy,
    sortOrder,
    studentMetricsMap,
  ]);

  // Paginated records
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormFirstName('');
    setFormLastName('');
    setFormNationalId('');
    setFormFatherName('');
    setFormClassId(classes[0]?.id || '');
    setFormParentPhone('۰۹۱۲۰۰۰۰۰۰۰');
    setFormDiscipline('20');
    setFormAddress('تهران، خیابان ولیعصر');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (std: Student) => {
    setEditingStudent(std);
    setFormFirstName(std.firstName);
    setFormLastName(std.lastName);
    setFormNationalId(std.nationalId);
    setFormFatherName(std.fatherName);
    setFormClassId(std.classId);
    setFormParentPhone(std.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰');
    setFormDiscipline(std.disciplineScore ? std.disciplineScore.toString() : '20');
    setFormAddress(std.address || 'تهران، خیابان ولیعصر');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNationalId = toEnglishDigits(formNationalId).trim();
    if (!cleanNationalId || cleanNationalId.length !== 10) {
      setFormError('کد ملی باید دقیقاً ۱۰ رقم باشد.');
      return;
    }
    if (!validateIranianNationalId(cleanNationalId)) {
      setFormError('کد ملی وارد شده طبق الگوریتم ثبت احوال معتبر نمی‌باشد.');
      return;
    }

    const targetClass = classes.find((c) => c.id === formClassId) || classes[0];

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        nationalId: cleanNationalId,
        fatherName: formFatherName.trim(),
        classId: targetClass.id,
        className: targetClass.name,
        gradeLevel: targetClass.gradeLevel,
        parentPhone: formParentPhone.trim(),
        disciplineScore: parseFloat(formDiscipline) || 20,
        address: formAddress.trim(),
      });
      setActionSuccessMsg(`اطلاعات دانش‌آموز ${formFirstName} ${formLastName} با موفقیت به‌روزرسانی شد.`);
    } else {
      addStudent({
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        nationalId: cleanNationalId,
        fatherName: formFatherName.trim(),
        classId: targetClass.id,
        className: targetClass.name,
        gradeLevel: targetClass.gradeLevel,
        fieldOfStudy: targetClass.fieldOfStudy || 'دوره اول متوسطه',
        parentPhone: formParentPhone.trim(),
        disciplineScore: parseFloat(formDiscipline) || 20,
        address: formAddress.trim(),
      });
      setActionSuccessMsg(`دانش‌آموز جدید ${formFirstName} ${formLastName} با موفقیت ثبت نام شد.`);
    }

    setShowAddModal(false);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setActionSuccessMsg(`پرونده دانش‌آموز ${studentToDelete.firstName} ${studentToDelete.lastName} از سیستم حذف شد.`);
      setStudentToDelete(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleResetPassword = (std: Student) => {
    resetStudentPassword(std.id);
    setActionSuccessMsg(`رمز عبور دانش‌آموز ${std.firstName} ${std.lastName} به کد ملی بازنشانی شد.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleToggleStatus = (std: Student) => {
    toggleStudentActive(std.id);
    setActionSuccessMsg(
      std.isActive
        ? `حساب کاربری ${std.firstName} ${std.lastName} غیرفعال شد.`
        : `حساب کاربری ${std.firstName} ${std.lastName} مجدداً فعال شد.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['نام', 'نام خانوادگی', 'کد ملی', 'کد دانش‌آموزی', 'نام پدر', 'کلاس', 'پایه', 'معدل', 'شماره ولی'];
    const rows = filteredStudents.map((s) => {
      const metrics = studentMetricsMap.get(s.id);
      return [
        s.firstName,
        s.lastName,
        s.nationalId,
        s.studentCode,
        s.fatherName,
        s.className,
        s.gradeLevel,
        metrics?.gpa || '18.0',
        s.parentPhone || '',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Parse
  const parseCSVData = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setImportPreview([]);
      return;
    }

    const rows: CSVImportPreviewRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((p) => p.trim());
      const [firstName, lastName, nationalId, fatherName, className, parentPhone] = parts;

      const cleanId = toEnglishDigits(nationalId || '');
      let isValid = true;
      let error = '';

      if (!firstName || !lastName) {
        isValid = false;
        error = 'نام یا نام خانوادگی خالی است';
      } else if (!cleanId || cleanId.length !== 10) {
        isValid = false;
        error = 'کد ملی نامعتبر (۱۰ رقمی نیست)';
      } else if (!validateIranianNationalId(cleanId)) {
        isValid = false;
        error = 'کد ملی نامعتبر (الگوریتم ثبت احوال)';
      }

      rows.push({
        rowNumber: i,
        firstName: firstName || '',
        lastName: lastName || '',
        nationalId: cleanId || '',
        fatherName: fatherName || 'نامشخص',
        className: className || classes[0]?.name || 'کلاس هفتم الف',
        parentPhone: parentPhone || '۰۹۱۲۰۰۰۰۰۰۰',
        isValid,
        error: isValid ? undefined : error,
      });
    }

    setImportPreview(rows);
  };

  const handleExecuteImport = () => {
    const res = bulkImportStudents(importPreview);
    setImportResult(res);
    setActionSuccessMsg(`ورود گروهی انجام شد: ${toPersianDigits(res.successCount)} دانش‌آموز اضافه شدند.`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportResult(null);
      setActionSuccessMsg(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            سامانه مدیریت جامع دانش‌آموزان و پرونده‌های تحصیلی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده، ثبت نام انفرادی و گروهی، بررسی کارنامه‌ها و سوابق رفتاری و تحصیلی
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل/CSV</span>
          </button>

          <button
            onClick={() => {
              setImportResult(null);
              parseCSVData(csvRawText);
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
          >
            <Upload className="w-4 h-4" />
            <span>ورود گروهی CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن دانش‌آموز جدید</span>
          </button>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، کدملی، کلاس یا کد دانش‌آموزی..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
          >
            <option value="all">تمامی کلاس‌ها</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (اتاق {toPersianDigits(cls.roomNumber)})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
          >
            <option value="all">وضعیت حساب: همه</option>
            <option value="active">فقط فعال</option>
            <option value="inactive">مسدود / غیرفعال</option>
          </select>

          {/* Performance Tier Filter */}
          <select
            value={selectedPerformanceTier}
            onChange={(e) => setSelectedPerformanceTier(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
          >
            <option value="all">سطح تحصیلی: همه</option>
            <option value="top">ممتاز (معدل ۱۸ به بالا)</option>
            <option value="medium">مطلوب (معدل ۱۴ تا ۱۸)</option>
            <option value="low">نیازمند تلاش (زیر ۱۴)</option>
          </select>
        </div>

        {/* Quick Sorting & Stats Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              مرتب‌سازی بر اساس:
            </span>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('name'); setSortOrder('asc'); }
              }}
              className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                sortBy === 'name' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              نام و نام خانوادگی {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'gpa') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('gpa'); setSortOrder('desc'); }
              }}
              className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                sortBy === 'gpa' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              معدل کل {sortBy === 'gpa' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'attendance') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('attendance'); setSortOrder('desc'); }
              }}
              className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                sortBy === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              درصد حضور {sortBy === 'attendance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <div className="text-slate-500 font-bold">
            نمایش {toPersianDigits(filteredStudents.length)} دانش‌آموز از مجموع {toPersianDigits(students.length)} نفر
          </div>
        </div>
      </div>

      {/* Advanced Students Table: Mobile Cards (< md) & Desktop Table (md+) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            دانش‌آموزی مطابق با فیلترهای انتخابی یافت نشد.
          </div>
        ) : (
          <>
            {/* Mobile View: High Quality Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedStudents.map((std) => {
                const metrics = studentMetricsMap.get(std.id) || { gpa: 18.0, attendanceRate: 95 };
                return (
                  <div key={std.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-xs shrink-0">
                          {std.firstName[0]}
                          {std.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => setDossierStudent(std)}
                            className="font-bold text-slate-900 dark:text-white text-xs hover:text-indigo-600 cursor-pointer truncate"
                          >
                            {std.firstName} {std.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            نام پدر: {std.fatherName} • {std.className}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          std.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                        }`}
                      >
                        {std.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-0.5">معدل کل:</span>
                        <span className={`font-black font-mono text-xs ${getGradeColorClass(metrics.gpa)}`}>
                          {formatScore(metrics.gpa)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-0.5">درصد حضور:</span>
                        <span className="font-bold font-mono text-xs text-slate-800 dark:text-slate-200">
                          {toPersianDigits(metrics.attendanceRate)}٪
                        </span>
                      </div>
                    </div>

                    {/* Identity Codes */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                      <span>کد ملی: {toPersianDigits(std.nationalId)}</span>
                      <span>کد دانش‌آموزی: {toPersianDigits(std.studentCode)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setDossierStudent(std)}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>پرونده</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(std)}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>

                      <button
                        onClick={() => handleResetPassword(std)}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 cursor-pointer"
                        title="بازنشانی رمز عبور"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(std)}
                        className={`p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl cursor-pointer ${
                          std.isActive
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        }`}
                        title={std.isActive ? 'تعلیق' : 'فعال‌سازی'}
                      >
                        {std.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setStudentToDelete(std)}
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 cursor-pointer"
                        title="حذف پرونده"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">مشخصات دانش‌آموز</th>
                    <th className="py-3.5 px-4">کلاس و پایه</th>
                    <th className="py-3.5 px-4">کد ملی / کد دانش‌آموزی</th>
                    <th className="py-3.5 px-4 text-center">معدل تحصیلی</th>
                    <th className="py-3.5 px-4 text-center">شاخص حضور</th>
                    <th className="py-3.5 px-4 text-center">وضعیت حساب</th>
                    <th className="py-3.5 px-4 text-center">عملیات مدیریتی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedStudents.map((std) => {
                    const metrics = studentMetricsMap.get(std.id) || { gpa: 18.0, attendanceRate: 95 };
                    return (
                      <tr
                        key={std.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-xs shrink-0">
                              {std.firstName[0]}
                              {std.lastName[0]}
                            </div>
                            <div>
                              <p
                                onClick={() => setDossierStudent(std)}
                                className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer text-xs"
                              >
                                {std.firstName} {std.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400">نام پدر: {std.fatherName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {std.className}
                          </span>
                          <span className="text-[10px] text-slate-400">پایه {std.gradeLevel}</span>
                        </td>

                        {/* National Code */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {toPersianDigits(std.nationalId)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            کد: {toPersianDigits(std.studentCode)}
                          </span>
                        </td>

                        {/* GPA */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl font-black text-xs ${getGradeColorClass(
                              metrics.gpa
                            )} bg-slate-100 dark:bg-slate-800`}
                          >
                            {formatScore(metrics.gpa)}
                          </span>
                        </td>

                        {/* Attendance */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {toPersianDigits(metrics.attendanceRate)}٪
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  metrics.attendanceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${metrics.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              std.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                            }`}
                          >
                            {std.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDossierStudent(std)}
                              className="p-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="مشاهده پرونده کامل دیجیتال"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(std)}
                              className="p-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="ویرایش مشخصات"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleResetPassword(std)}
                              className="p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                              title="بازنشانی رمز عبور به کد ملی"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(std)}
                              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                std.isActive
                                  ? 'hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600'
                                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-500 hover:text-emerald-600'
                              }`}
                              title={std.isActive ? 'غیرفعال‌سازی حساب' : 'فعال‌سازی حساب'}
                            >
                              {std.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => setStudentToDelete(std)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                              title="حذف پرونده دانش‌آموز"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">تعداد ردیف در هر صفحه:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value={10}>۱۰ مورد</option>
              <option value={25}>۲۵ مورد</option>
              <option value={50}>۵۰ مورد</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-700 dark:text-slate-300">
              صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Digital Dossier Modal */}
      <AdminStudentDossierModal
        isOpen={!!dossierStudent}
        student={dossierStudent}
        onClose={() => setDossierStudent(null)}
        onEdit={(std) => handleOpenEdit(std)}
      />

      {/* Confirm Delete Dialog */}
      <AdminConfirmDialog
        isOpen={!!studentToDelete}
        title="حذف پرونده دانش‌آموز"
        message={`آیا از حذف پرونده تحصیلی «${studentToDelete?.firstName} ${studentToDelete?.lastName}» به همراه کلیه نمرات و سوابق حضور و غیاب وی از سیستم اطمینان کامل دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmLabel="حذف دائم دانش‌آموز"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingStudent ? 'ویرایش پرونده دانش‌آموز' : 'ثبت نام دانش‌آموز جدید'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    نام:
                  </label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="مثال: علی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    نام خانوادگی:
                  </label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="مثال: حسینی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    کد ملی (۱۰ رقم معتبر):
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formNationalId}
                    onChange={(e) => setFormNationalId(e.target.value)}
                    placeholder="مثال: 0012345678"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    نام پدر:
                  </label>
                  <input
                    type="text"
                    required
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    placeholder="مثال: محمد"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    تخصیص کلاس درس:
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (پایه {cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    شماره تماس اولیا:
                  </label>
                  <input
                    type="text"
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="مثال: ۰۹۱۲۰۰۰۰۰۰۰"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                  آدرس محل سکونت:
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="تهران، خیابان ولیعصر..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors cursor-pointer"
                >
                  {editingStudent ? 'ذخیره تغییرات' : 'ثبت نام دانش‌آموز'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                ورود گروهی دانش‌آموزان از طریق فایل CSV
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">محتوای متنی داده‌های CSV:</span>
                <span className="text-[11px] text-slate-400 font-mono">فرمت: نام,نام‌خانوادگی,کدملی,پدر,کلاس,تلفن</span>
              </div>

              <textarea
                rows={4}
                dir="ltr"
                value={csvRawText}
                onChange={(e) => {
                  setCsvRawText(e.target.value);
                  parseCSVData(e.target.value);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-left"
              />
            </div>

            {/* Preview Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200">
                  پیش‌نمایش اعتبارسنجی ({toPersianDigits(importPreview.length)} ردیف)
                </span>
                <span className="text-emerald-600">
                  {toPersianDigits(importPreview.filter((r) => r.isValid).length)} ردیف معتبر و آماده ورود
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">ردیف</th>
                      <th className="py-2 px-3">کد ملی</th>
                      <th className="py-2 px-3">نام و خانوادگی</th>
                      <th className="py-2 px-3">نام پدر</th>
                      <th className="py-2 px-3">کلاس</th>
                      <th className="py-2 px-3 text-center">وضعیت صحت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importPreview.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={row.isValid ? 'hover:bg-emerald-50/30' : 'bg-rose-50/50 dark:bg-rose-950/20'}
                      >
                        <td className="py-2 px-3 text-slate-400">{toPersianDigits(row.rowNumber)}</td>
                        <td className="py-2 px-3 font-mono font-bold">{toPersianDigits(row.nationalId)}</td>
                        <td className="py-2 px-3 font-bold">{row.firstName} {row.lastName}</td>
                        <td className="py-2 px-3 text-slate-500">{row.fatherName}</td>
                        <td className="py-2 px-3 text-slate-600">{row.className}</td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> معتبر
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center justify-center gap-1" title={row.error}>
                              <AlertCircle className="w-3.5 h-3.5" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importPreview.filter((r) => r.isValid).length === 0}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                تایید و واردسازی {toPersianDigits(importPreview.filter((r) => r.isValid).length)} دانش‌آموز معتبر
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
