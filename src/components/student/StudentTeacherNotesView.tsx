import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ClipboardList, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const StudentTeacherNotesView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { teacherNotes } = useData();

  if (!currentStudent) return null;

  const notes = teacherNotes.filter((n) => n.studentId === currentStudent.id);

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          توصیه‌ها و یادداشت‌های دبیران و مشاوران
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          رهنمودهای آموزشی، تشویق‌ها و موارد انضباطی جهت ارتقای فرآیند یادگیری
        </p>
      </div>

      <div className="grid gap-4">
        {notes.length > 0 ? (
          notes.map((note) => {
            const isDiscipline = note.type === 'discipline';
            const isEncouragement = note.type === 'encouragement';
            return (
              <div
                key={note.id}
                className={`p-6 rounded-3xl border space-y-3 ${
                  isEncouragement
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : isDiscipline
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{note.teacherName}</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isEncouragement ? 'تقدیر و تشویق' : isDiscipline ? 'تذکر انضباطی' : 'مشاوره آموزشی'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{toPersianDigits(note.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 text-xs">
            در حال حاضر یادداشتی ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
};
