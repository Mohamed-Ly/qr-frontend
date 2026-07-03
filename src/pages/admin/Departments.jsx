import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiList, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { fetchDepartments, removeDepartment, selectDepartments, selectDepartmentsLoading, selectDepartmentsActionLoading, selectDepartmentsPagination } from '../../store/slices/departmentsSlice';
import DepartmentModal from '../../components/admin/DepartmentModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function Departments() {
  const dispatch = useDispatch();
  const departments = useSelector(selectDepartments);
  const pagination = useSelector(selectDepartmentsPagination);
  const loading = useSelector(selectDepartmentsLoading);
  const actionLoading = useSelector(selectDepartmentsActionLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);

  // Search & Pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirmation Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchDepartments({ page, limit, search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, page, limit, search]);

  const handleAdd  = () => { setDepartmentToEdit(null); setIsModalOpen(true); };
  const handleEdit = (dept) => { setDepartmentToEdit(dept); setIsModalOpen(true); };

  const promptDelete = (id) => {
    setDeptToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    const result = await dispatch(removeDepartment(deptToDelete));
    if (removeDepartment.fulfilled.match(result)) {
      toast.success('تم حذف القسم بنجاح');
      dispatch(fetchDepartments({ page, limit, search })); // Refresh
    } else {
      toast.error(result.payload || 'فشل حذف القسم');
    }
    setIsConfirmOpen(false);
    setDeptToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة الأقسام</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 text-sm">
          <FiPlus className="w-5 h-5" /> إضافة قسم
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar: Search */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم القسم، الكود، الوصف..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiList className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا توجد أقسام مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">المعرف</th>
                  <th className="py-4 px-6">اسم القسم</th>
                  <th className="py-4 px-6">الوصف</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-500 font-medium">#{dept.id}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{dept.name}</td>
                    <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{dept.description || 'لا يوجد وصف'}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEdit(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => promptDelete(dept.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="حذف">
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

        {/* Pagination Controls */}
        {!loading && departments.length > 0 && pagination && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي الأقسام: <span className="font-bold text-gray-900">{pagination.total}</span>
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

      <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} departmentToEdit={departmentToEdit} />
      
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف قسم"
        message="هل أنت متأكد من رغبتك في حذف هذا القسم؟ لا يمكن حذف القسم إذا كان مرتبطاً بمستخدمين أو مواد دراسية."
        confirmText="نعم، احذف القسم"
        isLoading={actionLoading}
      />
    </div>
  );
}
