import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Briefcase,
  Plus,
  Search,
  KeyRound,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { toPersianDigits, validateIranianNationalId, toEnglishDigits } from '../../utils/persian';
import { Teacher } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminTeacherManagement: React.FC = () => {
  const {
    teachers,
    classes,
    subjects,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    toggleTeacherActive,
    resetTeacherPassword,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [personnelCode, setPersonnelCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [degree, setDegree] = useState('کارشناسی ارشد');
  const [phone, setPhone] = useState('۰۹۱۲۰۰۰۰۰۰۰');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredTeachers = teachers.filter((t) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (t.firstName?.toLowerCase() || '').includes(q) ||
      (t.lastName?.toLowerCase() || '').includes(q) ||
      (t.specialty?.toLowerCase() || '').includes(q) ||
      (t.personnelCode?.toLowerCase() || '').includes(q) ||
      (t.nationalId || '').includes(toEnglishDigits(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFirstName('');
    setLastName('');
    setNationalId('');
    setPersonnelCode(`T-${Math.floor(100 + Math.random() * 900)}`);
    setSpecialty('ریاضیات و هندسه');
    setDegree('کارشناسی ارشد');
    setPhone('۰۹۱۲۰۰۰۰۰۰۰');
    setSelectedClassIds([classes[0]?.id || '']);
    setSelectedSubjectIds([subjects[0]?.id || '']);
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFirstName(t.firstName);
    setLastName(t.lastName);
    setNationalId(t.nationalId);
    setPersonnelCode(t.personnelCode || `T-${Math.floor(100 + Math.random() * 900)}`);
    setSpecialty(t.specialty);
    setDegree(t.degree || 'کارشناسی ارشد');
    setPhone(t.phone || '۰۹۱۲۰۰۰۰۰۰۰');
    setSelectedClassIds(t.assignedClassIds || []);
    setSelectedSubjectIds(t.assignedSubjectIds || []);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNationalId = toEnglishDigits(nationalId).trim();
    if (!cleanNationalId || cleanNationalId.length !== 10) {
      setFormError('کد ملی باید ۱۰ رقم باشد.');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: cleanNationalId,
        personnelCode: personnelCode.trim(),
        specialty: specialty.trim(),
        degree,
        phone,
        assignedClassIds: selectedClassIds,
        assignedSubjectIds: selectedSubjectIds,
      });
      setActionSuccessMsg(`اطلاعات دبیر ${firstName} ${lastName} با موفقیت ویرایش شد.`);
    } else {
      addTeacher({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: cleanNationalId,
        personnelCode: personnelCode.trim(),
        specialty: specialty.trim(),
        degree,
        phone,
        assignedClassIds: selectedClassIds,
        assignedSubjectIds: selectedSubjectIds,
      });
      setActionSuccessMsg(`دبیر جدید ${firstName} ${lastName} با موفقیت در سیستم ثبت گردید.`);
    }

    setShowModal(false);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDeleteConfirm = () => {
    if (teacherToDelete) {
      deleteTeacher(teacherToDelete.id);
      setActionSuccessMsg(`دبیر «${teacherToDelete.firstName} ${teacherToDelete.lastName}» از سیستم حذف شد.`);
      setTeacherToDelete(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleResetPassword = (t: Teacher) => {
    resetTeacherPassword(t.id);
    setActionSuccessMsg(`رمز عبور دبیر ${t.firstName} ${t.lastName} به کد ملی (${toPersianDigits(t.nationalId)}) تغییر یافت.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            مدیریت اساتید، دبیران و تخصیص دروس
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف دبیران، تنظیم رشته‌های تدریس، انتساب کلاس‌های درس و مدیریت دسترسی‌ها
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دبیر جدید</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام دبیر، کد پرسنلی، کد ملی یا تخصص تدریس..."
            className="w-full pr-10 pl-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          const tClasses = classes.filter((c) => (t.assignedClassIds || []).includes(c.id));
          const tSubjects = subjects.filter((s) => (t.assignedSubjectIds || []).includes(s.id));

          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-sm">
                      {t.firstName[0]}
                      {t.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t.firstName} {t.lastName}
                      </h3>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {t.specialty}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    }`}
                  >
                    {t.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Specs */}
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>کد پرسنلی:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(t.personnelCode)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>کد ملی (نام کاربری):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(t.nationalId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>مدرک تحصیلی:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{t.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>کلاس‌های تخصیص‌یافته:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(tClasses.length)} کلاس
                    </span>
                  </div>
                </div>

                {/* Badges of Subjects */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tSubjects.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer text-center"
                >
                  ویرایش
                </button>

                <button
                  onClick={() => handleResetPassword(t)}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 cursor-pointer"
                  title="بازنشانی رمز عبور به کد ملی"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleTeacherActive(t.id)}
                  className={`p-2 rounded-xl cursor-pointer ${
                    t.isActive
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                  title={t.isActive ? 'تعلیق حساب' : 'فعال‌سازی حساب'}
                >
                  {t.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setTeacherToDelete(t)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                  title="حذف دبیر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Delete Dialog */}
      <AdminConfirmDialog
        isOpen={!!teacherToDelete}
        title="حذف دبیر"
        message={`آیا از حذف پرونده همکار گرامی «${teacherToDelete?.firstName} ${teacherToDelete?.lastName}» از سیستم مدرسه اطمینان دارید؟`}
        confirmLabel="حذف دائم دبیر"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTeacherToDelete(null)}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              {editingTeacher ? 'ویرایش پرونده دبیر' : 'ثبت دبیر جدید'}
            </h3>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام:</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام خانوادگی:</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کد ملی (۱۰ رقم):</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رشته تخصصی / درس:</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کد پرسنلی:</label>
                  <input
                    type="text"
                    value={personnelCode}
                    onChange={(e) => setPersonnelCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مدرک تحصیلی:</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کلاس‌های تدریس:</label>
                <div className="grid grid-cols-2 gap-2">
                  {classes.map((c) => {
                    const isChecked = selectedClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                          isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedClassIds([...selectedClassIds, c.id]);
                            else setSelectedClassIds(selectedClassIds.filter((id) => id !== c.id));
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{c.name} (پایه {c.gradeLevel})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عناوین دروس:</label>
                <div className="grid grid-cols-3 gap-2">
                  {subjects.map((s) => {
                    const isChecked = selectedSubjectIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer text-[11px] ${
                          isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSubjectIds([...selectedSubjectIds, s.id]);
                            else setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== s.id));
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{s.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-colors"
                >
                  {editingTeacher ? 'ذخیره تغییرات دبیر' : 'ثبت نام دبیر جدید'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
