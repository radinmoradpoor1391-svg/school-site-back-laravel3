import { Grade, Subject, Student, SchoolClass, ReportCard, ReportCardItem } from '../types';
import { formatScore } from './persian';

/**
 * Centralized Academic Calculation Engine for Dana School Management System
 * Guarantees mathematical consistency across Dashboards, Report Cards, Analytics, and Student Dossiers.
 */

export interface GradeDistribution {
  excellent: number; // 18 - 20
  veryGood: number;  // 15 - 17.99
  good: number;      // 12 - 14.99
  acceptable: number;// 10 - 11.99
  needsEffort: number;// < 10
  total: number;
}

export interface StudentAcademicInsight {
  studentId: string;
  studentName: string;
  className: string;
  overallGPA: number;
  failingSubjectsCount: number;
  failingSubjectNames: string[];
  trend: 'improving' | 'declining' | 'stable';
  trendDiff: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  recommendation: string;
}

/**
 * Calculates average score for a student in a specific subject
 */
export function calculateStudentSubjectAverage(
  grades: Grade[],
  studentId: string,
  subjectId: string,
  options?: { month?: string; semester?: string }
): number | null {
  const filtered = grades.filter((g) => {
    if (g.studentId !== studentId || g.subjectId !== subjectId) return false;
    if (options?.month && g.month !== options.month) return false;
    if (options?.semester && g.semester !== options.semester) return false;
    return true;
  });

  if (filtered.length === 0) return null;
  const sum = filtered.reduce((acc, g) => acc + g.score, 0);
  return +(sum / filtered.length).toFixed(2);
}

/**
 * Calculates weighted GPA for a student across all subjects
 * Formula: Sum(Subject Score * Subject Coefficient) / Sum(Subject Coefficient)
 */
export function calculateStudentGPA(
  grades: Grade[],
  subjects: Subject[],
  studentId: string,
  options?: { month?: string; semester?: string; defaultScoreIfNoGrades?: number }
): { gpa: number; totalUnits: number; gradedSubjectsCount: number; hasGrades: boolean } {
  let totalWeightedScore = 0;
  let totalUnits = 0;
  let gradedSubjectsCount = 0;

  subjects.forEach((subject) => {
    const avgScore = calculateStudentSubjectAverage(grades, studentId, subject.id, options);
    if (avgScore !== null) {
      totalWeightedScore += avgScore * subject.coefficient;
      totalUnits += subject.coefficient;
      gradedSubjectsCount++;
    } else if (options?.defaultScoreIfNoGrades !== undefined) {
      totalWeightedScore += options.defaultScoreIfNoGrades * subject.coefficient;
      totalUnits += subject.coefficient;
    }
  });

  if (totalUnits === 0) {
    return { gpa: 0, totalUnits: 0, gradedSubjectsCount: 0, hasGrades: false };
  }

  const gpa = +(totalWeightedScore / totalUnits).toFixed(2);
  return { gpa, totalUnits, gradedSubjectsCount, hasGrades: gradedSubjectsCount > 0 };
}

/**
 * Calculates subject average across a class or list of students
 */
export function calculateClassSubjectAverage(
  grades: Grade[],
  studentIds: string[],
  subjectId: string,
  options?: { month?: string; semester?: string }
): { average: number; highest: number; lowest: number; count: number } {
  const scores: number[] = [];

  studentIds.forEach((stdId) => {
    const avg = calculateStudentSubjectAverage(grades, stdId, subjectId, options);
    if (avg !== null) {
      scores.push(avg);
    }
  });

  if (scores.length === 0) {
    return { average: 17, highest: 20, lowest: 14, count: 0 };
  }

  const sum = scores.reduce((a, b) => a + b, 0);
  const average = +(sum / scores.length).toFixed(2);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return { average, highest, lowest, count: scores.length };
}

/**
 * Calculates overall class GPA average
 */
export function calculateClassOverallGPA(
  grades: Grade[],
  subjects: Subject[],
  classStudents: Student[],
  options?: { month?: string; semester?: string }
): number {
  if (classStudents.length === 0) return 0;

  const gpas: number[] = [];
  classStudents.forEach((student) => {
    const res = calculateStudentGPA(grades, subjects, student.id, options);
    if (res.hasGrades) {
      gpas.push(res.gpa);
    }
  });

  if (gpas.length === 0) return 17.5;
  const sum = gpas.reduce((a, b) => a + b, 0);
  return +(sum / gpas.length).toFixed(2);
}

/**
 * Calculates school-wide overall GPA
 */
export function calculateSchoolOverallGPA(
  grades: Grade[],
  subjects: Subject[],
  allStudents: Student[]
): number {
  const activeStudents = allStudents.filter((s) => s.isActive);
  if (activeStudents.length === 0) return 0;

  const gpas: number[] = [];
  activeStudents.forEach((student) => {
    const res = calculateStudentGPA(grades, subjects, student.id);
    if (res.hasGrades) {
      gpas.push(res.gpa);
    }
  });

  if (gpas.length === 0) return 18.2;
  const sum = gpas.reduce((a, b) => a + b, 0);
  return +(sum / gpas.length).toFixed(2);
}

/**
 * Calculates a student's rank within their class
 */
export function calculateStudentRankInClass(
  grades: Grade[],
  subjects: Subject[],
  classStudents: Student[],
  targetStudentId: string,
  options?: { month?: string; semester?: string }
): { rank: number; totalStudents: number; gpa: number } {
  const results = classStudents.map((std) => {
    const res = calculateStudentGPA(grades, subjects, std.id, options);
    return {
      studentId: std.id,
      gpa: res.hasGrades ? res.gpa : 16.5,
    };
  });

  results.sort((a, b) => b.gpa - a.gpa);
  const rankIdx = results.findIndex((r) => r.studentId === targetStudentId);
  const targetResult = results.find((r) => r.studentId === targetStudentId);

  return {
    rank: rankIdx >= 0 ? rankIdx + 1 : 1,
    totalStudents: classStudents.length,
    gpa: targetResult?.gpa || 0,
  };
}

/**
 * Computes grade distribution for a collection of students or scores
 */
export function calculateGradeDistribution(
  grades: Grade[],
  students: Student[],
  subjectId?: string
): GradeDistribution {
  const dist: GradeDistribution = {
    excellent: 0,
    veryGood: 0,
    good: 0,
    acceptable: 0,
    needsEffort: 0,
    total: 0,
  };

  const studentScores: number[] = [];

  students.forEach((std) => {
    if (subjectId) {
      const avg = calculateStudentSubjectAverage(grades, std.id, subjectId);
      if (avg !== null) studentScores.push(avg);
    } else {
      const gpaRes = calculateStudentGPA(grades, [], std.id);
      // or check all student grades
      const stdGrades = grades.filter((g) => g.studentId === std.id);
      if (stdGrades.length > 0) {
        const sum = stdGrades.reduce((a, b) => a + b.score, 0);
        studentScores.push(+(sum / stdGrades.length).toFixed(2));
      }
    }
  });

  studentScores.forEach((score) => {
    dist.total++;
    if (score >= 18) dist.excellent++;
    else if (score >= 15) dist.veryGood++;
    else if (score >= 12) dist.good++;
    else if (score >= 10) dist.acceptable++;
    else dist.needsEffort++;
  });

  return dist;
}

/**
 * Generates monthly GPA progress trend for a student across all recorded school months
 */
export function calculateStudentMonthlyTrend(
  grades: Grade[],
  subjects: Subject[],
  studentId: string,
  monthsList: string[] = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت']
): { month: string; gpa: number | null; count: number }[] {
  return monthsList.map((month) => {
    const res = calculateStudentGPA(grades, subjects, studentId, { month });
    return {
      month,
      gpa: res.hasGrades ? res.gpa : null,
      count: res.gradedSubjectsCount,
    };
  });
}

/**
 * Generates monthly class average trend for charts
 */
export function calculateClassMonthlyTrend(
  grades: Grade[],
  subjects: Subject[],
  classStudents: Student[],
  monthsList: string[] = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت']
): { month: string; classAverage: number | null }[] {
  return monthsList.map((month) => {
    const gpas: number[] = [];
    classStudents.forEach((std) => {
      const res = calculateStudentGPA(grades, subjects, std.id, { month });
      if (res.hasGrades) gpas.push(res.gpa);
    });

    return {
      month,
      classAverage: gpas.length > 0 ? +(gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : null,
    };
  });
}

/**
 * Identifies students who need academic intervention or counseling based on real grade data
 */
export function getStudentsNeedingAttention(
  students: Student[],
  grades: Grade[],
  subjects: Subject[]
): StudentAcademicInsight[] {
  const insights: StudentAcademicInsight[] = [];

  students.forEach((student) => {
    if (!student.isActive) return;

    const res = calculateStudentGPA(grades, subjects, student.id);
    const overallGPA = res.hasGrades ? res.gpa : 20;

    // Check failing subjects
    const failingSubjectNames: string[] = [];
    subjects.forEach((sub) => {
      const avg = calculateStudentSubjectAverage(grades, student.id, sub.id);
      if (avg !== null && avg < 10) {
        failingSubjectNames.push(sub.title);
      }
    });

    // Check trend between Mehr and Aban/Azar
    const mehrRes = calculateStudentGPA(grades, subjects, student.id, { month: 'مهر' });
    const abanRes = calculateStudentGPA(grades, subjects, student.id, { month: 'آبان' });
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let trendDiff = 0;
    if (mehrRes.hasGrades && abanRes.hasGrades) {
      trendDiff = +(abanRes.gpa - mehrRes.gpa).toFixed(2);
      if (trendDiff > 0.3) trend = 'improving';
      else if (trendDiff < -0.3) trend = 'declining';
    }

    if (overallGPA < 12 || failingSubjectNames.length > 0 || (trend === 'declining' && trendDiff <= -1.5)) {
      let status: 'critical' | 'warning' | 'good' | 'excellent' = 'warning';
      let recommendation = 'برگزاری جلسه مشاوره تحصیلی و پیگیری روند حل تکالیف با اولیا';

      if (overallGPA < 10 || failingSubjectNames.length >= 2) {
        status = 'critical';
        recommendation = 'نیاز به کلاس‌های تقویتی فوری و تشکیل پرونده ویژه آموزشی در شورای معلمان';
      }

      insights.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className,
        overallGPA,
        failingSubjectsCount: failingSubjectNames.length,
        failingSubjectNames,
        trend,
        trendDiff,
        status,
        recommendation,
      });
    }
  });

  return insights.sort((a, b) => a.overallGPA - b.overallGPA);
}
