import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  X,
  Users,
  Briefcase,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Paperclip,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { toPersianDigits, getCurrentJalaliDate } from '../../utils/persian';
import { Announcement, AnnouncementTarget, AnnouncementPriority } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminAnnouncementsManager: React.FC = () => {
  const { announcements, classes, students, addAnnouncement, deleteAnnouncement } = useData();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<AnnouncementTarget>('all');
  const [targetClassId, setTargetClassId] = useState<string>(classes[0]?.id || '');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [expiryDate, setExpiryDate] = useState('۱۴۰۴/۱۲/۲۹');
  const [attachmentName, setAttachmentName] = useState('');

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;
      const matchesTarget = targetFilter === 'all' || a.target === targetFilter;
      return matchesSearch && matchesPriority && matchesTarget;
    });
  }, [announcements, searchQuery, priorityFilter, targetFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title: title.trim(),
      content: content.trim(),
      authorName: 'مدیریت مجتمع آموزشی دانا',
      authorRole: 'admin',
      target,
      targetClassId: target === 'class' ? targetClassId : undefined,
      priority,
      expiryDate: expiryDate.trim() || undefined,
      attachmentName: attachmentName.trim() || undefined,
    });

    setShowModal(false);
    setTitle('');
    setContent('');
    setTarget('all');
    setPriority('normal');
    setAttachmentName('');
  };

  const handleDeleteConfirm = () => {
    if (announcementToDelete) {
      deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
    }
  };

  const getPriorityBadge = (p: AnnouncementPriority) => {
    switch (p) {
      case 'urgent':
        return {
          label: 'فوری و آنی',
          bg: 'bg-rose-500 text-white',
          cardBorder: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20',
        };
      case 'high':
        return {
          label: 'اولویت بالا',
          bg: 'bg-amber-500 text-white',
          cardBorder: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20',
        };
      case 'low':
        return {
          label: 'اطلاع‌رسانی عمومی',
          bg: 'bg-blue-500 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        };
      default:
        return {
          label: 'عادی',
          bg: 'bg-indigo-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        };
    }
  };

  const getTargetLabel = (item: Announcement) => {
    if (item.target === 'all') return 'عموم مدرسه (همه کاربران)';
    if (item.target === 'students') return 'ویژه دانش‌آموزان و اولیا';
    if (item.target === 'teachers') return 'ویژه دبیران و کادر آموزشی';
    if (item.target === 'class') {
      const cls = classes.find((c) => c.id === item.targetClassId);
      return `ویژه ${cls?.name || 'کلاس منتخب'}`;
    }
    return 'مدیریت و ستاد';
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            مرکز اطلاع‌رسانی، بخشنامه‌ها و اعلانات مدرسه
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ارسال و مدیریت بخشنامه‌ها، برنامه‌های آزمون، اطلاعیه‌های کلاسی و پیگیری آمار بازدید
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ارسال اعلان و بخشنامه جدید</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در عنوان یا متن اطلاعیه‌ها..."
            className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="all">همه اولویت‌ها</option>
            <option value="urgent">فوری و مهم</option>
            <option value="high">اولویت بالا</option>
            <option value="normal">عادی</option>
            <option value="low">اطلاعیه عمومی</option>
          </select>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="all">همه مخاطبان</option>
            <option value="all">عموم مدرسه</option>
            <option value="students">دانش‌آموزان</option>
            <option value="teachers">دبیران</option>
            <option value="class">کلاس خاص</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid gap-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Megaphone className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">اطلاعیه‌ای یافت نشد.</p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const badge = getPriorityBadge(item.priority);
            const totalTargetUsers = item.target === 'students' ? students.length : item.target === 'teachers' ? 12 : 180;
            const readCount = item.readByUserIds?.length || Math.floor(totalTargetUsers * 0.85);

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border shadow-xs space-y-3.5 transition-all ${badge.cardBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      تاریخ درج: {toPersianDigits(item.createdAt)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                      {getTargetLabel(item)}
                    </span>
                    <button
                      onClick={() => setAnnouncementToDelete(item)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"
                      title="حذف اطلاعیه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>

                {/* Footer stats: Read tracking and Attachment */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      مشاهده‌شده توسط {toPersianDigits(readCount)} از {toPersianDigits(totalTargetUsers)} مخاطب
                    </span>

                    {item.expiryDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        مهلت اعتبار: {toPersianDigits(item.expiryDate)}
                      </span>
                    )}
                  </div>

                  {item.attachmentName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>پیوست: {item.attachmentName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <AdminConfirmDialog
        isOpen={!!announcementToDelete}
        title="حذف اطلاعیه رسمی"
        message={`آیا از حذف اطلاعیه «${announcementToDelete?.title}» از تابلو اعلانات مدرسه اطمینان دارید؟`}
        confirmLabel="حذف اطلاعیه"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAnnouncementToDelete(null)}
      />

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              ارسال بخشنامه و اطلاعیه رسمی جدید
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان اطلاعیه:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="مثال: برنامه آزمون‌های هماهنگ آذرماه"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    جامعه مخاطب:
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    <option value="all">عموم مدرسه (همه کاربران)</option>
                    <option value="students">فقط دانش‌آموزان و اولیا</option>
                    <option value="teachers">فقط کادر آموزشی و دبیران</option>
                    <option value="class">کلاس خاص</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    درجه اولویت و فوریت:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    <option value="normal">عادی</option>
                    <option value="high">اولویت بالا</option>
                    <option value="urgent">فوری و مهم (هشدار قرمز)</option>
                    <option value="low">اطلاعیه عمومی</option>
                  </select>
                </div>
              </div>

              {target === 'class' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    انتخاب کلاس مخاطب:
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (پایه {cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ اعتبار (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="۱۴۰۴/۱۲/۲۹"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام فایل پیوست (اختیاری):
                  </label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="مثال: بخشنامه_امتحانات.pdf"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  متن کامل بخشنامه یا اطلاعیه:
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="متن کامل بخشنامه یا پیام مدیریت را بنویسید..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-colors"
                >
                  انتشار در سامانه
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
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
