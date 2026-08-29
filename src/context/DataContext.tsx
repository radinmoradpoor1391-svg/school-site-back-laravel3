import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Teacher,
  SchoolClass,
  Subject,
  Grade,
  AttendanceRecord,
  Homework,
  HomeworkSubmission,
  Announcement,
  ReportCard,
  TeacherNote,
  AuditLog,
  AcademicYear,
  CSVImportPreviewRow,
  SchoolConfig,
} from '../types';
import { toEnglishDigits } from '../utils/persian';
import { syncApi, adminApi, teacherApi, studentApi } from '../services/schoolApi';

const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'دبیرستان هوشمند دانا',
  managerName: 'دکتر محمد رضایی',
  district: 'منطقه ۳',
  province: 'تهران',
  academicYear: '۱۴۰۴–۱۴۰۵',
  phone: '۰۲۱-۸۸۷۷۶۶۵۵',
  address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، بن‌بست دانش، پلاک ۱۲',
  passGrade: 10,
};

const DEFAULT_ACADEMIC_YEAR: AcademicYear = {
  id: 'ay-1404-1405',
  name: 'سال تحصیلی ۱۴۰۴–۱۴۰۵',
  startDate: '۱۴۰۴/۰۷/۰۱',
  endDate: '۱۴۰۵/۰۳/۳۱',
  isCurrent: true,
  isArchived: false,
};

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  homeworks: Homework[];
  submissions: HomeworkSubmission[];
  announcements: Announcement[];
  reportCards: ReportCard[];
  teacherNotes: TeacherNote[];
  auditLogs: AuditLog[];
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear;
  schoolConfig: SchoolConfig;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // School config actions
  updateSchoolConfig: (config: Partial<SchoolConfig>) => Promise<void>;

  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'userId' | 'studentCode' | 'isActive' | 'firstLogin'>) => Promise<Student>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  toggleStudentActive: (id: string) => Promise<void>;
  resetStudentPassword: (id: string) => Promise<void>;
  bulkImportStudents: (rows: CSVImportPreviewRow[]) => Promise<{ successCount: number; errorCount: number; errors: string[] }>;

  // Teacher actions
  addTeacher: (teacher: Omit<Teacher, 'id' | 'userId' | 'isActive' | 'firstLogin'>) => Promise<Teacher>;
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  toggleTeacherActive: (id: string) => Promise<void>;

  // Class & Subject actions
  addClass: (cls: Omit<SchoolClass, 'id' | 'studentIds'>) => Promise<SchoolClass>;
  updateClass: (id: string, data: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<Subject>;

  // Grade actions
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt'>, authorName: string) => Promise<Grade>;
  updateGrade: (id: string, data: Partial<Grade>, authorName: string) => Promise<void>;
  deleteGrade: (id: string, authorName: string) => Promise<void>;

  // Attendance actions
  recordBatchAttendance: (
    classId: string,
    date: string,
    records: { studentId: string; status: 'present' | 'absent' | 'excused' | 'late'; note?: string }[],
    teacherId: string,
    teacherName: string
  ) => Promise<void>;

  // Homework actions
  addHomework: (hw: Omit<Homework, 'id' | 'createdAt'>) => Promise<Homework>;
  deleteHomework: (id: string) => Promise<void>;
  submitHomework: (submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  gradeSubmission: (id: string, grade: number, feedback?: string) => Promise<void>;

  // Announcement actions
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'readByUserIds'>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  markAnnouncementAsRead: (id: string, userId: string) => Promise<void>;

  // Teacher notes actions
  addTeacherNote: (note: Omit<TeacherNote, 'id' | 'createdAt'>) => Promise<TeacherNote>;

  // Report Card Generation Engine
  generateMonthlyReportCards: (
    classId: string,
    monthName: string,
    academicYearId: string,
    remarksDefault?: string
  ) => Promise<ReportCard[]>;
  generateBatchMonthlyReportCards?: (
    classId: string,
    monthName: string,
    academicYearId: string,
    remarksDefault?: string
  ) => Promise<ReportCard[]>;
  generateSemesterReportCard: (
    studentId: string,
    semester: 'semester1' | 'semester2' | 'yearly',
    academicYearId: string
  ) => Promise<ReportCard>;

  // Academic year management
  setCurrentAcademicYear: (yearId: string) => Promise<void>;
  setActiveAcademicYear: (yearId: string) => Promise<void>;
  addAcademicYear: (year: Omit<AcademicYear, 'id' | 'isCurrent' | 'isArchived'>) => Promise<AcademicYear>;

  // Reset database
  resetDatabaseToInitial: () => Promise<void>;
  resetDatabaseToDefault: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(DEFAULT_SCHOOL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Sync data from API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await syncApi.getAll();
      if (res && res.success && res.data) {
        const d = res.data;
        setStudents(d.students || []);
        setTeachers(d.teachers || []);
        setClasses(d.classes || []);
        setSubjects(d.subjects || []);
        setGrades(d.grades || []);
        setAttendance(d.attendance || []);
        setHomeworks(d.homeworks || []);
        setSubmissions(d.submissions || []);
        setAnnouncements(d.announcements || []);
        setReportCards(d.reportCards || []);
        setTeacherNotes(d.teacherNotes || []);
        setAuditLogs(d.auditLogs || []);
        setAcademicYears(d.academicYears || []);
        if (d.schoolConfig) setSchoolConfig(d.schoolConfig);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const handleAuthChange = () => {
      refreshData();
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refreshData]);

  const currentAcademicYear =
    academicYears.find((y) => y.isCurrent) || academicYears[0] || DEFAULT_ACADEMIC_YEAR;

  // School Config Actions
  const updateSchoolConfig = async (config: Partial<SchoolConfig>) => {
    const res = await adminApi.updateSettings(config);
    if (res.success && res.data) {
      setSchoolConfig(res.data);
    } else {
      throw new Error('خطا در ذخیره تنظیمات مدرسه.');
    }
  };

  // Student Actions
  const addStudent = async (
    studentData: Omit<Student, 'id' | 'userId' | 'studentCode' | 'isActive' | 'firstLogin'>
  ): Promise<Student> => {
    const natId = toEnglishDigits(studentData.nationalId);
    const payload = {
      ...studentData,
      nationalId: natId,
    };

    const res = await adminApi.createStudent(payload);
    if (res.success && res.data) {
      setStudents((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در ثبت اطلاعات دانش‌آموز جدید.');
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    const res = await adminApi.updateStudent(id, data);
    if (res.success && res.data) {
      setStudents((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      await refreshData();
    } else {
      throw new Error('خطا در ویرایش مشخصات دانش‌آموز.');
    }
  };

  const deleteStudent = async (id: string) => {
    const res = await adminApi.deleteStudent(id);
    if (res.success) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setGrades((prev) => prev.filter((g) => g.studentId !== id));
      setAttendance((prev) => prev.filter((a) => a.studentId !== id));
      setReportCards((prev) => prev.filter((r) => r.studentId !== id));
      setTeacherNotes((prev) => prev.filter((n) => n.studentId !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف دانش‌آموز از سامانه.');
    }
  };

  const toggleStudentActive = async (id: string) => {
    const res = await adminApi.toggleStudentActive(id);
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } else {
      throw new Error('خطا در تغییر وضعیت فعالیت دانش‌آموز.');
    }
  };

  const resetStudentPassword = async (id: string) => {
    const res = await adminApi.resetStudentPassword(id);
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, firstLogin: true } : s))
      );
    } else {
      throw new Error('خطا در بازنشانی رمز عبور دانش‌آموز.');
    }
  };

  const bulkImportStudents = async (
    rows: CSVImportPreviewRow[]
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    const validRows = rows.filter((r) => r.isValid);
    const newStudents: Partial<Student>[] = validRows.map((r) => {
      const cls = classes.find((c) => c.name.includes(r.className)) || classes[0];
      return {
        nationalId: toEnglishDigits(r.nationalId),
        firstName: r.firstName,
        lastName: r.lastName,
        fatherName: r.fatherName || 'ـ',
        birthDate: '۱۳۸۸/۰۵/۱۵',
        classId: cls ? cls.id : (classes[0]?.id || 'cls-701'),
        className: cls ? cls.name : r.className,
        gradeLevel: cls ? cls.gradeLevel : 'هفتم',
        fieldOfStudy: cls ? cls.fieldOfStudy || 'دوره اول متوسطه' : 'دوره اول متوسطه',
        parentPhone: r.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰',
        disciplineScore: 20,
      };
    });

    const res = await adminApi.bulkImportStudents(newStudents);
    if (res.success) {
      await refreshData();
      return {
        successCount: res.importedCount || validRows.length,
        errorCount: rows.length - validRows.length,
        errors: rows.filter((r) => !r.isValid).map((r) => `${r.firstName} ${r.lastName}: ${r.error || 'داده نامعتبر'}`),
      };
    }
    throw new Error('خطا در درون‌ریزی گروهی دانش‌آموزان.');
  };

  // Teacher Actions
  const addTeacher = async (
    teacherData: Omit<Teacher, 'id' | 'userId' | 'isActive' | 'firstLogin'>
  ): Promise<Teacher> => {
    const natId = toEnglishDigits(teacherData.nationalId);
    const payload = {
      ...teacherData,
      nationalId: natId,
    };

    const res = await adminApi.createTeacher(payload);
    if (res.success && res.data) {
      setTeachers((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در ثبت اطلاعات دبیر جدید.');
  };

  const updateTeacher = async (id: string, data: Partial<Teacher>) => {
    const res = await adminApi.updateTeacher(id, data);
    if (res.success && res.data) {
      setTeachers((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      await refreshData();
    } else {
      throw new Error('خطا در ویرایش مشخصات دبیر.');
    }
  };

  const deleteTeacher = async (id: string) => {
    const res = await adminApi.deleteTeacher(id);
    if (res.success) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف دبیر از سامانه.');
    }
  };

  const toggleTeacherActive = async (id: string) => {
    const res = await adminApi.toggleTeacherActive(id);
    if (res.success) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
      );
    } else {
      throw new Error('خطا در تغییر وضعیت دسترسی دبیر.');
    }
  };

  // Class & Subject Actions
  const addClass = async (clsData: Omit<SchoolClass, 'id' | 'studentIds'>): Promise<SchoolClass> => {
    const res = await adminApi.createClass(clsData);
    if (res.success && res.data) {
      setClasses((prev) => [...prev, res.data]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در تعریف کلاس آموزشی جدید.');
  };

  const updateClass = async (id: string, data: Partial<SchoolClass>) => {
    const res = await adminApi.updateClass(id, data);
    if (res.success && res.data) {
      setClasses((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      await refreshData();
    } else {
      throw new Error('خطا در ویرایش مشخصات کلاس.');
    }
  };

  const deleteClass = async (id: string) => {
    const res = await adminApi.deleteClass(id);
    if (res.success) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف کلاس از سامانه.');
    }
  };

  const addSubject = async (subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
    const res = await adminApi.createSubject(subjectData);
    if (res.success && res.data) {
      setSubjects((prev) => [...prev, res.data]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در تعریف کتاب یا سرفصل درسی.');
  };

  // Grade Actions
  const addGrade = async (
    gradeData: Omit<Grade, 'id' | 'createdAt'>,
    authorName: string
  ): Promise<Grade> => {
    const res = await teacherApi.saveGrade(gradeData);
    if (res.success && res.data) {
      setGrades((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در ثبت نمره در پایگاه داده مرکزی.');
  };

  const updateGrade = async (id: string, data: Partial<Grade>, authorName: string) => {
    const res = await teacherApi.saveGrade({ id, ...data });
    if (res.success && res.data) {
      setGrades((prev) => prev.map((g) => (g.id === id ? res.data : g)));
      await refreshData();
    } else {
      throw new Error('خطا در ویرایش نمره در سامانه.');
    }
  };

  const deleteGrade = async (id: string, authorName: string) => {
    const res = await adminApi.deleteGrade(id);
    if (res.success) {
      setGrades((prev) => prev.filter((g) => g.id !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف نمره.');
    }
  };

  // Attendance Actions
  const recordBatchAttendance = async (
    classId: string,
    date: string,
    records: { studentId: string; status: 'present' | 'absent' | 'excused' | 'late'; note?: string }[],
    teacherId: string,
    teacherName: string
  ) => {
    const res = await teacherApi.saveAttendanceBatch({
      class_id: classId,
      date,
      records: records.map((r) => ({
        student_id: r.studentId,
        status: r.status,
        note: r.note,
      })),
    });

    if (res.success) {
      await refreshData();
    } else {
      throw new Error('خطا در ثبت حضور و غیاب کلاسی.');
    }
  };

  // Homework Actions
  const addHomework = async (hwData: Omit<Homework, 'id' | 'createdAt'>): Promise<Homework> => {
    const res = await teacherApi.createHomework(hwData);
    if (res.success && res.data) {
      setHomeworks((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در تعریف تکلیف جدید.');
  };

  const deleteHomework = async (id: string) => {
    const res = await teacherApi.deleteHomework(id);
    if (res.success) {
      setHomeworks((prev) => prev.filter((h) => h.id !== id));
      setSubmissions((prev) => prev.filter((s) => s.homeworkId !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف تکلیف.');
    }
  };

  const submitHomework = async (
    subData: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    const res = await studentApi.submitHomework(subData.homeworkId, subData);
    if (res.success && res.data) {
      setSubmissions((prev) => [
        ...prev.filter((s) => !(s.homeworkId === subData.homeworkId && s.studentId === subData.studentId)),
        res.data,
      ]);
      await refreshData();
    } else {
      throw new Error('خطا در ارسال پاسخ تکلیف.');
    }
  };

  const gradeSubmission = async (id: string, grade: number, feedback?: string) => {
    const res = await teacherApi.gradeSubmission(id, grade, feedback);
    if (res.success && res.data) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? res.data : s))
      );
      await refreshData();
    } else {
      throw new Error('خطا در ثبت نمره و بازخورد تکلیف.');
    }
  };

  // Announcement Actions
  const addAnnouncement = async (
    annData: Omit<Announcement, 'id' | 'createdAt' | 'readByUserIds'>
  ): Promise<Announcement> => {
    const res = await adminApi.createAnnouncement(annData);
    if (res.success && res.data) {
      setAnnouncements((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در انتشار اطلاعیه.');
  };

  const deleteAnnouncement = async (id: string) => {
    const res = await adminApi.deleteAnnouncement(id);
    if (res.success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      await refreshData();
    } else {
      throw new Error('خطا در حذف اطلاعیه.');
    }
  };

  const markAnnouncementAsRead = async (id: string, userId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id && !a.readByUserIds.includes(userId)
          ? { ...a, readByUserIds: [...a.readByUserIds, userId] }
          : a
      )
    );
  };

  // Teacher Note Actions
  const addTeacherNote = async (
    noteData: Omit<TeacherNote, 'id' | 'createdAt'>
  ): Promise<TeacherNote> => {
    const res = await teacherApi.createNote(noteData);
    if (res.success && res.data) {
      setTeacherNotes((prev) => [res.data, ...prev]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در ثبت یادداشت انضباطی/مشاوره‌ای.');
  };

  // Report Card Generation Actions
  const generateMonthlyReportCards = async (
    classId: string,
    monthName: string,
    academicYearId: string,
    remarksDefault?: string
  ): Promise<ReportCard[]> => {
    const res = await adminApi.generateBatchMonthly({
      classId,
      monthName,
      academicYearId,
      remarksDefault,
    });

    if (res.success && res.data) {
      setReportCards((prev) => [
        ...prev.filter((r) => !(r.classId === classId && r.monthName === monthName && r.academicYearId === academicYearId)),
        ...res.data,
      ]);
      await refreshData();
      return res.data;
    }

    throw new Error('خطا در صدور کارنامه ماهانه.');
  };

  const generateSemesterReportCard = async (
    studentId: string,
    semester: 'semester1' | 'semester2' | 'yearly',
    academicYearId: string
  ): Promise<ReportCard> => {
    const res = await adminApi.generateSemester({
      studentId,
      type: semester,
      academicYearId,
    });

    if (res.success && res.data) {
      setReportCards((prev) => [
        ...prev.filter((r) => r.id !== res.data.id),
        res.data,
      ]);
      await refreshData();
      return res.data;
    }

    throw new Error('عدم امکان صدور کارنامه نوبت تحصیلی.');
  };

  // Academic Year Management
  const setCurrentAcademicYear = async (yearId: string) => {
    const res = await adminApi.setCurrentAcademicYear(yearId);
    if (res.success) {
      setAcademicYears((prev) =>
        prev.map((y) => ({ ...y, isCurrent: y.id === yearId }))
      );
      await refreshData();
    } else {
      throw new Error('خطا در تغییر سال تحصیلی فعال.');
    }
  };

  const addAcademicYear = async (
    yearData: Omit<AcademicYear, 'id' | 'isCurrent' | 'isArchived'>
  ): Promise<AcademicYear> => {
    const res = await adminApi.createAcademicYear(yearData);
    if (res.success && res.data) {
      setAcademicYears((prev) => [...prev, res.data]);
      await refreshData();
      return res.data;
    }
    throw new Error('خطا در ثبت سال تحصیلی جدید.');
  };

  // Reset database actions
  const resetDatabaseToInitial = async () => {
    await refreshData();
  };

  const resetDatabaseToDefault = async () => {
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        students,
        teachers,
        classes,
        subjects,
        grades,
        attendance,
        homeworks,
        submissions,
        announcements,
        reportCards,
        teacherNotes,
        auditLogs,
        academicYears,
        currentAcademicYear,
        schoolConfig,
        isLoading,
        refreshData,
        updateSchoolConfig,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleStudentActive,
        resetStudentPassword,
        bulkImportStudents,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        toggleTeacherActive,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        addGrade,
        updateGrade,
        deleteGrade,
        recordBatchAttendance,
        addHomework,
        deleteHomework,
        submitHomework,
        gradeSubmission,
        addAnnouncement,
        deleteAnnouncement,
        markAnnouncementAsRead,
        addTeacherNote,
        generateMonthlyReportCards,
        generateBatchMonthlyReportCards: generateMonthlyReportCards,
        generateSemesterReportCard,
        setCurrentAcademicYear,
        setActiveAcademicYear: setCurrentAcademicYear,
        addAcademicYear,
        resetDatabaseToInitial,
        resetDatabaseToDefault,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
