import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Award, Save, CheckCircle, AlertCircle, Sparkles, Filter, ChevronLeft } from 'lucide-react';
import { toPersianDigits, formatScore, getGradeQualityLabel, toEnglishDigits } from '../../utils/persian';

export const TeacherGradingView: React.FC = () => {
  const { currentTeacher } = useAuth();
  const { classes, subjects, students, grades, addGrade, updateGrade } = useData();

  if (!currentTeacher) return null;

  const teacherClasses = classes.filter((c) =>
    currentTeacher.assignedClassIds.includes(c.id)
  );
  const teacherSubjects = subjects.filter((s) =>
    currentTeacher.assignedSubjectIds.includes(s.id)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacherClasses[0]?.id || classes[0]?.id || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    teacherSubjects[0]?.id || subjects[0]?.id || ''
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('آبان');
  const [assessmentType, setAssessmentType] = useState<'continuous' | 'midterm' | 'homework' | 'final'>('continuous');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const monthsList = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'];

  // Students in selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId && s.isActive);

  // Local state for table editing
  const [scoreInputs, setScoreInputs] = useState<{ [studentId: string]: string }>({});
  const [noteInputs, setNoteInputs] = useState<{ [studentId: string]: string }>({});

  // Sync inputs with existing grades
  const getExistingGrade = (studentId: string) => {
    return grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === selectedSubjectId &&
        g.month === selectedMonth &&
        g.type === assessmentType
    );
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreInputs((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleNoteChange = (studentId: string, value: string) => {
    setNoteInputs((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSaveStudentGrade = (studentId: string) => {
    const rawVal = scoreInputs[studentId];
    const existing = getExistingGrade(studentId);

    const val = rawVal !== undefined ? parseFloat(toEnglishDigits(rawVal)) : existing?.score;
    if (val === undefined || isNaN(val) || val < 0 || val > 20) {
      alert('لطفاً نمره‌ای معتبر بین ۰ تا ۲۰ وارد نمایید.');
      return;
    }

    const teacherName = `${currentTeacher.firstName} ${currentTeacher.lastName}`;
    const note = noteInputs[studentId] !== undefined ? noteInputs[studentId] : existing?.teacherNote;

    if (existing) {
      updateGrade(existing.id, { score: val, teacherNote: note }, teacherName);
    } else {
      addGrade(
        {
          studentId,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          score: val,
          month: selectedMonth,
          type: assessmentType,
          teacherNote: note,
        },
        teacherName
      );
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveAllGrades = () => {
    classStudents.forEach((std) => {
      handleSaveStudentGrade(std.id);
    });
  };

  const handleQuickFillStandard = () => {
    const newScores: { [stdId: string]: string } = {};
    classStudents.forEach((std) => {
      const pseudo = (17 + ((std.id.charCodeAt(std.id.length - 1) % 4) * 0.75)).toFixed(1);
      newScores[std.id] = pseudo;
    });
    setScoreInputs(newScores);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <Award className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>دفتر ثبت و ویرایش نمرات کلاسی</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ثبت ارزشیابی مستمر، تکالیف و آزمون‌های ماهانه به صورت فردی یا گروهی
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickFillStandard}
              className="flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer text-center"
            >
              تکمیل نمرات پیشنهادی
            </button>
            <button
              onClick={handleSaveAllGrades}
              className="flex-1 sm:flex-none min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer text-center"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>ذخیره کلی نمرات</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">کلاس آموزشی:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              {teacherClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان درس:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              {teacherSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (ضریب {toPersianDigits(s.coefficient)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">دوره ارزشیابی (ماه):</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  ماه {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع ارزیابی:</label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              <option value="continuous">مستمر و فعالیت کلاسی</option>
              <option value="midterm">آزمون میان‌ترم کتبی</option>
              <option value="homework">تکالیف و تمرین‌ها</option>
              <option value="final">آزمون پایانی</option>
            </select>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>نمرات با موفقیت ذخیره شدند و در لاگ ثبت گردید.</span>
        </div>
      )}

      {/* Spreadsheet Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            فهرست {toPersianDigits(classStudents.length)} دانش‌آموز کلاس
          </span>
          <span className="text-[11px] text-slate-400">
            مقیاس نمرات از ۰ تا ۲۰ (اعشار با نقطه یا ممیز)
          </span>
        </div>

        {/* Mobile View: Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {classStudents.map((std, idx) => {
            const existing = getExistingGrade(std.id);
            const currentVal =
              scoreInputs[std.id] !== undefined
                ? scoreInputs[std.id]
                : existing?.score !== undefined
                ? existing.score.toString()
                : '';

            const parsedScore = parseFloat(toEnglishDigits(currentVal));
            const quality = !isNaN(parsedScore) ? getGradeQualityLabel(parsedScore) : null;

            const currentNote =
              noteInputs[std.id] !== undefined
                ? noteInputs[std.id]
                : existing?.teacherNote || '';

            return (
              <div key={std.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs text-slate-400 font-mono">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {std.firstName} {std.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        کد: {toPersianDigits(std.studentCode)}
                      </p>
                    </div>
                  </div>

                  {quality ? (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${quality.badgeBg}`}>
                      {quality.label}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">ثبت نشده</span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">نمره (۰ تا ۲۰):</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={currentVal}
                      onChange={(e) => handleScoreChange(std.id, e.target.value)}
                      placeholder="۲۰"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl text-center font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="col-span-7 sm:col-span-8">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">بازخورد دبیر:</label>
                    <input
                      type="text"
                      value={currentNote}
                      onChange={(e) => handleNoteChange(std.id, e.target.value)}
                      placeholder="توضیح اختیاری..."
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveStudentGrade(std.id)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ثبت نمره {std.firstName}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table (hidden on mobile, visible on md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ردیف</th>
                <th className="py-3 px-4">نام و نام خانوادگی</th>
                <th className="py-3 px-4">کد دانش‌آموزی</th>
                <th className="py-3 px-4 text-center w-36">نمره (از ۲۰)</th>
                <th className="py-3 px-4 text-center w-28">سطح کیفی</th>
                <th className="py-3 px-4">ملاحظات و بازخورد دبیر</th>
                <th className="py-3 px-4 text-center w-24">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.map((std, idx) => {
                const existing = getExistingGrade(std.id);
                const currentVal =
                  scoreInputs[std.id] !== undefined
                    ? scoreInputs[std.id]
                    : existing?.score !== undefined
                    ? existing.score.toString()
                    : '';

                const parsedScore = parseFloat(toEnglishDigits(currentVal));
                const quality = !isNaN(parsedScore) ? getGradeQualityLabel(parsedScore) : null;

                const currentNote =
                  noteInputs[std.id] !== undefined
                    ? noteInputs[std.id]
                    : existing?.teacherNote || '';

                return (
                  <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400">{toPersianDigits(idx + 1)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {std.firstName} {std.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{toPersianDigits(std.studentCode)}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="text"
                        dir="ltr"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(std.id, e.target.value)}
                        placeholder="نمره"
                        className="w-24 px-3 py-1.5 rounded-xl text-center font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {quality ? (
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${quality.badgeBg}`}>
                          {quality.label}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">ثبت نشده</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => handleNoteChange(std.id, e.target.value)}
                        placeholder="ثبت توضیح اختیاری..."
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSaveStudentGrade(std.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        ثبت
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
