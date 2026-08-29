import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BookOpen,
  Calendar,
  Send,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Link2,
  Image as ImageIcon,
  UploadCloud,
  X,
  Eye,
  Maximize2,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { toPersianDigits, formatScore, getCurrentJalaliDate } from '../../utils/persian';

export const StudentHomeworkView: React.FC = () => {
  const { currentStudent } = useAuth();
  const { homeworks, submissions, submitHomework, subjects } = useData();

  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentStudent) return null;

  const studentHomeworks = homeworks.filter((h) => h.classId === currentStudent.classId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImagePreview(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent, hwId: string) => {
    e.preventDefault();
    if (!submissionText.trim() && !imagePreview) {
      setUploadError('لطفاً حداقل متن توضیحات یا یک تصویر پاسخ پیوست نمایید.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const downloadUrl = imagePreview || undefined;

      await submitHomework({
        homeworkId: hwId,
        studentId: currentStudent.id,
        studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
        studentCode: currentStudent.studentCode,
        content: submissionText || 'تصویر پاسخ تکلیف پیوست گردید.',
        answerText: submissionText,
        fileUrl: downloadUrl,
        fileName: imageFileName || (downloadUrl ? 'تصویر_پاسخ.png' : undefined),
        fileType: downloadUrl ? 'image' : undefined,
      });

      setSubmittingHwId(null);
      setSubmissionText('');
      setSelectedFile(null);
      setImagePreview(null);
      setImageFileName(null);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'خطا در ارسال تکلیف.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          تکالیف، پروژه‌ها و تمرین‌های کلاسی
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          مشاهده مهلت‌های تحویل، ارسال فایل و تصویر پاسخ دست‌نویس، و مشاهده نمره و بازخورد دبیر مربوطه
        </p>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {studentHomeworks.map((hw) => {
          const sub = subjects.find((s) => s.id === hw.subjectId);
          const studentSubmission = submissions.find(
            (s) => s.homeworkId === hw.id && s.studentId === currentStudent.id
          );
          const isSubmitted = !!studentSubmission;

          return (
            <div
              key={hw.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {sub?.title || 'درس تخصصی'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{hw.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">دبیر: {hw.teacherName || 'دبیر محترم'}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl">
                    مهلت تحویل: {toPersianDigits(hw.dueDate)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl font-bold ${
                      isSubmitted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {isSubmitted ? '✓ تحویل داده شد' : 'در انتظار تحویل'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-bold mb-1 text-slate-900 dark:text-white">دستورالعمل تکلیف:</p>
                <p>{hw.description}</p>
              </div>

              {/* Submission State or Form */}
              {isSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      پاسخ ارسال‌شده شما در تاریخ {toPersianDigits(studentSubmission.submittedAt)}:
                    </span>
                    {studentSubmission.grade !== undefined && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-sm">
                        نمره دریافت شده: {formatScore(studentSubmission.grade)} از ۲۰
                      </span>
                    )}
                  </div>

                  {studentSubmission.content && (
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{studentSubmission.content}</p>
                  )}

                  {/* Uploaded File / Image Preview */}
                  {studentSubmission.fileUrl && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">تصویر یا فایل پیوست‌شده:</p>
                      <div className="relative inline-block group">
                        <img
                          src={studentSubmission.fileUrl}
                          alt="پاسخ تکلیف"
                          className="w-32 h-24 object-cover rounded-xl border-2 border-emerald-300 dark:border-emerald-700 shadow-sm cursor-pointer group-hover:opacity-90 transition-opacity"
                          onClick={() => setZoomedImage({ url: studentSubmission.fileUrl!, title: hw.title })}
                        />
                        <button
                          onClick={() => setZoomedImage({ url: studentSubmission.fileUrl!, title: hw.title })}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {studentSubmission.feedback && (
                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">بازخورد استاد: </span>
                      {studentSubmission.feedback}
                    </div>
                  )}
                </div>
              ) : submittingHwId === hw.id ? (
                <form onSubmit={(e) => handleSubmit(e, hw.id)} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      متن پاسخ یا توضیحات تکلیف:
                    </label>
                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="متن حل تمرین، خلاصه پژوهش یا توضیحات خود را بنویسید..."
                      className="w-full p-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Image Attachment Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      تصویر پاسخ تکلیف (دست‌نویس / عکس از دفتر / اسکرین‌شات):
                    </label>
                    
                    {imagePreview ? (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                        <img
                          src={imagePreview}
                          alt="پیش‌نمایش تصویر"
                          className="w-16 h-16 object-cover rounded-xl border border-indigo-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{imageFileName || 'تصویر پیوست‌شده'}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">تصویر با موفقیت انتخاب شد</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                          title="حذف تصویر"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          کلیک کنید یا تصویر خود را اینجا بکشید
                        </p>
                        <p className="text-[11px] text-slate-400">فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadError && <p className="text-xs text-rose-500 font-bold mt-1">{uploadError}</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      ارسال نهایی تکلیف برای دبیر
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittingHwId(null);
                        setImagePreview(null);
                        setImageFileName(null);
                        setUploadError(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSubmittingHwId(hw.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  ارسال پاسخ یا تصویر برای این تکلیف
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Zoomed Image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{zoomedImage.title}</h4>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt="تصویر پاسخ تکلیف"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
