import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

function Spinner({ className = 'w-3 h-3' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

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

  const isAnyBusy = runningFix !== null || scanningTemp || purgingTemp;

  return (
    <div className="border border-slate-200 bg-white p-4 rounded shadow-sm space-y-3 text-xs">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">System Cleaners</h3>

      <div className="flex gap-2">
        {/* Clear RAM */}
        <button
          onClick={() => runDiagnosticFix('ramRejuvenation')}
          disabled={isAnyBusy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 border rounded text-center font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
            runningFix === 'ramRejuvenation'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
              : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700 disabled:opacity-50'
          }`}
        >
          {runningFix === 'ramRejuvenation' ? (
            <><Spinner className="w-3 h-3" /> Clearing...</>
          ) : 'Clear RAM'}
        </button>

        {/* Restart UI */}
        <button
          onClick={() => runDiagnosticFix('chronosReset')}
          disabled={isAnyBusy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 border rounded text-center font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
            runningFix === 'chronosReset'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
              : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700 disabled:opacity-50'
          }`}
        >
          {runningFix === 'chronosReset' ? (
            <><Spinner className="w-3 h-3" /> Restarting UI...</>
          ) : 'Restart UI'}
        </button>
      </div>

      {/* Temp Folder Scrubber */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[11px] text-slate-600">
          <span>OS Temp Directory:</span>
          <span className={`font-mono font-bold ${
            scanningTemp ? 'text-indigo-500' : purgingTemp ? 'text-rose-500' : 'text-slate-750'
          }`}>
            {scanningTemp ? 'Scanning...' : purgingTemp ? 'Purging...' : tempFolderSize}
          </span>
        </div>
        <div className="flex gap-1.5">
          {/* Scan Temp */}
          <button
            onClick={scanTempFolder}
            disabled={isAnyBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 border rounded text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
              scanningTemp
                ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50'
            }`}
          >
            {scanningTemp ? (
              <><Spinner className="w-2.5 h-2.5" /> Scanning...</>
            ) : (
              <>
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                Scan Temp
              </>
            )}
          </button>

          {/* Purge Temp */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to purge all files in your temporary directories? This cannot be undone.")) {
                purgeTempFolder();
              }
            }}
            disabled={isAnyBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
              purgingTemp
                ? 'bg-rose-400 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50'
            }`}
          >
            {purgingTemp ? (
              <><Spinner className="w-2.5 h-2.5" /> Purging...</>
            ) : 'Purge Temp'}
          </button>
        </div>

        {/* Status hint */}
        {isAnyBusy && (
          <div className="text-[9px] text-indigo-500 font-semibold flex items-center gap-1">
            <Spinner className="w-2 h-2" />
            {runningFix === 'ramRejuvenation' && 'Flushing memory heap...'}
            {runningFix === 'chronosReset' && 'Restarting Windows Explorer...'}
            {scanningTemp && 'Calculating temp folder size...'}
            {purgingTemp && 'Deleting temporary files...'}
          </div>
        )}
      </div>
    </div>
  );
}
