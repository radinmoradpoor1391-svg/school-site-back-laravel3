import apiClient from './axios';
import { Grade, AttendanceRecord, Homework, HomeworkSubmission, ReportCard, TeacherNote, Student } from '../types';

export const studentApi = {
  getDashboard: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/student/dashboard');
    return res.data;
  },

  getGrades: async () => {
    const res = await apiClient.get<{ success: boolean; data: Grade[] }>('/student/grades');
    return res.data;
  },

  getAttendance: async () => {
    const res = await apiClient.get<{ success: boolean; data: AttendanceRecord[] }>('/student/attendance');
    return res.data;
  },

  getHomeworks: async () => {
    const res = await apiClient.get<{ success: boolean; data: Homework[]; submissions: HomeworkSubmission[] }>(
      '/student/homeworks'
    );
    return res.data;
  },

  submitHomework: async (
    homeworkId: string,
    payload: { content?: string; answerText?: string; fileUrl?: string; fileName?: string; fileType?: string }
  ) => {
    const res = await apiClient.post<{ success: boolean; data: HomeworkSubmission }>(
      `/student/homeworks/${homeworkId}/submit`,
      payload
    );
    return res.data;
  },

  getReportCards: async () => {
    const res = await apiClient.get<{ success: boolean; data: ReportCard[] }>('/student/report-cards');
    return res.data;
  },

  getNotes: async () => {
    const res = await apiClient.get<{ success: boolean; data: TeacherNote[] }>('/student/notes');
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<{ success: boolean; data: Student }>('/student/profile');
    return res.data;
  },

  updateProfile: async (data: { avatarUrl?: string }) => {
    const res = await apiClient.put<{ success: boolean; data: Student }>('/student/profile', data);
    return res.data;
  },
};

export default studentApi;
