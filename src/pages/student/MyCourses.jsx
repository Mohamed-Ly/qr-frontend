import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiBook, FiSearch, FiChevronRight, FiChevronLeft, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { enrollmentsService } from '../../store/services/enrollmentsService';

export default function MyCourses() {
  const user = useSelector(selectCurrentUser);

  // Data state
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const params = { page, limit };
        if (search) params.search = search;

        const res = await enrollmentsService.getStudentCourses(user.id, params);
        setCourses(res.courses || []);
        setPagination(res.pagination || null);
      } catch (err) {
        toast.error('فشل جلب قائمة المواد');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id, page, limit, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">موادي المسجلة</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث باسم المادة أو الكود..."
              value={search}
              onChange={handleSearch}
              className="w-full pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiBook className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-semibold">لا توجد مواد مسجلة تطابق بحثك.</p>
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
                  <th className="py-4 px-6">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">{course.name}</span>
                      {course.description && (
                        <span className="block text-xs text-gray-400 mt-0.5 line-clamp-1 font-normal">{course.description}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {course.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">
                      {course.department?.name || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                          <FiUser className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-gray-700">{course.instructor?.name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500" dir="ltr">
                      {new Date(course.enrolledAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
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
    </div>
  );
}
