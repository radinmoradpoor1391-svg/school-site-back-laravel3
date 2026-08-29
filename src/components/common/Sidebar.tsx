import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  CalendarCheck,
  BookOpen,
  User,
  Users,
  Briefcase,
  Layers,
  FileSpreadsheet,
  Calendar,
  History,
  Settings,
  Bell,
  ClipboardList,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const { role, user } = useAuth();

  // Prevent background scrolling and handle Escape key on mobile when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const handleNav = (view: string) => {
    onSelectView(view);
    onClose();
  };

  const studentItems = [
    { id: 'dashboard', label: 'داشبورد دانش‌آموز', icon: LayoutDashboard },
    { id: 'grades', label: 'کارنامه و ریزنمرات', icon: Award },
    { id: 'monthly-reports', label: 'کارنامه‌های ماهانه', icon: FileSpreadsheet },
    { id: 'semester-reports', label: 'کارنامه نوبت اول و دوم', icon: Award },
    { id: 'attendance', label: 'حضور و غیاب', icon: CalendarCheck },
    { id: 'homework', label: 'تکالیف و تمرین‌ها', icon: BookOpen },
    { id: 'notes', label: 'توصیه‌های دبیران', icon: ClipboardList },
    { id: 'profile', label: 'پروفایل دانش‌آموز', icon: User },
  ];

  const teacherItems = [
    { id: 'dashboard', label: 'میز کار دبیر', icon: LayoutDashboard },
    { id: 'grading', label: 'ثبت نمرات کلاسی', icon: Award },
    { id: 'attendance', label: 'دفتر حضور و غیاب', icon: CalendarCheck },
    { id: 'homework', label: 'مدیریت تکالیف', icon: BookOpen },
    { id: 'notes', label: 'یادداشت‌های آموزشی', icon: ClipboardList },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'داشبورد مدیریت', icon: LayoutDashboard },
    { id: 'students', label: 'مدیریت دانش‌آموزان', icon: Users },
    { id: 'teachers', label: 'مدیریت دبیران و اساتید', icon: Briefcase },
    { id: 'classes', label: 'کلاس‌ها و پایه‌ها', icon: Layers },
    { id: 'academic-years', label: 'سال‌های تحصیلی', icon: Calendar },
    { id: 'report-cards-gen', label: 'کارنامه‌ها و گزارش‌ها', icon: FileSpreadsheet },
    { id: 'grades-oversight', label: 'نظارت بر نمرات', icon: Award },
    { id: 'announcements', label: 'تابلو اعلانات و بخشنامه‌ها', icon: Bell },
    { id: 'audit-logs', label: 'لاگ‌ها و رویدادهای سیستم', icon: History },
    { id: 'settings', label: 'تنظیمات سامانه', icon: Settings },
  ];

  const items =
    role === 'admin' ? adminItems : role === 'teacher' ? teacherItems : studentItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[280px] sm:w-64 max-w-[85vw] bg-[#0F172A] text-white flex flex-col border-l border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-0 shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/25 shrink-0">
              د
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm sm:text-base font-black tracking-tight text-white">
                مدیریت هوشمند دانا
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                سامانه یکپارچه آموزشی
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer transition-colors"
            title="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              {role === 'admin' ? (
                <Shield className="w-4 h-4" />
              ) : role === 'teacher' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs font-bold text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'کاربر مهمان'}
              </p>
              <p className="text-[10px] text-slate-400">
                {role === 'admin'
                  ? 'مدیر ارشد مجتمع'
                  : role === 'teacher'
                  ? 'دبیر تخصصی'
                  : 'دانش‌آموز'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full min-h-[44px] flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl text-xs transition-all cursor-pointer text-right ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'opacity-70'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status Badge */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <span className="text-xs text-slate-300 font-medium">سامانه برخط و پایدار است</span>
          </div>
        </div>
      </aside>
    </>
  );
};

