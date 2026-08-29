import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FileSpreadsheet, Printer, Download, Award, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { toPersianDigits, formatScore, getOrderedSchoolMonths, getCurrentJalaliMonthName } from '../../utils/persian';
import { ReportCardDocument } from '../common/ReportCardDocument';
import { ReportCard } from '../../types';

export const StudentMonthlyReportsView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { reportCards, currentAcademicYear, generateMonthlyReportCards } = useData();

  if (!currentStudent) return null;

  const studentReports = reportCards.filter(
    (r) => r.studentId === currentStudent.id && r.type === 'monthly'
  );

  // Sort reports according to standard school months order
  const orderedMonths = getOrderedSchoolMonths();
  studentReports.sort((a, b) => {
    const idxA = orderedMonths.indexOf(a.monthName || '');
    const idxB = orderedMonths.indexOf(b.monthName || '');
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const [selectedReportId, setSelectedReportId] = useState<string>(
    studentReports[0]?.id || ''
  );

  useEffect(() => {
    if (studentReports.length > 0) {
      if (!selectedReportId || !studentReports.some((r) => r.id === selectedReportId)) {
        setSelectedReportId(studentReports[0].id);
      }
    }
  }, [studentReports, selectedReportId]);

  const selectedReport = studentReports.find((r) => r.id === selectedReportId) || studentReports[0] || null;

  const currentMonthName = getCurrentJalaliMonthName();
  const hasCurrentMonthReport = studentReports.some((r) => r.monthName === currentMonthName);

  const handleGenerateCurrentMonth = () => {
    if (!currentStudent) return;
    const generated = generateMonthlyReportCards(currentStudent.classId, currentMonthName, currentAcademicYear.id);
    const myCard = generated.find((c) => c.studentId === currentStudent.id);
    if (myCard) {
      setSelectedReportId(myCard.id);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              کارنامه‌های ماهانه و دوره‌ای
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              مشاهده کارنامه‌های ماهانه با ضریب دروس، معدل کل، رتبه در کلاس و امکان چاپ و دریافت PDF/PNG
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!hasCurrentMonthReport && (
              <button
                onClick={handleGenerateCurrentMonth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                استعلام کارنامه ماه جاری ({currentMonthName})
              </button>
            )}
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
              {toPersianDigits(currentAcademicYear.name)}
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector Tabs */}
      {studentReports.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {studentReports.map((rc) => {
            const isSelected = selectedReport?.id === rc.id;
            return (
              <button
                key={rc.id}
                onClick={() => setSelectedReportId(rc.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>کارنامه ماه {rc.monthName}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  معدل: {formatScore(rc.gpa)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Document View */}
      {selectedReport ? (
        <ReportCardDocument reportCard={selectedReport} isModal={false} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 text-xs">
          <p className="mb-4">هنوز کارنامه‌ای برای این دانش‌آموز صادر نشده است.</p>
          <button
            onClick={handleGenerateCurrentMonth}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            صدور کارنامه ماه جاری ({currentMonthName})
          </button>
        </div>
      )}
    </div>
  );
};
