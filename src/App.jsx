import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import InstructorLayout from './components/layouts/InstructorLayout';
import StudentLayout from './components/layouts/StudentLayout';

// Public Pages
import { LandingPage, NotFoundPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Admin Pages
import AdminDashboard      from './pages/admin/Dashboard';
import AdminUsers          from './pages/admin/Users';
import AdminDepartments    from './pages/admin/Departments';
import AdminCourses        from './pages/admin/Courses';
import AdminLectures       from './pages/admin/Lectures';
import AdminEnrollments    from './pages/admin/Enrollments';
import AdminReports        from './pages/admin/Reports';
import AdminAttendanceLogs from './pages/admin/AttendanceLogs';

// Instructor Pages
import InstructorDashboard         from './pages/instructor/Dashboard';
import InstructorMyCourses         from './pages/instructor/MyCourses';
import InstructorManageLectures    from './pages/instructor/ManageLectures';
import InstructorGenerateQR        from './pages/instructor/GenerateQR';
import InstructorStudentAttendance from './pages/instructor/StudentAttendance';
import InstructorCourseReports     from './pages/instructor/CourseReports';

// Student Pages
import StudentDashboard    from './pages/student/Dashboard';
import StudentMyCourses    from './pages/student/MyCourses';
import StudentMyAttendance from './pages/student/MyAttendance';
import StudentScanQR       from './pages/student/ScanQR';
import StudentMyReports    from './pages/student/MyReports';

// Auth Selectors
import { selectIsAuthenticated, selectUserRole } from './store/slices/authSlice';

// ── Role → default path map ───────────────────────────────────
const ROLE_HOME = { ADMIN: '/admin', INSTRUCTOR: '/instructor', STUDENT: '/student' };

/**
 * GuestRoute: إذا المستخدم مسجل دخول → وجّهه للـ dashboard الخاص به
 */
function GuestRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  if (isAuth && role) return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  return children;
}

/**
 * ProtectedRoute: إذا المستخدم غير مسجل → وجّهه للـ login
 * allowedRoles: مصفوفة الأدوار المسموح بها لهذا المسار
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* ── Public Routes ─────────────────────────────── */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
          </Route>

          {/* ── Login — standalone (full-screen layout) ───── */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* ── Admin Routes ──────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route path="departments"     element={<AdminDepartments />} />
            <Route path="courses"         element={<AdminCourses />} />
            <Route path="lectures"        element={<AdminLectures />} />
            <Route path="enrollments"     element={<AdminEnrollments />} />
            <Route path="reports"         element={<AdminReports />} />
            <Route path="attendance-logs" element={<AdminAttendanceLogs />} />
          </Route>

          {/* ── Instructor Routes ─────────────────────────── */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="courses"    element={<InstructorMyCourses />} />
            <Route path="lectures"   element={<InstructorManageLectures />} />
            <Route path="qr-generate" element={<InstructorGenerateQR />} />
            <Route path="attendance" element={<InstructorStudentAttendance />} />
            <Route path="reports"    element={<InstructorCourseReports />} />
          </Route>

          {/* ── Student Routes ────────────────────────────── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses"    element={<StudentMyCourses />} />
            <Route path="attendance" element={<StudentMyAttendance />} />
            <Route path="scan"       element={<StudentScanQR />} />
            <Route path="reports"    element={<StudentMyReports />} />
          </Route>

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        rtl
      />
    </>
  );
}

export default App;
