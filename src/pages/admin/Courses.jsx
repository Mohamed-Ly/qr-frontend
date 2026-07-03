import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { fetchCourses, removeCourse, selectCourses, selectCoursesLoading, selectCoursesActionLoading, selectCoursesPagination } from '../../store/slices/coursesSlice';
import { fetchDepartments, selectDepartments } from '../../store/slices/departmentsSlice';
import { fetchUsers } from '../../store/slices/usersSlice';
import CourseModal from '../../components/admin/CourseModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function Courses() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const pagination = useSelector(selectCoursesPagination);
  const loading = useSelector(selectCoursesLoading);
  const actionLoading = useSelector(selectCoursesActionLoading);
  const departments = useSelector(selectDepartments);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // Search & Pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirmation Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchCourses({ page, limit, search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchUsers()); // needed so CourseModal can list instructors
  }, [dispatch]);

  const handleAdd  = () => { setCourseToEdit(null); setIsModalOpen(true); };
  const handleEdit = (course) => { setCourseToEdit(course); setIsModalOpen(true); };

  const promptDelete = (id) => {
    setCourseToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    const result = await dispatch(removeCourse(courseToDelete));
    if (removeCourse.fulfilled.match(result)) {
      toast.success('تم حذف المادة بنجاح');
      dispatch(fetchCourses({ page, limit, search }));
    } else {
      toast.error(result.payload || 'فشل حذف المادة');
    }
    setIsConfirmOpen(false);
    setCourseToDelete(null);
  };

  const getDeptName = (deptId) => departments.find(d => d.id === deptId)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة المواد</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 text-sm">
          <FiPlus className="w-5 h-5" /> إضافة مادة
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar: Search */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم المادة أو الكود..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiBook className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا توجد مواد مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">اسم المادة</th>
                  <th className="py-4 px-6">الكود</th>
                  <th className="py-4 px-6">القسم</th>
                  <th className="py-4 px-6">الأستاذ</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{course.name}</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-mono font-bold">{course.code}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{getDeptName(course.departmentId)}</td>
                    <td className="py-4 px-6 text-gray-600">{course.instructor?.name || '—'}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEdit(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => promptDelete(course.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="حذف">
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
        {!loading && courses.length > 0 && pagination && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي المواد: <span className="font-bold text-gray-900">{pagination.total}</span>
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

      <CourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} courseToEdit={courseToEdit} />
      
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف مادة"
        message="هل أنت متأكد من رغبتك في حذف هذه المادة؟ لا يمكن حذف المادة إذا كانت مرتبطة بطلاب مسجلين أو محاضرات."
        confirmText="نعم، احذف المادة"
        isLoading={actionLoading}
      />
    </div>
  );
}
