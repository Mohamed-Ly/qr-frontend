import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addUser, editUser, selectUsersActionLoading } from '../../store/slices/usersSlice';
import { selectDepartments } from '../../store/slices/departmentsSlice';

export default function UserModal({ isOpen, onClose, userToEdit }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectUsersActionLoading);
  const departments = useSelector(selectDepartments);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    status: 'ACTIVE',
    phone: '',
    departmentId: '',
    studentNumber: '',
    employeeNumber: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          name: userToEdit.name || '',
          email: userToEdit.email || '',
          password: '', // Leave blank on edit unless changing
          role: userToEdit.role || 'STUDENT',
          status: userToEdit.status || 'ACTIVE',
          phone: userToEdit.phone || '',
          departmentId: userToEdit.departmentId || '',
          studentNumber: userToEdit.studentNumber || '',
          employeeNumber: userToEdit.employeeNumber || ''
        });
      } else {
        setFormData({
          name: '', email: '', password: '', role: 'STUDENT', status: 'ACTIVE',
          phone: '', departmentId: '', studentNumber: '', employeeNumber: ''
        });
      }
      setError('');
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!userToEdit && !formData.password)) {
      setError('يرجى تعبئة الحقول الإجبارية (الاسم، البريد، وكلمة المرور)');
      return;
    }

    const submitData = { ...formData };
    if (!submitData.password) delete submitData.password;
    if (!submitData.phone) delete submitData.phone;
    if (!submitData.departmentId) delete submitData.departmentId;
    else submitData.departmentId = parseInt(submitData.departmentId);
    if (!submitData.studentNumber) delete submitData.studentNumber;
    if (!submitData.employeeNumber) delete submitData.employeeNumber;

    let resultAction;
    if (userToEdit) {
      resultAction = await dispatch(editUser({ id: userToEdit.id, userData: submitData }));
    } else {
      resultAction = await dispatch(addUser(submitData));
    }

    if (addUser.fulfilled.match(resultAction) || editUser.fulfilled.match(resultAction)) {
      toast.success(`تم ${userToEdit ? 'تعديل' : 'إضافة'} المستخدم بنجاح`);
      onClose();
    } else {
      setError(resultAction.payload || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800">
            {userToEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم كامل *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-right" disabled={loading} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                كلمة المرور {userToEdit ? '(اتركه فارغاً لعدم التغيير)' : '*'}
              </label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} dir="ltr" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" placeholder="05XXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-right" disabled={loading} />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الدور *</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-white" disabled={loading}>
                <option value="STUDENT">طالب</option>
                <option value="INSTRUCTOR">أستاذ</option>
                <option value="ADMIN">مدير</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">حالة الحساب</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-white" disabled={loading}>
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">غير نشط</option>
              </select>
            </div>

            {/* Department */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">القسم التابع له</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-white" disabled={loading}>
                <option value="">بدون قسم</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Specific Fields */}
            {formData.role === 'STUDENT' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرقم الجامعي (للطالب)</label>
                <input type="text" name="studentNumber" value={formData.studentNumber} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
              </div>
            )}
            {formData.role === 'INSTRUCTOR' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الرقم الوظيفي (للأستاذ)</label>
                <input type="text" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors text-sm">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-red-600 transition-colors shadow-md shadow-primary/30 disabled:opacity-70 text-sm">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              حفظ المستخدم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
