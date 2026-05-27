import React from 'react';

export default function CommandPanel({
  cmdInput,
  setCmdInput,
  terminalLogs,
  executing,
  runCommand,
  terminalEndRef
}) {
  return (
    <div className="space-y-4 h-full flex flex-col font-sans text-slate-800 bg-white p-2">
      <header className="shrink-0 border-b border-slate-200 pb-2">
        <h1 className="text-lg font-bold">Command Console</h1>
        <p className="text-[11px] text-slate-500">Execute powershell terminal commands directly on the host OS.</p>
      </header>

      {/* Bare Console Box */}
      <div className="flex-1 min-h-0 flex flex-col border border-slate-200 bg-slate-50 rounded overflow-hidden">
        <div className="bg-slate-200 px-3 py-1.5 text-xs text-slate-650 font-bold border-b border-slate-200 flex justify-between select-none">
          <span>Powershell Terminal Shell</span>
          <span className="font-mono text-[10px]">{executing ? 'RUNNING...' : 'READY'}</span>
        </div>

        <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-slate-700 bg-white space-y-1 select-text">
          {terminalLogs.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap border-b border-slate-50 pb-1">&gt; {l}</div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-2 shrink-0">
          <input 
            type="text" 
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !executing) runCommand(); }}
            disabled={executing}
            placeholder="Enter command lines..."
            className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 font-mono text-xs text-slate-800 outline-none"
          />
          <button 
            onClick={runCommand} 
            disabled={executing || !cmdInput.trim()} 
            className="bg-slate-800 text-white font-bold text-xs px-4 py-1 rounded cursor-pointer hover:bg-slate-750 disabled:bg-slate-300 disabled:text-slate-500"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
