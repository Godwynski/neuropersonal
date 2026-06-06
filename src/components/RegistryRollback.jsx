import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';
import ConfirmModal from './ConfirmModal';

export default function RegistryRollback() {
  const {
    registryBackups,
    loadRegistryBackups,
    autoBoostActive,
    setAutoBoostActive,
    clearAllBackups,
    restoreAllBackups,
    deleteBackup,
    restoreBackup,
    isProcessing,
    executeOperation
  } = useAppContext();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {}
  });

  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

  // Per-row loading: { idx: 'restore' | 'forget' | null }
  const [rowLoading, setRowLoading] = useState({});
  const [headerLoading, setHeaderLoading] = useState(null); // 'refresh' | 'restoreAll' | 'clearHistory'

  const withRowLoading = async (idx, type, fn) => {
    setRowLoading(prev => ({ ...prev, [idx]: type }));
    try { await fn(); } finally {
      setRowLoading(prev => ({ ...prev, [idx]: null }));
    }
  };

  const withHeaderLoading = async (type, fn) => {
    setHeaderLoading(type);
    try { await fn(); } finally { setHeaderLoading(null); }
  };

  const handleRefresh = () => withHeaderLoading('refresh', loadRegistryBackups);

  const handleRestoreAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore All Registry Changes',
      message: "Are you sure you want to restore ALL modifications?\n\nThis will revert every customized registry tweak in this list to its original Windows default value.\n\nNote: Reverted tweaks will disappear from this tracking list.",
      variant: 'warning',
      onConfirm: () => {
        withHeaderLoading('restoreAll', restoreAllBackups);
        closeConfirm();
      }
    });
  };

  const handleClearHistory = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Backup Logs',
      message: "Warning: Clearing backup history ONLY deletes the tracking list from this dashboard.\n\nIt does NOT restore or revert any registry values to their original state.\n\nTo revert registry settings, click 'Restore All' or use individual 'Restore' buttons.\n\nDo you want to proceed with clearing the history list?",
      variant: 'danger',
      onConfirm: () => {
        withHeaderLoading('clearHistory', clearAllBackups);
        closeConfirm();
      }
    });
  };

  const isAnyLoading = isProcessing || headerLoading !== null || Object.values(rowLoading).some(v => v !== null);

  const [runOnStartup, setRunOnStartup] = useState(false);

  useEffect(() => {
    if (window.api && window.api.getLoginItem) {
      window.api.getLoginItem().then(enabled => setRunOnStartup(enabled));
    }
  }, []);

  const toggleStartup = async () => {
    const nextVal = !runOnStartup;
    setRunOnStartup(nextVal);
    if (window.api && window.api.setLoginItem) {
      await window.api.setLoginItem(nextVal);
    }
  };

  return (
    <div className="space-y-8">
      {/* System Automation Settings */}
      <div className="glass-panel p-5 rounded-xl border border-[#262626] space-y-4">
        <div className="border-b border-[#262626] pb-3">
          <h3 className="text-sm font-semibold text-gray-100 font-outfit uppercase tracking-widest">⚙️ System Automation</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-4 sm:gap-0 bg-[#141414] border border-[#262626] p-4 rounded-lg">
            <div>
              <div className="font-bold text-gray-200 text-sm">Run on Startup</div>
              <div className="text-xs text-gray-500 mt-1">Automatically launch NeurOptimize in the background when Windows starts.</div>
            </div>
            <button 
              onClick={toggleStartup}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${runOnStartup ? 'bg-[#3b82f6]' : 'bg-[#262626]'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${runOnStartup ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-4 sm:gap-0 bg-[#141414] border border-[#262626] p-4 rounded-lg">
            <div>
              <div className="font-bold text-gray-200 text-sm">Auto-Boost on Game Launch</div>
              <div className="text-xs text-gray-500 mt-1">Automatically applies your Max Performance tweaks when VALORANT runs.</div>
            </div>
            <button 
              onClick={() => setAutoBoostActive(!autoBoostActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${autoBoostActive ? 'bg-[#3b82f6]' : 'bg-[#262626]'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBoostActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

    <div className="glass-panel p-5 rounded-xl border border-[#262626] space-y-4 relative">
      <div className="flex justify-between items-center border-b border-[#262626] pb-3">
        <h3 className="text-sm font-semibold text-gray-100 font-outfit uppercase tracking-widest">📋 Registry Rollback</h3>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            {headerLoading === 'refresh' ? (
              <><Spinner className="w-3 h-3" /> ...</>
            ) : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {registryBackups.length === 0 ? (
          <div className="text-[11px] text-gray-500 text-center py-3 font-medium">
            No active backup references stored. Redo tweaks to log values here.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[10px] text-gray-300 font-medium leading-relaxed">
              <span className="text-[#3b82f6] mr-1">ℹ️</span>
              Click <strong className="text-white">Restore</strong> to revert settings. Click <strong className="text-white">Forget</strong> to remove from logs.
            </div>
            
            {/* Header Actions when backups exist */}
            <div className="flex justify-end gap-3 pb-1">
              <button
                onClick={handleRestoreAll}
                disabled={isAnyLoading}
                className="text-[10px] text-[#3b82f6] font-medium hover:text-[#3b82f6]/80 disabled:opacity-50 transition-colors"
                title="Restores all original registry values from this list"
              >
                {headerLoading === 'restoreAll' ? 'Restoring All...' : 'Restore All'}
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isAnyLoading}
                className="text-[10px] text-[#ff4655] font-medium hover:text-[#ff4655]/80 disabled:opacity-50 transition-colors"
                title="Deletes backup references from history tracker (does not restore registry)"
              >
                {headerLoading === 'clearHistory' ? 'Clearing...' : 'Clear Logs'}
              </button>
            </div>

            {registryBackups.map((b, idx) => {
              const rowState = rowLoading[idx];
              const isRowBusy = rowState !== null && rowState !== undefined;
              const isRowDisabled = isAnyLoading;

              return (
                <div
                  key={idx}
                  className={`border border-[#262626] rounded-lg p-2.5 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${isRowDisabled && !isRowBusy ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-gray-200 truncate font-outfit" title={`${b.keyPath}\\${b.valueName}`}>
                      {b.valueName}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate font-mono mt-0.5">
                      Orig: <span className="text-gray-300">{b.value}</span>
                    </div>
                    {isRowBusy && (
                      <div className="text-[9px] text-[#3b82f6] font-medium mt-1 flex items-center gap-1.5">
                        <Spinner className="w-2.5 h-2.5" />
                        {rowState === 'restore' ? 'Restoring...' : 'Removing...'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {/* Forget */}
                    <button
                      onClick={() => withRowLoading(idx, 'forget', () => deleteBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-2 border border-[#262626] rounded text-[10px] font-medium transition-all disabled:opacity-50 ${
                        rowState === 'forget'
                          ? 'bg-[#262626] text-gray-500'
                          : 'bg-transparent text-gray-400 hover:bg-[#262626] hover:text-gray-200'
                      }`}
                      title="Deletes this reference only (does not revert value)"
                    >
                      {rowState === 'forget' ? 'Removing' : 'Forget'}
                    </button>

                    {/* Restore */}
                    <button
                      onClick={() => withRowLoading(idx, 'restore', () => restoreBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-2.5 rounded text-[10px] font-medium transition-all disabled:opacity-50 ${
                        rowState === 'restore'
                          ? 'bg-[#ff4655] text-white shadow-[0_0_10px_rgba(255,70,85,0.3)]'
                          : 'bg-[#262626] text-gray-200 hover:bg-[#ff4655] hover:text-white hover:shadow-[0_0_10px_rgba(255,70,85,0.2)]'
                      }`}
                      title="Restores the original value back to Windows registry"
                    >
                      {rowState === 'restore' ? 'Restoring' : 'Restore'}
                    </button>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}
