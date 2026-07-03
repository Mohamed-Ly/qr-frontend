import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiActivity, FiFilter, FiChevronRight, FiChevronLeft,
  FiCheckCircle, FiXCircle, FiClock
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { attendanceService } from '../../store/services/attendanceService';
import { enrollmentsService } from '../../store/services/enrollmentsService';

const STATUS_BADGE = {
  PRESENT: <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><FiCheckCircle />حاضر</span>,
  LATE:    <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><FiClock />متأخر</span>,
  ABSENT:  <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><FiXCircle />غائب</span>,
};

export default function MyAttendance() {
  const user = useSelector(selectCurrentUser);

  // Data
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // Filters
  const [page, setPage] = useState(1);
  const limit = 10;
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch student's enrolled courses (for filter dropdown)
  useEffect(() => {
    if (!user?.id) return;
    enrollmentsService.getStudentCourses(user.id, { limit: 100 })
      .then(res => setCourses(res.courses || []))
      .catch(() => {});
  }, [user?.id]);

  // Fetch attendance summary (top cards)
  useEffect(() => {
    if (!user?.id) return;
    attendanceService.getStudentSummary(user.id)
      .then(res => setSummary(res.summary))
      .catch(() => {});
  }, [user?.id]);

  // Fetch paginated attendance records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (courseFilter) params.courseId = courseFilter;
        if (statusFilter) params.status = statusFilter;
        if (fromDate)     params.fromDate = fromDate;
        if (toDate)       params.toDate   = toDate;

        const res = await attendanceService.getAll(params);
        setRecords(res.attendances || []);
        setPagination(res.pagination || null);
      } catch (err) {
        toast.error('فشل جلب سجلات الحضور');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [page, limit, courseFilter, statusFilter, fromDate, toDate]);

  const resetFilters = () => {
    setCourseFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">سجل حضوري</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
            <p className="text-xs font-bold text-gray-500 mb-2">إجمالي المحاضرات</p>
            <p className="text-3xl font-black text-gray-800">{summary.totalAttendances}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
            <p className="text-xs font-bold text-gray-500 mb-2">عدد الحضور</p>
            <p className="text-3xl font-black text-green-600">{summary.totalPresent}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
            <p className="text-xs font-bold text-gray-500 mb-2">التأخير</p>
            <p className="text-3xl font-black text-orange-500">{summary.totalLate}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
            <p className="text-xs font-bold text-gray-500 mb-2">الغياب</p>
            <p className="text-3xl font-black text-red-500">{summary.totalAbsent}</p>
            <p className={`text-xs font-bold mt-1 ${summary.attendanceRate < 75 ? 'text-red-500' : 'text-green-500'}`}
               dir="ltr">معدل {summary.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm whitespace-nowrap">
            <FiFilter className="w-4 h-4" /> تصفية النتائج:
          </div>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={onFilterChange(setCourseFilter)}
            className="flex-1 sm:max-w-xs px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
          >
            <option value="">جميع موادي</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={onFilterChange(setStatusFilter)}
            className="flex-1 sm:max-w-[160px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
          >
            <option value="">جميع الحالات</option>
            <option value="PRESENT">حاضر</option>
            <option value="LATE">متأخر</option>
            <option value="ABSENT">غائب</option>
          </select>

          {/* Date Filters */}
          <input
            type="date"
            value={fromDate}
            onChange={onFilterChange(setFromDate)}
            title="من تاريخ"
            className="flex-1 sm:max-w-[160px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="date"
            value={toDate}
            onChange={onFilterChange(setToDate)}
            title="إلى تاريخ"
            className="flex-1 sm:max-w-[160px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {(courseFilter || statusFilter || fromDate || toDate) && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-700 font-semibold whitespace-nowrap transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiActivity className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-semibold">لا توجد سجلات حضور تطابق الفلاتر المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">المادة</th>
                  <th className="py-4 px-6">المحاضرة</th>
                  <th className="py-4 px-6">تاريخ المحاضرة</th>
                  <th className="py-4 px-6">وقت التسجيل</th>
                  <th className="py-4 px-6 text-center">الحالة</th>
                  <th className="py-4 px-6">ملاحظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">{record.course?.name}</span>
                      <span className="block text-xs text-gray-400 font-mono mt-0.5">{record.course?.code}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      {record.lecture?.title}
                    </td>
                    <td className="py-4 px-6 text-gray-600" dir="ltr">
                      {record.lecture?.lectureDate
                        ? new Date(record.lecture.lectureDate).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="py-4 px-6 text-gray-500" dir="ltr">
                      {new Date(record.markedAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        {STATUS_BADGE[record.status] || record.status}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 italic text-xs">
                      {record.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي السجلات: <span className="font-bold text-gray-900">{pagination.total}</span>
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
