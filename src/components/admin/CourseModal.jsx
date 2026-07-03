import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addCourse, editCourse, selectCoursesActionLoading } from '../../store/slices/coursesSlice';
import { selectDepartments } from '../../store/slices/departmentsSlice';
import { selectUsers } from '../../store/slices/usersSlice';

export default function CourseModal({ isOpen, onClose, courseToEdit }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectCoursesActionLoading);
  const departments = useSelector(selectDepartments);
  const users = useSelector(selectUsers);

  const instructors = users.filter(u => u.role === 'INSTRUCTOR');

  const [formData, setFormData] = useState({ name: '', code: '', description: '', departmentId: '', instructorId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(courseToEdit ? {
        name: courseToEdit.name || '',
        code: courseToEdit.code || '',
        description: courseToEdit.description || '',
        departmentId: courseToEdit.departmentId || '',
        instructorId: courseToEdit.instructorId || '',
      } : { name: '', code: '', description: '', departmentId: '', instructorId: '' });
      setError('');
    }
  }, [isOpen, courseToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.departmentId) {
      setError('اسم المادة والكود والقسم حقول إجبارية');
      return;
    }

    const payload = { ...formData };
    if (!payload.instructorId) delete payload.instructorId;

    let result;
    if (courseToEdit) {
      result = await dispatch(editCourse({ id: courseToEdit.id, courseData: payload }));
    } else {
      result = await dispatch(addCourse(payload));
    }

    if (courseToEdit ? editCourse.fulfilled.match(result) : addCourse.fulfilled.match(result)) {
      toast.success(`تم ${courseToEdit ? 'تعديل' : 'إضافة'} المادة بنجاح`);
      dispatch(fetchCourses()); // Refresh the courses list just in case
      onClose();
    } else {
      setError(result.payload || 'حدث خطأ أثناء حفظ المادة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">{courseToEdit ? 'تعديل المادة' : 'إضافة مادة جديدة'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم المادة *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">كود المادة *</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="CS101" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">القسم *</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-white" disabled={loading}>
                <option value="">اختر القسم</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الأستاذ المسؤول</label>
              <select name="instructorId" value={formData.instructorId} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-white" disabled={loading}>
                <option value="">بدون أستاذ (لاحقاً)</option>
                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف (اختياري)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm resize-none" disabled={loading} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors text-sm">إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-red-600 transition-colors shadow-md shadow-primary/30 disabled:opacity-70 text-sm">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              حفظ المقرر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
