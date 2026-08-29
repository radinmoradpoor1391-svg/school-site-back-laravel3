import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Settings, RefreshCw, Save, School, ShieldCheck, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const AdminSettingsView: React.FC = () => {
  const { schoolConfig, updateSchoolConfig, resetDatabaseToDefault } = useData();

  const [schoolName, setSchoolName] = useState(schoolConfig?.schoolName || 'مجتمع آموزشی و دبیرستان نمونه دانا');
  const [managerName, setManagerName] = useState(schoolConfig?.managerName || 'دکتر محمد رضایی');
  const [district, setDistrict] = useState(schoolConfig?.district || 'منطقه ۶ آموزش و پرورش');
  const [province, setProvince] = useState(schoolConfig?.province || 'تهران');
  const [academicYear, setAcademicYear] = useState(schoolConfig?.academicYear || '۱۴۰۴–۱۴۰۵');
  const [phone, setPhone] = useState(schoolConfig?.phone || '۰۲۱-۸۸۹۹۰۰۱۱');
  const [address, setAddress] = useState(schoolConfig?.address || 'تهران، خیابان ولیعصر، نرسیده به میدان ونک، مجتمع آموزشی دانا');
  const [passGrade, setPassGrade] = useState((schoolConfig?.passGrade ?? 10).toString());

  useEffect(() => {
    if (schoolConfig) {
      setSchoolName(schoolConfig.schoolName || '');
      setManagerName(schoolConfig.managerName || '');
      setDistrict(schoolConfig.district || '');
      setProvince(schoolConfig.province || '');
      setAcademicYear(schoolConfig.academicYear || '');
      setPhone(schoolConfig.phone || '');
      setAddress(schoolConfig.address || '');
      setPassGrade((schoolConfig.passGrade ?? 10).toString());
    }
  }, [schoolConfig]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig({
      schoolName,
      managerName,
      district,
      province,
      academicYear,
      phone,
      address,
      passGrade: parseFloat(passGrade) || 10,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const [resetSuccessMsg, setResetSuccessMsg] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetDatabaseToDefault();
      setResetConfirm(false);
      setResetSuccessMsg(true);
      setTimeout(() => setResetSuccessMsg(false), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 text-right max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          تنظیمات عمومی مدرسه و پیکربندی کارنامه‌ها
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تنظیم اطلاعات سربرگ رسمی، نام مدیریت، منطقه آموزش و پرورش و بازنشانی پایگاه داده
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تنظیمات مدرسه با موفقیت ذخیره شدند و روی سربرگ کارنامه‌ها اعمال گردیدند.</span>
        </div>
      )}

      {resetSuccessMsg && (
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>پایگاه داده ابری سامانه با موفقیت به ۱۸۰ دانش‌آموز، ۱۵ دبیر و ۶ کلاس اولیه بازنشانی شد.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام رسمی مجتمع آموزشی / مدرسه:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نام مدیر مجتمع:</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">منطقه آموزش و پرورش:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">استان / شهر:</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کف نمره قبولی در کارنامه:</label>
              <input
                type="number"
                value={passGrade}
                onChange={(e) => setPassGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center font-bold"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شماره تلفن تماس مدرسه:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نشانی پستی مدرسه:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات پیکربندی</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/60 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
              بازنشانی پایگاه داده به وضعیت اولیه مدرسه نمونه
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              در صورت تمایل به بازنشانی کامل اطلاعات ۱۸۰ دانش‌آموز، ۱۵ معلم، نمرات و گزارش‌های اولیه، از این دکمه استفاده نمایید.
            </p>
          </div>
        </div>

        {resetConfirm ? (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-300 dark:border-rose-800">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
              آیا از بازنشانی داده‌ها کاملاً اطمینان دارید؟
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
            >
              بله، بازنشانی کن
            </button>
            <button
              type="button"
              onClick={() => setResetConfirm(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs cursor-pointer"
            >
              انصراف
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بازنشانی پایگاه داده به وضعیت کارخانه</span>
          </button>
        )}
      </div>
    </div>
  );
};
