import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addLecture, editLecture, fetchLectures } from '../../store/slices/lecturesSlice';
import { toast } from 'react-toastify';

export default function LectureModal({ isOpen, onClose, lectureToEdit, courses }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    lectureDate: '',
    startTime: '',
    endTime: '',
    isClosed: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (lectureToEdit) {
        // Format dates for inputs
        const dateStr = new Date(lectureToEdit.lectureDate).toISOString().split('T')[0];
        
        // Extract time as HH:MM
        const startT = new Date(lectureToEdit.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endT = new Date(lectureToEdit.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        setFormData({
          courseId: lectureToEdit.course?.id || '',
          title: lectureToEdit.title || '',
          lectureDate: dateStr,
          startTime: startT,
          endTime: endT,
          isClosed: lectureToEdit.isClosed || false,
        });
      } else {
        setFormData({
          courseId: '',
          title: '',
          lectureDate: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '10:00',
          isClosed: false,
        });
      }
      setError(null);
    }
  }, [isOpen, lectureToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title || !formData.lectureDate || !formData.startTime || !formData.endTime) {
      setError('جميع الحقول إجبارية (باستثناء حالة الإغلاق)');
      return;
    }

    setLoading(true);
    setError(null);

    // Combine date and time
    const startDateTime = new Date(`${formData.lectureDate}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${formData.lectureDate}T${formData.endTime}:00`).toISOString();

    const payload = {
      courseId: parseInt(formData.courseId),
      title: formData.title,
      lectureDate: new Date(formData.lectureDate).toISOString(),
      startTime: startDateTime,
      endTime: endDateTime,
      isClosed: formData.isClosed,
    };

    let result;
    if (lectureToEdit) {
      result = await dispatch(editLecture({ id: lectureToEdit.id, data: payload }));
    } else {
      result = await dispatch(addLecture(payload));
    }

    setLoading(false);

    if (lectureToEdit ? editLecture.fulfilled.match(result) : addLecture.fulfilled.match(result)) {
      toast.success(`تم ${lectureToEdit ? 'تعديل' : 'إضافة'} المحاضرة بنجاح`);
      dispatch(fetchLectures({ page: 1, limit: 10 }));
      onClose();
    } else {
      setError(result.payload || 'حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-right align-middle shadow-xl transition-all" dir="rtl">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <DialogTitle as="h3" className="text-lg font-bold text-gray-800">
                    {lectureToEdit ? 'تعديل المحاضرة' : 'إضافة محاضرة جديدة'}
                  </DialogTitle>
                  <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 disabled:opacity-50">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">{error}</div>}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">المادة *</label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      disabled={!!lectureToEdit || loading}
                    >
                      <option value="">-- اختر المادة --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان المحاضرة *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="مثال: مقدمة في قواعد البيانات"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">تاريخ المحاضرة *</label>
                    <input
                      type="date"
                      name="lectureDate"
                      value={formData.lectureDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">وقت البداية *</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">وقت النهاية *</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {lectureToEdit && (
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isClosed"
                          checked={formData.isClosed}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                          disabled={loading}
                        />
                        <span className="text-sm font-semibold text-gray-700">إغلاق المحاضرة (منع تسجيل حضور جديد)</span>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 disabled:opacity-50 text-sm">
                      {loading ? 'جاري الحفظ...' : 'حفظ المحاضرة'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
