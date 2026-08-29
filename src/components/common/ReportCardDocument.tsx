import React, { useRef, useState } from 'react';
import { ReportCard } from '../../types';
import { toPersianDigits, formatScore, getGradeQualityLabel } from '../../utils/persian';
import { Printer, Download, X, Award, CheckCircle2, School, ShieldCheck, FileText, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useData } from '../../context/DataContext';

interface ReportCardDocumentProps {
  reportCard: ReportCard;
  onClose?: () => void;
  isModal?: boolean;
}

export const ReportCardDocument: React.FC<ReportCardDocumentProps> = ({
  reportCard,
  onClose,
  isModal = true,
}) => {
  const { schoolConfig } = useData();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!printRef.current) return;
    try {
      setIsExportingPng(true);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `کارنامه_${reportCard.studentName.replace(/\s+/g, '_')}_${reportCard.monthName || reportCard.termName || 'دوره'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export PNG failed:', e);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsExportingPdf(true);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`کارنامه_${reportCard.studentName.replace(/\s+/g, '_')}_${reportCard.monthName || reportCard.termName || 'دوره'}.pdf`);
    } catch (e) {
      console.error('Export PDF failed:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
              کارنامه تحصیلی رسمی - {reportCard.type === 'monthly' ? `ماه ${reportCard.monthName}` : reportCard.termName || 'دوره‌ای'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reportCard.studentName} ({reportCard.className})
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            چاپ رسمی (A4)
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {isExportingPdf ? 'تولید PDF...' : 'دریافت PDF'}
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            {isExportingPng ? 'دریافت تصویر...' : 'دریافت PNG'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={printRef}
          className="report-card-container mx-auto bg-white text-slate-900 p-8 md:p-10 rounded-2xl border-2 border-slate-900/10 shadow-lg min-w-[720px] max-w-[900px] text-right font-sans"
          style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
        >
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6">
            <div className="flex items-center justify-between">
              {/* Right: Emblem / Ministry */}
              <div className="text-right space-y-1">
                <p className="text-xs font-semibold text-slate-500">جمهوری اسلامی ایران</p>
                <p className="text-xs font-semibold text-slate-500">وزارت آموزش و پرورش</p>
                <p className="text-xs font-medium text-slate-600">اداره کل آموزش و پرورش شهر تهران</p>
              </div>

              {/* Center: School Brand */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 border border-slate-300 text-slate-800 mb-1">
                  <School className="w-6 h-6" />
                </div>
                <h1 className="text-lg md:text-xl font-black text-slate-900">
                  {schoolConfig?.schoolName || 'دبیرستان و پیش‌دانشگاهی هوشمند دانا'}
                </h1>
                <div className="inline-block px-4 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
                  کارنامه ارزشیابی تحصیلی {reportCard.type === 'monthly' ? `ماه ${reportCard.monthName}` : reportCard.termName || 'دوره‌ای'} - {toPersianDigits(reportCard.academicYearName)}
                </div>
              </div>

              {/* Left: Metadata */}
              <div className="text-left space-y-1 text-xs text-slate-600">
                <p>تاریخ صدور: <span className="font-bold">{toPersianDigits(reportCard.generatedAt)}</span></p>
                <p>کد دانش‌آموزی: <span className="font-bold font-mono">{toPersianDigits(reportCard.studentCode)}</span></p>
                <p>شماره سند: <span className="font-mono">{toPersianDigits(reportCard.id.substring(4, 14))}</span></p>
              </div>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-4 gap-3 mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">نام و نام خانوادگی: </span>
                <span className="font-bold text-slate-900">{reportCard.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500">کد ملی: </span>
                <span className="font-bold text-slate-900 font-mono">{toPersianDigits(reportCard.nationalId)}</span>
              </div>
              <div>
                <span className="text-slate-500">کلاس و پایه: </span>
                <span className="font-bold text-slate-900">{reportCard.className}</span>
              </div>
              <div>
                <span className="text-slate-500">رشته / دوره: </span>
                <span className="font-bold text-slate-900">{reportCard.fieldOfStudy || 'متوسطه اول'}</span>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="mb-6">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y-2 border-slate-800 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 text-center w-10">ردیف</th>
                  <th className="py-2.5 px-3 text-right">عنوان درس</th>
                  <th className="py-2.5 px-2 text-center w-14">ضریب</th>
                  <th className="py-2.5 px-3 text-center w-24 bg-indigo-50/70 border-x border-slate-200 font-black text-indigo-950">نمره (از ۲۰)</th>
                  <th className="py-2.5 px-2 text-center w-20">میانگین کلاس</th>
                  <th className="py-2.5 px-2 text-center w-20">بالاترین</th>
                  <th className="py-2.5 px-2 text-center w-24">ارزیابی کیفی</th>
                  <th className="py-2.5 px-3 text-right">دبیر مربوطه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportCard.items.map((item, index) => {
                  const quality = getGradeQualityLabel(item.score);
                  return (
                    <tr key={item.subjectId} className={index % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      <td className="py-2.5 px-3 text-center text-slate-500">{toPersianDigits(index + 1)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.subjectName}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{toPersianDigits(item.coefficient)}</td>
                      <td className="py-2.5 px-3 text-center font-black text-slate-900 bg-indigo-50/40 border-x border-slate-200 text-sm">
                        {formatScore(item.score)}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{formatScore(item.classAverage)}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{formatScore(item.highestGrade)}</td>
                      <td className="py-2.5 px-2 text-center font-medium">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${quality.badgeBg}`}>
                          {quality.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.teacherName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Academic Summary Box */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-300 mb-6">
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-[11px]">معدل کل دوره</p>
              <p className="text-lg font-black text-indigo-700 mt-0.5">{formatScore(reportCard.gpa)}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-[11px]">رتبه در کلاس ({toPersianDigits(reportCard.totalStudentsInClass)} نفر)</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{toPersianDigits(reportCard.rankInClass)}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-[11px]">نمره انضباط</p>
              <p className="text-lg font-black text-emerald-700 mt-0.5">{formatScore(reportCard.disciplineScore)}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-[11px]">مجموع واحدهای موثر</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{toPersianDigits(reportCard.totalUnits)} واحد</p>
            </div>
          </div>

          {/* Remarks and Discipline */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs mb-8 space-y-1.5">
            <p className="font-bold text-slate-800">ملاحظات و توصیه‌های آموزشی شورای معلمان:</p>
            <p className="text-slate-700 leading-relaxed">
              {reportCard.teacherRemarks || 'روند تحصیلی و انضباطی دانش‌آموز بسیار رضایت‌بخش ارزیابی می‌گردد.'}
            </p>
          </div>

          {/* Signatures and Stamp Block */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-300 text-center text-xs text-slate-700">
            <div className="space-y-8">
              <p className="font-bold">مهر و امضای ولی دانش‌آموز</p>
              <p className="text-[11px] text-slate-400">................................................</p>
            </div>

            <div className="space-y-8">
              <p className="font-bold">امضای دبیر راهنما / مشاور</p>
              <p className="text-[11px] text-slate-400">استاد علیرضا رضوانی</p>
            </div>

            <div className="space-y-4">
              <p className="font-bold">مهر و امضای رئیس مجتمع آموزشی</p>
              <p className="text-[11px] text-slate-500">{schoolConfig?.managerName || 'دکتر محمد رضایی'}</p>
              <div className="relative inline-flex items-center justify-center w-24 h-16 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-700 font-serif font-black text-xs rotate-[-6deg] bg-indigo-50/30">
                <span className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 mb-0.5" />
                  مهر رسمی آموزشگاه
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            این سند به صورت سیستمی از سامانه مدیریت هوشمند مدرسه دانا صادر گردیده و نسخه فیزیکی آن دارای ارزش استنادی رسمی است.
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) return content;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[95vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
