import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Teacher } from '../../types';
import {
  Search,
  X,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Command,
} from 'lucide-react';
import { toPersianDigits, toEnglishDigits } from '../../utils/persian';

interface AdminGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
  onSelectTeacher?: (teacher: Teacher) => void;
}

export const AdminGlobalSearch: React.FC<AdminGlobalSearchProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onSelectTeacher,
}) => {
  const { students, teachers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Global keydown handler for Ctrl+K or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const engDigits = toEnglishDigits(term);

    if (!term) return { matchedStudents: [], matchedTeachers: [] };

    const matchedStudents = students.filter((s) => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const nationalId = s.nationalId ? toEnglishDigits(s.nationalId) : '';
      const code = s.studentCode ? toEnglishDigits(s.studentCode).toLowerCase() : '';
      const className = (s.className || '').toLowerCase();

      return (
        fullName.includes(term) ||
        nationalId.includes(engDigits) ||
        code.includes(engDigits) ||
        className.includes(term)
      );
    });

    const matchedTeachers = teachers.filter((t) => {
      const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
      const nationalId = t.nationalId ? toEnglishDigits(t.nationalId) : '';
      const specialty = (t.specialty || '').toLowerCase();
      const pCode = t.personnelCode ? toEnglishDigits(t.personnelCode) : '';

      return (
        fullName.includes(term) ||
        nationalId.includes(engDigits) ||
        specialty.includes(term) ||
        pCode.includes(engDigits)
      );
    });

    return { matchedStudents, matchedTeachers };
  }, [searchTerm, students, teachers]);

  if (!isOpen) return null;

  const totalMatches = searchResults.matchedStudents.length + searchResults.matchedTeachers.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-6 sm:pt-20 p-2.5 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-right overflow-hidden space-y-2 sm:space-y-3 animate-in fade-in zoom-in duration-150">
        
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی سریع دانش‌آموز، کد ملی، دبیر..."
            className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm md:text-base font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] sm:text-xs font-bold hover:bg-slate-200 cursor-pointer shrink-0"
          >
            بستن
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[70vh] sm:max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4 text-xs">
          {!searchTerm ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Command className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-600 dark:text-slate-400">
                عبارت مورد نظر خود را برای جستجو در سامانه وارد کنید
              </p>
              <p className="text-[11px] text-slate-400">
                جستجو در بین {toPersianDigits(students.length)} دانش‌آموز و {toPersianDigits(teachers.length)} دبیر فعال
              </p>
            </div>
          ) : totalMatches === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <p className="font-bold text-slate-600 dark:text-slate-400">
                هیچ موردی مطابق با «{searchTerm}» یافت نشد.
              </p>
              <p className="text-[11px] text-slate-400">
                لطفاً از صحت املای نام یا کد ملی اطمینان حاصل نمایید.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Students Section */}
              {searchResults.matchedStudents.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    دانش‌آموزان ({toPersianDigits(searchResults.matchedStudents.length)} مورد)
                  </span>

                  <div className="space-y-1.5">
                    {searchResults.matchedStudents.map((std) => (
                      <div
                        key={std.id}
                        onClick={() => {
                          onClose();
                          onSelectStudent(std);
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-xs">
                            {std.firstName[0]}
                            {std.lastName[0]}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                              {std.firstName} {std.lastName}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              کلاس: {std.className} • کدملی: {toPersianDigits(std.nationalId)} • کد دانش‌آموزی: {toPersianDigits(std.studentCode)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                          <span>مشاهده پرونده</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Section */}
              {searchResults.matchedTeachers.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    دبیران و کادر آموزشی ({toPersianDigits(searchResults.matchedTeachers.length)} مورد)
                  </span>

                  <div className="space-y-1.5">
                    {searchResults.matchedTeachers.map((tch) => (
                      <div
                        key={tch.id}
                        onClick={() => {
                          onClose();
                          if (onSelectTeacher) onSelectTeacher(tch);
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                            {tch.firstName[0]}
                            {tch.lastName[0]}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                              {tch.firstName} {tch.lastName} ({tch.specialty})
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              کد ملی: {toPersianDigits(tch.nationalId)} • کد پرسنلی: {toPersianDigits(tch.personnelCode || 'نامشخص')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-purple-600 text-xs font-bold">
                          <span>مشاهده اطلاعات</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
