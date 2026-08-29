import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ClipboardList, Plus, CheckCircle2, MessageSquare, HeartHandshake } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const TeacherNotesView: React.FC = () => {
  const { currentTeacher } = useAuth();
  const { classes, students, teacherNotes, addTeacherNote } = useData();

  if (!currentTeacher) return null;

  const teacherClasses = classes.filter((c) =>
    currentTeacher.assignedClassIds.includes(c.id)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacherClasses[0]?.id || classes[0]?.id || ''
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [noteType, setNoteType] = useState<'educational' | 'discipline' | 'encouragement'>('educational');
  const [noteContent, setNoteContent] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const classStudents = students.filter((s) => s.classId === selectedClassId && s.isActive);
  const activeStudentId = selectedStudentId || classStudents[0]?.id || '';

  const teacherRecordedNotes = teacherNotes.filter((n) => n.teacherId === currentTeacher.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !activeStudentId) return;

    addTeacherNote({
      teacherId: currentTeacher.id,
      teacherName: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
      studentId: activeStudentId,
      content: noteContent,
      type: noteType,
    });

    setNoteContent('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          ثبت توصیه‌ها، تشویق‌ها و یادداشت‌های آموزشی
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ارسال بازخوردهای انفرادی و تربیتی برای دانش‌آموزان و مشاهده در پرونده تحصیلی آنان
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">ارسال یادداشت جدید</h3>

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>یادداشت با موفقیت در پرونده دانش‌آموز ثبت گردید.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">انتخاب کلاس:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentId('');
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {teacherClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">دانش‌آموز هدف:</label>
                <select
                  value={activeStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع یادداشت:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNoteType('educational')}
                  className={`p-2 rounded-xl font-bold transition-all ${
                    noteType === 'educational'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  مشاوره درسی
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('encouragement')}
                  className={`p-2 rounded-xl font-bold transition-all ${
                    noteType === 'encouragement'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  تشویق و تقدیر
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('discipline')}
                  className={`p-2 rounded-xl font-bold transition-all ${
                    noteType === 'discipline'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  تذکر انضباطی
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">متن توصیه یا نظر:</label>
              <textarea
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="توصیه‌های کاربردی جهت بهبود وضعیت درسی یا تشویق دانش‌آموز..."
                required
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              ثبت در پرونده دانش‌آموز
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            تاریخچه یادداشت‌های ثبت‌شده شما ({toPersianDigits(teacherRecordedNotes.length)} مورد)
          </h3>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {teacherRecordedNotes.map((note) => {
              const std = students.find((s) => s.id === note.studentId);
              return (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      برای: {std ? `${std.firstName} ${std.lastName} (${std.className})` : 'دانش‌آموز'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{toPersianDigits(note.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
