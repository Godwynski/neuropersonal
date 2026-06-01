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
    <div className="border-[3px] border-pencil-black bg-white p-4 wobbly-md hand-shadow space-y-4 relative">
      {/* Tape decoration at top */}
      <div className="absolute -top-3 left-16 w-14 h-4.5 bg-pencil-black/10 border border-pencil-black/20 rotate-1 pointer-events-none" />

      <h3 className="text-sm font-bold text-pencil-black font-kalam uppercase tracking-wider border-b-2 border-pencil-black pb-1.5">
        🧹 System Cleaners
      </h3>

      <div className="flex gap-2">
        {/* Clear RAM */}
        <button
          onClick={() => runDiagnosticFix('ramRejuvenation')}
          disabled={isAnyBusy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border-2 border-pencil-black wobbly font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
            runningFix === 'ramRejuvenation'
              ? 'bg-accent-blue text-white translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-[#fff9c4] hover:bg-[#fff7b1] text-pencil-black hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
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
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border-2 border-pencil-black wobbly font-bold cursor-pointer disabled:cursor-not-allowed transition-all ${
            runningFix === 'chronosReset'
              ? 'bg-accent-blue text-white translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white hover:bg-paper-muted text-pencil-black hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          }`}
        >
          {runningFix === 'chronosReset' ? (
            <><Spinner className="w-3 h-3" /> Restarting UI...</>
          ) : 'Restart UI'}
        </button>
      </div>

      {/* Temp Folder Scrubber */}
      <div className="pt-3 border-t-2 border-dashed border-pencil-black flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-pencil-black/90 font-bold">
          <span>OS Temp Directory:</span>
          <span className={`font-mono text-xs font-bold ${
            scanningTemp ? 'text-accent-blue animate-pulse' : purgingTemp ? 'text-accent-red animate-pulse' : 'text-pencil-black'
          }`}>
            {scanningTemp ? 'Scanning...' : purgingTemp ? 'Purging...' : tempFolderSize}
          </span>
        </div>
        
        <div className="flex gap-2">
          {/* Scan Temp */}
          <button
            onClick={scanTempFolder}
            disabled={isAnyBusy}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 border-2 border-pencil-black wobbly-md text-[11px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all bg-white hover:bg-paper-muted text-pencil-black hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
          >
            {scanningTemp ? (
              <><Spinner className="w-2.5 h-2.5" /> Scanning...</>
            ) : (
              <>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 border-2 border-pencil-black wobbly-md text-[11px] font-bold cursor-pointer disabled:cursor-not-allowed transition-all bg-accent-red hover:bg-accent-red/90 text-white hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
          >
            {purgingTemp ? (
              <><Spinner className="w-2.5 h-2.5" /> Purging...</>
            ) : 'Purge Temp'}
          </button>
        </div>

        {/* Status hint */}
        {isAnyBusy && (
          <div className="text-[10px] text-accent-blue font-bold flex items-center gap-1">
            <Spinner className="w-2.5 h-2.5" />
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
