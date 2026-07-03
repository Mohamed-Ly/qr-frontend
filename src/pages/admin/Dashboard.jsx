import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FiUsers, FiBook, FiList, FiActivity } from 'react-icons/fi';
import { fetchDashboardStats, selectAdminStats, selectAdminStatsLoading } from '../../store/slices/adminDashboardSlice';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
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
  const stats = useSelector(selectAdminStats);
  const loading = useSelector(selectAdminStatsLoading);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !stats || !stats.cards) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { cards, charts } = stats;

  const barData = [
    { name: 'المدراء', count: cards.users?.admins || 0 },
    { name: 'الأساتذة', count: cards.users?.instructors || 0 },
    { name: 'الطلاب', count: cards.users?.students || 0 },
  ];

  const lineData = charts?.weeklyAttendance?.map(day => ({
    name: day.date,
    value: day.total,
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">نظرة عامة على النظام</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="إجمالي الطلاب"      value={cards.users?.students}    icon={FiUsers} color="bg-blue-100 text-blue-600" />
        <StatCard title="الأساتذة"             value={cards.users?.instructors} icon={FiUsers} color="bg-purple-100 text-purple-600" />
        <StatCard title="المواد الدراسية"   value={cards.academics?.courses} icon={FiBook}  color="bg-green-100 text-green-600" />
        <StatCard title="نسبة الحضور (%)"    value={cards.attendance?.rate}   icon={FiActivity}  color="bg-orange-100 text-orange-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع المستخدمين</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#EF4637" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">النشاط الأسبوعي للحضور</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
