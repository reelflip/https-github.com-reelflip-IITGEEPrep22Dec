
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../types';

interface ToastProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastType; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
    error: { icon: AlertCircle, bg: 'bg-rose-600', shadow: 'shadow-rose-200' },
    info: { icon: Info, bg: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
    warning: { icon: AlertCircle, bg: 'bg-amber-600', shadow: 'shadow-amber-200' },
  }[toast.type];

  return (
    <div className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl text-white shadow-2xl animate-in slide-in-from-right-10 duration-300 ${config.bg} ${config.shadow}`}>
      <config.icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-bold tracking-tight">{toast.message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-4">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
