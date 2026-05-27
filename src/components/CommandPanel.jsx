import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CommandPanel({
  cmdInput,
  setCmdInput,
  terminalLogs,
  executing,
  runCommand,
  activeStyle,
  terminalEndRef
}) {
  return (
    <div className="space-y-6 h-full flex flex-col outline-none animate-in fade-in duration-300 font-sans">
      <header className="space-y-1 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-200">Command Console</h1>
        <p className="text-sm text-indigo-400">Query host registry configurations and execute system utility commands directly via PowerShell</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Command prompt stream */}
        <div className="flex-1 flex flex-col bg-slate-950/80 border border-blue-500/10 rounded-xl overflow-hidden shadow-2xl relative min-h-0">
          <div className="h-11 bg-[#0c1222] border-b border-blue-500/10 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-400">PowerShell Terminal System</span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-cyan-400/90 space-y-1.5 select-text leading-relaxed">
            {terminalLogs.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
            <div ref={terminalEndRef} />
          </div>

          <div className="h-14 bg-[#0c1222] border-t border-blue-500/10 px-4 flex items-center gap-3 shrink-0">
            <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
            <input 
              type="text" 
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !executing) runCommand(); }}
              disabled={executing}
              placeholder="Input PowerShell script cmd lines..."
              className="flex-1 bg-transparent outline-none font-mono text-xs text-slate-100 placeholder-slate-600 disabled:opacity-50"
            />
            <button 
              onClick={runCommand} 
              disabled={executing || !cmdInput.trim()} 
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-1.5 font-semibold text-sm disabled:opacity-50 cursor-pointer transition"
            >
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
