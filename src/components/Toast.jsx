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

  const isLight = activeStyle?.isLight;

  let borderCol = '';
  let textCol = '';
  let shadow = '';
  let icon = '';

  switch (toast.type) {
    case 'success':
      borderCol = 'border-emerald-400/60';
      textCol = isLight ? 'text-emerald-700' : 'text-emerald-400';
      shadow = 'shadow-[0_4px_16px_rgba(16,185,129,0.15)]';
      icon = '✓';
      break;
    case 'error':
      borderCol = 'border-rose-400/60';
      textCol = isLight ? 'text-rose-700' : 'text-rose-400';
      shadow = 'shadow-[0_4px_16px_rgba(239,68,68,0.15)]';
      icon = '✕';
      break;
    case 'warning':
      borderCol = 'border-amber-400/60';
      textCol = isLight ? 'text-amber-700' : 'text-amber-400';
      shadow = 'shadow-[0_4px_16px_rgba(245,158,11,0.15)]';
      icon = '⚠';
      break;
    default:
      borderCol = 'border-cyan-400/60';
      textCol = isLight ? 'text-cyan-700' : 'text-cyan-400';
      shadow = 'shadow-[0_4px_16px_rgba(6,182,212,0.15)]';
      icon = 'ℹ';
      break;
  }

  return (
    <div className={`${isLight ? 'bg-white border' : 'bg-slate-950/92 backdrop-blur-md border'} ${borderCol} ${shadow} p-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto`}>
      <span className={`text-sm font-bold ${textCol}`}>{icon}</span>
      <div className="flex-1 font-mono">
        <p className={`text-xs ${textCol}`}>{toast.message}</p>
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className={`transition-colors text-xs p-0.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
      >
        ✕
      </button>
    </div>
  );
}
