import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiList, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronRight, FiChevronLeft, FiLock, FiUnlock } from 'react-icons/fi';
import { fetchLectures, removeLecture, closeLecture, selectLectures, selectLecturesPagination, selectLecturesLoading, selectLecturesActionLoading } from '../../store/slices/lecturesSlice';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import LectureModal from '../../components/admin/LectureModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function Lectures() {
  const dispatch = useDispatch();
  const lectures = useSelector(selectLectures);
  const pagination = useSelector(selectLecturesPagination);
  const loading = useSelector(selectLecturesLoading);
  const actionLoading = useSelector(selectLecturesActionLoading);
  const courses = useSelector(selectCourses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState(null);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirmation Modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 100 })); // For the modal
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchLectures({ page, limit, search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, page, limit, search]);

  const handleAdd = () => { setLectureToEdit(null); setIsModalOpen(true); };
  const handleEdit = (lecture) => { setLectureToEdit(lecture); setIsModalOpen(true); };

  const promptDelete = (id) => {
    setLectureToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!lectureToDelete) return;
    const result = await dispatch(removeLecture(lectureToDelete));
    if (removeLecture.fulfilled.match(result)) {
      toast.success('تم حذف المحاضرة بنجاح');
      dispatch(fetchLectures({ page, limit, search }));
    } else {
      toast.error(result.payload || 'فشل حذف المحاضرة');
    }
    setIsConfirmOpen(false);
    setLectureToDelete(null);
  };

  const handleToggleClose = async (lecture) => {
    if (lecture.isClosed) return; // Only allowing to close, not open? The backend close endpoint only sets isClosed: true. But update allows setting isClosed: true/false. Let's just use the toggle via Edit or if it's open, show a close button.
    const result = await dispatch(closeLecture(lecture.id));
    if (closeLecture.fulfilled.match(result)) {
      toast.success('تم إغلاق المحاضرة بنجاح');
    } else {
      toast.error(result.payload || 'فشل إغلاق المحاضرة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة المحاضرات</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 text-sm">
          <FiPlus className="w-5 h-5" /> إضافة محاضرة
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم المحاضرة أو المادة..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiList className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا توجد محاضرات مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">عنوان المحاضرة</th>
                  <th className="py-4 px-6">المادة</th>
                  <th className="py-4 px-6">التاريخ والوقت</th>
                  <th className="py-4 px-6">الحضور/QR</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{lecture.title}</td>
                    <td className="py-4 px-6 text-gray-600">
                      <span className="block font-semibold">{lecture.course?.name}</span>
                      <span className="text-xs text-gray-400">{lecture.course?.code}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600" dir="ltr">
                      <span className="block">{new Date(lecture.lectureDate).toLocaleDateString('en-GB')}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(lecture.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} - {new Date(lecture.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold ml-2">حضور: {lecture._count?.attendances || 0}</span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">QR: {lecture._count?.qrTokens || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      {lecture.isClosed ? (
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"><FiLock /> مغلقة</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"><FiUnlock /> مفتوحة</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!lecture.isClosed && (
                          <button onClick={() => handleToggleClose(lecture)} disabled={actionLoading} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50" title="إغلاق المحاضرة">
                            <FiLock className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleEdit(lecture)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => promptDelete(lecture.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="حذف">
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
        {!loading && lectures.length > 0 && pagination && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي المحاضرات: <span className="font-bold text-gray-900">{pagination.total}</span>
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

      <LectureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lectureToEdit={lectureToEdit}
        courses={courses}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف المحاضرة"
        message="هل أنت متأكد من رغبتك في حذف هذه المحاضرة؟ لا يمكن حذف المحاضرة إذا كان بها سجلات حضور."
        confirmText="نعم، احذف المحاضرة"
        isLoading={actionLoading}
      />
    </div>
  );
}
