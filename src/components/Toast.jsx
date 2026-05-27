import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  let typeStyle = 'border-slate-300 bg-white text-slate-800';
  let icon = '•';

  switch (toast.type) {
    case 'success':
      typeStyle = 'border-green-300 bg-green-50 text-green-800';
      icon = '✓';
      break;
    case 'error':
      typeStyle = 'border-red-300 bg-red-50 text-red-800';
      icon = '×';
      break;
    case 'warning':
      typeStyle = 'border-amber-300 bg-amber-50 text-amber-800';
      icon = '!';
      break;
    case 'info':
      typeStyle = 'border-blue-300 bg-blue-50 text-blue-800';
      icon = 'i';
      break;
  }

  return (
    <div className={`p-3 border rounded text-xs flex items-center justify-between gap-3 shadow-md pointer-events-auto font-sans ${typeStyle}`}>
      <span className="font-bold shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 font-medium truncate">
        {toast.message}
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="text-slate-400 hover:text-slate-700 font-bold shrink-0 cursor-pointer font-mono"
      >
        ×
      </button>
    </div>
  );
}
