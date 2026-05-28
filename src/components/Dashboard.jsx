import React from 'react';

export default function Dashboard({ 
  stats, 
  runDiagnosticFix, 
  runningFix,
  premadeMacros,
  runningMacro,
  runMacro,
  fixStatusText,
  gpuInfo,
  maxBoostActive,
  maxBoostProgress,
  maxBoostLogs,
  maxBoostStatus,
  toggleMaxBoost,
  registryStates,
  gameModeActive,
  powerPlanMode,
  timerResActive,
  boostProfile = 'safe'
}) {
  return (
    <div className="space-y-6 font-sans text-slate-800 bg-white p-2">
      
      {runningFix && (
        <div className="w-full border border-slate-300 bg-slate-50 p-3 flex justify-between items-center text-xs rounded">
          <span>⚙ {fixStatusText}</span>
          <span className="animate-pulse font-bold">RUNNING</span>
        </div>
      )}

      {/* One-Click Optimize Skeletal Card */}
      <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold">One-Click System Optimize</h2>
            <p className="text-[11px] text-slate-500">Auto-tunes game settings, latency configurations, and service tasks.</p>
          </div>
          <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded uppercase">{maxBoostStatus}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="p-3 border border-slate-200 bg-white rounded text-center flex flex-col justify-between md:w-48">
            <div>
              <span className="text-xs font-bold text-slate-650 block">Engine Overdrive</span>
              <span className={`text-[9px] font-mono font-bold uppercase ${boostProfile === 'safe' ? 'text-green-650' : 'text-amber-700'}`}>
                ({boostProfile} profile)
              </span>
            </div>
            <div className="my-2">
              <button
                onClick={() => toggleMaxBoost(!maxBoostActive, boostProfile)}
                disabled={maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold rounded cursor-pointer disabled:bg-slate-300 w-full"
              >
                {maxBoostActive ? 'ACTIVE' : 'BOOST'}
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              Latency Adjustment: {maxBoostActive ? (boostProfile === 'safe' ? '−6.2ms' : '−12.8ms') : '0.0ms'}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="text-xs font-bold flex justify-between">
              <span>Progress Bar</span>
              <span>{maxBoostProgress}%</span>
            </div>
            <div className="w-full h-3 border border-slate-200 bg-slate-100 rounded overflow-hidden">
              <div 
                className="h-full bg-slate-700 transition-all duration-300"
                style={{ width: `${maxBoostProgress}%` }}
              />
            </div>

            {/* Simple Text Logger */}
            <div className="border border-slate-200 bg-white p-2 font-mono text-[10px] rounded h-20 overflow-y-auto">
              {maxBoostLogs.length === 0 ? (
                <span className="text-slate-400">Logger is standby...</span>
              ) : (
                maxBoostLogs.map((log, index) => (
                  <div key={index} className="text-slate-600">&gt; {log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Stats Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Processor Card */}
        <div className="p-4 border border-slate-200 bg-white rounded space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider border-b pb-1.5">Processor</span>
          <div className="text-xs font-mono">
            <div className="font-bold">{stats.cpuModel}</div>
            <div className="mt-1 text-slate-500">{stats.cpuCores} Threads</div>
          </div>
        </div>

        {/* Resources Cards */}
        <div className="md:col-span-2 p-4 border border-slate-200 bg-white rounded space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider border-b pb-1.5">Resource Telemetry</span>
          
          <div className="space-y-2 text-xs">
            {/* RAM */}
            <div>
              <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                <span>Memory</span>
                <span>{stats.usedMemGB} GB / {stats.totalMemGB} GB ({stats.memUsagePercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                <div className="h-full bg-slate-500" style={{ width: `${stats.memUsagePercent}%` }} />
              </div>
            </div>

            {/* CPU */}
            <div>
              <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                <span>CPU Load</span>
                <span>{stats.cpuLoad}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded overflow-hidden">
                <div className="h-full bg-slate-500" style={{ width: `${stats.cpuLoad}%` }} />
              </div>
            </div>

            {gpuInfo && (
              <div className="pt-1.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-600">
                <span>GPU: {gpuInfo.name}</span>
                <span>{gpuInfo.temperature}°C | Load: {gpuInfo.utilization}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registry Checks */}
      <div className="p-4 border border-slate-200 bg-white rounded space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">Live Parameters Checklist</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            { label: 'HAGS', val: registryStates.hagsEnabled ? 'Enabled' : 'Disabled' },
            { label: 'Game Mode', val: gameModeActive ? 'On' : 'Off' },
            { label: 'Power Plan', val: powerPlanMode === 'high' ? 'High Perf.' : 'Balanced' },
            { label: 'MM Priority', val: registryStates.priorityOptimized ? 'High' : 'Default' },
            { label: 'Timer Res', val: timerResActive ? '0.5ms' : '15.6ms' },
            { label: 'VRAM Detect', val: gpuInfo.vramMB ? `${Math.round(gpuInfo.vramMB / 1024)}GB` : 'N/A' }
          ].map((item, index) => (
            <div key={index} className="p-2 border border-slate-100 bg-slate-50 rounded text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</div>
              <div className="mt-1 font-mono font-bold text-[11px] text-slate-800">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions / Macros */}
      <div className="p-4 border border-slate-200 bg-white rounded space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">Quick Actions (Macros)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {premadeMacros.map(macro => (
            <div key={macro.key} className="p-3 border border-slate-200 bg-slate-50 rounded flex flex-col justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{macro.name}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{macro.desc}</p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-[10px]">
                <code className="text-[9px] text-slate-600 truncate max-w-[100px] bg-white px-1 border rounded">{macro.cmd}</code>
                <button
                  onClick={() => runMacro(macro.key, macro.name, macro.cmd)}
                  disabled={runningMacro !== null}
                  className="px-2.5 py-1 bg-slate-850 hover:bg-slate-700 text-white rounded text-[9px] font-bold cursor-pointer disabled:bg-slate-350"
                >
                  {runningMacro === macro.key ? 'RUNNING...' : 'RUN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics */}
      <div className="p-4 border border-slate-200 bg-white rounded space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1.5">Quick Diagnostics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => runDiagnosticFix('ramRejuvenation')}
            disabled={runningFix !== null}
            className="p-3 border border-slate-200 hover:border-slate-400 bg-white rounded text-left cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-slate-800">Clear RAM Cache</div>
            <p className="text-[10px] text-slate-500 mt-1">Runs garbage collection to release active memory heaps.</p>
          </button>
          <button
            onClick={() => runDiagnosticFix('chronosReset')}
            disabled={runningFix !== null}
            className="p-3 border border-slate-200 hover:border-slate-400 bg-white rounded text-left cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-slate-800">Restart Explorer</div>
            <p className="text-[10px] text-slate-500 mt-1">Kills and restarts explorer.exe to resolve desktop GUI freezes.</p>
          </button>
        </div>
      </div>

    </div>
  );
}
