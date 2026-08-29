import React from 'react';
import { useData } from '../../context/DataContext';
import {
  School,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Compass,
  Laptop,
  CheckCircle2,
  Atom,
  Trophy,
  HeartHandshake,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface PublicHomePageProps {
  onOpenLogin: (role?: 'student' | 'teacher' | 'admin') => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({ onOpenLogin }) => {
  const { announcements, teachers, classes, subjects } = useData();

  const facilities = [
    {
      title: 'آزمایشگاه مرکزی علوم و نانو',
      desc: 'مجهز به میکروسکوپ‌های الکترونی، کیت‌های آزمایشگاهی شیمی و حسگرهای داده‌برداری فیزیک',
      icon: Atom,
      tag: 'پژوهش‌محور',
    },
    {
      title: 'سایت تخصصی کامپیوتر و هوش مصنوعی',
      desc: 'سیستم‌های مجهز برای برنامه‌نویسی پایتون، الگوریتم، کارگاه رباتیک و طراحی وب',
      icon: Laptop,
      tag: 'فناوری نوین',
    },
    {
      title: 'کتابخانه تخصصی و سالن مطالعه',
      desc: 'دارای بیش از ۶,۰۰۰ جلد کتاب مرجع علمی، المپیادی و ادبیات کهن با فضای مطالعه استاندارد',
      icon: BookOpen,
      tag: 'مطالعه آرام',
    },
    {
      title: 'مجموعه ورزشی چندمنظوره سرپوشیده',
      desc: 'زمین استاندارد فوتسال، والیبال، بسکتبال و سالن تنیس روی میز با مربیان مجرب',
      icon: Trophy,
      tag: 'نشاط و سلامت',
    },
  ];

  return (
    <div className="space-y-16 pb-16 text-right">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Right Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>سامانه یکپارچه آموزش هوشمند سال تحصیلی ۱۴۰۴–۱۴۰۵</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight">
                مجتمع آموزشی و دبیرستان هوشمند دانا
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-blue-500 mt-2">
                  پرورش استعداد، تفکر نقاد و اخلاق‌مداری
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                محیطی پویا و الهام‌بخش با بهره‌گیری از اساتید برجسته دانشگاه‌های تراز اول، زیرساخت‌های آزمایشگاهی پیشرفته، ارزیابی مستمر تحصیلی و صدور لحظه‌ای کارنامه‌های هوشمند برای ۱۸۰ دانش‌آموز برگزیده.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>ورود دانش‌آموزان و اولیا</span>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </button>

                <button
                  onClick={() => onOpenLogin('teacher')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span>ورود کادر آموزشی و دبیران</span>
                </button>

                <button
                  onClick={() => onOpenLogin('admin')}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>پورتال مدیریت</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>سامانه اختصاصی نمرات و حضور و غیاب</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>صدور کارنامه ماهانه با استاندارد رسمی</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>امنیت کامل و مبتنی بر وب</span>
                </div>
              </div>
            </div>

            {/* Left Interactive Highlights Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">کارت پایش تحصیلی دانا</p>
                      <p className="text-[11px] text-slate-400">آمار زنده سال تحصیلی جاری</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    فعال و آنلاین
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">دانش‌آموزان فعال</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{toPersianDigits(180)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">در ۶ کلاس تخصصی</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">کادر هیئت علمی</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{toPersianDigits(teachers.length)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">دبیران با سابقه بالا</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">میانگین معدل مدرسه</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{toPersianDigits('۱۹.۱۵')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">نمرات نوبت گذشته</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">نرخ حضور منظم</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{toPersianDigits('۹۸.۴٪')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">انضباط و حضور مستمر</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      افتخارات اخیر: کسب ۵ مدال طلای المپیاد و رتبه‌های تک‌رقمی
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Introduction & Philosophy */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>رویکرد تربیتی و چشم‌انداز</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            فلسفه آموزشی و تعهد ما به دانش‌پژوهان
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            ما در مجتمع دانا باور داریم آموزش تنها انتقال فرمول‌ها نیست؛ بلکه پرورش تفکر خلاق، مسئولیت‌پذیری اجتماعی و عشق به دانستن است.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">آموزش پژوهش‌محور و مفهومی</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تمرکز بر درک عمیق مفاهیم دروس ریاضی، علوم و فناوری با آزمایش‌های عملی و ارائه‌های کلاسی به‌جای حفظیات مقطعی.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">مشاوره فردی و پایش روانی</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              حضور مستمر مشاوران تربیتی و برنامه‌ریزی اختصاصی تحصیلی متناسب با روحیات و توانمندی‌های منحصر‌به‌فرد هر دانش‌آموز.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">شفافیت کامل برای اولیای گرامی</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              دسترسی آنی به گزارش‌های حضور و غیاب، نمرات هفتگی، تکالیف و کارنامه‌های رسمی ماهانه از طریق پنل اختصاصی اولیا.
            </p>
          </div>
        </div>
      </section>

      {/* Classes Overview */}
      <section id="classes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>پایه‌های آموزشی دانا</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            کلاس‌های فعال دوره اول متوسطه
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ظرفیت محدود ۳۰ نفره در هر کلاس جهت تضمین کیفیت آموزش و تعامل حداکثری با دبیر
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  پایه {cls.gradeLevel}
                </span>
                <span className="text-xs text-slate-400 font-mono">اتاق {toPersianDigits(cls.roomNumber)}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">{cls.name}</h3>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>تعداد دانش‌آموزان ثبت‌نامی:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{toPersianDigits(30)} نفر (تکمیل)</span>
                </div>
                <div className="flex justify-between">
                  <span>تعداد دروس فعال:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{toPersianDigits(subjects.length)} درس مصوب</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Elite Faculty Showcase */}
      <section id="teachers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>هیئت علمی و دبیران</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            کادر برجسته آموزشی مجتمع دانا
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            جمعی از نخبگان و اساتید با تجربه در حوزه آموزش و هدایت تحصیلی نوجوانان
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {teachers.slice(0, 8).map((tch) => (
            <div
              key={tch.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white mx-auto flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                {tch.firstName.charAt(0)}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {tch.firstName} {tch.lastName}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {tch.specialty}
                </p>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {tch.degree}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* School Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Atom className="w-3.5 h-3.5" />
            <span>امکانات و تجهیزات فیزیکی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            فضاهای آموزشی استاندارد و مجهز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            فراهم‌سازی بستری ایمن و پیشرفته برای یادگیری علمی، ورزشی و مهارتی
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {fac.tag}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{fac.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{fac.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* News & Announcements */}
      <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>اخبار و رویدادهای مدرسه</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            تازه‌ترین اطلاعیه‌های رسمی
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {announcements.slice(0, 4).map((ann) => (
            <div
              key={ann.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {ann.authorRole}
                </span>
                <span className="text-slate-400">{toPersianDigits(ann.createdAt)}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">{ann.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ann.content}</p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>نویسنده: {ann.authorName}</span>
                <button
                  onClick={() => onOpenLogin('student')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  مشاهده جزئیات در پنل &larr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Important Education Portals & Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">پیوندهای مهم و سامانه‌های وزارت آموزش و پرورش</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">دسترسی مستقیم به پایگاه‌های علمی و آزمون‌های کشوری</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://medu.ir"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span>وزارت آموزش و پرورش</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://shad.ir"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span>شبکه آموزشی دانش‌آموز (شاد)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://roshd.ir"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span>شبکه ملی مدارس (رشد)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Map Card */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-indigo-900 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/20">
                ارتباط با دبیرخانه و روابط عمومی
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                همواره مشتاق پاسخگویی به اولیای گرامی و دانش‌آموزان عزیز هستیم
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                جهت هماهنگی دیدارهای حضوری با مدیریت، مشاوران و کادر آموزشی می‌توانید در ساعات اداری با شماره‌های زیر تماس حاصل فرمایید.
              </p>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-indigo-300" />
                  </div>
                  <span>تلفن تماس: ۰۲۱-۸۸۲۲۳۳۴۴ | ۰۲۱-۸۸۲۲۳۳۴۵</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-indigo-300" />
                  </div>
                  <span>پست الکترونیک: info@dana-school.ir</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-300" />
                  </div>
                  <span>نشانی: تهران، خیابان ولیعصر، نرسیده به میدان ونک، کوچه شادمان، پلاک ۱۸</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-indigo-300" />
                  </div>
                  <span>ساعات کاری: شنبه تا چهارشنبه، ساعت ۷:۳۰ الی ۱۵:۰۰</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 space-y-4">
              <h3 className="font-bold text-base text-white">پورتال ورود کاربران سامانه</h3>
              <p className="text-xs text-indigo-200">
                دانش‌آموزان و دبیران محترم با فشردن دکمه زیر می‌توانند با کد ملی خود وارد سامانه شوند:
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition-colors shadow-lg cursor-pointer"
                >
                  ورود دانش‌آموز / اولیا
                </button>
                <button
                  onClick={() => onOpenLogin('teacher')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-indigo-700/80 hover:bg-indigo-700 text-white border border-white/20 transition-colors cursor-pointer"
                >
                  ورود اساتید و دبیران
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              مجتمع آموزشی هوشمند دانا - تمامی حقوق محفوظ است © ۱۴۰۴
            </span>
          </div>
          <p className="text-[11px]">
            طراحی و توسعه سامانه مدیریت یکپارچه آموزشی منطبق با استانداردهای آموزش و پرورش کشور
          </p>
        </div>
      </footer>
    </div>
  );
};
