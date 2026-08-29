import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Layers, Plus, BookOpen, Edit2, Trash2, X, CheckCircle, Users } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';
import { ClassEntity, Subject } from '../../types';

export const AdminClassManagement: React.FC = () => {
  const { classes, subjects, students, teachers, addClass, updateClass, addSubject } = useData();

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  // Modal State
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);

  // Class Form
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('هفتم');
  const [roomNumber, setRoomNumber] = useState('101');
  const [fieldOfStudy, setFieldOfStudy] = useState('عمومی');

  // Subject Form
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('SUB-001');
  const [subjectCoeff, setSubjectCoeff] = useState('3');
  const [subjectGradeLevel, setSubjectGradeLevel] = useState('هفتم');

  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassName('کلاس نهم ج');
    setGradeLevel('نهم');
    setRoomNumber('303');
    setFieldOfStudy('عمومی');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (c: ClassEntity) => {
    setEditingClass(c);
    setClassName(c.name);
    setGradeLevel(c.gradeLevel);
    setRoomNumber(c.roomNumber);
    setFieldOfStudy(c.fieldOfStudy || 'عمومی');
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name: className,
        gradeLevel,
        roomNumber,
        fieldOfStudy,
      });
    } else {
      addClass({
        name: className,
        gradeLevel,
        academicYearId: 'ay-1403-1404',
        roomNumber,
        fieldOfStudy,
        studentIds: [],
        subjectIds: subjects.map((s) => s.id),
      });
    }
    setShowClassModal(false);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      title: subjectTitle,
      code: subjectCode,
      coefficient: parseInt(subjectCoeff) || 2,
      gradeLevel: subjectGradeLevel,
      description: `درس ${subjectTitle} پایه ${subjectGradeLevel}`,
    });
    setShowSubjectModal(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            مدیریت کلاس‌ها، پایه‌ها و دروس مصوب
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            پیکربندی ساختار آموزشی مدرسه، تعیین ضرایب دروس و شماره اتاق‌های آموزشی
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'classes' ? (
            <button
              onClick={handleOpenAddClass}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد کلاس جدید</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSubjectTitle('');
                setSubjectCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
                setSubjectCoeff('3');
                setShowSubjectModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف درس جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>کلاس‌ها و پایه‌ها ({toPersianDigits(classes.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دروس و ضرایب ({toPersianDigits(subjects.length)})</span>
        </button>
      </div>

      {/* Tab 1: Classes Grid */}
      {activeTab === 'classes' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    پایه {cls.gradeLevel}
                  </span>
                  <span className="text-xs font-mono text-slate-400">اتاق {toPersianDigits(cls.roomNumber)}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">رشته تحصیلی: {cls.fieldOfStudy || 'عمومی'}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    دانش‌آموزان ثبت‌نامی:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {toPersianDigits(classStudents.length || 30)} نفر
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenEditClass(cls)}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ویرایش تنظیمات کلاس
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tab 2: Subjects Table */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ردیف</th>
                <th className="py-3 px-4">عنوان درس</th>
                <th className="py-3 px-4">کد درس</th>
                <th className="py-3 px-4 text-center">ضریب آموزشی</th>
                <th className="py-3 px-4">پایه تحصیلی</th>
                <th className="py-3 px-4">توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-center text-slate-400">{toPersianDigits(idx + 1)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sub.title}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{toPersianDigits(sub.code)}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600 font-mono text-sm">
                    {toPersianDigits(sub.coefficient)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">پایه {sub.gradeLevel}</td>
                  <td className="py-3 px-4 text-slate-400">{sub.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <button
              onClick={() => setShowClassModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingClass ? 'ویرایش کلاس' : 'ایجاد کلاس جدید'}
            </h3>

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام کلاس:</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="مثال: کلاس هفتم الف"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">پایه تحصیلی:</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="هفتم">هفتم</option>
                    <option value="هشتم">هشتم</option>
                    <option value="نهم">نهم</option>
                    <option value="دهم">دهم</option>
                    <option value="یازدهم">یازدهم</option>
                    <option value="دوازدهم">دوازدهم</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شماره اتاق / کلاس:</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <button
              onClick={() => setShowSubjectModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">تعریف درس مصوب جدید</h3>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان درس:</label>
                <input
                  type="text"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  required
                  placeholder="مثال: هندسه و استدلال"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ضریب در کارنامه:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectCoeff}
                    onChange={(e) => setSubjectCoeff(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">پایه تحصیلی:</label>
                  <select
                    value={subjectGradeLevel}
                    onChange={(e) => setSubjectGradeLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="هفتم">هفتم</option>
                    <option value="هشتم">هشتم</option>
                    <option value="نهم">نهم</option>
                    <option value="دهم">دهم</option>
                    <option value="یازدهم">یازدهم</option>
                    <option value="دوازدهم">دوازدهم</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                >
                  افزودن درس
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
