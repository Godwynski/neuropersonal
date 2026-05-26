import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast, activeStyle }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} removeToast={removeToast} activeStyle={activeStyle} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast, activeStyle }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  let borderCol = '';
  let textCol = '';
  let shadow = '';
  let icon = '';

  switch (toast.type) {
    case 'success':
      borderCol = 'border-emerald-500/35';
      textCol = 'text-emerald-400';
      shadow = 'shadow-[0_0_12px_rgba(16,185,129,0.2)]';
      icon = '✓';
      break;
    case 'error':
      borderCol = 'border-rose-500/35';
      textCol = 'text-rose-400';
      shadow = 'shadow-[0_0_12px_rgba(239,68,68,0.2)]';
      icon = '✕';
      break;
    case 'warning':
      borderCol = 'border-amber-500/35';
      textCol = 'text-amber-400';
      shadow = 'shadow-[0_0_12px_rgba(245,158,11,0.2)]';
      icon = '⚠';
      break;
    default:
      borderCol = 'border-cyan-500/35';
      textCol = 'text-cyan-400';
      shadow = 'shadow-[0_0_12px_rgba(6,182,212,0.2)]';
      icon = 'ℹ';
      break;
  }

  return (
    <div className={`bg-slate-950/90 backdrop-blur-md border ${borderCol} ${shadow} p-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto`}>
      <span className={`text-sm font-bold ${textCol}`}>{icon}</span>
      <div className="flex-1 font-mono">
        <p className={`text-xs ${textCol}`}>{toast.message}</p>
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="text-slate-500 hover:text-slate-300 transition-colors text-xs p-0.5"
      >
        ✕
      </button>
    </div>
  );
}
