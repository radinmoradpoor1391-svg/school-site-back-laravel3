import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { PublicHomePage } from './components/public/PublicHomePage';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentGradesView } from './components/student/StudentGradesView';
import { StudentMonthlyReportsView } from './components/student/StudentMonthlyReportsView';
import { StudentSemesterReportsView } from './components/student/StudentSemesterReportsView';
import { StudentAttendanceView } from './components/student/StudentAttendanceView';
import { StudentHomeworkView } from './components/student/StudentHomeworkView';
import { StudentTeacherNotesView } from './components/student/StudentTeacherNotesView';
import { StudentProfileView } from './components/student/StudentProfileView';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherGradingView } from './components/teacher/TeacherGradingView';
import { TeacherAttendanceView } from './components/teacher/TeacherAttendanceView';
import { TeacherHomeworkView } from './components/teacher/TeacherHomeworkView';
import { TeacherNotesView } from './components/teacher/TeacherNotesView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudentManagement } from './components/admin/AdminStudentManagement';
import { AdminTeacherManagement } from './components/admin/AdminTeacherManagement';
import { AdminClassManagement } from './components/admin/AdminClassManagement';
import { AdminGradeOversight } from './components/admin/AdminGradeOversight';
import { AdminReportCardManager } from './components/admin/AdminReportCardManager';
import { AdminAnnouncementsManager } from './components/admin/AdminAnnouncementsManager';
import { AdminAcademicYearManager } from './components/admin/AdminAcademicYearManager';
import { AdminAuditLogsView } from './components/admin/AdminAuditLogsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { user, role } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // When user role changes or logs in, reset to dashboard
  useEffect(() => {
    setCurrentView('dashboard');
  }, [role]);

  // If user is not logged in, show Public Homepage with standard Header
  if (!user || role === 'guest') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col" dir="rtl">
        <Navbar
          onOpenLoginModal={() => setShowAuthModal(true)}
          activeView="dashboard"
        />
        <div className="flex-1">
          <PublicHomePage
            onOpenLogin={(r) => {
              if (r) setAuthRole(r);
              setShowAuthModal(true);
            }}
          />
        </div>
        <AuthModal
          isOpen={showAuthModal}
          initialRole={authRole}
          onSuccess={() => {
            setCurrentView('dashboard');
          }}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // Render Portal View based on current role and view ID
  const renderCurrentView = () => {
    // Shared announcement view fallback
    if (currentView === 'announcements') {
      return <AdminAnnouncementsManager />;
    }

    // --- STUDENT VIEWS ---
    if (role === 'student') {
      switch (currentView) {
        case 'dashboard':
          return <StudentDashboard onNavigate={setCurrentView} />;
        case 'grades':
          return <StudentGradesView />;
        case 'monthly-reports':
          return <StudentMonthlyReportsView />;
        case 'semester-reports':
          return <StudentSemesterReportsView />;
        case 'attendance':
          return <StudentAttendanceView />;
        case 'homework':
          return <StudentHomeworkView />;
        case 'notes':
          return <StudentTeacherNotesView />;
        case 'profile':
          return <StudentProfileView />;
        default:
          return <StudentDashboard onNavigate={setCurrentView} />;
      }
    }

    // --- TEACHER VIEWS ---
    if (role === 'teacher') {
      switch (currentView) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={setCurrentView} />;
        case 'grading':
          return <TeacherGradingView />;
        case 'attendance':
          return <TeacherAttendanceView />;
        case 'homework':
          return <TeacherHomeworkView />;
        case 'notes':
          return <TeacherNotesView />;
        default:
          return <TeacherDashboard onNavigate={setCurrentView} />;
      }
    }

    // --- ADMIN VIEWS ---
    if (role === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentView} />;
        case 'students':
          return <AdminStudentManagement />;
        case 'teachers':
          return <AdminTeacherManagement />;
        case 'classes':
          return <AdminClassManagement />;
        case 'grades-oversight':
          return <AdminGradeOversight />;
        case 'report-cards-gen':
          return <AdminReportCardManager />;
        case 'announcements':
          return <AdminAnnouncementsManager />;
        case 'academic-years':
          return <AdminAcademicYearManager />;
        case 'audit-logs':
          return <AdminAuditLogsView />;
        case 'settings':
          return <AdminSettingsView />;
        default:
          return <AdminDashboard onNavigate={setCurrentView} />;
      }
    }

    return <div>صفحه مورد نظر یافت نشد.</div>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" dir="rtl">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLoginModal={() => setShowAuthModal(true)}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        activeView={currentView}
        onSelectView={(view) => setCurrentView(view)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-y-auto w-full max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
