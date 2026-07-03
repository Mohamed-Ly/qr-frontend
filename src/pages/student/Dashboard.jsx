import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiBook, FiCheckCircle, FiXCircle, FiClock, FiActivity, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { studentService } from '../../store/services/studentService';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await studentService.getDashboardStats(params);
        setData(res);
      } catch (err) {
        toast.error('فشل جلب بيانات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [fromDate, toDate]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">مرحباً بك، {data.student?.name?.split(' ')[0]} </h1>
          <p className="text-gray-500 font-medium mt-1">تخصص: {data.student?.department?.name || 'غير محدد'} | الرقم الجامعي: <span className="font-mono">{data.student?.studentNumber || '—'}</span></p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm bg-transparent border-none focus:outline-none text-gray-600 font-medium"
            title="من تاريخ"
          />
          <span className="text-gray-300">-</span>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm bg-transparent border-none focus:outline-none text-gray-600 font-medium"
            title="إلى تاريخ"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FiBook className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 font-semibold mb-1 text-sm">المواد المسجلة</h3>
          <p className="text-3xl font-black text-gray-800">{data.cards.totalCourses}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 font-semibold mb-1 text-sm">عدد الحضور</h3>
          <p className="text-3xl font-black text-gray-800">{data.cards.attendance.present}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <FiClock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 font-semibold mb-1 text-sm">التأخير</h3>
          <p className="text-3xl font-black text-gray-800">{data.cards.attendance.late}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-red-50 rounded-full opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <FiXCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-gray-500">معدل الحضور</span>
              <p className={`font-black text-lg ${data.cards.attendance.rate < 75 ? 'text-red-500' : 'text-green-500'}`} dir="ltr">
                {data.cards.attendance.rate}%
              </p>
            </div>
          </div>
          <h3 className="text-gray-500 font-semibold mb-1 text-sm relative z-10">الغيابات الكلية</h3>
          <p className="text-3xl font-black text-gray-800 relative z-10">{data.cards.attendance.absent}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <FiActivity className="text-primary" /> توزيع الحضور
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} محاضرة`, 'العدد']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Lectures */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <FiCalendar className="text-blue-500" /> المحاضرات القادمة (اليوم وغداً)
            </h2>
          </div>
          <div className="p-0 overflow-y-auto max-h-[320px]">
            {data.upcomingLectures?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                <FiCalendar className="w-10 h-10 mb-2 opacity-20" />
                <p>لا توجد محاضرات قادمة مجدولة اليوم أو غداً.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.upcomingLectures?.map((lecture) => (
                  <li key={lecture.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{lecture.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{lecture.course}</p>
                    </div>
                    <div className="text-left" dir="ltr">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{new Date(lecture.date).toLocaleDateString('en-GB')}</p>
                      <p className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md font-bold inline-block">
                        {new Date(lecture.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} 
                        {' - '} 
                        {new Date(lecture.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance by Course */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiBookOpen className="text-gray-500" />
            <h2 className="font-bold text-gray-800 text-lg">نسبة الحضور حسب المادة</h2>
          </div>
          <div className="overflow-x-auto">
            {data.coursesAttendance?.length === 0 ? (
               <div className="p-8 text-center text-gray-400 text-sm">لا توجد مواد مسجلة.</div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">المادة</th>
                    <th className="py-3 px-4 font-bold text-center">المحاضرات</th>
                    <th className="py-3 px-4 font-bold text-center">غياب</th>
                    <th className="py-3 px-4 font-bold text-center">النسبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.coursesAttendance?.map((item) => (
                    <tr key={item.course.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {item.course.name}
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">أستاذ: {item.course.instructor?.name || 'غير محدد'}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-600">{item.stats.totalLectures}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">{item.stats.absent}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center gap-2 justify-center" dir="ltr">
                          <span className={`font-bold text-xs ${item.stats.attendanceRate < 75 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.stats.attendanceRate}%
                          </span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.stats.attendanceRate < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${item.stats.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiClock className="text-gray-500" />
            <h2 className="font-bold text-gray-800 text-lg">سجل الحضور الأخير</h2>
          </div>
          <div className="overflow-x-auto">
            {data.recentAttendance?.length === 0 ? (
               <div className="p-8 text-center text-gray-400 text-sm">لا توجد سجلات حضور حديثة.</div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">المحاضرة / المادة</th>
                    <th className="py-3 px-4 font-bold">تاريخ المحاضرة</th>
                    <th className="py-3 px-4 font-bold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentAttendance?.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-semibold text-gray-800">{record.lecture}</span>
                        <span className="text-xs text-gray-500">{record.course}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.date).toLocaleDateString('en-GB')}
                        <span className="block text-xs text-gray-400 mt-0.5">تسجيل: {new Date(record.markedAt).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          record.status === 'حاضر' ? 'bg-green-100 text-green-700' :
                          record.status === 'متأخر' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
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
