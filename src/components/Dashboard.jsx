import React from 'react';
import { Cpu, Monitor, Sparkles, Zap, Activity, RefreshCw, CheckCircle2, Circle } from 'lucide-react';

export default function Dashboard({ 
  stats, 
  activeStyle, 
  canvasRef, 
  setTheme, 
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
  timerResActive
}) {
  const getGradient = () => {
    if (activeStyle.textPrimary.includes('blue')) return 'from-blue-600 to-cyan-400';
    if (activeStyle.textPrimary.includes('emerald')) return 'from-emerald-600 to-green-400';
    if (activeStyle.textPrimary.includes('fuchsia')) return 'from-fuchsia-600 to-cyan-400';
    if (activeStyle.textPrimary.includes('amber')) return 'from-amber-600 to-orange-400';
    return 'from-blue-600 to-cyan-400';
  };

  const isLight = activeStyle.isLight;

  return (
    <div className="space-y-6 outline-none font-sans">
      
      {runningFix && (
        <div className={`w-full border rounded-xl p-4 flex items-center justify-between animate-pulse text-sm ${isLight ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-blue-500/10 border-blue-500/30'}`}>
          <span>⚡ {fixStatusText}</span>
          <span className="animate-spin text-blue-400">¤</span>
        </div>
      )}

      {/* One-Click System Optimize - Primary Hero Card */}
      <div className={`rounded-2xl border-2 transition-all duration-500 relative overflow-hidden ${
        maxBoostActive 
          ? (isLight 
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-400 shadow-[0_4px_24px_rgba(6,182,212,0.18)]' 
              : 'bg-[#060c18]/90 border-cyan-500/40 shadow-[0_0_24px_rgba(6,182,212,0.18)]') 
          : (isLight
              ? 'bg-white border-slate-200 shadow-[0_2px_12px_rgba(15,23,42,0.07)]'
              : 'bg-[#0b1220]/85 border-blue-500/15')
      }`}>

        {/* Grid line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.025)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Hero title row */}
        <div className={`relative z-10 flex items-center justify-between px-6 pt-5 pb-0`}>
          <div>
            <div className="flex items-center gap-2.5">
              <Zap className={`w-5 h-5 ${maxBoostActive ? 'text-cyan-500 animate-pulse' : activeStyle.textPrimary}`} />
              <h2 className={`text-base font-black tracking-tight ${activeStyle.textBody}`}>
                One-Click System Optimize
              </h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border tracking-wider ${
                maxBoostStatus === 'active'
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-600'
                  : maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-600'
                    : isLight ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {maxBoostStatus.toUpperCase()}
              </span>
            </div>
            <p className={`text-xs mt-1 ${activeStyle.textSub}`}>
              Applies all performance tweaks automatically — GPU scheduling, latency, power & more
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch relative z-10 p-6">
          
          {/* Boost Button Column */}
          <div className={`flex flex-col items-center justify-between p-5 rounded-xl border lg:w-[260px] shrink-0 text-center relative overflow-hidden ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090d16] border-white/5'
          }`}>

            {/* Glowing Action Button */}
            <div className="my-4 relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className={`absolute rounded-full transition-all duration-1000 ${
                maxBoostStatus === 'active' 
                  ? 'w-[130px] h-[130px] border border-cyan-500/40 animate-ping' 
                  : maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'
                    ? 'w-[130px] h-[130px] border border-amber-500/40 animate-spin border-dashed'
                    : `w-[110px] h-[110px] border ${activeStyle.border}`
              }`} />
              
              {/* Inner glowing ring */}
              <div className={`absolute rounded-full transition-all duration-700 ${
                maxBoostStatus === 'active' 
                  ? 'w-[110px] h-[110px] bg-cyan-500/12 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse' 
                  : maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'
                    ? 'w-[110px] h-[110px] bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : `w-[96px] h-[96px] ${isLight ? 'bg-white border border-slate-200' : 'bg-slate-950 border border-blue-500/10'}`
              }`} />

              <button
                onClick={() => toggleMaxBoost(!maxBoostActive)}
                disabled={maxBoostStatus === 'boosting' || maxBoostStatus === 'reverting'}
                aria-label={maxBoostActive ? 'Deactivate performance boost' : 'Activate performance boost'}
                className={`relative z-10 w-[96px] h-[96px] rounded-full flex flex-col items-center justify-center transition-all duration-300 text-xs font-black tracking-wider cursor-pointer border select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  maxBoostActive 
                    ? 'bg-cyan-500 border-cyan-300 text-slate-950 hover:bg-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.55)]' 
                    : isLight
                      ? 'bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-500 shadow-[0_2px_8px_rgba(15,23,42,0.1)]'
                      : 'bg-slate-950 hover:bg-slate-900 border-blue-500/30 hover:border-cyan-400/50 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]'
                }`}
              >
                {maxBoostStatus === 'boosting' ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : maxBoostStatus === 'reverting' ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                ) : (
                  <Zap className={`w-7 h-7 ${maxBoostActive ? 'fill-slate-950' : isLight ? 'text-blue-600' : 'text-cyan-500'}`} />
                )}
                <span className="text-xs mt-1 font-bold">
                  {maxBoostActive ? 'ACTIVE' : 'BOOST'}
                </span>
              </button>
            </div>

            {/* Delay reduction indicator */}
            <div className="w-full space-y-1.5">
              <div className={`flex justify-between text-xs font-semibold ${activeStyle.textSub}`}>
                <span>LATENCY REDUCTION</span>
                <span className={maxBoostActive ? 'text-cyan-500 font-bold' : ''}>
                  {maxBoostActive ? '−12.8ms' : '0.0ms'}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-950 border-blue-500/10'}`}>
                <div className={`h-full rounded-full transition-all duration-500 ${
                  maxBoostActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`} style={{ width: maxBoostActive ? '85%' : '0%' }} />
              </div>
            </div>

            {/* CTA hint when idle */}
            {maxBoostStatus === 'idle' && (
              <p className={`text-xs mt-3 font-sans ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                Click the button above to apply all optimizations in one go
              </p>
            )}
          </div>

          {/* Details & Logger Column */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            
            {/* Header info */}
            <div className={`flex justify-between items-center border-b pb-2.5 ${activeStyle.border}`}>
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${maxBoostActive ? 'text-cyan-500 animate-pulse' : activeStyle.textPrimary}`} />
                <span className={`text-sm font-bold tracking-wide uppercase ${activeStyle.textBody}`}>
                  System Overdrive Engine
                </span>
              </div>
              <span className={`text-xs ${activeStyle.textSub}`}>
                Profile: <strong className={maxBoostActive ? 'text-cyan-500' : activeStyle.textSub}>{maxBoostActive ? 'MAX OVERDRIVE' : 'DEFAULT'}</strong>
              </span>
            </div>

            {/* Progress & Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className={`text-xs ${activeStyle.textSub} font-sans leading-relaxed`}>
                  Applies low-level scheduler changes, disables power-limiting registry configs, and cleans GPU shader caches automatically.
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 text-xs">
                  <div className={`flex justify-between font-bold ${activeStyle.textSub}`}>
                    <span className="uppercase tracking-wider text-xs">Engine Progress</span>
                    <span className={maxBoostActive ? 'text-cyan-500' : activeStyle.textSub}>{maxBoostProgress}%</span>
                  </div>
                  <div className={`w-full h-4 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-blue-500/10'} p-[2px]`}>
                    <div className={`bg-gradient-to-r ${getGradient()} h-full rounded transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]`} style={{ width: `${maxBoostProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Console log */}
              <div className={`border rounded-lg p-3 font-mono text-xs h-[108px] flex flex-col justify-between overflow-hidden relative select-text ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-blue-500/10 text-slate-200'
              }`}>
                <span className={`absolute top-1 right-2 text-xs uppercase font-bold tracking-wider select-none ${activeStyle.textSub}`}>
                  Core Daemon
                </span>
                <div className="overflow-y-auto space-y-1 flex-1 pr-1 leading-tight max-h-[84px] select-text" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                  {maxBoostLogs.length === 0 ? (
                    <span className={`block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Console idle. Overdrive on standby.</span>
                  ) : (
                    maxBoostLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5 items-start">
                        <span className={`${isLight ? 'text-slate-400' : 'text-slate-500'} shrink-0`}>&gt;</span>
                        <span className={
                          log.includes('✨') || log.includes('SUCCESS') 
                            ? (isLight ? 'text-cyan-700' : 'text-cyan-400') 
                            : log.includes('⚡') 
                              ? (isLight ? 'text-blue-700 font-bold' : 'text-blue-400 font-bold') 
                              : isLight ? 'text-slate-700' : 'text-slate-300'
                        }>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Status nodes grid */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t text-xs font-semibold ${activeStyle.border}`}>
              {[
                { label: 'CPU Scheduler', active: maxBoostActive && maxBoostProgress >= 15 },
                { label: 'GPU Pipeline',  active: maxBoostActive && maxBoostProgress >= 30 },
                { label: 'Input Latency', active: maxBoostActive && maxBoostProgress >= 48 },
                { label: 'OS Threads',    active: maxBoostActive && maxBoostProgress >= 90 }
              ].map((node, i) => (
                <div 
                  key={i} 
                  className={`px-2 py-1.5 rounded border text-center transition-all duration-300 flex items-center justify-between gap-1.5 ${
                    node.active 
                      ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-700' 
                      : isLight
                        ? 'bg-white border-slate-200 text-slate-500'
                        : 'bg-slate-900/50 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="truncate">{node.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${node.active ? 'bg-cyan-500 animate-pulse' : isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SYSTEM STATS
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CPU Model Telemetry */}
        <div className={`p-6 flex flex-col justify-between rounded-xl border ${activeStyle.panelBg}`}>
          <div className="space-y-4">
            <span className={`text-xs tracking-wider uppercase font-bold ${activeStyle.textSub}`}>Processor Telemetry</span>
            <div className="space-y-2 pt-2">
              <h4 className={`text-sm font-bold ${activeStyle.textBody}`}>CPU Model</h4>
              <p className={`text-xs font-mono leading-relaxed text-indigo-400`}>
                {stats.cpuModel}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-blue-500/5 mt-4 flex items-center justify-between text-xs">
            <span className={activeStyle.textSub}>Cores:</span>
            <span className={`font-bold ${activeStyle.textBody}`}>{stats.cpuCores} Threads</span>
          </div>
        </div>

        {/* Attribute Gauges */}
        <div className={`lg:col-span-2 p-6 flex flex-col justify-between rounded-xl border ${activeStyle.panelBg}`}>
          <div className="space-y-4">
            <h3 className={`text-sm font-bold tracking-wider uppercase border-b pb-2 ${activeStyle.textBody} ${activeStyle.border}`}>Core Usage Metrics</h3>
            
            {/* HP RAM */}
            <div className="space-y-1.5 text-sm">
              <div className={`flex justify-between font-bold ${activeStyle.textBody}`}>
                <span className="text-emerald-600">RAM Usage</span>
                <span className="font-mono text-xs">{stats.usedMemGB} GB / {stats.totalMemGB} GB ({stats.memUsagePercent}%)</span>
              </div>
              <div className={`w-full h-5 rounded border p-[2px] ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-white/5'}`}>
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded transition-all" style={{ width: `${stats.memUsagePercent}%` }} />
              </div>
            </div>

            {/* MP CPU */}
            <div className="space-y-1.5 text-sm">
              <div className={`flex justify-between font-bold ${activeStyle.textBody}`}>
                <span className="text-purple-600">CPU Usage</span>
                <span className="font-mono text-xs">{stats.cpuLoad}% Load</span>
              </div>
              <div className={`w-full h-5 rounded border p-[2px] ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-white/5'}`}>
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-full rounded transition-all" style={{ width: `${stats.cpuLoad}%` }} />
              </div>
            </div>

            {/* GPU Info */}
            {gpuInfo && (
              <div className="space-y-1 text-sm pt-1">
                <div className={`flex justify-between font-bold ${activeStyle.textBody}`}>
                  <span className={gpuInfo.vendor === 'nvidia' ? 'text-green-600' : gpuInfo.vendor === 'amd' ? 'text-red-600' : 'text-blue-700'}>
                    GPU [{gpuInfo.name.toUpperCase()}]
                  </span>
                  <span className="font-mono text-xs">{gpuInfo.utilization ? `Load: ${gpuInfo.utilization}% | ` : ''}{gpuInfo.temperature ? `${gpuInfo.temperature}°C | ` : ''}{gpuInfo.vramMB ? `${Math.round(gpuInfo.vramMB/1024)}GB VRAM` : ''}</span>
                </div>
                <div className={`text-xs flex justify-between ${activeStyle.textSub}`}>
                  <span>Driver: {gpuInfo.driverVersion || 'N/A'}</span>
                  <span>{gpuInfo.refreshRate ? `${gpuInfo.refreshRate}Hz` : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════
          SYSTEM OPTIMIZATION AUDIT
      ═══════════════════════════════════════════════ */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
        <div className={`flex justify-between items-center border-b pb-3 ${activeStyle.border}`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${activeStyle.textAccent}`} />
            <h3 className={`text-sm font-bold tracking-wide uppercase ${activeStyle.textBody}`}>
              Optimization Status
            </h3>
          </div>
          <span className={`text-xs uppercase ${activeStyle.textSub}`}>Live Registry &amp; State Check</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { name: 'GPU VRAM', status: gpuInfo.vramMB ? `${Math.round(gpuInfo.vramMB / 1024)} GB` : 'N/A', verified: gpuInfo.vramMB > 0, desc: 'Detected VRAM from registry.' },
            { name: 'HAGS', status: registryStates.hagsEnabled ? 'Enabled' : 'Disabled', verified: registryStates.hagsEnabled, desc: 'Hardware-Accelerated GPU Scheduling.' },
            { name: 'Game Mode', status: gameModeActive ? 'On' : 'Off', verified: gameModeActive, desc: 'Windows GameBar auto mode.' },
            { name: 'Power Plan', status: powerPlanMode === 'high' ? 'High Perf.' : 'Balanced', verified: powerPlanMode === 'high', desc: 'Active power scheme.' },
            { name: 'MM Priority', status: registryStates.priorityOptimized ? 'High' : 'Default', verified: registryStates.priorityOptimized, desc: 'Multimedia scheduling priority.' },
            { name: 'Timer Res.', status: timerResActive ? '0.5ms' : '15.6ms', verified: timerResActive, desc: 'NtSetTimerResolution lock.' },
          ].map((audit, idx) => (
            <div key={idx} className={`p-3 rounded-lg border flex flex-col gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-white/5'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-xs ${activeStyle.textBody}`}>{audit.name}</span>
                {audit.verified 
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  : <Circle className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-300' : 'text-slate-650'}`} />
                }
              </div>
              <p className={`text-xs leading-relaxed font-sans ${activeStyle.textSub}`}>{audit.desc}</p>
              <div className={`mt-auto pt-2 border-t flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                <span className={`text-xs font-bold ${audit.verified ? 'text-emerald-600' : activeStyle.textSub}`}>
                  {audit.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-wider border ${
                  audit.verified 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : isLight 
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {audit.verified ? 'VERIFIED' : 'DEFAULT'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ONE-CLICK MACROS
      ═══════════════════════════════════════════════ */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
        <div className={`flex justify-between items-center border-b pb-3 ${activeStyle.border}`}>
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${activeStyle.textAccent}`} />
            <h3 className={`text-sm font-bold tracking-wide uppercase ${activeStyle.textBody}`}>
              Quick Actions
            </h3>
          </div>
          <span className={`text-xs uppercase ${activeStyle.textSub}`}>Run native fixes instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {premadeMacros.map(macro => {
            const MacroIcon = macro.icon;
            const isRunning = runningMacro === macro.key;

            return (
              <button
                key={macro.key}
                onClick={() => runMacro(macro.key, macro.name, macro.cmd)}
                disabled={runningMacro !== null}
                className={`border rounded-xl p-4 text-left transition-all duration-200 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-[0_2px_12px_rgba(59,130,246,0.1)]'
                    : 'bg-slate-900/40 border-white/5 hover:bg-blue-500/5 hover:border-blue-500/35'
                }`}
              >
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 mb-2 ${activeStyle.textPrimary}`}>
                    <MacroIcon className="w-4 h-4 shrink-0" />
                    <h4 className={`font-bold text-sm ${activeStyle.textBody}`}>{macro.name}</h4>
                  </div>
                  <p className={`text-xs ${activeStyle.textSub} font-sans leading-relaxed`}>{macro.desc}</p>
                </div>
                <div className={`mt-4 pt-3 border-t flex items-center justify-between w-full ${activeStyle.border}`}>
                  <code className={`text-xs px-1.5 py-0.5 rounded block truncate max-w-[160px] select-all font-mono ${
                    isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-950 text-sky-400 border border-white/5'
                  }`}>{macro.cmd}</code>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isRunning
                      ? 'bg-amber-500/15 text-amber-600 border border-amber-300'
                      : isLight
                        ? 'bg-blue-600 text-white group-hover:bg-blue-700'
                        : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white border border-blue-500/20'
                  }`}>
                    {isRunning ? 'RUNNING…' : 'RUN'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          QUICK DIAGNOSTICS
      ═══════════════════════════════════════════════ */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
        <h3 className={`text-sm font-bold tracking-wide uppercase block border-b pb-3 ${activeStyle.textBody} ${activeStyle.border}`}>
          Quick Diagnostics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              fix: 'ramRejuvenation', 
              title: 'Clear RAM Cache', 
              desc: 'Runs garbage collection to free unused memory blocks.' 
            },
            { 
              fix: 'chronosReset', 
              title: 'Restart Explorer', 
              desc: 'Restarts explorer.exe to fix frozen taskbars and UI.' 
            },
          ].map(({ fix, title, desc }) => (
            <button 
              key={fix}
              onClick={() => runDiagnosticFix(fix)} 
              disabled={runningFix !== null} 
              className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  : `${activeStyle.btnGhost}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className={`text-sm font-bold ${activeStyle.textBody} group-hover:${activeStyle.textPrimary} transition-colors`}>{title}</h4>
              </div>
              <p className={`text-xs mt-1.5 font-sans leading-relaxed ${activeStyle.textSub}`}>{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
