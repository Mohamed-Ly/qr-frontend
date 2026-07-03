import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateAttendanceRecord } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';

export default function AttendanceModal({ isOpen, onClose, recordToEdit }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    status: 'PRESENT',
    note: '',
  });

  useEffect(() => {
    if (isOpen && recordToEdit) {
      setFormData({
        status: recordToEdit.status || 'PRESENT',
        note: recordToEdit.note || '',
      });
      setError(null);
    }
  }, [isOpen, recordToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      status: formData.status,
      note: formData.note,
    };

    const result = await dispatch(updateAttendanceRecord({ id: recordToEdit.id, data: payload }));
    
    setLoading(false);

    if (updateAttendanceRecord.fulfilled.match(result)) {
      toast.success('تم تحديث سجل الحضور بنجاح');
      onClose();
    } else {
      setError(result.payload || 'حدث خطأ أثناء التحديث');
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
                    تعديل سجل الحضور
                  </DialogTitle>
                  <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 disabled:opacity-50">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 pb-2 text-sm text-gray-600 bg-gray-50/30">
                  <p><strong>الطالب:</strong> {recordToEdit?.student?.name}</p>
                  <p><strong>المادة:</strong> {recordToEdit?.course?.name}</p>
                  <p><strong>تاريخ المحاضرة:</strong> {recordToEdit?.lecture?.lectureDate ? new Date(recordToEdit.lecture.lectureDate).toLocaleDateString('en-GB') : '—'}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">{error}</div>}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحالة *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                      disabled={loading}
                    >
                      <option value="PRESENT">حاضر</option>
                      <option value="LATE">متأخر</option>
                      <option value="ABSENT">غائب</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات (اختياري)</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="أضف أي ملاحظات حول هذا الحضور..."
                      rows="3"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-primary/30 disabled:opacity-50 text-sm">
                      {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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
