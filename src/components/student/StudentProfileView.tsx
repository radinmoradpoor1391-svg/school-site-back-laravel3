import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, KeyRound, Phone, MapPin, Award, School, ShieldCheck, Camera, Trash2, CheckCircle2, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const StudentProfileView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { updateStudent } = useData();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentStudent) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(30);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const downloadUrl = event.target?.result as string;
        setUploadProgress(100);
        await updateStudent(currentStudent.id, { avatarUrl: downloadUrl });
        setSuccessMessage('تصویر پروفایل شما با موفقیت در سامانه ذخیره و به‌روزرسانی شد.');
        setErrorMessage(null);
        setIsUploading(false);
        setTimeout(() => setSuccessMessage(null), 4000);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در بارگذاری تصویر.');
      setSuccessMessage(null);
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    await updateStudent(currentStudent.id, { avatarUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessMessage('تصویر پروفایل شما حذف گردید.');
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 text-right max-w-4xl mx-auto">
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 dark:border-slate-800 pb-6">
          {/* Avatar with Upload overlay */}
          <div className="relative group">
            {currentStudent.avatarUrl ? (
              <img
                src={currentStudent.avatarUrl}
                alt={`${currentStudent.firstName} ${currentStudent.lastName}`}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-100 dark:border-indigo-900/60 shadow-lg shadow-indigo-600/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-indigo-600/20 border-4 border-indigo-100 dark:border-indigo-900/60">
                {currentStudent.firstName.charAt(0)}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="بارگذاری / تغییر تصویر پروفایل"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <div className="text-center sm:text-right space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {currentStudent.firstName} {currentStudent.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                دانش‌آموز فعال
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              کلاس {currentStudent.className} | {currentStudent.gradeLevel} {currentStudent.fieldOfStudy ? `(${currentStudent.fieldOfStudy})` : ''} | نام پدر: {currentStudent.fatherName}
            </p>

            {currentStudent.avatarUrl && (
              <button
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline pt-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف تصویر پرسنلی
              </button>
            )}
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <KeyRound className="w-4 h-4" />
            <span>تغییر کلمه عبور</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400">کد ملی دانش‌آموز:</span>
            <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {toPersianDigits(currentStudent.nationalId)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400">کد اختصاصی دانش‌آموزی:</span>
            <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {toPersianDigits(currentStudent.studentCode)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400">شماره تماس ولی / اضطراری:</span>
            <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {toPersianDigits(currentStudent.parentPhone || '۰۹۱۲۰۰۰۰۰۰۰')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400">نمره پیش‌فرض انضباط:</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              {toPersianDigits(currentStudent.disciplineScore || 20)} از ۲۰
            </p>
          </div>
        </div>

        {/* Security & Access Box */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="leading-relaxed">
            این حساب کاربری به صورت امن در سرور مرکزی دانا احراز هویت شده است. در صورت نیاز به ویرایش مشخصات سجلی به واحد فناوری و آموزش مراجعه نمایید.
          </p>
        </div>
      </div>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
};
