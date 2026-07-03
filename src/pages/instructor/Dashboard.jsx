import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBook, FiUsers, FiCalendar, FiActivity, FiClock, FiCheckCircle } from 'react-icons/fi';
import { fetchInstructorDashboardStats, selectInstructorStats, selectInstructorLoading } from '../../store/slices/instructorSlice';
import { Link } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectInstructorStats);
  const loading = useSelector(selectInstructorLoading);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    dispatch(fetchInstructorDashboardStats(params));
  }, [dispatch, fromDate, toDate]);

  if (loading || !stats || !stats.cards) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const { cards, upcomingLectures, coursesStats, recentLectures } = stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">نظرة عامة على المواد (دكتور)</h1>
        
        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0 text-gray-600"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="المواد التي أدرسها" value={cards.courses} icon={FiBook} color="bg-blue-100 text-blue-600" />
        <StatCard title="إجمالي الطلاب" value={cards.students} icon={FiUsers} color="bg-purple-100 text-purple-600" />
        <StatCard title="إجمالي المحاضرات" value={cards.lectures} icon={FiCalendar} color="bg-green-100 text-green-600" />
        <StatCard title="متوسط نسبة الحضور" value={`${cards.attendance?.rate || 0}%`} icon={FiActivity} color="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Lectures */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiClock className="text-blue-500" /> المحاضرات القادمة
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {upcomingLectures?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد محاضرات مجدولة اليوم أو غداً</p>
            ) : (
              upcomingLectures?.map(lecture => (
                <div key={lecture.id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                  <div className="font-bold text-gray-800 text-sm mb-1">{lecture.title}</div>
                  <div className="text-xs text-gray-500 mb-2">{lecture.course}</div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                    <span dir="ltr">{new Date(lecture.date).toLocaleDateString('en-GB')}</span>
                    <span dir="ltr">{lecture.startTime.slice(0, 5)} - {lecture.endTime.slice(0, 5)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courses Stats Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiCheckCircle className="text-green-500" /> إحصائيات المواد
            </h3>
            <Link to="/instructor/courses" className="text-sm text-primary hover:text-red-600 font-semibold">عرض كل المواد &larr;</Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-bold">المادة</th>
                  <th className="py-3 px-4 font-bold text-center">الطلاب</th>
                  <th className="py-3 px-4 font-bold text-center">المحاضرات</th>
                  <th className="py-3 px-4 font-bold text-center">نسبة الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coursesStats?.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-gray-400">لا توجد إحصائيات للمواد</td></tr>
                ) : (
                  coursesStats?.map(item => (
                    <tr key={item.course.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-gray-800">{item.course.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{item.course.code}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-600">{item.stats.students}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-600">{item.stats.lectures}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-xs" dir="ltr">
                          {item.stats.attendanceRate}%
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
    </div>
  );
}
