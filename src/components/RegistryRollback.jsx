import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function RegistryRollback() {
  const {
    registryBackups,
    loadRegistryBackups,
    clearAllBackups,
    deleteBackup,
    restoreBackup
  } = useAppContext();

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3 text-xs">
      <div className="flex justify-between items-center border-b pb-1.5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registry Rollback</h3>
        <div className="flex gap-2">
          <button 
            onClick={loadRegistryBackups}
            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            Refresh
          </button>
          {registryBackups.length > 0 && (
            <button 
              onClick={clearAllBackups}
              className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
        {registryBackups.length === 0 ? (
          <div className="text-[10px] text-slate-400 text-center py-2">
            No registry backups found. Modifications will back up original values here.
          </div>
        ) : (
          registryBackups.map((b, idx) => {
            const label = b.valueName;
            return (
              <div key={idx} className="border border-slate-150 p-2 rounded bg-slate-50 flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[10px] text-slate-700 truncate" title={`${b.keyPath}\\${b.valueName}`}>
                    {label}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    Original: <span className="font-mono">{b.value}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => deleteBackup(idx)}
                    className="py-1 px-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded text-[9px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => restoreBackup(idx)}
                    className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-bold cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
