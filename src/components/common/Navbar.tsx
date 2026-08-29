import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import {
  School,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Bell,
  Menu,
  Shield,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenLoginModal?: () => void;
  onOpenPasswordModal?: () => void;
  activeView?: string;
  onSelectView?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenLoginModal,
  onOpenPasswordModal,
  activeView,
  onSelectView,
}) => {
  const { user, role, logout, switchDemoUser, currentStudent } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { announcements } = useData();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const viewTitles: Record<string, string> = {
    dashboard: 'خلاصه وضعیت تحصیلی و آموزشی',
    grades: 'کارنامه و ریز نمرات تحصیلی',
    'monthly-reports': 'کارنامه‌های ماهانه و دوره‌ای',
    'semester-reports': 'کارنامه‌های رسمی نوبت اول و دوم',
    attendance: 'دفتر حضور و غیاب و انضباطی',
    homework: 'مدیریت و ارسال تکالیف',
    notes: 'توصیه‌ها و یادداشت‌های آموزشی دبیران',
    profile: 'پروفایل و اطلاعات کاربری',
    grading: 'میز ثبت نمرات و ارزشیابی کلاسی',
    students: 'بانک اطلاعات دانش‌آموزان (ثبت گروهی CSV)',
    teachers: 'مدیریت اساتید، دبیران و دروس',
    classes: 'مدیریت کلاس‌ها، پایه‌ها و رشته‌ها',
    'grades-oversight': 'نظارت کلی بر نمرات مدرسه',
    'report-cards-gen': 'موتور پردازش و صدور کارنامه‌ها',
    announcements: 'تابلو اعلانات و بخشنامه‌ها',
    'academic-years': 'مدیریت سال‌های تحصیلی',
    'audit-logs': 'دفتر ثبت رویدادها و لاگ‌های امنیتی',
    settings: 'تنظیمات عمومی مدرسه و کارنامه',
  };

  const currentTitle = (activeView && viewTitles[activeView]) || 'سامانه مدیریت هوشمند دانا';

  const avatarSrc = currentStudent?.avatarUrl || user?.avatarUrl;
  const userInitial = user
    ? user.firstName?.charAt(0) || user.username?.charAt(0) || 'د'
    : 'د';

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-xs">
      {/* Right side (RTL Start): Mobile toggle & Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="منوی ناوبری"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-indigo-600/20 lg:hidden shrink-0">
            د
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base md:text-lg font-black text-slate-800 dark:text-white tracking-tight truncate">
              {currentTitle}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block truncate">
              مجتمع آموزشی و دبیرستان استعدادهای درخشان دانا
            </p>
          </div>
        </div>
      </div>

      {/* Left side (RTL End): Actions & User Profile */}
      <div className="flex items-center gap-1 sm:gap-2.5 md:gap-4 shrink-0">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] rounded-full text-[11px] sm:text-xs font-bold bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100/80 transition-all cursor-pointer shadow-xs"
            title="تغییر سریع نقش برای آزمودن سامانه"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">بررسی نقش‌ها</span>
            <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
          </button>

          {showDemoSwitcher && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDemoSwitcher(false)} />
              <div
                className="absolute left-0 sm:left-auto right-auto mt-2 w-[calc(100vw-32px)] max-w-[280px] sm:w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowDemoSwitcher(false)}
              >
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">ورود سریع آزمایشی</p>
                  <p className="text-[10px] text-slate-400">تغییر فوری بدون نیاز به کلمه عبور:</p>
                </div>

                <button
                  onClick={() => {
                    switchDemoUser('admin');
                    if (onSelectView) onSelectView('dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">مدیر دمو (۳۳۳۳۳۳۳۳۳۳)</p>
                    <p className="text-[10px] text-slate-400">دانش‌آموزان، دبیران، کلاس‌ها، گزارش‌ها</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoUser('teacher');
                    if (onSelectView) onSelectView('dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">دبیر دمو (۲۲۲۲۲۲۲۲۲۲)</p>
                    <p className="text-[10px] text-slate-400">کلاس‌ها، ثبت نمرات، حضور و تکالیف</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoUser('student');
                    if (onSelectView) onSelectView('dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">دانش‌آموز دمو (۱۱۱۱۱۱۱۱۱۱)</p>
                    <p className="text-[10px] text-slate-400">نمرات، کارنامه، تکالیف و پروفایل</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="اطلاعیه‌ها و اعلانات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute left-0 sm:left-auto right-auto mt-2 w-[calc(100vw-32px)] max-w-[320px] sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 text-right"
                onClick={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">آخرین اطلاعیه‌های رسمی</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {toPersianDigits(announcements.length)} اعلان
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {announcements.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => onSelectView && onSelectView('announcements')}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs space-y-1"
                    >
                      <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{ann.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{ann.content}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{toPersianDigits(ann.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'فعالسازی حالت روشن' : 'فعالسازی حالت تاریک'}
          title={resolvedTheme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl sm:rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* User Pill - Professional Polish Style */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 p-1 sm:py-1.5 sm:px-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs min-h-[38px] sm:min-h-[42px]"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border-2 border-white dark:border-slate-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-xs sm:text-sm shrink-0">
                  {userInitial}
                </div>
              )}
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {role === 'admin' ? 'مدیر سامانه' : role === 'teacher' ? 'دبیر آموزشی' : 'دانش‌آموز'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className="absolute left-0 sm:left-auto right-auto mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 text-right"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      کد ملی: {toPersianDigits(user.nationalId || '')}
                    </p>
                  </div>

                  {onOpenPasswordModal && (
                    <button
                      onClick={onOpenPasswordModal}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-right min-h-[44px]"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      تغییر کلمه عبور
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-right min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج از حساب کاربری
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="px-3 sm:px-4 py-2 min-h-[38px] sm:min-h-[42px] rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            ورود به سامانه
          </button>
        )}
      </div>
    </header>
  );
};

