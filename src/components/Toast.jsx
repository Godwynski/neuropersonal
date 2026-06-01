import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3.5 max-w-xs pointer-events-none">
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

  let typeStyle = 'border-pencil-black bg-white text-pencil-black';
  let icon = '✏️';

  switch (toast.type) {
    case 'success':
      typeStyle = 'border-pencil-black bg-[#fff9c4] text-pencil-black'; // post-it yellow for successes!
      icon = '✓';
      break;
    case 'error':
      typeStyle = 'border-pencil-black bg-accent-red text-white';
      icon = '×';
      break;
    case 'warning':
      typeStyle = 'border-pencil-black bg-[#fff9c4] text-pencil-black';
      icon = '⚠️';
      break;
    case 'info':
      typeStyle = 'border-pencil-black bg-white text-pencil-black';
      icon = 'ℹ️';
      break;
  }

  return (
    <div className={`p-3 border-2 wobbly-md text-xs flex items-center justify-between gap-3 hand-shadow pointer-events-auto font-patrick relative ${typeStyle}`}>
      <span className="font-bold shrink-0 font-kalam text-sm">{icon}</span>
      <div className="flex-1 min-w-0 font-bold">
        {toast.message}
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="hover:text-accent-red font-bold shrink-0 cursor-pointer font-kalam text-sm"
      >
        ✕
      </button>
    </div>
  );
}
