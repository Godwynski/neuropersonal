import React from 'react';
import { Cpu, Settings, Zap, Trash2, Monitor } from 'lucide-react';

export default function ValorantOptimizer({
  isElectron,
  valorantRunning,
  setValorantRunning,
  autoBoostActive,
  setAutoBoostActive,
  gameModeActive,
  toggleGameMode,
  powerPlanMode,
  togglePowerPlan,
  forceValorantPriority,
  valorantLogsSize,
  shaderCacheSize,
  scanValorantCaches,
  clearValorantLogs,
  clearShaderCache,
  scanningVal,
  cleaningVal,
  valorantLogs,
  triggerValorantAutoBoost,
  activeStyle,
  deepOptimizeActive,
  setDeepOptimizeActive,
  optimizationOptions,
  setOptimizationOptions,
  purgeAppsChecklist,
  setPurgeAppsChecklist,
  triggerValorantAutoRevert,
  revertQueue,
  isAdmin
}) {
  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-300">
      <header className="flex justify-between items-center border-b border-blue-500/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">VALORANT ENGINE BOOSTER</h1>
          <p className="text-xs text-indigo-400 font-mono mt-0.5">Optimize system parameters and purge junk caches to boost game FPS</p>
        </div>
        <div className="flex gap-2 font-mono">
          {!isElectron && (
            <button 
              onClick={() => {
                if (valorantRunning) {
                  setValorantRunning(false);
                } else {
                  triggerValorantAutoBoost();
                  setValorantRunning(true);
                }
              }} 
              className="bg-[#0f172a] border border-blue-500/20 text-xs px-3 py-1.5 rounded hover:bg-blue-500/10 text-blue-400 cursor-pointer"
            >
              {valorantRunning ? 'Simulate Game Exit' : 'Simulate Game Launch'}
            </button>
          )}
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${valorantRunning ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-slate-950 border-white/5 text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${valorantRunning ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className="text-xs font-bold">{valorantRunning ? 'VALORANT RUNNING [BOOST ACTIVE]' : 'VALORANT NOT DETECTED'}</span>
          </div>
        </div>
      </header>

      {/* Auto Boost Toggle Banner */}
      <div className="bg-[#0b1220]/85 border border-blue-500/15 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs">
        <div className="space-y-1 max-w-xl">
          <span className="text-xs font-bold text-slate-200 block">⚡ Allow Background Auto-Boosting Daemon</span>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            When enabled, Nexus Sentinel polls background processes. The second Valorant launches, it automatically sets the game to HIGH scheduling priority, collects memory junk, and flushes network ports.
          </p>
        </div>
        <button 
          onClick={() => setAutoBoostActive(!autoBoostActive)}
          className={`px-4 py-2.5 rounded-lg border font-bold shrink-0 transition cursor-pointer ${
            autoBoostActive ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' : 'bg-slate-950 border-white/5 text-slate-500'
          }`}
        >
          {autoBoostActive ? 'AUTO-BOOST ENABLED' : 'AUTO-BOOST DISABLED'}
        </button>
      </div>

      {/* Deep Performance Optimizer Panel */}
      <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-6`}>
        {!isAdmin && deepOptimizeActive && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg flex items-start gap-2.5 font-sans text-xs">
            <span className="text-sm">⚠️</span>
            <div className="space-y-0.5 leading-relaxed">
              <strong>Administrator Privileges Required:</strong> Suspending the Windows Defender monitor and the Windows Update service requires the app (or terminal/VS Code) to be launched as Administrator. Otherwise, these services will fail to pause, but RAM flushing and browser terminations will still run.
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-500/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase flex items-center gap-2">
              <span className="text-rose-500 animate-pulse">🔥</span> DEEP PERFORMANCE OPTIMIZER (TEMPORARY TWEAKS)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Temporarily halts non-essential system workloads and purges memory-heavy background apps during gameplay.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {revertQueue.length > 0 && (
              <button 
                onClick={triggerValorantAutoRevert}
                className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition"
              >
                REVERT OPTIMIZATIONS ({revertQueue.length})
              </button>
            )}
            <button 
              onClick={() => setDeepOptimizeActive(!deepOptimizeActive)}
              className={`px-4 py-2 rounded-lg border font-bold font-mono text-xs transition cursor-pointer ${
                deepOptimizeActive ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-slate-950 border-white/5 text-slate-500'
              }`}
            >
              {deepOptimizeActive ? 'DEEP MODE ENABLED' : 'DEEP MODE DISABLED'}
            </button>
          </div>
        </div>

        {deepOptimizeActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs animate-in fade-in duration-300">
            {/* System Services Checkboxes */}
            <div className="space-y-4">
              <span className="text-slate-400 font-bold block border-b border-blue-500/5 pb-1 uppercase tracking-wider">1. System Services Workload Pause</span>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={optimizationOptions.pauseUpdates}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, pauseUpdates: e.target.checked }))}
                  className="mt-0.5 accent-rose-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-rose-400 transition font-bold block">Suspend Windows Update Service</span>
                  <span className="text-slate-500 font-sans block leading-relaxed text-[11px]">Pauses the background update checks (`wuauserv`) to free up network and CPU queues. Reverted on exit. (Admin Required)</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group mt-3">
                <input 
                  type="checkbox" 
                  checked={optimizationOptions.disableDefender}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, disableDefender: e.target.checked }))}
                  className="mt-0.5 accent-rose-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-rose-400 transition font-bold block">Tweak Windows Defender Shielding</span>
                  <span className="text-slate-500 font-sans block leading-relaxed text-[11px]">Suspends real-time protection checks and adds VALORANT AppData paths to exclusions to avoid disk IO wait stutters. (Admin Required)</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group mt-3">
                <input 
                  type="checkbox" 
                  checked={optimizationOptions.clearStandby}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, clearStandby: e.target.checked }))}
                  className="mt-0.5 accent-rose-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-rose-400 transition font-bold block">Flush System RAM Standby Lists</span>
                  <span className="text-slate-500 font-sans block leading-relaxed text-[11px]">Purges cached standby page lists on launch to make room for active game heap structures.</span>
                </div>
              </label>
            </div>

            {/* Background Apps Purge Checklist */}
            <div className="space-y-4">
              <span className="text-slate-400 font-bold block border-b border-blue-500/5 pb-1 uppercase tracking-wider">2. Background Processes Purge List</span>
              <p className="text-slate-500 font-sans text-[11px] leading-relaxed mb-2">
                Check browsers or launchers to terminate when VALORANT launches. Make sure to save any pending tasks before starting.
              </p>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={optimizationOptions.purgeApps}
                  onChange={(e) => setOptimizationOptions(prev => ({ ...prev, purgeApps: e.target.checked }))}
                  className="mt-0.5 accent-rose-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-rose-400 transition font-bold block">Enable App Purger</span>
                  <span className="text-slate-500 font-sans block text-[11px]">Automatically executes process kills for the checked applications below.</span>
                </div>
              </label>

              {optimizationOptions.purgeApps && (
                <div className="grid grid-cols-2 gap-3 pl-6 pt-2 border-l border-rose-500/10 mt-2">
                  {Object.keys(purgeAppsChecklist).map(appKey => (
                    <label key={appKey} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={purgeAppsChecklist[appKey]}
                        onChange={(e) => setPurgeAppsChecklist(prev => ({ ...prev, [appKey]: e.target.checked }))}
                        className="accent-rose-500 cursor-pointer"
                      />
                      <span className="text-slate-300 group-hover:text-slate-100 transition capitalize">{appKey}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* One Click FPS Boosters */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
            <h3 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase border-b border-blue-500/5 pb-2">
              Windows Gaming Enhancers (FPS Controls)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              
              {/* CPU Priority */}
              <button 
                onClick={forceValorantPriority}
                className="bg-slate-950/40 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/35 p-4 rounded-lg text-left transition group cursor-pointer"
              >
                <Cpu className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">High CPU Priority</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Forces scheduler allocation priority class for the game thread.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Force Priority</span>
              </button>

              {/* Game Mode */}
              <button 
                onClick={toggleGameMode}
                className="bg-slate-950/40 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/35 p-4 rounded-lg text-left transition group cursor-pointer"
              >
                <Zap className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">Enable Game Mode</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Focuses all graphics processing cores solely on game threads.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Status: {gameModeActive ? 'ACTIVE' : 'OFF'}</span>
              </button>

              {/* Power Plan */}
              <button 
                onClick={togglePowerPlan}
                className="bg-slate-950/40 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/35 p-4 rounded-lg text-left transition group cursor-pointer"
              >
                <Settings className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">Max Performance Plan</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Forces Windows to bypass energy savings for max speed.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Plan: {powerPlanMode.toUpperCase()}</span>
              </button>

            </div>
          </div>

          {/* Storage Cleaners */}
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex justify-between items-center border-b border-blue-500/5 pb-2">
              <h3 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                Game Storage & Shader Cache Scrubbers
              </h3>
              <button onClick={scanValorantCaches} disabled={scanningVal || cleaningVal} className={`px-3 py-1 text-xs border ${activeStyle.btnGhost} cursor-pointer disabled:opacity-50`}>
                {scanningVal ? 'Scanning...' : 'Scan Folders'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              
              {/* Clean logs */}
              <div className="bg-[#05080e] p-4 rounded-lg border border-white/5 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Wipe Game Log Cache</span>
                  <p className="text-xs text-slate-400 font-sans">Removes crash reports and telemetry logs inside Local AppData.</p>
                  <span className="text-indigo-400 block text-[10px] font-bold">Logs Size: {valorantLogsSize}</span>
                </div>
                <button onClick={clearValorantLogs} disabled={cleaningVal || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-4 transition font-bold cursor-pointer disabled:opacity-50">Clear Logs</button>
              </div>

              {/* Clean shaders */}
              <div className="bg-[#05080e] p-4 rounded-lg border border-white/5 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Scrub NVIDIA DXCache</span>
                  <p className="text-xs text-slate-400 font-sans">Empties shader database tables. Resolves sudden game stutter issues.</p>
                  <span className="text-indigo-400 block text-[10px] font-bold">Cache Size: {shaderCacheSize}</span>
                </div>
                <button onClick={clearShaderCache} disabled={cleaningVal || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-4 transition font-bold cursor-pointer disabled:opacity-50">Purge Shader Cache</button>
              </div>

            </div>
          </div>

        </div>

        {/* Right column sidebar: Valorant Optimizer logs feed */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className={`p-6 rounded-xl bg-slate-950/40 border ${activeStyle.panelBg} space-y-4`}>
            <h3 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase border-b border-blue-500/10 pb-2">
              Optimization Stats
            </h3>
            <div className="font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Game Mode Status</span>
                <span className={gameModeActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{gameModeActive ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Power Profile</span>
                <span className="text-blue-400 font-bold capitalize">{powerPlanMode} Plan</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Auto-Boost Core</span>
                <span className="text-emerald-400 font-bold">STANDBY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Game Thread</span>
                <span className={valorantRunning ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{valorantRunning ? 'ACTIVE' : 'NONE'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#05080e]/60 border border-blue-500/5 p-4 rounded-xl h-[200px] font-mono text-xs flex flex-col flex-1 mt-6">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-widest border-b border-blue-500/5 pb-1.5 mb-2 shrink-0">Boost Log Feeds</span>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 text-slate-400 select-text">
              {valorantLogs.length === 0 ? (
                <div className="italic text-slate-600">Waiting for Valorant events to log...</div>
              ) : (
                valorantLogs.map((l, i) => (
                  <div key={i} className="leading-4 border-l-2 border-blue-500/10 pl-2">{l}</div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
