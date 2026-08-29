import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileSpreadsheet,
  Sparkles,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  Layers,
  Calendar,
  Award,
  Filter,
} from 'lucide-react';
import { toPersianDigits, formatScore } from '../../utils/persian';
import { ReportCardDocument } from '../common/ReportCardDocument';
import { ReportCard } from '../../types';

export const AdminReportCardManager: React.FC = () => {
  const {
    reportCards,
    classes,
    students,
    generateBatchMonthlyReportCards,
    generateSemesterReportCard,
    currentAcademicYear,
  } = useData();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('آبان');
  const [reportType, setReportType] = useState<'monthly' | 'semester1' | 'semester2' | 'yearly'>('monthly');

  const [generating, setGenerating] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);

  // Preview Modal
  const [previewReport, setPreviewReport] = useState<ReportCard | null>(null);

  const monthsList = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'];

  // Filter report cards in state
  const classReports = reportCards.filter((r) => {
    const std = students.find((s) => s.id === r.studentId);
    const matchesClass = !selectedClassId || std?.classId === selectedClassId;
    const matchesType = r.type === reportType;
    const matchesMonth = reportType !== 'monthly' || r.monthName === selectedMonth;
    return matchesClass && matchesType && matchesMonth;
  });

  const handleGenerateBatch = () => {
    setGenerating(true);
    setTimeout(() => {
      if (reportType === 'monthly') {
        generateBatchMonthlyReportCards(selectedClassId, selectedMonth, currentAcademicYear.id);
      } else {
        // Generate for all students in class
        const targetStudents = students.filter((s) => s.classId === selectedClassId);
        targetStudents.forEach((std) => {
          generateSemesterReportCard(std.id, reportType, currentAcademicYear.id);
        });
      }
      setGenerating(false);
      setGenerationDone(true);
      setTimeout(() => setGenerationDone(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            موتور پردازش و صدور کارنامه‌های هوشمند
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            محاسبه خودکار میانگین وزنی با ضرایب دروس، رتبه‌بندی درون‌کلاسی، ثبت نظر شورا و چاپ گروهی
          </p>
        </div>

        <button
          onClick={handleGenerateBatch}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{generating ? 'در حال محاسبه نمرات...' : 'تولید و انتشار کارنامه‌های این کلاس'}</span>
        </button>
      </div>

      {generationDone && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>کارنامه‌ها با موفقیت محاسبه شدند و در پنل دانش‌آموزان قرار گرفتند.</span>
        </div>
      )}

      {/* Settings Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع کارنامه:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="monthly">کارنامه ماهانه دوره‌ای</option>
            <option value="semester1">کارنامه رسمی نوبت اول (دی)</option>
            <option value="semester2">کارنامه رسمی نوبت دوم (خرداد)</option>
            <option value="yearly">کارنامه نهایی کل سال</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کلاس هدف:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (پایه {c.gradeLevel})
              </option>
            ))}
          </select>
        </div>

        {reportType === 'monthly' && (
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ماه ارزشیابی:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  ماه {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Generated Report Cards Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            فهرست {toPersianDigits(classReports.length)} کارنامه صادرشده
          </span>

          {classReports.length > 0 && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ گروهی همه کارنامه‌ها</span>
            </button>
          )}
        </div>

        {classReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ردیف</th>
                  <th className="py-3 px-4">نام دانش‌آموز</th>
                  <th className="py-3 px-4">کد دانش‌آموزی</th>
                  <th className="py-3 px-4 text-center">معدل کل</th>
                  <th className="py-3 px-4 text-center">رتبه در کلاس</th>
                  <th className="py-3 px-4 text-center">نمره انضباط</th>
                  <th className="py-3 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classReports.map((rc, idx) => (
                  <tr key={rc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">{toPersianDigits(idx + 1)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{rc.studentName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{toPersianDigits(rc.studentCode)}</td>
                    <td className="py-3 px-4 text-center font-black font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {formatScore(rc.gpa)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-600 font-mono">
                      {toPersianDigits(rc.rankInClass || idx + 1)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 font-mono">
                      {toPersianDigits(rc.disciplineScore || 20)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setPreviewReport(rc)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده و چاپ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            برای این کلاس و ماه هنوز کارنامه‌ای صادر نشده است. دکمه «تولید و انتشار کارنامه‌ها» را در بالا بزنید.
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <ReportCardDocument
          reportCard={previewReport}
          isModal={true}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
};
