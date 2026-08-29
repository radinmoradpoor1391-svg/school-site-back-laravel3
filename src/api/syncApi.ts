import apiClient from './axios';
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
  SchoolConfig,
} from '../types';

export const syncApi = {
  getAll: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
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
        schoolConfig: SchoolConfig;
      };
    }>('/sync/all');
    return res.data;
  },
};

export default syncApi;
