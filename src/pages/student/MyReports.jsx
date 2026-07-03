import { FiPieChart } from 'react-icons/fi';

export default function MyReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">تقاريري</h1>
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 min-h-[400px] flex flex-col items-center justify-center text-gray-400">
        <FiPieChart className="w-14 h-14 mb-4 text-gray-300" />
        <p className="font-semibold">سيتم ربط تقارير حضورك ونسبك لكل مقرر هنا</p>
      </div>
    </div>
  );
}
