import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addDepartment, editDepartment, selectDepartmentsActionLoading } from '../../store/slices/departmentsSlice';

export default function DepartmentModal({ isOpen, onClose, departmentToEdit }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectDepartmentsActionLoading);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        setName(departmentToEdit.name);
        setDescription(departmentToEdit.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, departmentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم القسم مطلوب');
      return;
    }

    const deptData = { name, description };
    let resultAction;

    if (departmentToEdit) {
      resultAction = await dispatch(editDepartment({ id: departmentToEdit.id, deptData }));
    } else {
      resultAction = await dispatch(addDepartment(deptData));
    }

    if (addDepartment.fulfilled.match(resultAction) || editDepartment.fulfilled.match(resultAction)) {
      toast.success(`تم ${departmentToEdit ? 'تعديل' : 'إضافة'} القسم بنجاح`);
      onClose();
    } else {
      setError(resultAction.payload || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">
            {departmentToEdit ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم القسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="مثال: قسم علوم الحاسوب"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للقسم..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-red-600 transition-colors shadow-md shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              حفظ القسم
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
