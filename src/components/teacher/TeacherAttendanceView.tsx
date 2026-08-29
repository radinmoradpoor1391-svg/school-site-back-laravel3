import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Check,
  Calendar,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';
import { toPersianDigits, getCurrentJalaliDate } from '../../utils/persian';

export const TeacherAttendanceView: React.FC = () => {
  const { currentTeacher } = useAuth();
  const { classes, students, attendance, recordBatchAttendance } = useData();

  if (!currentTeacher) return null;

  const teacherClasses = classes.filter((c) =>
    currentTeacher.assignedClassIds.includes(c.id)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacherClasses[0]?.id || classes[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentJalaliDate());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statuses, setStatuses] = useState<{
    [studentId: string]: 'present' | 'absent' | 'late' | 'excused';
  }>({});
  const [notes, setNotes] = useState<{ [studentId: string]: string }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const classStudents = students.filter((s) => s.classId === selectedClassId && s.isActive);
  const filteredStudents = classStudents.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.includes(searchQuery)
  );

  // Initialize or get student status
  const getStatus = (studentId: string): 'present' | 'absent' | 'late' | 'excused' => {
    if (statuses[studentId]) return statuses[studentId];
    const existing = attendance.find(
      (a) => a.studentId === studentId && a.date === selectedDate && a.classId === selectedClassId
    );
    return existing ? existing.status : 'present'; // Default to present
  };

  const handleStatusToggle = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: { [stdId: string]: 'present' } = {};
    classStudents.forEach((s) => {
      allPresent[s.id] = 'present';
    });
    setStatuses(allPresent);
  };

  const handleSaveAttendance = () => {
    const teacherName = `${currentTeacher.firstName} ${currentTeacher.lastName}`;
    const records = classStudents.map((std) => ({
      studentId: std.id,
      status: getStatus(std.id),
      note: notes[std.id],
    }));

    recordBatchAttendance(selectedClassId, selectedDate, records, currentTeacher.id, teacherName);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Real-time live counts
  const presentCount = classStudents.filter((s) => getStatus(s.id) === 'present').length;
  const absentCount = classStudents.filter((s) => getStatus(s.id) === 'absent').length;
  const lateCount = classStudents.filter((s) => getStatus(s.id) === 'late').length;
  const excusedCount = classStudents.filter((s) => getStatus(s.id) === 'excused').length;
  const attendanceRate = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 100;

  return (
    <div className="space-y-6 sm:space-y-8 text-right max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-900/60 mb-2">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>دفتر ثبت حضور و غیاب الکترونیک</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ثبت و مدیریت حضور روزانه
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ثبت سریع وضعیت حضور، تاخیرها و غیبت‌های موجه کلاسی
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleMarkAllPresent}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              علامت‌گذاری همه حاضر
            </button>

            <button
              onClick={handleSaveAttendance}
              className="min-h-[42px] flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ثبت نهایی دفتر</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              انتخاب کلاس:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              {teacherClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (پایه {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تاریخ ثبت (هجری شمسی):
            </label>
            <input
              type="text"
              dir="ltr"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-center font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              جستجوی دانش‌آموز:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام یا کد دانش‌آموزی..."
                className="w-full min-h-[42px] pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Attendance Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">حاضرین</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {toPersianDigits(presentCount)} نفر
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
            {toPersianDigits(attendanceRate)}٪
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">غایبین</span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {toPersianDigits(absentCount)} نفر
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تاخیر ورود</span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {toPersianDigits(lateCount)} نفر
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">غیبت موجه</span>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {toPersianDigits(excusedCount)} نفر
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs">
            {toPersianDigits(classStudents.length)} کل
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>دفتر حضور و غیاب برای تاریخ {toPersianDigits(selectedDate)} با موفقیت ثبت شد.</span>
        </div>
      )}

      {/* Attendance Roster */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            فهرست {toPersianDigits(filteredStudents.length)} دانش‌آموز
          </span>
          <span className="text-[11px] text-slate-400">با یک کلیک وضعیت را تغییر دهید</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredStudents.map((std, idx) => {
            const currentSt = getStatus(std.id);
            return (
              <div
                key={std.id}
                className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs text-slate-400 font-mono">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {std.firstName} {std.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      کد دانش‌آموزی: {toPersianDigits(std.studentCode)}
                    </p>
                  </div>
                </div>

                {/* 4 Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(std.id, 'present')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentSt === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50'
                    }`}
                  >
                    حاضر
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(std.id, 'absent')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentSt === 'absent'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50'
                    }`}
                  >
                    غایب
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(std.id, 'late')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentSt === 'late'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                    }`}
                  >
                    تاخیر
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(std.id, 'excused')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentSt === 'excused'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50'
                    }`}
                  >
                    موجه
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
