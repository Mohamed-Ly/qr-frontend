import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiList, FiPlus, FiEdit2, FiLock, FiUnlock, FiSearch, FiChevronRight, FiChevronLeft, FiFilter } from 'react-icons/fi';
import { fetchLectures, editLecture, selectLectures, selectLecturesLoading, selectLecturesActionLoading, selectLecturesPagination } from '../../store/slices/lecturesSlice';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LectureModal from '../../components/admin/LectureModal';

export default function ManageLectures() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const lectures = useSelector(selectLectures);
  const pagination = useSelector(selectLecturesPagination);
  const loading = useSelector(selectLecturesLoading);
  const actionLoading = useSelector(selectLecturesActionLoading);
  
  // We need the instructor's courses to filter and to pass to the LectureModal
  const courses = useSelector(selectCourses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 1. Fetch Instructor's Courses
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCourses({ instructorId: user.id, limit: 100 })); // fetch all their courses
    }
  }, [dispatch, user?.id]);

  // 2. Fetch Lectures (only for instructor's courses)
  // If no course is selected, we could either fetch nothing, or fetch for all their courses. 
  // Since the backend doesn't support multiple courseIds, if no course is selected, 
  // we might get ALL lectures if we don't pass courseId.
  // To avoid seeing other instructors' lectures, we can default selectedCourseId to the first course,
  // OR we can fetch all and filter in frontend, but pagination would break.
  // Let's require selecting a course first if they have multiple, or auto-select the first one.

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id.toString());
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return; // Wait until a course is selected
    
    const timer = setTimeout(() => {
      dispatch(fetchLectures({ page, limit, search, courseId: selectedCourseId }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, page, limit, search, selectedCourseId]);

  const handleAdd  = () => { setLectureToEdit(null); setIsModalOpen(true); };
  const handleEdit = (lecture) => { setLectureToEdit(lecture); setIsModalOpen(true); };

  const toggleStatus = async (lecture) => {
    const result = await dispatch(editLecture({ 
      id: lecture.id, 
      data: { isClosed: !lecture.isClosed } 
    }));
    
    if (editLecture.fulfilled.match(result)) {
      toast.success(lecture.isClosed ? 'تم فتح المحاضرة' : 'تم إغلاق المحاضرة');
      dispatch(fetchLectures({ page, limit, search, courseId: selectedCourseId }));
    } else {
      toast.error(result.payload || 'فشل تغيير حالة المحاضرة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة المحاضرات</h1>
        <button 
          onClick={handleAdd} 
          disabled={!selectedCourseId}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="w-5 h-5" /> إضافة محاضرة
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar: Filters & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <FiFilter className="text-gray-400" />
            <select
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value); setPage(1); }}
              className="w-full md:w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {courses.length === 0 ? (
                <option value="">لا توجد مواد مسندة لك</option>
              ) : (
                courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بعنوان المحاضرة..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {!selectedCourseId ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiList className="w-12 h-12 mb-3 text-gray-300" />
            <p>يرجى اختيار مادة لعرض محاضراتها.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiList className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا توجد محاضرات مطابقة للبحث في هذه المادة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">عنوان المحاضرة</th>
                  <th className="py-4 px-6">التاريخ</th>
                  <th className="py-4 px-6">الوقت</th>
                  <th className="py-4 px-6 text-center">الحالة</th>
                  <th className="py-4 px-6 text-center">الحضور</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{lecture.title}</td>
                    <td className="py-4 px-6 text-gray-600 font-semibold" dir="ltr">
                      {new Date(lecture.lectureDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-xs font-bold" dir="ltr">
                      {lecture.startTime.slice(0,5)} - {lecture.endTime.slice(0,5)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        lecture.isClosed ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {lecture.isClosed ? <FiLock className="w-3 h-3" /> : <FiUnlock className="w-3 h-3" />}
                        {lecture.isClosed ? 'مغلقة' : 'مفتوحة'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {lecture._count?.attendances || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => toggleStatus(lecture)} disabled={actionLoading} className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${lecture.isClosed ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`} title={lecture.isClosed ? "فتح المحاضرة" : "إغلاق المحاضرة"}>
                          {lecture.isClosed ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleEdit(lecture)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <FiEdit2 className="w-4 h-4" />
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
        {!loading && lectures.length > 0 && pagination && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي المحاضرات: <span className="font-bold text-gray-900">{pagination.total}</span>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">
                <FiChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-gray-700 px-2">صفحة {page} من {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">
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
        courses={courses} // Provide only instructor's courses
        fixedCourseId={selectedCourseId} // Optionally auto-select the current course
      />
    </div>
  );
}
