import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUsers, FiPlus, FiTrash2, FiSearch, FiChevronRight, FiChevronLeft, FiBook } from 'react-icons/fi';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import { fetchCourseStudents, unenrollStudent, selectEnrollmentStudents, selectEnrollmentPagination, selectEnrollmentsLoading, selectEnrollmentsActionLoading } from '../../store/slices/enrollmentsSlice';
import EnrollmentModal from '../../components/admin/EnrollmentModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function Enrollments() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const students = useSelector(selectEnrollmentStudents);
  const pagination = useSelector(selectEnrollmentPagination);
  const loading = useSelector(selectEnrollmentsLoading);
  const actionLoading = useSelector(selectEnrollmentsActionLoading);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Search & Pagination for Students
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [studentToUnenroll, setStudentToUnenroll] = useState(null);

  // Load all courses once
  useEffect(() => {
    dispatch(fetchCourses({ limit: 100 })); // Get max 100 courses for dropdown
  }, [dispatch]);

  // Load students when course, page, or search changes
  useEffect(() => {
    if (!selectedCourseId) return;
    const timer = setTimeout(() => {
      dispatch(fetchCourseStudents({ courseId: selectedCourseId, params: { page, limit, search } }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, selectedCourseId, page, limit, search]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSearch('');
    setPage(1);
  };

  const promptUnenroll = (studentId) => {
    setStudentToUnenroll(studentId);
    setIsConfirmOpen(true);
  };

  const confirmUnenroll = async () => {
    if (!studentToUnenroll || !selectedCourseId) return;
    const result = await dispatch(unenrollStudent({ studentId: studentToUnenroll, courseId: selectedCourseId }));
    
    if (unenrollStudent.fulfilled.match(result)) {
      toast.success('تم حذف الطالب من المادة بنجاح');
      dispatch(fetchCourseStudents({ courseId: selectedCourseId, params: { page, limit, search } }));
    } else {
      toast.error(result.payload || 'فشل حذف الطالب من المادة');
    }
    setIsConfirmOpen(false);
    setStudentToUnenroll(null);
  };

  const getStatusBadge = (status) =>
    status === 'ACTIVE'
      ? <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold">نشط</span>
      : <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">غير نشط</span>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة التسجيلات</h1>
      </div>

      {/* Course Selector Section */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">اختر المادة لعرض وإدارة الطلاب المسجلين</label>
        <div className="relative max-w-md">
          <FiBook className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
          >
            <option value="">-- اختر المادة --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourseId && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث برقم الطالب، الاسم..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button onClick={() => setIsEnrollModalOpen(true)} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all text-sm">
              <FiPlus className="w-5 h-5" /> تسجيل طالب جديد
            </button>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FiUsers className="w-12 h-12 mb-3 text-gray-300" />
              <p>لا يوجد طلاب مسجلين في هذه المادة.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                  <tr>
                    <th className="py-4 px-6">رقم الطالب</th>
                    <th className="py-4 px-6">الاسم</th>
                    <th className="py-4 px-6">البريد الإلكتروني</th>
                    <th className="py-4 px-6">الحالة</th>
                    <th className="py-4 px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-gray-600">{student.studentNumber || '—'}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{student.name}</td>
                      <td className="py-4 px-6 text-gray-500" dir="ltr">{student.email}</td>
                      <td className="py-4 px-6">{getStatusBadge(student.status)}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center">
                          <button onClick={() => promptUnenroll(student.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="إلغاء التسجيل">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && students.length > 0 && pagination && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500 font-medium">
                إجمالي الطلاب: <span className="font-bold text-gray-900">{pagination.total}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-gray-700 px-2">
                  صفحة {page} من {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCourseId && (
        <EnrollmentModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          courseId={selectedCourseId}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmUnenroll}
        title="إلغاء تسجيل الطالب"
        message="هل أنت متأكد من رغبتك في حذف هذا الطالب من المادة؟ سيتم حذفه من سجلات غياب هذه المادة فقط."
        confirmText="نعم، احذف الطالب"
        isLoading={actionLoading}
      />
    </div>
  );
}
