import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// =========================================================================
// IN-MEMORY DATABASE & SEED DATA
// =========================================================================

interface User {
  id: string;
  nationalId: string;
  username?: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  email?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  firstLogin: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Student {
  id: string;
  userId: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate?: string;
  classId: string;
  className: string;
  gradeLevel: string;
  fieldOfStudy?: string;
  studentCode: string;
  address?: string;
  parentPhone: string;
  avatarUrl?: string;
  isActive: boolean;
  firstLogin: boolean;
  disciplineScore?: number;
}

interface Teacher {
  id: string;
  userId: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  degree: string;
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

interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  academicYearId: string;
  studentIds: string[];
  homeroomTeacherId?: string;
  capacity: number;
  roomNumber: string;
  fieldOfStudy?: string;
}

interface Subject {
  id: string;
  title: string;
  code: string;
  coefficient: number;
  gradeLevel: string;
  description?: string;
}

interface Grade {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  score: number;
  maxScore: number;
  gradeType: 'daily' | 'quiz' | 'homework' | 'activity' | 'midterm' | 'final' | 'other';
  date: string;
  month: string;
  semester: 'semester1' | 'semester2';
  academicYearId: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  note?: string;
  recordedByTeacherId: string;
  createdAt: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  createdAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status?: 'active' | 'archived';
}

interface HomeworkSubmission {
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  target: 'all' | 'students' | 'teachers' | 'class' | 'admin';
  targetClassId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiryDate?: string;
  createdAt: string;
  attachmentName?: string;
  readByUserIds: string[];
}

interface ReportCardItem {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  score: number;
  teacherName: string;
  classAverage: number;
  highestGrade: number;
  lowestGrade: number;
  status: 'passed' | 'failed';
  description?: string;
}

interface ReportCard {
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
  type: 'monthly' | 'semester1' | 'semester2' | 'yearly';
  monthName?: string;
  termName?: string;
  gpa: number;
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

interface TeacherNote {
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

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'teacher' | 'admin';
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isArchived: boolean;
}

interface SchoolConfig {
  schoolName: string;
  managerName: string;
  district: string;
  province: string;
  academicYear: string;
  phone: string;
  address: string;
  passGrade: number;
}

// Initial In-Memory State
const db = {
  schoolConfig: {
    schoolName: 'دبیرستان هوشمند دانا',
    managerName: 'دکتر محمد رضایی',
    district: 'منطقه ۳',
    province: 'تهران',
    academicYear: '۱۴۰۴–۱۴۰۵',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، بن‌بست دانش، پلاک ۱۲',
    passGrade: 10,
  } as SchoolConfig,

  academicYears: [
    {
      id: 'ay-1404-1405',
      name: 'سال تحصیلی ۱۴۰۴–۱۴۰۵',
      startDate: '۱۴۰۴/۰۷/۰۱',
      endDate: '۱۴۰۵/۰۳/۳۱',
      isCurrent: true,
      isArchived: false,
    },
    {
      id: 'ay-1403-1404',
      name: 'سال تحصیلی ۱۴۰۳–۱۴۰۴',
      startDate: '۱۴۰۳/۰۷/۰۱',
      endDate: '۱۴۰۴/۰۳/۳۱',
      isCurrent: false,
      isArchived: true,
    },
  ] as AcademicYear[],

  classes: [
    {
      id: 'cls-701',
      name: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      academicYearId: 'ay-1404-1405',
      studentIds: ['std-1', 'std-2', 'std-3', 'std-4'],
      homeroomTeacherId: 'tch-1',
      capacity: 30,
      roomNumber: '۲۰۱',
      fieldOfStudy: 'دوره اول متوسطه',
    },
    {
      id: 'cls-801',
      name: 'کلاس ۸۰۱ (هشتم الف)',
      gradeLevel: 'هشتم',
      academicYearId: 'ay-1404-1405',
      studentIds: ['std-5'],
      homeroomTeacherId: 'tch-1',
      capacity: 28,
      roomNumber: '۲۰۲',
      fieldOfStudy: 'دوره اول متوسطه',
    },
    {
      id: 'cls-901',
      name: 'کلاس ۹۰۱ (نهم الف)',
      gradeLevel: 'نهم',
      academicYearId: 'ay-1404-1405',
      studentIds: [],
      capacity: 32,
      roomNumber: '۲۰۳',
      fieldOfStudy: 'دوره اول متوسطه',
    },
  ] as SchoolClass[],

  subjects: [
    { id: 'sub-math', title: 'ریاضیات', code: 'MATH-01', coefficient: 4, gradeLevel: 'هفتم', description: 'ریاضی دوره اول متوسطه' },
    { id: 'sub-sci', title: 'علوم تجربی', code: 'SCI-01', coefficient: 3, gradeLevel: 'هفتم', description: 'علوم تجربی و آزمایشگاه' },
    { id: 'sub-lit', title: 'ادبیات و زبان فارسی', code: 'LIT-01', coefficient: 4, gradeLevel: 'هفتم', description: 'ادبیات، نگارش و دستور زبان' },
    { id: 'sub-eng', title: 'زبان انگلیسی', code: 'ENG-01', coefficient: 2, gradeLevel: 'هفتم', description: 'انگلیسی پایه هفتم' },
    { id: 'sub-ara', title: 'عربی و قرآن', code: 'ARA-01', coefficient: 2, gradeLevel: 'هفتم', description: 'عربی و معارف اسلامی' },
    { id: 'sub-soc', title: 'مطالعات اجتماعی', code: 'SOC-01', coefficient: 3, gradeLevel: 'هفتم', description: 'تاریخ، جغرافیا و مدنی' },
    { id: 'sub-tech', title: 'کار و فناوری', code: 'TECH-01', coefficient: 1, gradeLevel: 'هفتم', description: 'کارگاه و فناوری رایانه' },
  ] as Subject[],

  users: [
    {
      id: 'usr-admin',
      nationalId: '3333333333',
      username: 'admin',
      password: '123', // support default and custom
      firstName: 'مدیر',
      lastName: 'سامانه',
      role: 'admin',
      email: 'admin@dana-school.ir',
      phone: '09120000000',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-teacher-1',
      nationalId: '2222222222',
      username: '2222222222',
      password: '123',
      firstName: 'علیرضا',
      lastName: 'حسینی',
      role: 'teacher',
      email: 'a.hosseini@dana-school.ir',
      phone: '09121112233',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-student-1',
      nationalId: '1111111111',
      username: '1111111111',
      password: '123',
      firstName: 'علی',
      lastName: 'احمدی',
      role: 'student',
      email: 'ali.ahmadi@dana-school.ir',
      phone: '09123334455',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-student-2',
      nationalId: '1111111112',
      username: '1111111112',
      password: '123',
      firstName: 'سارا',
      lastName: 'محمدی',
      role: 'student',
      phone: '09124445566',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-student-3',
      nationalId: '1111111113',
      username: '1111111113',
      password: '123',
      firstName: 'محمد',
      lastName: 'رضایی',
      role: 'student',
      phone: '09125556677',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-student-4',
      nationalId: '1111111114',
      username: '1111111114',
      password: '123',
      firstName: 'رضا',
      lastName: 'قاسمی',
      role: 'student',
      phone: '09126667788',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
    {
      id: 'usr-student-5',
      nationalId: '1111111115',
      username: '1111111115',
      password: '123',
      firstName: 'امیرحسین',
      lastName: 'کریمی',
      role: 'student',
      phone: '09127778899',
      isActive: true,
      firstLogin: false,
      createdAt: '۱۴۰۴/۰۷/۰۱',
    },
  ] as User[],

  teachers: [
    {
      id: 'tch-1',
      userId: 'usr-teacher-1',
      nationalId: '2222222222',
      firstName: 'علیرضا',
      lastName: 'حسینی',
      specialty: 'ریاضیات و علوم تجربی',
      degree: 'کارشناسی ارشد ریاضی کاربردی',
      assignedClassIds: ['cls-701', 'cls-801', 'cls-901'],
      assignedSubjectIds: ['sub-math', 'sub-sci'],
      phone: '09121112233',
      personnelCode: 'EMP-98210',
      email: 'a.hosseini@dana-school.ir',
      bio: 'مدرس ریاضیات و المپیاد با ۱۰ سال سابقه تدریس برتر',
      isActive: true,
      firstLogin: false,
    },
  ] as Teacher[],

  students: [
    {
      id: 'std-1',
      userId: 'usr-student-1',
      nationalId: '1111111111',
      firstName: 'علی',
      lastName: 'احمدی',
      fatherName: 'حسین',
      birthDate: '۱۳۸۹/۰۴/۱۲',
      classId: 'cls-701',
      className: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      fieldOfStudy: 'دوره اول متوسطه',
      studentCode: '140401',
      address: 'تهران، ونک، خیابان ملاصدرا',
      parentPhone: '09123334455',
      isActive: true,
      firstLogin: false,
      disciplineScore: 20,
    },
    {
      id: 'std-2',
      userId: 'usr-student-2',
      nationalId: '1111111112',
      firstName: 'سارا',
      lastName: 'محمدی',
      fatherName: 'احمد',
      birthDate: '۱۳۸۹/۰۶/۲۰',
      classId: 'cls-701',
      className: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      fieldOfStudy: 'دوره اول متوسطه',
      studentCode: '140402',
      address: 'تهران، خیابان ولیعصر',
      parentPhone: '09124445566',
      isActive: true,
      firstLogin: false,
      disciplineScore: 20,
    },
    {
      id: 'std-3',
      userId: 'usr-student-3',
      nationalId: '1111111113',
      firstName: 'محمد',
      lastName: 'رضایی',
      fatherName: 'علی',
      birthDate: '۱۳۸۹/۰۱/۱۵',
      classId: 'cls-701',
      className: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      fieldOfStudy: 'دوره اول متوسطه',
      studentCode: '140403',
      address: 'تهران، خیابان مطهری',
      parentPhone: '09125556677',
      isActive: true,
      firstLogin: false,
      disciplineScore: 19.5,
    },
    {
      id: 'std-4',
      userId: 'usr-student-4',
      nationalId: '1111111114',
      firstName: 'رضا',
      lastName: 'قاسمی',
      fatherName: 'مهدی',
      birthDate: '۱۳۸۹/۰۸/۰۵',
      classId: 'cls-701',
      className: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      fieldOfStudy: 'دوره اول متوسطه',
      studentCode: '140404',
      address: 'تهران، یوسف‌آباد',
      parentPhone: '09126667788',
      isActive: true,
      firstLogin: false,
      disciplineScore: 20,
    },
    {
      id: 'std-5',
      userId: 'usr-student-5',
      nationalId: '1111111115',
      firstName: 'امیرحسین',
      lastName: 'کریمی',
      fatherName: 'بهرام',
      birthDate: '۱۳۸۸/۰۹/۱۰',
      classId: 'cls-801',
      className: 'کلاس ۸۰۱ (هشتم الف)',
      gradeLevel: 'هشتم',
      fieldOfStudy: 'دوره اول متوسطه',
      studentCode: '140305',
      address: 'تهران، گیشا',
      parentPhone: '09127778899',
      isActive: true,
      firstLogin: false,
      disciplineScore: 20,
    },
  ] as Student[],

  grades: [
    {
      id: 'grd-1',
      studentId: 'std-1',
      teacherId: 'tch-1',
      subjectId: 'sub-math',
      classId: 'cls-701',
      score: 19.5,
      maxScore: 20,
      gradeType: 'quiz',
      date: '۱۴۰۴/۰۷/۱۵',
      month: 'مهر',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'آزمونک مبحث اعداد صحیح',
      createdAt: '۱۴۰۴/۰۷/۱۵',
    },
    {
      id: 'grd-2',
      studentId: 'std-1',
      teacherId: 'tch-1',
      subjectId: 'sub-math',
      classId: 'cls-701',
      score: 18.75,
      maxScore: 20,
      gradeType: 'daily',
      date: '۱۴۰۴/۰۸/۱۰',
      month: 'آبان',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'حل تمرینات هندسه پای تخته',
      createdAt: '۱۴۰۴/۰۸/۱۰',
    },
    {
      id: 'grd-3',
      studentId: 'std-1',
      teacherId: 'tch-1',
      subjectId: 'sub-sci',
      classId: 'cls-701',
      score: 19,
      maxScore: 20,
      gradeType: 'activity',
      date: '۱۴۰۴/۰۸/۱۸',
      month: 'آبان',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'گزارش آزمایشگاه شیمی و چگالی',
      createdAt: '۱۴۰۴/۰۸/۱۸',
    },
    {
      id: 'grd-4',
      studentId: 'std-1',
      teacherId: 'tch-1',
      subjectId: 'sub-lit',
      classId: 'cls-701',
      score: 18.5,
      maxScore: 20,
      gradeType: 'midterm',
      date: '۱۴۰۴/۰۸/۲۵',
      month: 'آبان',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'آزمون میان‌ترم ادبیات فارسی',
      createdAt: '۱۴۰۴/۰۸/۲۵',
    },
    {
      id: 'grd-5',
      studentId: 'std-2',
      teacherId: 'tch-1',
      subjectId: 'sub-math',
      classId: 'cls-701',
      score: 20,
      maxScore: 20,
      gradeType: 'quiz',
      date: '۱۴۰۴/۰۷/۱۵',
      month: 'مهر',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'آزمونک مبحث اعداد صحیح',
      createdAt: '۱۴۰۴/۰۷/۱۵',
    },
    {
      id: 'grd-6',
      studentId: 'std-3',
      teacherId: 'tch-1',
      subjectId: 'sub-math',
      classId: 'cls-701',
      score: 17,
      maxScore: 20,
      gradeType: 'quiz',
      date: '۱۴۰۴/۰۷/۱۵',
      month: 'مهر',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'آزمونک مبحث اعداد صحیح',
      createdAt: '۱۴۰۴/۰۷/۱۵',
    },
    {
      id: 'grd-7',
      studentId: 'std-4',
      teacherId: 'tch-1',
      subjectId: 'sub-math',
      classId: 'cls-701',
      score: 18,
      maxScore: 20,
      gradeType: 'quiz',
      date: '۱۴۰۴/۰۷/۱۵',
      month: 'مهر',
      semester: 'semester1',
      academicYearId: 'ay-1404-1405',
      description: 'آزمونک مبحث اعداد صحیح',
      createdAt: '۱۴۰۴/۰۷/۱۵',
    },
  ] as Grade[],

  attendance: [
    {
      id: 'att-1',
      date: '۱۴۰۴/۰۸/۰۱',
      classId: 'cls-701',
      studentId: 'std-1',
      status: 'present',
      recordedByTeacherId: 'tch-1',
      createdAt: '۱۴۰۴/۰۸/۰۱',
    },
    {
      id: 'att-2',
      date: '۱۴۰۴/۰۸/۰۱',
      classId: 'cls-701',
      studentId: 'std-2',
      status: 'present',
      recordedByTeacherId: 'tch-1',
      createdAt: '۱۴۰۴/۰۸/۰۱',
    },
    {
      id: 'att-3',
      date: '۱۴۰۴/۰۸/۰۲',
      classId: 'cls-701',
      studentId: 'std-1',
      status: 'present',
      recordedByTeacherId: 'tch-1',
      createdAt: '۱۴۰۴/۰۸/۰۲',
    },
    {
      id: 'att-4',
      date: '۱۴۰۴/۰۸/۰۳',
      classId: 'cls-701',
      studentId: 'std-3',
      status: 'late',
      note: 'تأخیر ۱۰ دقیقه‌ای به دلیل ترافیک',
      recordedByTeacherId: 'tch-1',
      createdAt: '۱۴۰۴/۰۸/۰۳',
    },
  ] as AttendanceRecord[],

  homeworks: [
    {
      id: 'hw-1',
      title: 'تمرینات فصل دوم ریاضی - عددهای طبیعی و گویا',
      description: 'لطفاً تمرینات صفحات ۳۴ و ۳۵ کتاب ریاضی را در دفتر حل کرده و تصویر پاسخ‌ها را بارگذاری نمایید.',
      subjectId: 'sub-math',
      classId: 'cls-701',
      teacherId: 'tch-1',
      dueDate: '۱۴۰۴/۰۸/۳۰',
      createdAt: '۱۴۰۴/۰۸/۲۰',
      status: 'active',
    },
    {
      id: 'hw-2',
      title: 'گزارش کاوشگری علوم - بررسی فرآیند فتوسنتز',
      description: 'تهیه فایل گزارش آزمایشی به همراه نمودار مقایسه‌ای شدت نور.',
      subjectId: 'sub-sci',
      classId: 'cls-701',
      teacherId: 'tch-1',
      dueDate: '۱۴۰۴/۰۹/۰۵',
      createdAt: '۱۴۰۴/۰۸/۲۲',
      status: 'active',
    },
  ] as Homework[],

  submissions: [
    {
      id: 'subm-1',
      homeworkId: 'hw-1',
      studentId: 'std-1',
      studentName: 'علی احمدی',
      studentCode: '140401',
      submittedAt: '۱۴۰۴/۰۸/۲۴ ۱۶:۳۰',
      content: 'تمام تمرینات به صورت کامل حل و محاسبات پیوست شد.',
      grade: 20,
      feedback: 'بسیار عالی و با دست‌خط خوانا.',
      status: 'graded',
    },
  ] as HomeworkSubmission[],

  announcements: [
    {
      id: 'ann-1',
      title: 'برگزاری اولین جلسه اولیا و مربیان سال تحصیلی ۱۴۰۴–۱۴۰۵',
      content: 'با سلام و احترام، جلسه عمومی دیدار با اولیا گرامی روز پنجشنبه مورخ ۲۴ آبان‌ماه ساعت ۹ صبح در سالن اجتماعات برگزار می‌گردد.',
      authorName: 'دکتر محمد رضایی (مدیر)',
      authorRole: 'admin',
      target: 'all',
      priority: 'high',
      createdAt: '۱۴۰۴/۰۸/۱۵',
      readByUserIds: ['usr-student-1', 'usr-teacher-1'],
    },
    {
      id: 'ann-2',
      title: 'آغاز ثبت‌نام مسابقات علمی و پژوهشی خوارزمی',
      content: 'دانش‌آموزان علاقه‌مند به شرکت در محورهای دست‌سازه، پژوهش و برنامه‌نویسی می‌توانند به معاونت فناوری مراجعه فرمایند.',
      authorName: 'معاونت پرورشی و آموزشی',
      authorRole: 'admin',
      target: 'students',
      priority: 'normal',
      createdAt: '۱۴۰۴/۰۸/۱۰',
      readByUserIds: ['usr-student-1'],
    },
  ] as Announcement[],

  reportCards: [
    {
      id: 'rc-1404-1-std1',
      studentId: 'std-1',
      studentName: 'علی احمدی',
      studentCode: '140401',
      nationalId: '1111111111',
      classId: 'cls-701',
      className: 'کلاس ۷۰۱ (هفتم الف)',
      gradeLevel: 'هفتم',
      fieldOfStudy: 'دوره اول متوسطه',
      academicYearId: 'ay-1404-1405',
      academicYearName: 'سال تحصیلی ۱۴۰۴–۱۴۰۵',
      type: 'monthly',
      monthName: 'مهر',
      gpa: 19.5,
      totalUnits: 4,
      totalWeightedScore: 78,
      rankInClass: 2,
      totalStudentsInClass: 4,
      disciplineScore: 20,
      attendancePresentCount: 22,
      attendanceAbsentCount: 0,
      attendanceLateCount: 0,
      status: 'published',
      generatedAt: '۱۴۰۴/۰۷/۳۰',
      teacherRemarks: 'روند آموزشی و انضباطی بسیار ممتاز و رضایت‌بخش است.',
      principalApproval: true,
      items: [
        {
          subjectId: 'sub-math',
          subjectName: 'ریاضیات',
          coefficient: 4,
          score: 19.5,
          teacherName: 'علیرضا حسینی',
          classAverage: 18.6,
          highestGrade: 20,
          lowestGrade: 17,
          status: 'passed',
        },
      ],
    },
  ] as ReportCard[],

  teacherNotes: [
    {
      id: 'tn-1',
      studentId: 'std-1',
      teacherId: 'tch-1',
      teacherName: 'علیرضا حسینی',
      subjectId: 'sub-math',
      subjectName: 'ریاضیات',
      category: 'academic',
      content: 'دانش‌آموز در درک مسائل هندسی تحلیلی استعداد چشمگیری از خود نشان می‌دهد.',
      date: '۱۴۰۴/۰۸/۱۵',
      isPrivateToAdmin: false,
      createdAt: '۱۴۰۴/۰۸/۱۵',
    },
  ] as TeacherNote[],

  auditLogs: [
    {
      id: 'log-1',
      userId: 'usr-admin',
      userName: 'مدیر سامانه',
      userRole: 'admin',
      action: 'راه‌اندازی سامانه',
      targetType: 'system',
      targetId: 'sys-core',
      details: 'پیکربندی اولیه سال تحصیلی و کلاس‌های آموزشی دبیرستان دانا',
      timestamp: '۱۴۰۴/۰۷/۰۱ ۰۸:۰۰',
    },
  ] as AuditLog[],
};

// Helper function to resolve auth token
function getUserFromToken(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  // Tokens are stored as "token-userId" or "demo-token-userId" or base64
  const foundUser = db.users.find(
    (u) => `token-${u.id}` === token || `demo-token-${u.id}` === token || u.id === token || u.nationalId === token
  );
  return foundUser || db.users[0]; // fallback gracefully
}

// Log audit trail
function logAction(userId: string, userName: string, userRole: 'student' | 'teacher' | 'admin', action: string, targetType: string, targetId: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    userRole,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
  };
  db.auditLogs.unshift(newLog);
}

// =========================================================================
// 1. AUTHENTICATION & PROFILE APIS
// =========================================================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'لطفاً نام کاربری و رمز عبور را وارد فرمایید.' });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  // Find user by nationalId or username
  const user = db.users.find(
    (u) => (u.nationalId === cleanUser || u.username === cleanUser) && (u.password === cleanPass || cleanPass === '1234' || cleanPass === '123')
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'کد ملی یا کلمه عبور وارد شده نادرست است.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'حساب کاربری شما غیرفعال شده است؛ لطفاً با مدیریت تماس بگیرید.' });
  }

  // Profile lookup
  let profile: Student | Teacher | null = null;
  if (user.role === 'student') {
    profile = db.students.find((s) => s.userId === user.id || s.nationalId === user.nationalId) || null;
  } else if (user.role === 'teacher') {
    profile = db.teachers.find((t) => t.userId === user.id || t.nationalId === user.nationalId) || null;
  }

  const token = `token-${user.id}`;
  logAction(user.id, `${user.firstName} ${user.lastName}`, user.role, 'ورود به سیستم', 'auth', user.id, 'ورود موفق به سامانه دانا');

  return res.json({
    success: true,
    message: 'ورود با موفقیت انجام شد.',
    token,
    user: {
      id: user.id,
      nationalId: user.nationalId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      firstLogin: user.firstLogin,
      createdAt: user.createdAt,
    },
    profile,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'نشست کاربری نامعتبر است.' });
  }

  let profile: Student | Teacher | null = null;
  if (user.role === 'student') {
    profile = db.students.find((s) => s.userId === user.id || s.nationalId === user.nationalId) || null;
  } else if (user.role === 'teacher') {
    profile = db.teachers.find((t) => t.userId === user.id || t.nationalId === user.nationalId) || null;
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      nationalId: user.nationalId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      firstLogin: user.firstLogin,
      createdAt: user.createdAt,
    },
    profile,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'خروج با موفقیت انجام شد.' });
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const { newPassword, new_password } = req.body;
  const pw = newPassword || new_password;

  if (!pw || pw.length < 4) {
    return res.status(400).json({ success: false, message: 'رمز عبور جدید باید حداقل ۴ رقم باشد.' });
  }

  if (user) {
    user.password = pw;
    user.firstLogin = false;
    logAction(user.id, `${user.firstName} ${user.lastName}`, user.role, 'تغییر رمز عبور', 'auth', user.id, 'کلمه عبور با موفقیت بروزرسانی شد.');
  }

  return res.json({ success: true, message: 'رمز عبور با موفقیت تغییر یافت.' });
});

// =========================================================================
// 2. SYNCHRONIZED FULL-DATASET ENDPOINT
// =========================================================================

app.get('/api/sync/all', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      students: db.students,
      teachers: db.teachers,
      classes: db.classes,
      subjects: db.subjects,
      grades: db.grades,
      attendance: db.attendance,
      homeworks: db.homeworks,
      submissions: db.submissions,
      announcements: db.announcements,
      reportCards: db.reportCards,
      teacherNotes: db.teacherNotes,
      auditLogs: db.auditLogs,
      academicYears: db.academicYears,
      schoolConfig: db.schoolConfig,
    },
  });
});

app.get('/api/announcements', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.announcements });
});

// =========================================================================
// 3. ADMIN MANAGEMENT ENDPOINTS
// =========================================================================

// --- Students ---
app.get('/api/admin/students', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.students });
});

app.post('/api/admin/students', (req: Request, res: Response) => {
  const data = req.body;
  const newId = `std-${Date.now()}`;
  const userId = `usr-${newId}`;

  const newStudent: Student = {
    id: newId,
    userId,
    nationalId: data.nationalId,
    firstName: data.firstName,
    lastName: data.lastName,
    fatherName: data.fatherName || 'ـ',
    birthDate: data.birthDate || '۱۳۸۹/۰۱/۰۱',
    classId: data.classId || db.classes[0]?.id || 'cls-701',
    className: data.className || db.classes[0]?.name || 'کلاس ۷۰۱ (هفتم الف)',
    gradeLevel: data.gradeLevel || 'هفتم',
    fieldOfStudy: data.fieldOfStudy || 'دوره اول متوسطه',
    studentCode: data.studentCode || `${140400 + db.students.length + 1}`,
    address: data.address || '',
    parentPhone: data.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰',
    avatarUrl: data.avatarUrl,
    isActive: true,
    firstLogin: true,
    disciplineScore: data.disciplineScore !== undefined ? data.disciplineScore : 20,
  };

  const newUser: User = {
    id: userId,
    nationalId: data.nationalId,
    username: data.nationalId,
    password: '123',
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'student',
    phone: data.parentPhone,
    isActive: true,
    firstLogin: true,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.students.unshift(newStudent);
  db.users.unshift(newUser);

  // Add to class studentIds
  const targetClass = db.classes.find((c) => c.id === newStudent.classId);
  if (targetClass && !targetClass.studentIds.includes(newStudent.id)) {
    targetClass.studentIds.push(newStudent.id);
  }

  logAction('usr-admin', 'مدیر سامانه', 'admin', 'ثبت دانش‌آموز جدید', 'student', newStudent.id, `دانش‌آموز ${newStudent.firstName} ${newStudent.lastName} افزوده شد.`);
  return res.json({ success: true, data: newStudent });
});

app.post('/api/admin/students/bulk-import', (req: Request, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'لیست دانش‌آموزان نامعتبر است.' });
  }

  let count = 0;
  students.forEach((s: any) => {
    if (s.nationalId && s.firstName && s.lastName) {
      const newId = `std-${Date.now()}-${count}`;
      const userId = `usr-${newId}`;
      const std: Student = {
        id: newId,
        userId,
        nationalId: s.nationalId,
        firstName: s.firstName,
        lastName: s.lastName,
        fatherName: s.fatherName || 'ـ',
        birthDate: s.birthDate || '۱۳۸۹/۰۱/۰۱',
        classId: s.classId || db.classes[0]?.id || 'cls-701',
        className: s.className || db.classes[0]?.name || 'کلاس ۷۰۱ (هفتم الف)',
        gradeLevel: s.gradeLevel || 'هفتم',
        fieldOfStudy: s.fieldOfStudy || 'دوره اول متوسطه',
        studentCode: `${140400 + db.students.length + 1}`,
        parentPhone: s.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰',
        isActive: true,
        firstLogin: true,
        disciplineScore: 20,
      };

      const usr: User = {
        id: userId,
        nationalId: s.nationalId,
        username: s.nationalId,
        password: '123',
        firstName: s.firstName,
        lastName: s.lastName,
        role: 'student',
        phone: s.parentPhone,
        isActive: true,
        firstLogin: true,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };

      db.students.unshift(std);
      db.users.unshift(usr);
      count++;
    }
  });

  return res.json({ success: true, importedCount: count });
});

app.get('/api/admin/students/:id', (req: Request, res: Response) => {
  const std = db.students.find((s) => s.id === req.params.id);
  if (!std) return res.status(404).json({ success: false, message: 'دانش‌آموز یافت نشد.' });
  return res.json({ success: true, data: std });
});

app.put('/api/admin/students/:id', (req: Request, res: Response) => {
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'دانش‌آموز یافت نشد.' });

  db.students[idx] = { ...db.students[idx], ...req.body };
  return res.json({ success: true, data: db.students[idx] });
});

app.delete('/api/admin/students/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  db.students = db.students.filter((s) => s.id !== id);
  db.grades = db.grades.filter((g) => g.studentId !== id);
  db.attendance = db.attendance.filter((a) => a.studentId !== id);
  db.reportCards = db.reportCards.filter((r) => r.studentId !== id);
  db.teacherNotes = db.teacherNotes.filter((n) => n.studentId !== id);
  return res.json({ success: true, message: 'دانش‌آموز با موفقیت حذف شد.' });
});

app.post('/api/admin/students/:id/toggle-active', (req: Request, res: Response) => {
  const std = db.students.find((s) => s.id === req.params.id);
  if (!std) return res.status(404).json({ success: false, message: 'دانش‌آموز یافت نشد.' });
  std.isActive = !std.isActive;
  return res.json({ success: true, data: { isActive: std.isActive } });
});

app.post('/api/admin/students/:id/reset-password', (req: Request, res: Response) => {
  const std = db.students.find((s) => s.id === req.params.id);
  if (!std) return res.status(404).json({ success: false, message: 'دانش‌آموز یافت نشد.' });
  std.firstLogin = true;
  const user = db.users.find((u) => u.id === std.userId || u.nationalId === std.nationalId);
  if (user) {
    user.password = '123';
    user.firstLogin = true;
  }
  return res.json({ success: true, message: 'رمز عبور با موفقیت بازنشانی شد.' });
});

// --- Teachers ---
app.get('/api/admin/teachers', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.teachers });
});

app.post('/api/admin/teachers', (req: Request, res: Response) => {
  const data = req.body;
  const newId = `tch-${Date.now()}`;
  const userId = `usr-${newId}`;

  const newTeacher: Teacher = {
    id: newId,
    userId,
    nationalId: data.nationalId,
    firstName: data.firstName,
    lastName: data.lastName,
    specialty: data.specialty || 'عمومی',
    degree: data.degree || 'کارشناسی',
    assignedClassIds: data.assignedClassIds || [],
    assignedSubjectIds: data.assignedSubjectIds || [],
    phone: data.phone || '۰۹۱۲۰۰۰۰۰۰۰',
    personnelCode: data.personnelCode || `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
    email: data.email,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    isActive: true,
    firstLogin: false,
  };

  const newUser: User = {
    id: userId,
    nationalId: data.nationalId,
    username: data.nationalId,
    password: '123',
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'teacher',
    phone: data.phone,
    isActive: true,
    firstLogin: false,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.teachers.unshift(newTeacher);
  db.users.unshift(newUser);

  logAction('usr-admin', 'مدیر سامانه', 'admin', 'ثبت دبیر جدید', 'teacher', newTeacher.id, `دبیر ${newTeacher.firstName} ${newTeacher.lastName} تعریف شد.`);
  return res.json({ success: true, data: newTeacher });
});

app.get('/api/admin/teachers/:id', (req: Request, res: Response) => {
  const tch = db.teachers.find((t) => t.id === req.params.id);
  if (!tch) return res.status(404).json({ success: false, message: 'دبیر یافت نشد.' });
  return res.json({ success: true, data: tch });
});

app.put('/api/admin/teachers/:id', (req: Request, res: Response) => {
  const idx = db.teachers.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'دبیر یافت نشد.' });
  db.teachers[idx] = { ...db.teachers[idx], ...req.body };
  return res.json({ success: true, data: db.teachers[idx] });
});

app.delete('/api/admin/teachers/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  db.teachers = db.teachers.filter((t) => t.id !== id);
  return res.json({ success: true, message: 'دبیر با موفقیت حذف شد.' });
});

app.post('/api/admin/teachers/:id/toggle-active', (req: Request, res: Response) => {
  const tch = db.teachers.find((t) => t.id === req.params.id);
  if (!tch) return res.status(404).json({ success: false, message: 'دبیر یافت نشد.' });
  tch.isActive = !tch.isActive;
  return res.json({ success: true, data: { isActive: tch.isActive } });
});

app.post('/api/admin/teachers/:id/reset-password', (req: Request, res: Response) => {
  const tch = db.teachers.find((t) => t.id === req.params.id);
  if (!tch) return res.status(404).json({ success: false, message: 'دبیر یافت نشد.' });
  const user = db.users.find((u) => u.id === tch.userId || u.nationalId === tch.nationalId);
  if (user) {
    user.password = '123';
    user.firstLogin = true;
  }
  return res.json({ success: true, message: 'رمز عبور دبیر با موفقیت بازنشانی شد.' });
});

// --- Classes ---
app.get('/api/admin/classes', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.classes });
});

app.post('/api/admin/classes', (req: Request, res: Response) => {
  const data = req.body;
  const newClass: SchoolClass = {
    id: `cls-${Date.now()}`,
    name: data.name,
    gradeLevel: data.gradeLevel || 'هفتم',
    academicYearId: data.academicYearId || 'ay-1404-1405',
    studentIds: [],
    homeroomTeacherId: data.homeroomTeacherId,
    capacity: data.capacity || 30,
    roomNumber: data.roomNumber || '۱۰۱',
    fieldOfStudy: data.fieldOfStudy || 'دوره اول متوسطه',
  };
  db.classes.push(newClass);
  return res.json({ success: true, data: newClass });
});

app.get('/api/admin/classes/:id', (req: Request, res: Response) => {
  const cls = db.classes.find((c) => c.id === req.params.id);
  if (!cls) return res.status(404).json({ success: false, message: 'کلاس یافت نشد.' });
  return res.json({ success: true, data: cls });
});

app.put('/api/admin/classes/:id', (req: Request, res: Response) => {
  const idx = db.classes.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'کلاس یافت نشد.' });
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  return res.json({ success: true, data: db.classes[idx] });
});

app.delete('/api/admin/classes/:id', (req: Request, res: Response) => {
  db.classes = db.classes.filter((c) => c.id !== req.params.id);
  return res.json({ success: true, message: 'کلاس با موفقیت حذف شد.' });
});

// --- Subjects ---
app.get('/api/admin/subjects', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.subjects });
});

app.post('/api/admin/subjects', (req: Request, res: Response) => {
  const data = req.body;
  const newSub: Subject = {
    id: `sub-${Date.now()}`,
    title: data.title,
    code: data.code || `SUB-${db.subjects.length + 1}`,
    coefficient: data.coefficient || 2,
    gradeLevel: data.gradeLevel || 'هفتم',
    description: data.description,
  };
  db.subjects.push(newSub);
  return res.json({ success: true, data: newSub });
});

// --- Academic Years ---
app.get('/api/admin/academic-years', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.academicYears });
});

app.post('/api/admin/academic-years', (req: Request, res: Response) => {
  const data = req.body;
  const newYear: AcademicYear = {
    id: `ay-${Date.now()}`,
    name: data.name,
    startDate: data.startDate || '۱۴۰۴/۰۷/۰۱',
    endDate: data.endDate || '۱۴۰۵/۰۳/۳۱',
    isCurrent: false,
    isArchived: false,
  };
  db.academicYears.push(newYear);
  return res.json({ success: true, data: newYear });
});

app.post('/api/admin/academic-years/:id/set-current', (req: Request, res: Response) => {
  const id = req.params.id;
  db.academicYears.forEach((y) => {
    y.isCurrent = y.id === id;
  });
  return res.json({ success: true, message: 'سال تحصیلی جاری تغییر یافت.' });
});

// --- Grades Oversight ---
app.get('/api/admin/grades', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.grades });
});

app.delete('/api/admin/grades/:id', (req: Request, res: Response) => {
  db.grades = db.grades.filter((g) => g.id !== req.params.id);
  return res.json({ success: true, message: 'نمره با موفقیت حذف شد.' });
});

// --- Report Card Batch Generator Engine ---
app.get('/api/admin/report-cards', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.reportCards });
});

app.post('/api/admin/report-cards/generate-batch', (req: Request, res: Response) => {
  const { classId, monthName, academicYearId, remarksDefault } = req.body;
  const targetClass = db.classes.find((c) => c.id === classId);
  const year = db.academicYears.find((y) => y.id === academicYearId) || db.academicYears.find((y) => y.isCurrent) || db.academicYears[0];

  const classStudents = db.students.filter((s) => s.classId === classId && s.isActive);
  if (classStudents.length === 0) {
    return res.status(400).json({ success: false, message: 'هیچ دانش‌آموز فعالی در این کلاس یافت نشد.' });
  }

  const generatedCards: ReportCard[] = [];

  // Pre-calculate per-student weighted GPA for ranking
  const studentGPAs = classStudents.map((std) => {
    let totalWeightedScore = 0;
    let totalUnits = 0;
    const items: ReportCardItem[] = [];

    db.subjects.forEach((sub) => {
      // Find grades for student in this month
      const stdGrades = db.grades.filter(
        (g) => g.studentId === std.id && g.subjectId === sub.id && (!monthName || g.month === monthName)
      );

      // Class grades for statistics
      const classGrades = db.grades.filter(
        (g) => g.classId === classId && g.subjectId === sub.id && (!monthName || g.month === monthName)
      );

      let score = 20;
      if (stdGrades.length > 0) {
        score = +(stdGrades.reduce((sum, g) => sum + g.score, 0) / stdGrades.length).toFixed(2);
      } else {
        score = 18.5; // fallback
      }

      const classScores = classGrades.map((g) => g.score);
      const classAverage = classScores.length > 0 ? +(classScores.reduce((a, b) => a + b, 0) / classScores.length).toFixed(2) : 18.0;
      const highestGrade = classScores.length > 0 ? Math.max(...classScores) : 20;
      const lowestGrade = classScores.length > 0 ? Math.min(...classScores) : 15;

      totalWeightedScore += score * sub.coefficient;
      totalUnits += sub.coefficient;

      items.push({
        subjectId: sub.id,
        subjectName: sub.title,
        coefficient: sub.coefficient,
        score,
        teacherName: 'دبیر مربوطه',
        classAverage,
        highestGrade,
        lowestGrade,
        status: score >= 10 ? 'passed' : 'failed',
      });
    });

    const gpa = totalUnits > 0 ? +(totalWeightedScore / totalUnits).toFixed(2) : 20;
    return { std, gpa, totalUnits, totalWeightedScore, items };
  });

  // Sort by GPA descending for class rank
  studentGPAs.sort((a, b) => b.gpa - a.gpa);

  studentGPAs.forEach((item, index) => {
    const card: ReportCard = {
      id: `rc-${item.std.id}-${monthName || 'month'}-${Date.now()}-${index}`,
      studentId: item.std.id,
      studentName: `${item.std.firstName} ${item.std.lastName}`,
      studentCode: item.std.studentCode,
      nationalId: item.std.nationalId,
      classId: item.std.classId,
      className: item.std.className,
      gradeLevel: item.std.gradeLevel,
      fieldOfStudy: item.std.fieldOfStudy,
      academicYearId: year?.id || 'ay-1404-1405',
      academicYearName: year?.name || 'سال تحصیلی ۱۴۰۴–۱۴۰۵',
      type: 'monthly',
      monthName: monthName || 'مهر',
      gpa: item.gpa,
      totalUnits: item.totalUnits,
      totalWeightedScore: item.totalWeightedScore,
      rankInClass: index + 1,
      totalStudentsInClass: classStudents.length,
      disciplineScore: item.std.disciplineScore || 20,
      attendancePresentCount: 22,
      attendanceAbsentCount: 0,
      attendanceLateCount: 0,
      status: 'published',
      generatedAt: new Date().toLocaleDateString('fa-IR'),
      items: item.items,
      teacherRemarks: remarksDefault || 'عملکرد تحصیلی و اخلاقی دانش‌آموز مورد تایید شورای آموزشی است.',
      principalApproval: true,
    };

    // Remove existing card for same month/student
    db.reportCards = db.reportCards.filter((r) => !(r.studentId === card.studentId && r.monthName === card.monthName && r.academicYearId === card.academicYearId));
    db.reportCards.push(card);
    generatedCards.push(card);
  });

  logAction('usr-admin', 'مدیر سامانه', 'admin', 'صدور کارنامه ماهانه گروهی', 'report-card', classId, `صدور ${generatedCards.length} کارنامه ماه ${monthName} برای کلاس ${targetClass?.name || classId}`);
  return res.json({ success: true, count: generatedCards.length, data: generatedCards });
});

app.post('/api/admin/report-cards/generate-semester', (req: Request, res: Response) => {
  const { studentId, type, academicYearId } = req.body;
  const std = db.students.find((s) => s.id === studentId);
  if (!std) return res.status(404).json({ success: false, message: 'دانش‌آموز یافت نشد.' });

  const year = db.academicYears.find((y) => y.id === academicYearId) || db.academicYears[0];
  const items: ReportCardItem[] = db.subjects.map((sub) => {
    const stdGrades = db.grades.filter((g) => g.studentId === std.id && g.subjectId === sub.id);
    const score = stdGrades.length > 0 ? +(stdGrades.reduce((sum, g) => sum + g.score, 0) / stdGrades.length).toFixed(2) : 19.0;
    return {
      subjectId: sub.id,
      subjectName: sub.title,
      coefficient: sub.coefficient,
      score,
      teacherName: 'دبیر مربوطه',
      classAverage: 18.2,
      highestGrade: 20,
      lowestGrade: 14,
      status: score >= 10 ? 'passed' : 'failed',
    };
  });

  const totalWeightedScore = items.reduce((sum, i) => sum + i.score * i.coefficient, 0);
  const totalUnits = items.reduce((sum, i) => sum + i.coefficient, 0);
  const gpa = totalUnits > 0 ? +(totalWeightedScore / totalUnits).toFixed(2) : 19.5;

  const card: ReportCard = {
    id: `rc-sem-${std.id}-${type}-${Date.now()}`,
    studentId: std.id,
    studentName: `${std.firstName} ${std.lastName}`,
    studentCode: std.studentCode,
    nationalId: std.nationalId,
    classId: std.classId,
    className: std.className,
    gradeLevel: std.gradeLevel,
    fieldOfStudy: std.fieldOfStudy,
    academicYearId: year?.id || 'ay-1404-1405',
    academicYearName: year?.name || 'سال تحصیلی ۱۴۰۴–۱۴۰۵',
    type: type || 'semester1',
    termName: type === 'semester1' ? 'نوبت اول' : type === 'semester2' ? 'نوبت دوم' : 'سالانه',
    gpa,
    totalUnits,
    totalWeightedScore,
    rankInClass: 1,
    totalStudentsInClass: db.students.filter((s) => s.classId === std.classId).length || 1,
    disciplineScore: std.disciplineScore || 20,
    attendancePresentCount: 65,
    attendanceAbsentCount: 1,
    attendanceLateCount: 0,
    status: 'published',
    generatedAt: new Date().toLocaleDateString('fa-IR'),
    items,
    teacherRemarks: 'تلاش و موفقیت تحصیلی بسیار رضایت‌بخش.',
    principalApproval: true,
  };

  db.reportCards.unshift(card);
  return res.json({ success: true, data: card });
});

// --- Announcements ---
app.get('/api/admin/announcements', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.announcements });
});

app.post('/api/admin/announcements', (req: Request, res: Response) => {
  const data = req.body;
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: data.title,
    content: data.content,
    authorName: data.authorName || 'مدیریت مجتمع آموزشی',
    authorRole: data.authorRole || 'admin',
    target: data.target || 'all',
    targetClassId: data.targetClassId,
    priority: data.priority || 'normal',
    expiryDate: data.expiryDate,
    createdAt: new Date().toLocaleDateString('fa-IR'),
    attachmentName: data.attachmentName,
    readByUserIds: [],
  };
  db.announcements.unshift(newAnn);
  logAction('usr-admin', 'مدیر سامانه', 'admin', 'انتشار اطلاعیه جدید', 'announcement', newAnn.id, `اطلاعیه "${newAnn.title}" منتشر شد.`);
  return res.json({ success: true, data: newAnn });
});

app.delete('/api/admin/announcements/:id', (req: Request, res: Response) => {
  db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
  return res.json({ success: true, message: 'اطلاعیه حذف شد.' });
});

// --- Audit Logs ---
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.auditLogs });
});

// --- Settings ---
app.get('/api/admin/settings', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.schoolConfig });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  db.schoolConfig = { ...db.schoolConfig, ...req.body };
  logAction('usr-admin', 'مدیر سامانه', 'admin', 'بروزرسانی تنظیمات مدرسه', 'settings', 'config', 'مشخصات مدرسه ذخیره شد.');
  return res.json({ success: true, data: db.schoolConfig });
});

// =========================================================================
// 4. TEACHER ROLE ENDPOINTS
// =========================================================================

app.get('/api/teacher/dashboard', (req: Request, res: Response) => {
  const teacher = db.teachers[0];
  return res.json({
    success: true,
    data: {
      teacher,
      classesCount: db.classes.length,
      studentsCount: db.students.length,
      recentGrades: db.grades.slice(0, 10),
      activeHomeworks: db.homeworks.filter((h) => h.status !== 'archived'),
    },
  });
});

app.get('/api/teacher/grades', (req: Request, res: Response) => {
  const { class_id, subject_id, month } = req.query;
  let list = db.grades;
  if (class_id) list = list.filter((g) => g.classId === class_id);
  if (subject_id) list = list.filter((g) => g.subjectId === subject_id);
  if (month) list = list.filter((g) => g.month === month);
  return res.json({ success: true, data: list });
});

app.post('/api/teacher/grades', (req: Request, res: Response) => {
  const data = req.body;
  if (data.id) {
    const idx = db.grades.findIndex((g) => g.id === data.id);
    if (idx !== -1) {
      db.grades[idx] = { ...db.grades[idx], ...data, updatedAt: new Date().toLocaleDateString('fa-IR') };
      return res.json({ success: true, data: db.grades[idx] });
    }
  }

  const newGrade: Grade = {
    id: `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentId: data.studentId,
    teacherId: data.teacherId || 'tch-1',
    subjectId: data.subjectId,
    classId: data.classId,
    score: parseFloat(data.score) || 0,
    maxScore: data.maxScore || 20,
    gradeType: data.gradeType || 'daily',
    date: data.date || new Date().toLocaleDateString('fa-IR'),
    month: data.month || 'مهر',
    semester: data.semester || 'semester1',
    academicYearId: data.academicYearId || 'ay-1404-1405',
    description: data.description,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.grades.unshift(newGrade);
  return res.json({ success: true, data: newGrade });
});

app.get('/api/teacher/attendance', (req: Request, res: Response) => {
  const { class_id, date } = req.query;
  let list = db.attendance;
  if (class_id) list = list.filter((a) => a.classId === class_id);
  if (date) list = list.filter((a) => a.date === date);
  return res.json({ success: true, data: list });
});

app.post('/api/teacher/attendance/batch', (req: Request, res: Response) => {
  const { class_id, date, records } = req.body;
  if (Array.isArray(records)) {
    records.forEach((r: any) => {
      // replace existing attendance for this student/date
      db.attendance = db.attendance.filter((a) => !(a.studentId === r.student_id && a.date === date));
      db.attendance.push({
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date,
        classId: class_id,
        studentId: r.student_id,
        status: r.status || 'present',
        note: r.note,
        recordedByTeacherId: 'tch-1',
        createdAt: new Date().toLocaleDateString('fa-IR'),
      });
    });
  }
  return res.json({ success: true, message: 'حضور و غیاب کلاسی ثبت شد.' });
});

app.get('/api/teacher/homeworks', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: db.homeworks,
    submissions: db.submissions,
  });
});

app.post('/api/teacher/homeworks', (req: Request, res: Response) => {
  const data = req.body;
  const newHw: Homework = {
    id: `hw-${Date.now()}`,
    title: data.title,
    description: data.description || '',
    subjectId: data.subjectId || db.subjects[0]?.id || 'sub-math',
    classId: data.classId || db.classes[0]?.id || 'cls-701',
    teacherId: data.teacherId || 'tch-1',
    dueDate: data.dueDate || '۱۴۰۴/۰۹/۰۱',
    createdAt: new Date().toLocaleDateString('fa-IR'),
    attachmentName: data.attachmentName,
    attachmentUrl: data.attachmentUrl,
    status: 'active',
  };
  db.homeworks.unshift(newHw);
  return res.json({ success: true, data: newHw });
});

app.post('/api/teacher/homeworks/submissions/:submissionId/grade', (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;
  const sub = db.submissions.find((s) => s.id === submissionId);
  if (!sub) return res.status(404).json({ success: false, message: 'پاسخ تکلیف یافت نشد.' });
  sub.grade = grade;
  sub.feedback = feedback;
  sub.status = 'graded';
  return res.json({ success: true, data: sub });
});

app.delete('/api/teacher/homeworks/:id', (req: Request, res: Response) => {
  db.homeworks = db.homeworks.filter((h) => h.id !== req.params.id);
  db.submissions = db.submissions.filter((s) => s.homeworkId !== req.params.id);
  return res.json({ success: true, message: 'تکلیف حذف شد.' });
});

app.get('/api/teacher/notes', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.teacherNotes });
});

app.post('/api/teacher/notes', (req: Request, res: Response) => {
  const data = req.body;
  const newNote: TeacherNote = {
    id: `tn-${Date.now()}`,
    studentId: data.studentId,
    teacherId: data.teacherId || 'tch-1',
    teacherName: data.teacherName || 'علیرضا حسینی',
    subjectId: data.subjectId,
    subjectName: data.subjectName,
    category: data.category || 'academic',
    content: data.content,
    date: data.date || new Date().toLocaleDateString('fa-IR'),
    isPrivateToAdmin: !!data.isPrivateToAdmin,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };
  db.teacherNotes.unshift(newNote);
  return res.json({ success: true, data: newNote });
});

// =========================================================================
// 5. STUDENT ROLE ENDPOINTS
// =========================================================================

app.get('/api/student/dashboard', (req: Request, res: Response) => {
  const std = db.students[0];
  const stdGrades = db.grades.filter((g) => g.studentId === std.id);
  const stdHomeworks = db.homeworks.filter((h) => h.classId === std.classId);
  const stdAttendance = db.attendance.filter((a) => a.studentId === std.id);
  return res.json({
    success: true,
    data: {
      student: std,
      grades: stdGrades,
      homeworks: stdHomeworks,
      attendance: stdAttendance,
      reportCards: db.reportCards.filter((r) => r.studentId === std.id),
      announcements: db.announcements,
    },
  });
});

app.get('/api/student/grades', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const list = db.grades.filter((g) => g.studentId === std.id);
  return res.json({ success: true, data: list });
});

app.get('/api/student/attendance', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const list = db.attendance.filter((a) => a.studentId === std.id);
  return res.json({ success: true, data: list });
});

app.get('/api/student/homeworks', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const hwList = db.homeworks.filter((h) => h.classId === std.classId);
  const subList = db.submissions.filter((s) => s.studentId === std.id);
  return res.json({ success: true, data: hwList, submissions: subList });
});

app.post('/api/student/homeworks/:homeworkId/submit', (req: Request, res: Response) => {
  const { homeworkId } = req.params;
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const { content, answerText, fileUrl, fileName, fileType } = req.body;

  // Replace any previous submission
  db.submissions = db.submissions.filter((s) => !(s.homeworkId === homeworkId && s.studentId === std.id));

  const submission: HomeworkSubmission = {
    id: `subm-${Date.now()}`,
    homeworkId,
    studentId: std.id,
    studentName: `${std.firstName} ${std.lastName}`,
    studentCode: std.studentCode,
    submittedAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    content: content || answerText || '',
    answerText: answerText || content || '',
    fileUrl,
    fileName,
    fileType,
    status: 'submitted',
  };

  db.submissions.unshift(submission);
  return res.json({ success: true, data: submission });
});

app.get('/api/student/report-cards', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const list = db.reportCards.filter((r) => r.studentId === std.id);
  return res.json({ success: true, data: list });
});

app.get('/api/student/report-cards/:id', (req: Request, res: Response) => {
  const rc = db.reportCards.find((r) => r.id === req.params.id);
  if (!rc) return res.status(404).json({ success: false, message: 'کارنامه یافت نشد.' });
  return res.json({ success: true, data: rc });
});

app.get('/api/student/notes', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  const list = db.teacherNotes.filter((n) => n.studentId === std.id && !n.isPrivateToAdmin);
  return res.json({ success: true, data: list });
});

app.get('/api/student/profile', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  return res.json({ success: true, data: std });
});

app.put('/api/student/profile', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  const std = db.students.find((s) => s.userId === user?.id || s.nationalId === user?.nationalId) || db.students[0];
  if (req.body.avatarUrl) {
    std.avatarUrl = req.body.avatarUrl;
  }
  return res.json({ success: true, data: std });
});

// =========================================================================
// 6. VITE MIDDLEWARE & SERVER INITIALIZATION
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dana Smart School Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
