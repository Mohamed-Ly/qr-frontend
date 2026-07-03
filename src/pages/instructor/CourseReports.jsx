import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiPieChart, FiDownload, FiFileText, FiBook, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { fetchCourses, selectCourses } from '../../store/slices/coursesSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { attendanceService } from '../../store/services/attendanceService';
import { reportsService } from '../../store/services/reportsService';

export default function CourseReports() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const courses = useSelector(selectCourses);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseSummary, setCourseSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCourses({ instructorId: user.id, limit: 100 }));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedCourseId) {
        setCourseSummary(null);
        return;
      }
      setLoading(true);
      try {
        const res = await attendanceService.getCourseSummary(selectedCourseId);
        setCourseSummary(res);
      } catch (err) {
        toast.error('فشل جلب تقرير المادة');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedCourseId]);

  const handleDownload = async (format) => {
    if (!selectedCourseId) return;
    try {
      setDownloading(true);
      const response = await reportsService.getDetailedReportFile({ courseId: selectedCourseId, format });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course-report-${selectedCourseId}-${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`تم تحميل التقرير بصيغة ${format.toUpperCase()} بنجاح`);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل التقرير');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">تقارير المواد</h1>
        
        {selectedCourseId && courseSummary && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleDownload('csv')} 
              disabled={downloading}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm shadow-sm disabled:opacity-50"
            >
              <FiFileText className="w-4 h-4 text-green-600" /> تصدير CSV
            </button>
            <button 
              onClick={() => handleDownload('pdf')} 
              disabled={downloading}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-all text-sm shadow-md shadow-primary/30 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" /> تصدير PDF
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm whitespace-nowrap">
          <FiBook className="w-5 h-5 text-primary" /> اختر المادة:
        </div>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-800"
        >
          <option value="">-- يرجى اختيار مادة لعرض التقرير --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !selectedCourseId ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
          <FiPieChart className="w-16 h-16 mb-4 text-gray-300" />
          <p className="font-semibold text-lg text-gray-500">اختر مادة لعرض إحصائياتها وتقارير الحضور</p>
        </div>
      ) : courseSummary ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiUsers className="w-5 h-5" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold">الطلاب المسجلين</h3>
              </div>
              <p className="text-3xl font-black text-gray-800">{courseSummary.summary.totalStudents}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold">نسبة الحضور الإجمالية</h3>
              </div>
              <p className="text-3xl font-black text-gray-800" dir="ltr">{courseSummary.summary.overallAttendanceRate}%</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FiBook className="w-5 h-5" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold">المحاضرات</h3>
              </div>
              <p className="text-3xl font-black text-gray-800">{courseSummary.summary.totalLectures}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-gray-500 text-sm font-bold">الغيابات الكلية</h3>
              </div>
              <p className="text-3xl font-black text-gray-800">{courseSummary.summary.totalAbsent}</p>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-lg">تفاصيل حضور الطلاب</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 font-bold">الطالب</th>
                    <th className="py-4 px-6 font-bold text-center">حاضر</th>
                    <th className="py-4 px-6 font-bold text-center">متأخر</th>
                    <th className="py-4 px-6 font-bold text-center">غائب</th>
                    <th className="py-4 px-6 font-bold text-center">نسبة الحضور للطالب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courseSummary.students?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400 font-semibold">
                        لا يوجد طلاب مسجلين في هذه المادة.
                      </td>
                    </tr>
                  ) : (
                    courseSummary.students?.map((item) => (
                      <tr key={item.student.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-6">
                          <span className="block font-bold text-gray-800">{item.student.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{item.student.studentNumber}</span>
                        </td>
                        <td className="py-3 px-6 text-center text-green-600 font-bold">{item.present}</td>
                        <td className="py-3 px-6 text-center text-orange-500 font-bold">{item.late}</td>
                        <td className="py-3 px-6 text-center text-red-600 font-bold">{item.absent}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${
                            item.attendanceRate >= 75 ? 'bg-green-50 text-green-700' :
                            item.attendanceRate >= 50 ? 'bg-orange-50 text-orange-700' :
                            'bg-red-50 text-red-700'
                          }`} dir="ltr">
                            {item.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
