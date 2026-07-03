import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { enrollStudent, fetchCourseStudents } from '../../store/slices/enrollmentsSlice';
import { usersService } from '../../store/services/usersService';
import { toast } from 'react-toastify';

export default function EnrollmentModal({ isOpen, onClose, courseId }) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search for students when typing
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await usersService.getUsers({ role: 'STUDENT', search, limit: 10 });
        setStudents(data?.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setError(null);
    }
  }, [isOpen]);

  const handleEnroll = async (studentId) => {
    setActionLoading(true);
    setError(null);
    const result = await dispatch(enrollStudent({ studentId, courseId }));
    setActionLoading(false);

    if (enrollStudent.fulfilled.match(result)) {
      toast.success('تم تسجيل الطالب بنجاح');
      dispatch(fetchCourseStudents({ courseId, params: { page: 1, limit: 10 } }));
      onClose();
    } else {
      setError(result.payload || 'حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={actionLoading ? () => {} : onClose}>
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
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-right align-middle shadow-xl transition-all flex flex-col max-h-[80vh]" dir="rtl">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <DialogTitle as="h3" className="text-lg font-bold text-gray-800">
                    تسجيل طالب في المادة
                  </DialogTitle>
                  <button onClick={onClose} disabled={actionLoading} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 disabled:opacity-50">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center">{error}</div>}
                  
                  <div className="relative mb-4">
                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ابحث برقم الطالب أو الاسم..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    {loading ? (
                      <div className="flex justify-center p-4">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : students.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-4">لا يوجد طلاب مطابقين للبحث.</p>
                    ) : (
                      students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{student.studentNumber || student.email}</p>
                          </div>
                          <button
                            onClick={() => handleEnroll(student.id)}
                            disabled={actionLoading}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            تسجيل
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
