import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

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

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3 text-xs">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">System Cleaners</h3>
      
      <div className="flex gap-2">
        <button
          onClick={() => runDiagnosticFix('ramRejuvenation')}
          disabled={runningFix !== null}
          className="flex-1 py-1.5 px-2 border border-slate-200 hover:bg-slate-50 bg-white rounded text-center cursor-pointer disabled:opacity-50 font-bold"
        >
          Clear RAM
        </button>
        <button
          onClick={() => runDiagnosticFix('chronosReset')}
          disabled={runningFix !== null}
          className="flex-1 py-1.5 px-2 border border-slate-200 hover:bg-slate-50 bg-white rounded text-center cursor-pointer disabled:opacity-50 font-bold"
        >
          Restart UI
        </button>
      </div>

      {/* Temp Folder Scrubber */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[11px] text-slate-600">
          <span>OS Temp Directory:</span>
          <span className="font-mono font-bold text-slate-750">{tempFolderSize}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={scanTempFolder}
            disabled={scanningTemp || purgingTemp}
            className="flex-1 py-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-[10px] font-bold cursor-pointer disabled:opacity-50"
          >
            Scan Temp
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to purge all files in your temporary directories? This cannot be undone.")) {
                purgeTempFolder();
              }
            }}
            disabled={purgingTemp || scanningTemp}
            className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold cursor-pointer disabled:opacity-50"
          >
            Purge Temp
          </button>
        </div>
      </div>
    </div>
  );
}
