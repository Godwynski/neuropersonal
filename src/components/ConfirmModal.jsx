import React from 'react';

/**
 * Paper-sketch styled confirm modal to replace window.confirm (#34).
 *
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string (can include newlines)
 *  - confirmLabel?: string (default "Confirm")
 *  - cancelLabel?: string (default "Cancel")
 *  - variant?: 'danger' | 'warning' | 'info' (default 'warning')
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      confirmBg: 'bg-[#ff4655] hover:bg-[#ff4655]/90 text-white',
      border: 'border-[#ff4655]'
    },
    warning: {
      icon: '⚡',
      confirmBg: 'bg-[#262626] hover:bg-[#3f3f46] text-gray-200',
      border: 'border-[#262626]'
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white',
      border: 'border-[#3b82f6]'
    }
  };

  const v = variantStyles[variant] || variantStyles.warning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pencil-black/40 backdrop-blur-[2px]" onClick={onCancel}>
      <div
        className={`bg-[#0a0a0a] border ${v.border} rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 space-y-4 font-inter`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b-2 border-[#262626] pb-2">
          <span className="text-lg">{v.icon}</span>
          <h3 className="font-bold text-gray-200 font-outfit text-sm">{title}</h3>
        </div>

        {/* Message */}
        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-semibold">
          {message}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 border border-[#262626] bg-[#0a0a0a] hover:bg-[#141414] text-gray-200 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 border border-[#262626] ${v.confirmBg} text-xs font-bold font-outfit rounded-lg cursor-pointer transition-all shadow-sm active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
