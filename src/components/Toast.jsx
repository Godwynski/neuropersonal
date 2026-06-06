import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  // Only render the 3 most recent toasts
  const visibleToasts = toasts.slice(-3);
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3.5 max-w-xs pointer-events-none">
      {visibleToasts.map((t) => (
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

  let typeStyle = 'border-[#262626] bg-white text-gray-200';
  let icon = '✏️';

  switch (toast.type) {
    case 'success':
      typeStyle = 'border-[#262626] bg-[#262626] text-gray-200'; // post-it yellow for successes!
      icon = '✓';
      break;
    case 'error':
      typeStyle = 'border-[#262626] bg-[#ff4655] text-white';
      icon = '×';
      break;
    case 'warning':
      typeStyle = 'border-[#262626] bg-[#262626] text-gray-200';
      icon = '⚠️';
      break;
    case 'info':
      typeStyle = 'border-[#262626] bg-white text-gray-200';
      icon = 'ℹ️';
      break;
  }

  return (
    <div className={`p-3 border rounded-lg text-xs flex items-center justify-between gap-3 shadow-md pointer-events-auto font-inter relative ${typeStyle}`}>
      <span className="font-bold shrink-0 font-outfit text-sm">{icon}</span>
      <div className="flex-1 min-w-0 font-bold">
        {toast.message}
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="hover:text-[#ff4655] font-bold shrink-0 cursor-pointer font-outfit text-sm"
      >
        ✕
      </button>
    </div>
  );
}
