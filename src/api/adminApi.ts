import apiClient from './axios';
import {
  Student,
  Teacher,
  SchoolClass,
  Subject,
  Grade,
  Announcement,
  ReportCard,
  AuditLog,
  AcademicYear,
  SchoolConfig,
} from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Admin API Service interacting with Laravel 12 Admin Endpoints
 */
export const adminApi = {
  // --- STUDENTS ---
  getStudents: async (): Promise<{ success: boolean; data: Student[] }> => {
    const res = await apiClient.get<{ success: boolean; data: Student[] }>('/admin/students');
    return res.data;
  },

  createStudent: async (student: Partial<Student>): Promise<{ success: boolean; data: Student }> => {
    const res = await apiClient.post<{ success: boolean; data: Student }>('/admin/students', student);
    return res.data;
  },

  bulkImportStudents: async (students: Partial<Student>[]): Promise<{ success: boolean; importedCount: number }> => {
    const res = await apiClient.post<{ success: boolean; importedCount: number }>('/admin/students/bulk-import', { students });
    return res.data;
  },

  getStudent: async (id: string): Promise<{ success: boolean; data: Student }> => {
    const res = await apiClient.get<{ success: boolean; data: Student }>(`/admin/students/${id}`);
    return res.data;
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<{ success: boolean; data: Student }> => {
    const res = await apiClient.put<{ success: boolean; data: Student }>(`/admin/students/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/students/${id}`);
    return res.data;
  },

  toggleStudentActive: async (id: string): Promise<{ success: boolean; data: { isActive: boolean } }> => {
    const res = await apiClient.post<{ success: boolean; data: { isActive: boolean } }>(`/admin/students/${id}/toggle-active`);
    return res.data;
  },

  resetStudentPassword: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(`/admin/students/${id}/reset-password`);
    return res.data;
  },

  // --- TEACHERS ---
  getTeachers: async (): Promise<{ success: boolean; data: Teacher[] }> => {
    const res = await apiClient.get<{ success: boolean; data: Teacher[] }>('/admin/teachers');
    return res.data;
  },

  createTeacher: async (teacher: Partial<Teacher>): Promise<{ success: boolean; data: Teacher }> => {
    const res = await apiClient.post<{ success: boolean; data: Teacher }>('/admin/teachers', teacher);
    return res.data;
  },

  getTeacher: async (id: string): Promise<{ success: boolean; data: Teacher }> => {
    const res = await apiClient.get<{ success: boolean; data: Teacher }>(`/admin/teachers/${id}`);
    return res.data;
  },

  updateTeacher: async (id: string, data: Partial<Teacher>): Promise<{ success: boolean; data: Teacher }> => {
    const res = await apiClient.put<{ success: boolean; data: Teacher }>(`/admin/teachers/${id}`, data);
    return res.data;
  },

  deleteTeacher: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/teachers/${id}`);
    return res.data;
  },

  toggleTeacherActive: async (id: string): Promise<{ success: boolean; data: { isActive: boolean } }> => {
    const res = await apiClient.post<{ success: boolean; data: { isActive: boolean } }>(`/admin/teachers/${id}/toggle-active`);
    return res.data;
  },

  resetTeacherPassword: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(`/admin/teachers/${id}/reset-password`);
    return res.data;
  },

  // --- CLASSES ---
  getClasses: async (): Promise<{ success: boolean; data: SchoolClass[] }> => {
    const res = await apiClient.get<{ success: boolean; data: SchoolClass[] }>('/admin/classes');
    return res.data;
  },

  createClass: async (cls: Partial<SchoolClass>): Promise<{ success: boolean; data: SchoolClass }> => {
    const res = await apiClient.post<{ success: boolean; data: SchoolClass }>('/admin/classes', cls);
    return res.data;
  },

  updateClass: async (id: string, data: Partial<SchoolClass>): Promise<{ success: boolean; data: SchoolClass }> => {
    const res = await apiClient.put<{ success: boolean; data: SchoolClass }>(`/admin/classes/${id}`, data);
    return res.data;
  },

  deleteClass: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/classes/${id}`);
    return res.data;
  },

  // --- SUBJECTS ---
  getSubjects: async (): Promise<{ success: boolean; data: Subject[] }> => {
    const res = await apiClient.get<{ success: boolean; data: Subject[] }>('/admin/subjects');
    return res.data;
  },

  createSubject: async (sub: Partial<Subject>): Promise<{ success: boolean; data: Subject }> => {
    const res = await apiClient.post<{ success: boolean; data: Subject }>('/admin/subjects', sub);
    return res.data;
  },

  // --- ACADEMIC YEARS ---
  getAcademicYears: async (): Promise<{ success: boolean; data: AcademicYear[] }> => {
    const res = await apiClient.get<{ success: boolean; data: AcademicYear[] }>('/admin/academic-years');
    return res.data;
  },

  createAcademicYear: async (year: Partial<AcademicYear>): Promise<{ success: boolean; data: AcademicYear }> => {
    const res = await apiClient.post<{ success: boolean; data: AcademicYear }>('/admin/academic-years', year);
    return res.data;
  },

  setCurrentAcademicYear: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(`/admin/academic-years/${id}/set-current`);
    return res.data;
  },

  // --- GRADES OVERSIGHT ---
  getGrades: async (): Promise<{ success: boolean; data: Grade[] }> => {
    const res = await apiClient.get<{ success: boolean; data: Grade[] }>('/admin/grades');
    return res.data;
  },

  deleteGrade: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/grades/${id}`);
    return res.data;
  },

  // --- REPORT CARDS ---
  getReportCards: async (): Promise<{ success: boolean; data: ReportCard[] }> => {
    const res = await apiClient.get<{ success: boolean; data: ReportCard[] }>('/admin/report-cards');
    return res.data;
  },

  generateBatchMonthly: async (payload: {
    classId: string;
    monthName: string;
    academicYearId?: string;
    remarksDefault?: string;
  }): Promise<{ success: boolean; count: number; data: ReportCard[] }> => {
    const res = await apiClient.post<{ success: boolean; count: number; data: ReportCard[] }>(
      '/admin/report-cards/generate-batch',
      payload
    );
    return res.data;
  },

  generateSemester: async (payload: {
    studentId: string;
    type: string;
    academicYearId?: string;
  }): Promise<{ success: boolean; data: ReportCard }> => {
    const res = await apiClient.post<{ success: boolean; data: ReportCard }>(
      '/admin/report-cards/generate-semester',
      payload
    );
    return res.data;
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements: async (): Promise<{ success: boolean; data: Announcement[] }> => {
    const res = await apiClient.get<{ success: boolean; data: Announcement[] }>('/admin/announcements');
    return res.data;
  },

  createAnnouncement: async (ann: Partial<Announcement>): Promise<{ success: boolean; data: Announcement }> => {
    const res = await apiClient.post<{ success: boolean; data: Announcement }>('/admin/announcements', ann);
    return res.data;
  },

  deleteAnnouncement: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/announcements/${id}`);
    return res.data;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: async (): Promise<{ success: boolean; data: AuditLog[] }> => {
    const res = await apiClient.get<{ success: boolean; data: AuditLog[] }>('/admin/audit-logs');
    return res.data;
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<{ success: boolean; data: SchoolConfig }> => {
    const res = await apiClient.get<{ success: boolean; data: SchoolConfig }>('/admin/settings');
    return res.data;
  },

  updateSettings: async (config: Partial<SchoolConfig>): Promise<{ success: boolean; data: SchoolConfig }> => {
    const res = await apiClient.put<{ success: boolean; data: SchoolConfig }>('/admin/settings', config);
    return res.data;
  },
};

export default adminApi;
