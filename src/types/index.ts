export type UserRole = 'student' | 'teacher' | 'admin';

export type GradeType = 
  | 'daily'         // نمره مستمر / کلاسی
  | 'quiz'          // پرسش و آزمونک
  | 'homework'      // تکلیف
  | 'activity'      // فعالیت کلاسی و پژوهش
  | 'midterm'       // آزمون میان‌ترم
  | 'final'         // آزمون پایانی / نوبت
  | 'other';        // سایر

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export type AnnouncementTarget = 'all' | 'students' | 'teachers' | 'class' | 'admin';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export type HomeworkStatus = 'pending' | 'submitted' | 'graded' | 'overdue';

export type ReportCardType = 'monthly' | 'semester1' | 'semester2' | 'yearly';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  nationalId?: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  firstLogin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate?: string;
  classId: string;
  className: string;
  gradeLevel: string; // هفتم، هشتم، نهم، دهم، یازدهم، دوازدهم
  fieldOfStudy?: string; // عمومی، ریاضی فیزیک، علوم تجربی، علوم انسانی
  studentCode: string;
  address?: string;
  parentPhone: string;
  avatarUrl?: string;
  isActive: boolean;
  firstLogin: boolean;
  disciplineScore?: number; // نمره انضباط (پیش‌فرض ۲۰)
}

export interface Teacher {
  id: string;
  userId: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  specialty: string; // رشته تخصصی e.g. ریاضیات، فیزیک، ادبیات فارسی
  degree: string; // کارشناسی، کارشناسی ارشد، دکتری
  assignedClassIds: string[];
  assignedSubjectIds: string[];
  phone: string;
  personnelCode?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  firstLogin: boolean;
}

export interface Subject {
  id: string;
  title: string;
  code: string;
  coefficient: number; // ضریب درس در کارنامه
  gradeLevel: string; // پایه تحصیلی
  description?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. کلاس ۱۰۱ (هفتم الف)
  gradeLevel: string; // هفتم، هشتم، نهم...
  academicYearId: string;
  studentIds: string[];
  homeroomTeacherId?: string; // معلم راهنما / دبیر پرورشی
  capacity: number;
  roomNumber: string;
  fieldOfStudy?: string;
}

export type ClassEntity = SchoolClass;

export interface Grade {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  score: number; // نمره از ۲۰
  maxScore: number; // معمولاً ۲۰
  gradeType: GradeType;
  date: string; // تاریخ شمسی e.g. ۱۴۰۴/۰۸/۱۵
  month: string; // مهر، آبان، آذر...
  semester: 'semester1' | 'semester2';
  academicYearId: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // تاریخ شمسی e.g. ۱۴۰۴/۰۸/۱۵
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  recordedByTeacherId: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string; // تاریخ شمسی
  createdAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status?: 'active' | 'archived';
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  submittedAt: string;
  content?: string;
  answerText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  target: AnnouncementTarget;
  targetClassId?: string;
  priority: AnnouncementPriority;
  expiryDate?: string;
  createdAt: string;
  attachmentName?: string;
  readByUserIds: string[];
}

export interface ReportCardItem {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  score: number;
  teacherName: string;
  classAverage: number;
  highestGrade: number;
  lowestGrade: number;
  status: 'passed' | 'failed'; // نمره ۱۰ به بالا قبولی
  description?: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  nationalId: string;
  classId: string;
  className: string;
  gradeLevel: string;
  fieldOfStudy?: string;
  academicYearId: string;
  academicYearName: string;
  type: ReportCardType;
  monthName?: string; // e.g. مهر، آبان، آذر...
  termName?: string; // نوبت اول، نوبت دوم، سالانه
  gpa: number; // معدل کل
  totalUnits: number;
  totalWeightedScore: number;
  rankInClass: number;
  totalStudentsInClass: number;
  disciplineScore: number;
  attendancePresentCount?: number;
  attendanceAbsentCount?: number;
  attendanceLateCount?: number;
  status: 'draft' | 'published';
  generatedAt: string;
  items: ReportCardItem[];
  teacherRemarks?: string;
  principalApproval?: boolean;
}

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  subjectId?: string;
  subjectName?: string;
  category: 'behavior' | 'academic' | 'strength' | 'improvement';
  content: string;
  date: string;
  isPrivateToAdmin: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. 'ثبت نمره', 'ویرایش دانش‌آموز', 'صدور کارنامه'
  targetType: string; // 'grade' | 'student' | 'teacher' | 'report' | 'announcement' | 'attendance'
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. سال تحصیلی ۱۴۰۴–۱۴۰۵
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isArchived: boolean;
}

export interface CSVImportPreviewRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  className: string;
  fatherName?: string;
  parentPhone?: string;
  isValid: boolean;
  errors?: string[];
  error?: string;
}

export interface SchoolConfig {
  schoolName: string;
  managerName: string;
  district: string;
  province: string;
  academicYear: string;
  phone: string;
  address: string;
  passGrade: number;
}
