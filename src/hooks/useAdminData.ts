import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { Student, Teacher, SchoolClass, Subject, SchoolConfig, ReportCard } from '../types';

/**
 * Custom Hook to fetch and manage Students from Laravel Admin API (GET /admin/students)
 */
export function useAdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getStudents();
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست دانش‌آموزان از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    isLoading,
    error,
    isEmpty: !isLoading && !error && students.length === 0,
    refetch: fetchStudents,
    setStudents,
  };
}

/**
 * Custom Hook to fetch and manage Teachers from Laravel Admin API (GET /admin/teachers)
 */
export function useAdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getTeachers();
      if (res.success && res.data) {
        setTeachers(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست دبیران از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    isLoading,
    error,
    isEmpty: !isLoading && !error && teachers.length === 0,
    refetch: fetchTeachers,
    setTeachers,
  };
}

/**
 * Custom Hook to fetch and manage Classes from Laravel Admin API (GET /admin/classes)
 */
export function useAdminClasses() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getClasses();
      if (res.success && res.data) {
        setClasses(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست کلاس‌ها از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    isLoading,
    error,
    isEmpty: !isLoading && !error && classes.length === 0,
    refetch: fetchClasses,
    setClasses,
  };
}

/**
 * Custom Hook to fetch and manage Subjects from Laravel Admin API (GET /admin/subjects)
 */
export function useAdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getSubjects();
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست دروس از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    isEmpty: !isLoading && !error && subjects.length === 0,
    refetch: fetchSubjects,
    setSubjects,
  };
}

/**
 * Custom Hook to fetch and manage Settings from Laravel Admin API (GET /admin/settings)
 */
export function useAdminSettings() {
  const [settings, setSettings] = useState<SchoolConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت تنظیمات مدرسه از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    isEmpty: !isLoading && !error && !settings,
    refetch: fetchSettings,
    setSettings,
  };
}

/**
 * Custom Hook to fetch and manage Report Cards from Laravel Admin API (GET /admin/report-cards)
 */
export function useAdminReportCards() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getReportCards();
      if (res.success && res.data) {
        setReportCards(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست کارنامه‌ها از سرور لاراول');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportCards();
  }, [fetchReportCards]);

  return {
    reportCards,
    isLoading,
    error,
    isEmpty: !isLoading && !error && reportCards.length === 0,
    refetch: fetchReportCards,
    setReportCards,
  };
}
