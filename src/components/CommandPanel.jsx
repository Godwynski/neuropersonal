import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CommandPanel({
  cmdInput,
  setCmdInput,
  terminalLogs,
  executing,
  runCommand,
  radarHops,
  activeStyle,
  terminalEndRef
}) {
  return (
    <div className="space-y-6 h-full flex flex-col outline-none animate-in fade-in duration-300">
      <header className="space-y-1 shrink-0 font-mono">
        <h1 className="text-xl font-bold tracking-widest text-slate-200">CYBER DECK COMMAND PANEL</h1>
        <p className="text-xs text-indigo-400 mt-0.5">Query host PowerShell registry and audit path networks</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Command prompt stream */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950/80 border border-blue-500/10 rounded-xl overflow-hidden shadow-2xl relative min-h-0">
          <div className="h-10 bg-[#0c1222] border-b border-blue-500/10 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500/80" />
              <div className="w-2 h-2 rounded-full bg-amber-500/80" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500">PowerShell Mainstream Shell</span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-cyan-400/90 space-y-1 select-text">
            {terminalLogs.map((l, i) => <div key={i} className="whitespace-pre-wrap leading-5">{l}</div>)}
            <div ref={terminalEndRef} />
          </div>

          <div className="h-13 bg-[#0c1222] border-t border-blue-500/10 px-4 flex items-center gap-3 shrink-0">
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
            <button onClick={runCommand} disabled={executing || !cmdInput.trim()} className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-1 font-mono text-xs disabled:opacity-50 cursor-pointer">EXEC</button>
          </div>
        </div>

        {/* Right Column: Netrunner Geolocation Radar Map */}
        <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} flex flex-col justify-between items-center relative`}>
          <span className="absolute top-3 left-4 text-xs font-mono tracking-widest text-slate-500 uppercase font-bold font-mono">Network Netrunner Radar</span>

          {/* Radar Grid Graphic */}
          <div className="w-[180px] h-[180px] rounded-full border border-blue-500/10 relative flex items-center justify-center mt-4">
            {/* Concentric grids */}
            <div className="absolute w-[130px] h-[130px] rounded-full border border-blue-500/5" />
            <div className="absolute w-[80px] h-[80px] rounded-full border border-blue-500/5" />
            {/* Radar sweep arm line */}
            <div className="absolute w-[90px] h-[1px] bg-gradient-to-r from-transparent to-blue-500/80 origin-left left-1/2 animate-[spin_4s_linear_infinite]" />

            {/* Render plotted Hop Nodes */}
            {radarHops.map(h => {
              const radAngle = (h.angle * Math.PI) / 180;
              const x = Math.cos(radAngle) * h.radius;
              const y = Math.sin(radAngle) * h.radius;
              return (
                <div 
                  key={h.id}
                  className="absolute w-2.5 h-2.5 rounded-full group cursor-pointer"
                  style={{ left: `calc(50% + ${x}px - 5px)`, top: `calc(50% + ${y}px - 5px)` }}
                >
                  <div className="w-full h-full rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                  {/* Tooltip hover */}
                  <div className="absolute bg-[#0c1222] border border-emerald-500/30 p-2 rounded shadow-2xl z-50 pointer-events-none hidden group-hover:block font-mono text-xs text-emerald-400 w-[140px] -translate-x-[60px] translate-y-3">
                    <strong className="block text-slate-200">{h.host}</strong>
                    <span>IP: {h.ip}</span>
                    <span className="block mt-0.5">Latency: {h.pingMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radar Feed Details list */}
          <div className="w-full font-mono text-xs space-y-1 mt-6 border-t border-blue-500/10 pt-4 flex-1 overflow-y-auto">
            <span className="text-slate-500 uppercase tracking-widest font-bold block mb-1">TRACEROUTE NODE REGISTRY</span>
            {radarHops.map(h => (
              <div key={h.id} className="flex justify-between text-slate-400 border-b border-blue-500/5 py-1">
                <span className="truncate max-w-[100px]">{h.host} ({h.ip})</span>
                <span className="text-emerald-400 font-bold shrink-0">{h.pingMs} ms</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
