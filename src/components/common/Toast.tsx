import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex flex-col gap-2 max-w-md w-auto pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 bg-white border border-[#E4E4E7] rounded-xl shadow-lg transition-all duration-200 novora-animate-toast"
          role="status"
          aria-live="polite"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#18181B] truncate">{toast.title}</h4>
            {toast.message && <p className="text-xs text-[#52525B] mt-0.5 leading-relaxed">{toast.message}</p>}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-[#71717A] hover:text-[#18181B] p-1 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
