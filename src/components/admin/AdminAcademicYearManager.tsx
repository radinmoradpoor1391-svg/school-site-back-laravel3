import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Calendar, Plus, CheckCircle2, Archive, Sparkles, X } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';
import { AcademicYear } from '../../types';

export const AdminAcademicYearManager: React.FC = () => {
  const { academicYears, currentAcademicYear, addAcademicYear, setActiveAcademicYear } = useData();

  const [showModal, setShowModal] = useState(false);
  const [yearName, setYearName] = useState('۱۴۰۴-۱۴۰۵');
  const [startDate, setStartDate] = useState('۱۴۰۴/۰۷/۰۱');
  const [endDate, setEndDate] = useState('۱۴۰۵/۰۳/۳۱');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAcademicYear({
      name: yearName,
      startDate,
      endDate,
      isCurrent: false,
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            مدیریت سال‌های تحصیلی و دوره‌های آموزشی
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            پشتیبانی از چندین سال تحصیلی، تغییر دوره فعال، بایگانی سوابق سال‌های گذشته
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف سال تحصیلی جدید</span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {academicYears.map((ay) => {
          const isActive = ay.id === currentAcademicYear.id;
          return (
            <div
              key={ay.id}
              className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                isActive
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 font-bold">{ay.id}</span>
                {isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> دوره فعال جاری
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    بایگانی
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  سال تحصیلی {toPersianDigits(ay.name)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  شروع: {toPersianDigits(ay.startDate)} | پایان: {toPersianDigits(ay.endDate)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {!isActive ? (
                  <button
                    onClick={() => setActiveAcademicYear(ay.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    فعال‌سازی این سال تحصیلی
                  </button>
                ) : (
                  <div className="py-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    تمام داده‌های نمرات و کلاس‌ها متصل به این سال هستند.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">تعریف سال تحصیلی جدید</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان دوره:</label>
                <input
                  type="text"
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  required
                  placeholder="۱۴۰۴-۱۴۰۵"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاریخ آغاز:</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاریخ پایان:</label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
