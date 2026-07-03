import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPieChart, FiDownload, FiFileText, FiAlertCircle, FiTrendingUp, FiFilter } from 'react-icons/fi';
import { fetchTopAbsentStudents, fetchMostCommittedCourses, selectTopAbsentStudents, selectMostCommittedCourses, selectReportsLoading } from '../../store/slices/reportsSlice';
import { reportsService } from '../../store/services/reportsService';
import { toast } from 'react-toastify';

export default function Reports() {
  const dispatch = useDispatch();
  const topAbsent = useSelector(selectTopAbsentStudents);
  const mostCommitted = useSelector(selectMostCommittedCourses);
  const loading = useSelector(selectReportsLoading);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    dispatch(fetchTopAbsentStudents({ ...params, limit: 10 }));
    dispatch(fetchMostCommittedCourses({ ...params, limit: 10 }));
  }, [dispatch, fromDate, toDate]);

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      const params = { format };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await reportsService.getDetailedReportFile(params);
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().getTime()}.${format}`);
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
        <h1 className="text-2xl font-extrabold text-gray-900">التقارير والإحصائيات</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDownload('csv')} 
            disabled={downloading}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm shadow-sm disabled:opacity-50"
          >
            <FiFileText className="w-4 h-4 text-green-600" />
            تصدير CSV
          </button>
          <button 
            onClick={() => handleDownload('pdf')} 
            disabled={downloading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-all text-sm shadow-md shadow-primary/30 disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4" />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm whitespace-nowrap">
          <FiFilter className="w-4 h-4" /> تصفية التاريخ:
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">من تاريخ</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">إلى تاريخ</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="self-end pb-0.5">
            <button 
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors font-semibold"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Absent Students */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-red-50/30">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <FiAlertCircle className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">الطلاب الأكثر غياباً</h2>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : topAbsent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                <p>لا توجد بيانات غياب حالياً.</p>
              </div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">الطالب</th>
                    <th className="py-3 px-4 font-bold text-center">الغيابات</th>
                    <th className="py-3 px-4 font-bold text-center">نسبة الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topAbsent.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-gray-800">{item.student.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{item.student.studentNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-red-50 text-red-600 rounded-lg font-bold text-xs">
                          {item.absentCount} غياب
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-600" dir="ltr">
                        {item.attendanceRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Most Committed Courses */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-green-50/30">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">المواد الأكثر التزاماً بالحضور</h2>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : mostCommitted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                <p>لا توجد بيانات حضور كافية.</p>
              </div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">المادة</th>
                    <th className="py-3 px-4 font-bold text-center">الطلاب</th>
                    <th className="py-3 px-4 font-bold text-center">نسبة الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mostCommitted.map((item, idx) => (
                    <tr key={item.course.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-gray-800">{item.course.name}</span>
                        <span className="text-xs text-gray-400">{item.course.instructor?.name || 'غير محدد'}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-600">
                        {item.stats.totalStudents}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-xs" dir="ltr">
                          {item.stats.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
