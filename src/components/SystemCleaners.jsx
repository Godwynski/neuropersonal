import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';
import ConfirmModal from './ConfirmModal';

export default function SystemCleaners() {
  const {
    runningFix,
    tempFolderSize,
    scanningTemp,
    purgingTemp,
    runDiagnosticFix,
    scanTempFolder,
    purgeTempFolder
  } = useAppContext();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {}
  });

  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

  const isAnyBusy = runningFix !== null || scanningTemp || purgingTemp;

  return (
    <div className="glass-panel p-5 rounded-xl border border-[#262626] space-y-4 relative">
      <h3 className="text-sm font-semibold text-gray-100 font-outfit uppercase tracking-widest border-b border-[#262626] pb-3">
        🧹 System Cleaners
      </h3>

      <div className="flex gap-2">
        {/* Clear RAM */}
        <button
          onClick={() => runDiagnosticFix('ramRejuvenation')}
          disabled={isAnyBusy}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            runningFix === 'ramRejuvenation'
              ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-[#141414] border border-[#262626] text-gray-300 hover:bg-[#262626]'
          }`}
        >
          {runningFix === 'ramRejuvenation' ? (
            <><Spinner className="w-3.5 h-3.5" /> Clearing...</>
          ) : 'Clear RAM'}
        </button>

        {/* Restart UI */}
        <button
          onClick={() => runDiagnosticFix('chronosReset')}
          disabled={isAnyBusy}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            runningFix === 'chronosReset'
              ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-[#141414] border border-[#262626] text-gray-300 hover:bg-[#262626]'
          }`}
        >
          {runningFix === 'chronosReset' ? (
            <><Spinner className="w-3.5 h-3.5" /> Restarting UI...</>
          ) : 'Restart UI'}
        </button>
      </div>

      {/* Temp Folder Scrubber */}
      <div className="pt-4 border-t border-[#262626] flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs font-medium text-gray-400">
          <span>OS Temp Directory:</span>
          <span className={`font-mono font-semibold ${
            scanningTemp ? 'text-[#3b82f6] animate-pulse' : purgingTemp ? 'text-[#ff4655] animate-pulse' : 'text-gray-200'
          }`}>
            {scanningTemp ? 'Scanning...' : purgingTemp ? 'Purging...' : tempFolderSize}
          </span>
        </div>
        
        <div className="flex gap-2">
          {/* Scan Temp */}
          <button
            onClick={scanTempFolder}
            disabled={isAnyBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#262626] text-gray-300 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {scanningTemp ? (
              <><Spinner className="w-3 h-3" /> Scanning...</>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                Scan Temp
              </>
            )}
          </button>

          {/* Purge Temp */}
          <button
            onClick={() => {
              setConfirmDialog({
                isOpen: true,
                title: 'Purge Temporary Files',
                message: 'Are you sure you want to purge all files in your temporary directories? This cannot be undone.',
                variant: 'danger',
                onConfirm: () => {
                  purgeTempFolder();
                  closeConfirm();
                }
              });
            }}
            disabled={isAnyBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-white bg-[#ff4655] hover:bg-[#ff4655]/90 text-xs font-medium transition-all shadow-[0_0_10px_rgba(255,70,85,0.2)] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {purgingTemp ? (
              <><Spinner className="w-3 h-3" /> Purging...</>
            ) : 'Purge Temp'}
          </button>
        </div>

        {/* Status hint */}
        {isAnyBusy && (
          <div className="text-[10px] text-[#3b82f6] font-medium flex items-center gap-1.5 mt-1">
            <Spinner className="w-3 h-3" />
            {runningFix === 'ramRejuvenation' && 'Flushing memory heap...'}
            {runningFix === 'chronosReset' && 'Restarting Windows Explorer...'}
            {scanningTemp && 'Calculating temp folder size...'}
            {purgingTemp && 'Deleting temporary files...'}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
