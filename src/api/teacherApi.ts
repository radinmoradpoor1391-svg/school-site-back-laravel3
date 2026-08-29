import apiClient from './axios';
import { Grade, AttendanceRecord, Homework, HomeworkSubmission, TeacherNote } from '../types';

export const teacherApi = {
  getDashboard: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/teacher/dashboard');
    return res.data;
  },

  getGrades: async (params?: { class_id?: string; subject_id?: string; month?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Grade[] }>('/teacher/grades', { params });
    return res.data;
  },

  saveGrade: async (grade: Partial<Grade>) => {
    const res = await apiClient.post<{ success: boolean; data: Grade }>('/teacher/grades', grade);
    return res.data;
  },

  getAttendance: async (params?: { class_id?: string; date?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: AttendanceRecord[] }>('/teacher/attendance', { params });
    return res.data;
  },

  saveAttendanceBatch: async (payload: {
    class_id: string;
    date: string;
    records: { student_id: string; status: string; note?: string }[];
  }) => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/teacher/attendance/batch', payload);
    return res.data;
  },

  getHomeworks: async () => {
    const res = await apiClient.get<{ success: boolean; data: Homework[]; submissions: HomeworkSubmission[] }>(
      '/teacher/homeworks'
    );
    return res.data;
  },

  createHomework: async (homework: Partial<Homework>) => {
    const res = await apiClient.post<{ success: boolean; data: Homework }>('/teacher/homeworks', homework);
    return res.data;
  },

  deleteHomework: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(`/teacher/homeworks/${id}`);
    return res.data;
  },

  gradeSubmission: async (submissionId: string, grade: number, feedback?: string) => {
    const res = await apiClient.post<{ success: boolean; data: HomeworkSubmission }>(
      `/teacher/homeworks/submissions/${submissionId}/grade`,
      { grade, feedback }
    );
    return res.data;
  },

  getNotes: async () => {
    const res = await apiClient.get<{ success: boolean; data: TeacherNote[] }>('/teacher/notes');
    return res.data;
  },

  createNote: async (note: Partial<TeacherNote>) => {
    const res = await apiClient.post<{ success: boolean; data: TeacherNote }>('/teacher/notes', note);
    return res.data;
  },
};

export default teacherApi;
