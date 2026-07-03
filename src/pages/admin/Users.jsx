import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { fetchUsers, removeUser, toggleStatus, selectUsers, selectUsersLoading, selectUsersActionLoading, selectUsersPagination } from '../../store/slices/usersSlice';
import { fetchDepartments } from '../../store/slices/departmentsSlice';
import UserModal from '../../components/admin/UserModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const pagination = useSelector(selectUsersPagination);
  const loading = useSelector(selectUsersLoading);
  const actionLoading = useSelector(selectUsersActionLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Search & Pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirmation Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    // Delay search slightly to avoid spamming the API (debounce)
    const timer = setTimeout(() => {
      dispatch(fetchUsers({ page, limit, search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    dispatch(fetchDepartments()); // needed for the UserModal dropdowns
  }, [dispatch]);

  const handleAdd = () => { setUserToEdit(null); setIsModalOpen(true); };
  const handleEdit = (user) => { setUserToEdit(user); setIsModalOpen(true); };

  const promptDelete = (id) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const result = await dispatch(removeUser(userToDelete));
    if (removeUser.fulfilled.match(result)) {
      toast.success('تم حذف المستخدم بنجاح');
      // refetch current page
      dispatch(fetchUsers({ page, limit, search }));
    } else {
      toast.error(result.payload || 'فشل حذف المستخدم');
    }
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const result = await dispatch(toggleStatus({ id, newStatus }));
    toggleStatus.fulfilled.match(result)
      ? toast.success(`تم ${newStatus === 'ACTIVE' ? 'تفعيل' : 'إيقاف'} الحساب`)
      : toast.error(result.payload || 'فشل تغيير الحالة');
  };

  const getRoleBadge = (role) => {
    const map = {
      ADMIN:      <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold">مدير</span>,
      INSTRUCTOR: <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold">أستاذ</span>,
    };
    return map[role] ?? <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">طالب</span>;
  };

  const getStatusBadge = (status) =>
    status === 'ACTIVE'
      ? <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold">نشط</span>
      : <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">غير نشط</span>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة المستخدمين</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 text-sm">
          <FiPlus className="w-5 h-5" /> إضافة مستخدم
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Toolbar: Search */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد، أو الرقم..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FiUsers className="w-12 h-12 mb-3 text-gray-300" />
            <p>لا يوجد مستخدمين مطابقيين للبحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6">الاسم</th>
                  <th className="py-4 px-6">البريد الإلكتروني</th>
                  <th className="py-4 px-6">الدور</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-gray-500" dir="ltr">{user.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleToggleStatus(user.id, user.status)} disabled={actionLoading} className="px-2 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                          {user.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => promptDelete(user.id)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="حذف">
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
        {!loading && users.length > 0 && pagination && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              إجمالي المستخدمين: <span className="font-bold text-gray-900">{pagination.total}</span>
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

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userToEdit={userToEdit} />
      
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف مستخدم"
        message="هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟ ستفقد جميع البيانات المرتبطة به."
        confirmText="نعم، احذف المستخدم"
        isLoading={actionLoading}
      />
    </div>
  );
}
