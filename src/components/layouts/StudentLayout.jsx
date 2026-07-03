import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiBook, FiCheckCircle, FiCamera, FiPieChart, FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { selectCurrentUser } from '../../store/slices/authSlice';

const NAV_ITEMS = [
  { path: '/student',            icon: FiHome,        label: 'لوحة التحكم', end: true },
  { path: '/student/courses',    icon: FiBook,        label: 'موادي' },
  { path: '/student/attendance', icon: FiCheckCircle, label: 'سجل حضوري' },
  { path: '/student/scan',       icon: FiCamera,      label: 'مسح رمز QR' },
  // { path: '/student/reports',    icon: FiPieChart,    label: 'تقاريري' },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="بوابة الطالب"
        navItems={NAV_ITEMS}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="فتح القائمة"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-800">بوابة الطالب</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'الطالب'}</span>
            <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {user?.name?.[0] || 'ط'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
