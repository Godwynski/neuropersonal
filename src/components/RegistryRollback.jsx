import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

// Inline spinner component
function Spinner({ className = 'w-3 h-3' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export default function RegistryRollback() {
  const {
    registryBackups,
    loadRegistryBackups,
    clearAllBackups,
    restoreAllBackups,
    deleteBackup,
    restoreBackup,
    isProcessing,
    executeOperation
  } = useAppContext();

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
    if (window.confirm(
      "Are you sure you want to restore ALL modifications? " +
      "This will revert every customized registry tweak in this list to its original Windows default value.\n\n" +
      "Note: Reverted tweaks will disappear from this tracking list."
    )) {
      withHeaderLoading('restoreAll', restoreAllBackups);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(
      "Warning: Clearing backup history ONLY deletes the tracking list from this dashboard. " +
      "It does NOT restore or revert any registry values to their original state.\n\n" +
      "To revert registry settings, click 'Restore All' or use individual 'Restore' buttons.\n\n" +
      "Do you want to proceed with clearing the history list?"
    )) {
      withHeaderLoading('clearHistory', clearAllBackups);
    }
  };

  const isAnyLoading = isProcessing || headerLoading !== null || Object.values(rowLoading).some(v => v !== null);

  return (
    <div className="border-[3px] border-pencil-black bg-white p-4 wobbly hand-shadow space-y-3 text-xs relative">
      {/* Tape decoration at top */}
      <div className="absolute -top-3 left-10 w-14 h-4.5 bg-pencil-black/10 border border-pencil-black/20 -rotate-1 pointer-events-none" />

      <div className="flex justify-between items-center border-b-2 border-pencil-black pb-2">
        <h3 className="text-sm font-bold text-pencil-black font-kalam uppercase tracking-wider">📋 Registry Rollback</h3>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="flex items-center gap-1 text-[11px] text-pencil-black/70 hover:text-pencil-black font-bold cursor-pointer disabled:opacity-40 transition-opacity"
          >
            {headerLoading === 'refresh' ? (
              <><Spinner className="w-2.5 h-2.5" /> ...</>
            ) : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
        {registryBackups.length === 0 ? (
          <div className="text-[11px] text-pencil-black/55 text-center py-2 italic font-semibold">
            No active backup references stored. Redo tweaks to log values here.
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="p-2 border-2 border-dashed border-accent-blue bg-paper-muted/30 wobbly-md text-[10px] text-pencil-black font-semibold leading-normal">
              ℹ️ Click <strong>Restore</strong> to revert settings. Click <strong>Forget</strong> to remove from logs.
            </div>
            
            {/* Header Actions when backups exist */}
            <div className="flex justify-end gap-2 pb-1">
              <button
                onClick={handleRestoreAll}
                disabled={isAnyLoading}
                className="text-[10px] text-accent-blue font-bold cursor-pointer disabled:opacity-40 underline"
                title="Restores all original registry values from this list"
              >
                {headerLoading === 'restoreAll' ? 'Restoring All...' : 'Restore All'}
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isAnyLoading}
                className="text-[10px] text-accent-red font-bold cursor-pointer disabled:opacity-40 underline"
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
                  className={`border-2 border-pencil-black p-2 bg-paper-bg flex justify-between items-center gap-2 transition-opacity wobbly-md ${isRowDisabled && !isRowBusy ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[11px] text-pencil-black truncate font-kalam" title={`${b.keyPath}\\${b.valueName}`}>
                      {b.valueName}
                    </div>
                    <div className="text-[10px] text-pencil-black/60 truncate font-mono">
                      Orig: <span className="font-bold">{b.value}</span>
                    </div>
                    {isRowBusy && (
                      <div className="text-[9px] text-accent-blue font-bold mt-0.5 flex items-center gap-1">
                        <Spinner className="w-2 h-2" />
                        {rowState === 'restore' ? 'Restoring...' : 'Removing...'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {/* Forget */}
                    <button
                      onClick={() => withRowLoading(idx, 'forget', () => deleteBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-1.5 border border-pencil-black text-pencil-black rounded-none text-[9px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all wobbly-md ${
                        rowState === 'forget'
                          ? 'bg-paper-muted text-pencil-black/40 shadow-none'
                          : 'bg-white hover:bg-paper-muted shadow-none active:translate-x-[1px] active:translate-y-[1px]'
                      }`}
                      title="Deletes this reference only (does not revert value)"
                    >
                      {rowState === 'forget' ? 'Removing' : 'Forget'}
                    </button>

                    {/* Restore */}
                    <button
                      onClick={() => withRowLoading(idx, 'restore', () => restoreBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-2 border-2 border-pencil-black text-[9px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all wobbly-md ${
                        rowState === 'restore'
                          ? 'bg-pencil-black text-white shadow-none'
                          : 'bg-pencil-black hover:bg-pencil-black/90 text-white hand-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
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
    </div>
  );
}
