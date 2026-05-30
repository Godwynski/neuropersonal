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
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3 text-xs">
      <div className="flex justify-between items-center border-b pb-1.5 font-bold">
        <h3 className="text-xs text-slate-500 uppercase tracking-wider">Registry Rollback</h3>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="flex items-center gap-1 text-[10px] text-slate-555 hover:text-slate-800 font-bold cursor-pointer disabled:opacity-40 transition-opacity"
          >
            {headerLoading === 'refresh' ? (
              <><Spinner className="w-2.5 h-2.5" /> Refreshing...</>
            ) : (
              <><svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Refresh</>
            )}
          </button>

          {registryBackups.length > 0 && (
            <>
              {/* Restore All */}
              <button
                onClick={handleRestoreAll}
                disabled={isAnyLoading}
                className="flex items-center gap-1 text-[10px] text-green-600 hover:text-green-800 font-bold cursor-pointer disabled:opacity-40 transition-opacity"
                title="Restores all original registry values from this list"
              >
                {headerLoading === 'restoreAll' ? (
                  <><Spinner className="w-2.5 h-2.5" /> Restoring...</>
                ) : 'Restore All'}
              </button>

              {/* Clear History */}
              <button
                onClick={handleClearHistory}
                disabled={isAnyLoading}
                className="flex items-center gap-1 text-[10px] text-rose-650 hover:text-rose-800 font-bold cursor-pointer disabled:opacity-40 transition-opacity"
                title="Deletes backup references from history tracker (does not restore registry)"
              >
                {headerLoading === 'clearHistory' ? (
                  <><Spinner className="w-2.5 h-2.5" /> Clearing...</>
                ) : 'Clear History'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
        {registryBackups.length === 0 ? (
          <div className="text-[10px] text-slate-400 text-center py-2 italic">
            No active registry backup references stored. Modifications will back up original values here.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2 border border-blue-150 bg-blue-50/30 rounded text-[9px] text-blue-800 leading-normal">
              ℹ️ Click <strong>Restore</strong> to revert a value to its original Windows setting. Click <strong>Forget</strong> to remove it from the tracking list without reverting.
            </div>
            {registryBackups.map((b, idx) => {
              const rowState = rowLoading[idx];
              const isRowBusy = rowState !== null && rowState !== undefined;
              const isRowDisabled = isAnyLoading;

              return (
                <div
                  key={idx}
                  className={`border border-slate-150 p-2 rounded bg-slate-50 flex justify-between items-center gap-2 transition-opacity ${isRowDisabled && !isRowBusy ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[10px] text-slate-700 truncate" title={`${b.keyPath}\\${b.valueName}`}>
                      {b.valueName}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      Original: <span className="font-mono">{b.value}</span>
                    </div>
                    {isRowBusy && (
                      <div className="text-[9px] text-indigo-500 font-semibold mt-0.5 flex items-center gap-1">
                        <Spinner className="w-2 h-2" />
                        {rowState === 'restore' ? 'Restoring registry value...' : 'Removing reference...'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {/* Forget */}
                    <button
                      onClick={() => withRowLoading(idx, 'forget', () => deleteBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-1.5 border border-slate-205 text-slate-600 rounded text-[9px] font-bold cursor-pointer disabled:cursor-not-allowed font-sans transition-all ${
                        rowState === 'forget'
                          ? 'bg-slate-100 border-slate-300 text-slate-500'
                          : 'hover:bg-slate-100'
                      }`}
                      title="Deletes this reference only (does not revert value)"
                    >
                      {rowState === 'forget' ? <><Spinner className="w-2.5 h-2.5" /> Removing</> : 'Forget'}
                    </button>

                    {/* Restore */}
                    <button
                      onClick={() => withRowLoading(idx, 'restore', () => restoreBackup(idx))}
                      disabled={isRowDisabled}
                      className={`flex items-center gap-1 py-1 px-2.5 rounded text-[9px] font-bold cursor-pointer disabled:cursor-not-allowed font-sans transition-all ${
                        rowState === 'restore'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                      title="Restores the original value back to Windows registry"
                    >
                      {rowState === 'restore' ? <><Spinner className="w-2.5 h-2.5" /> Restoring</> : 'Restore'}
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
