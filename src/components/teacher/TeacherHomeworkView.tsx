import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  Users,
  Award,
  ChevronDown,
  X,
} from 'lucide-react';
import { toPersianDigits, formatScore, getCurrentJalaliDate } from '../../utils/persian';

export const TeacherHomeworkView: React.FC = () => {
  const { currentTeacher } = useAuth();
  const { classes, subjects, homeworks, submissions, addHomework, deleteHomework, gradeSubmission } = useData();

  if (!currentTeacher) return null;

  const teacherClasses = classes.filter((c) =>
    currentTeacher.assignedClassIds.includes(c.id)
  );
  const teacherSubjects = subjects.filter((s) =>
    currentTeacher.assignedSubjectIds.includes(s.id)
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHwForGrading, setSelectedHwForGrading] = useState<string | null>(null);
  const [zoomedTeacherImage, setZoomedTeacherImage] = useState<{ url: string; title: string } | null>(null);

  // New Homework Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClassId, setNewClassId] = useState(teacherClasses[0]?.id || classes[0]?.id || '');
  const [newSubjectId, setNewSubjectId] = useState(teacherSubjects[0]?.id || subjects[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('۱۴۰۴/۰۸/۳۰');

  // Grading Form State
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('20');
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const teacherHomeworks = homeworks.filter((h) => h.teacherId === currentTeacher.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    addHomework({
      title: newTitle,
      description: newDesc,
      classId: newClassId,
      subjectId: newSubjectId,
      teacherId: currentTeacher.id,
      teacherName: `${currentTeacher.firstName} ${currentTeacher.lastName}`,
      dueDate: newDueDate,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleSaveGrade = (subId: string) => {
    const score = parseFloat(gradeInput);
    if (isNaN(score) || score < 0 || score > 20) {
      alert('لطفاً نمره‌ای بین ۰ تا ۲۰ وارد کنید.');
      return;
    }
    gradeSubmission(subId, score, feedbackInput);
    setGradingSubId(null);
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            مدیریت تکالیف و ارزیابی پروژه‌ها
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف تکالیف جدید با مهلت مقرر، مشاهده پاسخ‌های ارسال‌شده دانش‌آموزان و نمره‌دهی
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف تکلیف جدید</span>
        </button>
      </div>

      {/* Homework List */}
      <div className="grid gap-4">
        {teacherHomeworks.map((hw) => {
          const hwSubmissions = submissions.filter((s) => s.homeworkId === hw.id);
          const targetClass = classes.find((c) => c.id === hw.classId);
          const targetSub = subjects.find((s) => s.id === hw.subjectId);
          const isExpanded = selectedHwForGrading === hw.id;

          return (
            <div
              key={hw.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {targetClass?.name} - {targetSub?.title}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{hw.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hw.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl">
                    مهلت: {toPersianDigits(hw.dueDate)}
                  </span>
                  <button
                    onClick={() => deleteHomework(hw.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="حذف تکلیف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Submissions Toggle and Count */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  تعداد پاسخ‌های تحویل‌شده: <span className="font-bold text-slate-900 dark:text-white">{toPersianDigits(hwSubmissions.length)} نفر</span>
                </div>

                <button
                  onClick={() => setSelectedHwForGrading(isExpanded ? null : hw.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'بستن لیست تحویل‌ها' : 'مشاهده و تصحیح پاسخ‌ها'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Expanded Submissions Roster */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    پاسخ‌های ثبت‌شده دانش‌آموزان:
                  </h4>

                  {hwSubmissions.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {hwSubmissions.map((sub) => (
                        <div key={sub.id} className="py-3 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{sub.studentName}</span>
                              <span className="text-slate-400 font-mono mr-2">
                                (تحویل در {toPersianDigits(sub.submittedAt)})
                              </span>
                            </div>

                            {sub.grade !== undefined ? (
                              <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                نمره داده‌شده: {formatScore(sub.grade)} از ۲۰
                              </span>
                            ) : (
                              <button
                                onClick={() => setGradingSubId(sub.id)}
                                className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold transition-colors cursor-pointer"
                              >
                                ثبت نمره و بازخورد
                              </button>
                            )}
                          </div>

                          {sub.content && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {sub.content}
                            </div>
                          )}

                          {/* Submission Image if uploaded */}
                          {sub.fileUrl && (
                            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                              <img
                                src={sub.fileUrl}
                                alt="تصویر پاسخ تکلیف"
                                className="w-16 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setZoomedTeacherImage({ url: sub.fileUrl!, title: `${sub.studentName} - ${hw.title}` })}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">فایل یا دست‌نویس ارسالی دانش‌آموز</p>
                                <button
                                  type="button"
                                  onClick={() => setZoomedTeacherImage({ url: sub.fileUrl!, title: `${sub.studentName} - ${hw.title}` })}
                                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-0.5 cursor-pointer"
                                >
                                  مشاهده تصویر در ابعاد بزرگ ↗
                                </button>
                              </div>
                            </div>
                          )}

                          {gradingSubId === sub.id && (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    نمره (از ۲۰):
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.25"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    بازخورد یا نظر تشویقی:
                                  </label>
                                  <input
                                    type="text"
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    placeholder="مثال: پاسخ بسیار جامع و دقیق بود."
                                    className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveGrade(sub.id)}
                                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                                >
                                  ذخیره ارزیابی
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGradingSubId(null)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 text-xs cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      هنوز پاسخی از سوی دانش‌آموزان برای این تکلیف ارسال نشده است.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Homework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">تعریف تکلیف جدید برای دانش‌آموزان</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان تکلیف:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: حل تمرین‌های فصل سوم هندسه"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کلاس هدف:</label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    {teacherClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">درس مربوطه:</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    {teacherSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مهلت تحویل (هجری شمسی):</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="۱۴۰۴/۰۸/۳۰"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">دستورالعمل و توضیحات:</label>
                <textarea
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="صورت تمرین‌ها، شماره صفحات کتاب یا نحوه ارسال پاسخ را شرح دهید..."
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  ثبت و انتشار تکلیف
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Zoomed Student Image */}
      {zoomedTeacherImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setZoomedTeacherImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{zoomedTeacherImage.title}</h4>
              <button
                onClick={() => setZoomedTeacherImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center">
              <img
                src={zoomedTeacherImage.url}
                alt="تصویر ارسالی دانش‌آموز"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
