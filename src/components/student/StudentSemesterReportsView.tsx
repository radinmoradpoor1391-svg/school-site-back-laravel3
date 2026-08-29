import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Award, FileText, Calendar, CheckCircle } from 'lucide-react';
import { toPersianDigits, formatScore } from '../../utils/persian';
import { ReportCardDocument } from '../common/ReportCardDocument';
import { ReportCard } from '../../types';

export const StudentSemesterReportsView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { reportCards, generateSemesterReportCard, currentAcademicYear } = useData();

  if (!currentStudent) return null;

  // Find or allow generation of semester reports
  const semesterReports = reportCards.filter(
    (r) => r.studentId === currentStudent.id && r.type !== 'monthly'
  );

  const [activeTab, setActiveTab] = useState<'semester1' | 'semester2' | 'yearly'>('semester1');

  // Find matching report card or generate on-the-fly for viewing
  const matchedReport =
    semesterReports.find((r) => r.type === activeTab) ||
    generateSemesterReportCard(currentStudent.id, activeTab, currentAcademicYear.id);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          کارنامه‌های رسمی نوبت اول، دوم و سالانه
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          کارنامه معتبر آموزش و پرورش حاوی میانگین نمرات پایانی، تایید مدیریت و مهر مدرسه
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('semester1')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'semester1'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>کارنامه رسمی نوبت اول (دی‌ماه)</span>
        </button>

        <button
          onClick={() => setActiveTab('semester2')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'semester2'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>کارنامه رسمی نوبت دوم (خردادماه)</span>
        </button>

        <button
          onClick={() => setActiveTab('yearly')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'yearly'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>کارنامه کل سال تحصیلی (نهایی)</span>
        </button>
      </div>

      {/* Render Document */}
      {matchedReport && <ReportCardDocument reportCard={matchedReport} isModal={false} />}
    </div>
  );
};
