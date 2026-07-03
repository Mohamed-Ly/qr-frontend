import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الإجراء',
  message = 'هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDanger = true,
  isLoading = false
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isLoading ? () => {} : onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all" dir="rtl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <FiAlertTriangle className="w-6 h-6" />
                  </div>
                  <DialogTitle as="h3" className="text-lg font-bold leading-6 text-gray-900">
                    {title}
                  </DialogTitle>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-xl px-4 py-2 text-sm font-medium text-white focus:outline-none disabled:opacity-50 ${
                      isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
