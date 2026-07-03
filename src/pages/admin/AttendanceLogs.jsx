import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiActivity, FiEdit2, FiTrash2, FiChevronRight, FiChevronLeft, FiFilter } from 'react-icons/fi';
import { fetchAttendanceRecords, removeAttendanceRecord, selectAttendanceRecords, selectAttendancePagination, selectAttendanceLoading, selectAttendanceActionLoading } from '../../store/slices/attendanceSlice';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import AttendanceModal from '../../components/admin/AttendanceModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function AttendanceLogs() {
  const dispatch = useDispatch();
  const records = useSelector(selectAttendanceRecords);
  const pagination = useSelector(selectAttendancePagination);
  const loading = useSelector(selectAttendanceLoading);
  const actionLoading = useSelector(selectAttendanceActionLoading);
  const courses = useSelector(selectCourses);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 100 })); // For filter dropdown
  }, [dispatch]);

  useEffect(() => {
    const params = { page, limit };
    if (courseFilter) params.courseId = courseFilter;
    if (statusFilter) params.status = statusFilter;

    dispatch(fetchAttendanceRecords(params));
  }, [dispatch, page, limit, courseFilter, statusFilter]);

  const handleEdit = (record) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const promptDelete = (id) => {
    setRecordToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    const result = await dispatch(removeAttendanceRecord(recordToDelete));
    if (removeAttendanceRecord.fulfilled.match(result)) {
      toast.success('تم حذف سجل الحضور بنجاح');
      
      const params = { page, limit };
      if (courseFilter) params.courseId = courseFilter;
      if (statusFilter) params.status = statusFilter;
      dispatch(fetchAttendanceRecords(params));
    } else {
      toast.error(result.payload || 'فشل حذف سجل الحضور');
    }
    setIsConfirmOpen(false);
    setRecordToDelete(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT': return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold">حاضر</span>;
      case 'LATE':    return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-bold">متأخر</span>;
      case 'ABSENT':  return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold">غائب</span>;
      default:        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">سجلات الحضور</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm whitespace-nowrap">
            <FiFilter className="w-4 h-4" /> تصفية النتائج:
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
              className="w-full sm:max-w-xs px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-700"
            >
              <option value="">جميع المواد</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:max-w-xs px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-700"
            >
              <option value="">جميع الحالات</option>
              <option value="PRESENT">حاضر</option>
              <option value="LATE">متأخر</option>
              <option value="ABSENT">غائب</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiActivity className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا توجد سجلات حضور تطابق عوامل التصفية المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">الطالب</th>
                  <th className="py-4 px-6">المادة</th>
                  <th className="py-4 px-6">تاريخ المحاضرة</th>
                  <th className="py-4 px-6">وقت التسجيل</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="block font-bold text-gray-900">{record.student?.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{record.student?.studentNumber}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{record.course?.name}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {record.lecture?.lectureDate ? new Date(record.lecture.lectureDate).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-4 px-6 text-gray-500" dir="ltr">
                      {new Date(record.markedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل الحالة">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => promptDelete(record.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="حذف السجل">
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

        {/* Pagination */}
        {!loading && records.length > 0 && pagination && (
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

      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={recordToEdit}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف سجل الحضور"
        message="هل أنت متأكد من رغبتك في حذف هذا السجل؟ لن يتمكن الطالب من استعادة حضوره إلا بتسجيل يدوي جديد."
        confirmText="نعم، احذف السجل"
        isLoading={actionLoading}
      />
    </div>
  );
}
