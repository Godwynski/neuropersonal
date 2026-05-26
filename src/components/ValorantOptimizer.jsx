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
  isAdmin,
  valorantConfigs,
  selectedConfig,
  setSelectedConfig,
  saveValorantConfig,
  applyTournamentPreset,
  registryStates,
  toggleHags,
  toggleGameDvr,
  togglePriorityOptimized,
  checkRegistryStates,
  latencyTweaks,
  toggleLatencyTweak,
  monitorRefreshRate,
  frameLimitMode,
  applyFrameLimitSettings,
  vanguardHealth,
  bgServices,
  activeDns,
  timerResActive,
  hyperthreadingDisabled,
  setHyperthreadingDisabled,
  backgroundAppsToEcores,
  setBackgroundAppsToEcores,
  checkVanguardHealth,
  checkBgServices,
  toggleBgService,
  changeDns,
  toggleTimerResolution,
  vbsEnabled, toggleVbs,
  nagleDisabled, toggleNagle,
  memCompressionEnabled, toggleMemCompression,
  nicPowerSavingDisabled, toggleNicPower,
  globalFsoDisabled, toggleGlobalFso,
  powerThrottlingDisabled, togglePowerThrottling,
  msiEnabled, toggleMsiMode,
  nicOffloadsDisabled, toggleNicOffloads,
  hpetDisabled, toggleHpet,
  islcActive, setIslcActive,
  cleanAllShaderCaches,
  applyOptimizationProfile,
  gsyncDisabled, toggleGsync,
  freesyncEnabled, toggleFreesync
}) {
  // Theme-aware local helpers so every sub-section adapts to light/dark mode
  const cardInner = activeStyle.isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-950/60 border-white/5';
  const deepCard = activeStyle.isLight
    ? 'bg-white border-slate-200'
    : 'bg-[#05080e] border-white/5';
  const pillInactive = activeStyle.isLight
    ? 'bg-slate-100 border-slate-200 text-slate-500'
    : 'bg-[#0f172a] border-white/5 text-slate-500';
  const textH  = activeStyle.textBody  || 'text-slate-200';
  const textS  = activeStyle.textSub   || 'text-slate-400';
  const textM  = activeStyle.textMuted || 'text-slate-500';
  const sectionBorder = activeStyle.isLight ? 'border-slate-200' : 'border-blue-500/10';
  const sectionLabelBorder = activeStyle.isLight ? 'border-slate-200' : 'border-blue-500/5';
  const bannerBg = activeStyle.isLight
    ? 'bg-blue-50 border-slate-200'
    : 'bg-[#0b1220]/85 border-blue-500/15';
  const simBtn = activeStyle.isLight
    ? 'bg-white border-slate-300 text-blue-600 hover:bg-blue-50'
    : 'bg-[#0f172a] border-blue-500/20 text-blue-400 hover:bg-blue-500/10';

  return (
    <div className="space-y-6 outline-none animate-in fade-in duration-300">
      <header className={`flex justify-between items-center border-b ${sectionBorder} pb-4`}>
        <div>
          <h1 className={`text-xl font-bold tracking-widest font-mono ${textH}`}>VALORANT ENGINE BOOSTER</h1>
          <p className={`text-xs ${activeStyle.textAccent} font-mono mt-0.5`}>Optimize system parameters and purge junk caches to boost game FPS</p>
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
              className={`border text-xs px-3 py-1.5 rounded cursor-pointer transition ${simBtn}`}
            >
              {valorantRunning ? 'Simulate Game Exit' : 'Simulate Game Launch'}
            </button>
          )}
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${valorantRunning ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse' : `${pillInactive}`}`}>
            <div className={`w-2 h-2 rounded-full ${valorantRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-xs font-bold">{valorantRunning ? 'VALORANT RUNNING [BOOST ACTIVE]' : 'VALORANT NOT DETECTED'}</span>
          </div>
        </div>
      </header>

      {/* Auto Boost Toggle Banner */}
      <div className={`${bannerBg} border rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs`}>
        <div className="space-y-1 max-w-xl">
          <span className={`text-xs font-bold ${textH} block`}>⚡ Allow Background Auto-Boosting Daemon</span>
          <p className={`text-xs ${textS} font-sans leading-relaxed`}>
            When enabled, NeurOptimize polls background processes. The second Valorant launches, it automatically sets the game to HIGH scheduling priority, collects memory junk, and flushes network ports.
          </p>
        </div>
        <button 
          onClick={() => setAutoBoostActive(!autoBoostActive)}
          className={`px-4 py-2.5 rounded-lg border font-bold shrink-0 transition cursor-pointer ${
            autoBoostActive ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' : pillInactive
          }`}
        >
          {autoBoostActive ? 'AUTO-BOOST ENABLED' : 'AUTO-BOOST DISABLED'}
        </button>
      </div>

      {/* ISLC Daemon Banner */}
      <div className={`${bannerBg} border rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs animate-in fade-in duration-300 delay-75`}>
        <div className="space-y-1 max-w-xl">
          <span className={`text-xs font-bold ${textH} block`}>🤖 Intelligent Standby List Cleaner (ISLC) Daemon</span>
          <p className={`text-xs ${textS} font-sans leading-relaxed`}>
            Monitors system RAM every 30 seconds while Valorant is running. Automatically triggers garbage collection on standby lists to prevent micro-stutters during heavy memory swapping.
          </p>
        </div>
        <button 
          onClick={() => setIslcActive(!islcActive)}
          className={`px-4 py-2.5 rounded-lg border font-bold shrink-0 transition cursor-pointer ${
            islcActive ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400' : pillInactive
          }`}
        >
          {islcActive ? 'ISLC DAEMON ACTIVE' : 'ISLC DAEMON DISABLED'}
        </button>
      </div>

      {/* Deep Performance Optimizer Panel */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-6`}>
        {!isAdmin && deepOptimizeActive && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg flex items-start gap-2.5 font-sans text-xs">
            <span className="text-sm">⚠️</span>
            <div className="space-y-0.5 leading-relaxed">
              <strong>Administrator Privileges Required:</strong> Suspending the Windows Defender monitor and the Windows Update service requires the app (or terminal/VS Code) to be launched as Administrator. Otherwise, these services will fail to pause, but RAM flushing and browser terminations will still run.
            </div>
          </div>
        )}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-4`}>
          <div className="space-y-1">
            <h3 className={`text-xs font-mono font-bold tracking-widest ${textH} uppercase flex items-center gap-2`}>
              <span className="text-rose-500 animate-pulse">🔥</span> DEEP PERFORMANCE OPTIMIZER (TEMPORARY TWEAKS)
            </h3>
            <p className={`text-xs ${textS} font-sans`}>
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
              <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>1. System Services Workload Pause</span>
              
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
              <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>2. Background Processes Purge List</span>
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

      {/* CLIENT & GPU OPTIMIZATION DECK */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-6`}>
        {!isAdmin && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg flex items-start gap-2.5 font-sans text-xs">
            <span className="text-sm">⚠️</span>
            <div className="space-y-0.5 leading-relaxed">
              <strong>Administrator Elevation Recommended:</strong> Modifying system registry entries (Hardware GPU Scheduling and CPU Priorities) requires NeurOptimize to be run with Administrator privileges. Otherwise, these toggles will fail to apply.
            </div>
          </div>
        )}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-4`}>
          <div className="space-y-1">
            <h3 className={`text-xs font-mono font-bold tracking-widest ${textH} uppercase flex items-center gap-2`}>
              <Monitor className="w-4 h-4 text-cyan-400" /> CLIENT & GPU OPTIMIZATION DECK
            </h3>
            <p className={`text-xs ${textS} font-sans`}>
              Scan accounts, customize Unreal engine graphic parameters in config files, and toggle Windows registry boosts for GPU scheduling & game latency.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
          
          {/* Section 1: Graphics Settings Tuner */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              1. VALORANT Graphic Settings Tuner
            </span>
            
            {valorantConfigs.length === 0 ? (
              <div className="text-slate-500 italic font-sans py-4">
                No VALORANT configurations detected on disk. Play VALORANT once to generate settings files, or connect your account.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Account Settings File</label>
                  <select
                    value={selectedConfig ? selectedConfig.filePath : ''}
                    onChange={(e) => {
                      const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                      if (cfg) setSelectedConfig(cfg);
                    }}
                    className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-cyan-500 transition text-[11px] cursor-pointer"
                  >
                    {valorantConfigs.map((cfg) => (
                      <option key={cfg.filePath} value={cfg.filePath}>
                        {cfg.accountId.slice(0, 18)}... (Windows)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedConfig && (
                  <div className={`space-y-4 p-4 rounded-lg border ${cardInner} animate-in fade-in duration-300`}>
                    
                    {/* VSync toggle */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-sans font-bold">Enable VSync</span>
                      <button
                        onClick={() => saveValorantConfig({ vsync: !selectedConfig.vsync })}
                        className={`px-3 py-1 rounded text-[11px] font-bold border transition ${
                          selectedConfig.vsync ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                        }`}
                      >
                        {selectedConfig.vsync ? 'ON (Adds Latency)' : 'OFF (Optimal)'}
                      </button>
                    </div>

                    {/* Resolution Scale */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300 font-sans font-bold">Resolution Scale</span>
                        <span className="text-indigo-400 font-bold">{Math.round(selectedConfig.resolutionQuality)}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={Math.round(selectedConfig.resolutionQuality)}
                        onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    {/* Quality toggles (Texture, Shadow, Effects, AA) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {/* Texture Quality */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Texture Quality</span>
                        <select
                          value={selectedConfig.textureQuality}
                          onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })}
                          className="bg-[#05080e] border border-white/5 rounded p-1 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <option value="0">Low</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                          <option value="3">Ultra</option>
                        </select>
                      </div>

                      {/* Shadow Quality */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Shadow Quality</span>
                        <select
                          value={selectedConfig.shadowQuality}
                          onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })}
                          className="bg-[#05080e] border border-white/5 rounded p-1 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <option value="0">Low (Off)</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                          <option value="3">Ultra</option>
                        </select>
                      </div>

                      {/* Effects Quality */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Effects Quality</span>
                        <select
                          value={selectedConfig.effectsQuality}
                          onChange={(e) => saveValorantConfig({ effectsQuality: parseInt(e.target.value, 10) })}
                          className="bg-[#05080e] border border-white/5 rounded p-1 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <option value="0">Low</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                          <option value="3">Ultra</option>
                        </select>
                      </div>

                      {/* Anti-Aliasing */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Anti-Aliasing</span>
                        <select
                          value={selectedConfig.antiAliasingQuality}
                          onChange={(e) => saveValorantConfig({ antiAliasingQuality: parseInt(e.target.value, 10) })}
                          className="bg-[#05080e] border border-white/5 rounded p-1 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <option value="0">Off</option>
                          <option value="1">MSAA 2x</option>
                          <option value="2">MSAA 4x</option>
                          <option value="3">MSAA 8x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Windows registry GPU tweaks */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              2. GPU & System Registry Latency Tweaks
            </span>
            
            <div className="space-y-3 font-mono">
              {/* Tweak 1: HAGS */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3.5 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Hardware GPU Scheduling (HAGS)</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Reduces input latency and overhead by allowing your GPU to manage its memory. Requires restart.
                  </p>
                </div>
                <button
                  onClick={() => toggleHags(!registryStates.hagsEnabled)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    registryStates.hagsEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {registryStates.hagsEnabled ? 'HAGS ENABLED' : 'HAGS DISABLED'}
                </button>
              </div>

              {/* Tweak 2: Disable Game DVR */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3.5 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Disable Windows Game Bar & DVR</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Turns off the background gaming capture and telemetry overlays which cause sudden frame drops.
                  </p>
                </div>
                <button
                  onClick={() => toggleGameDvr(!registryStates.gameDvrDisabled)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    registryStates.gameDvrDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {registryStates.gameDvrDisabled ? 'DVR DISABLED' : 'DVR ENABLED'}
                </button>
              </div>

              {/* Tweak 3: High Priority System Scheduler */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3.5 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>System Profile Task Scheduling</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Optimizes the Windows Multimedia Scheduler priority values, assigning maximum CPU slices to gaming tasks.
                  </p>
                </div>
                <button
                  onClick={() => togglePriorityOptimized(!registryStates.priorityOptimized)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    registryStates.priorityOptimized
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {registryStates.priorityOptimized ? 'OPTIMIZED' : 'DEFAULT'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ULTRA-LOW LATENCY & INPUT DECK */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-6`}>
        {!isAdmin && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg flex items-start gap-2.5 font-sans text-xs">
            <span className="text-sm">⚠️</span>
            <div className="space-y-0.5 leading-relaxed">
              <strong>Administrator Rights Required:</strong> Disabling USB Selective Suspend, unparking CPU cores, and disabling dynamic tick/platform clock require NeurOptimize to run as Administrator.
            </div>
          </div>
        )}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-4`}>
          <div className="space-y-1">
            <h3 className={`text-xs font-mono font-bold tracking-widest ${textH} uppercase flex items-center gap-2`}>
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> ULTRA-LOW LATENCY & INPUT DECK
            </h3>
            <p className={`text-xs ${textS} font-sans`}>
              Optimize display frame-rates for Variable Refresh Rate monitors, eliminate peripheral input lag, and stabilize CPU 1% frametime lows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
          
          {/* Column 1: Display VRR Sync & Frame Limiter */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              1. Monitor Synchronization &amp; FPS Cap
            </span>
            
            <div className={`space-y-4 p-4 rounded-lg border ${cardInner}`}>
              {/* G-Sync Disable / FreeSync Enable toggles */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Display Sync Technology</span>
                
                {/* G-Sync Disable Toggle */}
                <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                  <div className="space-y-0.5">
                    <span className="text-slate-200 font-bold block text-[11px]">Disable G-Sync (NVIDIA)</span>
                    <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>
                      Turn off G-Sync to prevent frame timing overhead — best paired with FreeSync + uncapped FPS.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleGsync(!gsyncDisabled)}
                    className={`px-3 py-1.5 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${
                      gsyncDisabled
                        ? 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                        : pillInactive
                    }`}
                  >
                    {gsyncDisabled ? 'G-SYNC OFF ✓' : 'G-SYNC ON'}
                  </button>
                </div>

                {/* FreeSync Enable Toggle */}
                <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                  <div className="space-y-0.5">
                    <span className="text-slate-200 font-bold block text-[11px]">Enable FreeSync / Adaptive Sync</span>
                    <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>
                      Activates AMD FreeSync or NVIDIA Adaptive Sync for tear-free frames without VSync latency.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFreesync(!freesyncEnabled)}
                    className={`px-3 py-1.5 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${
                      freesyncEnabled
                        ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                        : pillInactive
                    }`}
                  >
                    {freesyncEnabled ? 'FREESYNC ACTIVE ✓' : 'FREESYNC OFF'}
                  </button>
                </div>
              </div>

              {/* Hz selector */}
              <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monitor Refresh Rate (Hz)</label>
                <select
                  value={monitorRefreshRate}
                  onChange={(e) => {
                    const hz = parseInt(e.target.value, 10);
                    applyFrameLimitSettings(frameLimitMode, hz);
                  }}
                  className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-cyan-500 transition text-[11px] cursor-pointer"
                >
                  <option value="60">60 Hz</option>
                  <option value="120">120 Hz</option>
                  <option value="144">144 Hz</option>
                  <option value="165">165 Hz</option>
                  <option value="240">240 Hz</option>
                  <option value="280">280 Hz</option>
                  <option value="360">360 Hz</option>
                  <option value="540">540 Hz</option>
                </select>
              </div>

              {/* VRR Preset buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">FPS Cap Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)}
                    className={`p-2.5 rounded-lg border font-bold text-center transition cursor-pointer text-[11px] flex flex-col justify-center items-center gap-1 ${
                      frameLimitMode === 'uncapped'
                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                        : pillInactive
                    }`}
                  >
                    <span className="block font-bold">⚡ RAW UNCAPPED</span>
                    <span className="text-[9px] font-sans font-normal opacity-85 block">No FPS limit — max performance</span>
                  </button>
                  <button
                    onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)}
                    className={`p-2.5 rounded-lg border font-bold text-center transition cursor-pointer text-[11px] flex flex-col justify-center items-center gap-1 ${
                      frameLimitMode === 'vrr'
                        ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                        : pillInactive
                    }`}
                  >
                    <span className="block font-bold">VRR SYNC CAP</span>
                    <span className="text-[9px] font-sans font-normal opacity-85 block">Caps to {monitorRefreshRate - 3} FPS for stable VRR</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-sans leading-relaxed pt-2 border-t border-white/5">
                💡 <strong>Recommended:</strong> Disable G-Sync + Enable FreeSync + <span className="text-amber-400">Uncapped FPS</span>. FreeSync handles tear prevention while uncapped FPS minimizes latency and prevents stutters from adaptive sync range limits.
              </div>
            </div>
          </div>

          {/* Column 2: Inputs & Hardware Tweaks */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              2. Inputs & Core Latency Tweaks
            </span>
            
            <div className="space-y-3 font-mono">
              {/* Mouse acceleration */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Disable Mouse Acceleration</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Forces Windows pointer speed curves to absolute 1-to-1 raw input ratios.
                  </p>
                </div>
                <button
                  onClick={() => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    latencyTweaks.disableMouseAccel
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {latencyTweaks.disableMouseAccel ? 'ACCEL DISABLED' : 'DEFAULT'}
                </button>
              </div>

              {/* USB Selective suspend */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Disable USB selective suspend</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Prevents USB root ports from powering down, reducing mouse/keyboard wake latency.
                  </p>
                </div>
                <button
                  onClick={() => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    latencyTweaks.disableUsbSuspend
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {latencyTweaks.disableUsbSuspend ? 'POWER SLEEP OFF' : 'DEFAULT'}
                </button>
              </div>

              {/* Core Parking */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Disable CPU Core Parking (1% Lows)</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Stops physical cores from entering deep sleep states, eliminating CPU power-state frame spikes.
                  </p>
                </div>
                <button
                  onClick={() => toggleLatencyTweak('disableCoreParking', !latencyTweaks.disableCoreParking)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    latencyTweaks.disableCoreParking
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {latencyTweaks.disableCoreParking ? 'PARKING DISABLED' : 'DEFAULT'}
                </button>
              </div>

              {/* Dynamic tick */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Disable Windows Dynamic Tick</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Forces Windows to maintain uniform scheduler clock periods for frame smoothness.
                  </p>
                </div>
                <button
                  onClick={() => toggleLatencyTweak('disableDynamicTick', !latencyTweaks.disableDynamicTick)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    latencyTweaks.disableDynamicTick
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {latencyTweaks.disableDynamicTick ? 'TICK CONSTANT' : 'DEFAULT'}
                </button>
              </div>

              {/* Fullscreen Optimizations */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Force Exclusive Fullscreen (VALORANT)</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Bypasses the DWM overlay pipeline completely, trimming display render queue latency.
                  </p>
                </div>
                <button 
                  onClick={() => toggleLatencyTweak('disableFullscreenOpt', !latencyTweaks.disableFullscreenOpt)} 
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    latencyTweaks.disableFullscreenOpt
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {latencyTweaks.disableFullscreenOpt ? 'EXCLUSIVE FORCE' : 'DEFAULT'}
                </button>
              </div>

              {/* MSI Mode */}
              <div className={`flex justify-between items-start gap-4 ${cardInner} p-3 rounded-lg border`}>
                <div className="space-y-1">
                  <span className={`text-slate-200 font-bold block`}>Force MSI Mode (GPU & USB)</span>
                  <p className={`text-[11px] ${textS} font-sans leading-relaxed`}>
                    Forces Message Signaled Interrupts (MSISupported) for display adapters, providing direct CPU lanes for inputs and frames.
                  </p>
                </div>
                <button 
                  onClick={() => toggleMsiMode(!msiEnabled)} 
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    msiEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {msiEnabled ? 'MSI MODE ON' : 'LINE-BASED (DEFAULT)'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* VANGUARD HEALTH & COMPLIANCE BOARD */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-6 animate-in fade-in duration-300`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-4`}>
          <div className="space-y-1">
            <h3 className={`text-xs font-mono font-bold tracking-widest ${textH} uppercase flex items-center gap-2`}>
              <span className="text-[#ff4655] animate-pulse">🛡️</span> VANGUARD HEALTH & COMPLIANCE BOARD
            </h3>
            <p className={`text-xs ${textS} font-sans`}>
              Diagnose system parameters to ensure full Vanguard compatibility and prevent game client connection drops or freezes.
            </p>
          </div>
          <button
            onClick={checkVanguardHealth}
            className="bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/35 text-blue-400 px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition shrink-0 uppercase"
          >
            Re-Scan Compliance
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 font-mono text-xs">
          {/* Secure Boot Check */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Secure Boot Status</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${vanguardHealth.secureBoot === 'enabled' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className={`font-bold capitalize ${vanguardHealth.secureBoot === 'enabled' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {vanguardHealth.secureBoot}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>Required by Vanguard on Windows 11 systems.</p>
          </div>

          {/* TPM 2.0 Check */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">TPM 2.0 Verification</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${vanguardHealth.tpm2 === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className={`font-bold capitalize ${vanguardHealth.tpm2 === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {vanguardHealth.tpm2}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>Trusted Platform Module 2.0 encryption check.</p>
          </div>

          {/* CSM Check */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">CSM Compatibility</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${vanguardHealth.csmDisabled === 'disabled' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
              <span className={`font-bold uppercase ${vanguardHealth.csmDisabled === 'disabled' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {vanguardHealth.csmDisabled === 'disabled' ? 'INACTIVE (UEFI)' : 'ACTIVE / UNKNOWN'}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>CSM must be turned OFF in BIOS for Secure Boot compatibility.</p>
          </div>

          {/* VPN/Proxy Active */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VPN Interface Status</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${!vanguardHealth.vpnActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
              <span className={`font-bold uppercase ${!vanguardHealth.vpnActive ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                {vanguardHealth.vpnActive ? 'VPN DETECTED' : 'CLEAR'}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>Active VPN tunnels can disrupt matchmaking protocols.</p>
          </div>

          {/* AMD Driver Warning */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">AMD RX Driver Check</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${!vanguardHealth.gpuDriverWarning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className={`font-bold uppercase ${!vanguardHealth.gpuDriverWarning ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                {vanguardHealth.gpuDriverWarning ? 'WARNING' : 'CLEAR'}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>AMD RX Driver v32.0.31007.1017 causes game client crashes.</p>
          </div>

          {/* Incompatible Driver Scanner */}
          <div className={`p-4 rounded-lg border ${cardInner} flex flex-col justify-between`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Vulnerable Drivers</span>
            <div className="my-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${(!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className={`font-bold uppercase ${(!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0) ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                {(!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0) ? 'CLEAR' : 'FLAGGED'}
              </span>
            </div>
            <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>
              {(!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0)
                ? 'No vulnerable or incompatible drivers (inpoutx64, gdrv) found.'
                : `Found: ${vanguardHealth.flaggedDrivers.join(', ')}. Uninstall associated app.`}
            </p>
          </div>
        </div>
      </div>

      {/* ADVANCED CPU SCHEDULER & WINDOWS SERVICES DECK */}
      <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-6 animate-in fade-in duration-300`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b ${sectionBorder} pb-4`}>
          <div className="space-y-1">
            <h3 className={`text-xs font-mono font-bold tracking-widest ${textH} uppercase flex items-center gap-2`}>
              <Cpu className="w-4 h-4 text-indigo-400" /> ADVANCED CPU SCHEDULER & ENVIRONMENT DECK
            </h3>
            <p className={`text-xs ${textS} font-sans`}>
              Optimize thread scheduler affinities for physical and efficiency processor cores, lock system clock speed periods, and configure local DNS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Section 1: Process Affinity & Priority Controls */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              1. CPU Thread Affinity & Priority
            </span>
            <div className={`space-y-3 p-4 rounded-lg border ${cardInner}`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className={`text-slate-300 font-bold font-sans`}>Auto-High Priority</span>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">STANDBY</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed mb-3">
                Sets high process execution priority classes for both launcher and shipping binaries on detection.
              </p>

              <label className="flex items-start gap-3 cursor-pointer group pt-1">
                <input
                  type="checkbox"
                  checked={hyperthreadingDisabled}
                  onChange={(e) => setHyperthreadingDisabled(e.target.checked)}
                  className="mt-0.5 accent-cyan-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-cyan-400 transition font-bold block">Disable Hyperthreading (SMT)</span>
                  <span className={`text-[10px] ${textM} font-sans block leading-normal`}>
                    Affinitizes VALORANT only to physical cores, stabilizing frame delivery and 1% lows.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input
                  type="checkbox"
                  checked={backgroundAppsToEcores}
                  onChange={(e) => setBackgroundAppsToEcores(e.target.checked)}
                  className="mt-0.5 accent-cyan-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-slate-200 group-hover:text-cyan-400 transition font-bold block">Restrain Background Apps</span>
                  <span className={`text-[10px] ${textM} font-sans block leading-normal`}>
                    Binds browsers, launchers, and Discord to Efficiency (E) cores so performance cores focus solely on the game.
                  </span>
                </div>
              </label>

              <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                <span className={`text-slate-300 font-bold font-sans`}>Auto Power Plan</span>
                <span className="text-cyan-400 font-bold text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded">ACTIVE</span>
              </div>
              <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>
                Switches the system scheme to High Performance on launch and reverts it to Balanced on exit.
              </p>
            </div>
          </div>

          {/* Section 2: Timer Resolution & Network DNS */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              2. Latency Timers & Connection
            </span>
            <div className={`space-y-3 p-4 rounded-lg border ${cardInner}`}>
              {/* Timer resolution override */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-slate-300 font-bold font-sans block">Wanted Timer Resolution</span>
                  <span className="text-[10px] text-slate-500 font-sans block">Force system tick rate to 0.50 ms.</span>
                </div>
                <button
                  onClick={toggleTimerResolution}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    timerResActive
                      ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                      : pillInactive
                  }`}
                >
                  {timerResActive ? '0.50 ms LOCKED' : 'WINDOWS DEFAULT'}
                </button>
              </div>

              {/* HPET Disable */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mt-2">
                <div className="space-y-0.5">
                  <span className={`text-slate-200 font-bold block`}>Disable HPET (Platform Clock)</span>
                  <p className={`text-[10px] ${textS} font-sans leading-relaxed`}>
                    Forces Windows to use the CPU's native Time Stamp Counter (TSC), resolving DPC latency spikes caused by motherboard timer desync.
                  </p>
                </div>
                <button
                  onClick={() => toggleHpet(!hpetDisabled)}
                  className={`px-3 py-1.5 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${
                    hpetDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      : pillInactive
                  }`}
                >
                  {hpetDisabled ? 'HPET DISABLED (TSC)' : 'ENABLED (DEFAULT)'}
                </button>
              </div>

              {/* DNS Changer */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">One-Click DNS Optimizer</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => changeDns('cloudflare')}
                    className={`py-1.5 rounded border font-bold text-center transition cursor-pointer text-[10px] ${
                      activeDns === 'cloudflare'
                        ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400'
                        : pillInactive
                    }`}
                  >
                    Cloudflare (1.1.1.1)
                  </button>
                  <button
                    onClick={() => changeDns('google')}
                    className={`py-1.5 rounded border font-bold text-center transition cursor-pointer text-[10px] ${
                      activeDns === 'google'
                        ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400'
                        : pillInactive
                    }`}
                  >
                    Google (8.8.8.8)
                  </button>
                  <button
                    onClick={() => changeDns('default')}
                    className={`py-1.5 rounded border font-bold text-center transition cursor-pointer text-[10px] ${
                      activeDns === 'default'
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                        : pillInactive
                    }`}
                  >
                    Reset (DHCP)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  Reduces lookup desyncs and deserialization latency on initial matchmaking queues.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Safe Background Windows Services */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              3. Safely Disable Windows Services
            </span>
            <div className={`space-y-3 p-4 rounded-lg border ${cardInner}`}>
              <p className={`text-[10px] ${textM} font-sans leading-relaxed`}>
                Turn off non-essential telemetry and background schedulers to reclaim CPU cycles.
              </p>

              {/* SysMain toggle */}
              <div className="flex justify-between items-center">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>SysMain (SuperFetch)</span>
                <button
                  onClick={() => toggleBgService('SysMain', !bgServices.SysMain)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    bgServices.SysMain
                      ? pillInactive
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {bgServices.SysMain ? 'RUNNING (Disable)' : 'DISABLED (Optimized)'}
                </button>
              </div>

              {/* Spooler toggle */}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Print Spooler</span>
                <button
                  onClick={() => toggleBgService('Spooler', !bgServices.Spooler)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    bgServices.Spooler
                      ? pillInactive
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {bgServices.Spooler ? 'RUNNING (Disable)' : 'DISABLED (Optimized)'}
                </button>
              </div>

              {/* Telemetry toggle */}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Connected Telemetry (DiagTrack)</span>
                <button
                  onClick={() => toggleBgService('DiagTrack', !bgServices.DiagTrack)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    bgServices.DiagTrack
                      ? pillInactive
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {bgServices.DiagTrack ? 'RUNNING (Disable)' : 'DISABLED (Optimized)'}
                </button>
              </div>

              {/* Xbox Live toggle */}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Xbox Live Auth Manager</span>
                <button
                  onClick={() => toggleBgService('XblAuthManager', !bgServices.XblAuthManager)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    bgServices.XblAuthManager
                      ? pillInactive
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {bgServices.XblAuthManager ? 'RUNNING (Disable)' : 'DISABLED (Optimized)'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Deep System & Network Tuning */}
          <div className="space-y-4">
            <span className={`text-slate-400 font-bold block border-b ${sectionLabelBorder} pb-1 uppercase tracking-wider`}>
              4. Deep System & Network Tuning
            </span>
            <div className={`space-y-3 p-4 rounded-lg border ${cardInner}`}>
              
              <div className="flex justify-between items-center">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>VBS / Memory Integrity</span>
                <button
                  onClick={() => toggleVbs(!vbsEnabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    !vbsEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-400'
                  }`}
                >
                  {!vbsEnabled ? 'DISABLED (Fast)' : 'ENABLED (Slow)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Network Interrupt Moderation & Offloads</span>
                <button
                  onClick={() => toggleNicOffloads(!nicOffloadsDisabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    nicOffloadsDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {nicOffloadsDisabled ? 'DISABLED (Instant)' : 'ENABLED (Batched)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Nagle's Algorithm (TCP)</span>
                <button
                  onClick={() => toggleNagle(!nagleDisabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    nagleDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {nagleDisabled ? 'DISABLED (Low Ping)' : 'ENABLED (Default)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Windows Memory Compression</span>
                <button
                  onClick={() => toggleMemCompression(!memCompressionEnabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    !memCompressionEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {!memCompressionEnabled ? 'DISABLED (No Stutter)' : 'ENABLED (Default)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>NIC Power Saving</span>
                <button
                  onClick={() => toggleNicPower(!nicPowerSavingDisabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    nicPowerSavingDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {nicPowerSavingDisabled ? 'DISABLED (Stable)' : 'ENABLED (Default)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Global Fullscreen Optimizations</span>
                <button
                  onClick={() => toggleGlobalFso(!globalFsoDisabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    globalFsoDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {globalFsoDisabled ? 'DISABLED (Exclusive)' : 'ENABLED (Borderless)'}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className={`text-[11px] ${textH} font-sans font-bold block`}>Power Throttling</span>
                <button
                  onClick={() => togglePowerThrottling(!powerThrottlingDisabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    powerThrottlingDisabled
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : pillInactive
                  }`}
                >
                  {powerThrottlingDisabled ? 'DISABLED (Max Perf)' : 'ENABLED (Throttled)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Optimization Profile Engine */}
          <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase border-b border-cyan-500/10 pb-2">
              Optimization Profile Engine
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <button 
                onClick={() => applyOptimizationProfile('tournament')}
                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 p-3 rounded text-purple-400 text-center font-bold transition shadow-[0_0_8px_rgba(168,85,247,0.15)] cursor-pointer"
              >
                TOURNAMENT
              </button>
              <button 
                onClick={() => applyOptimizationProfile('balanced')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-3 rounded text-emerald-400 text-center font-bold transition cursor-pointer"
              >
                BALANCED
              </button>
              <button 
                onClick={() => applyOptimizationProfile('streaming')}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-3 rounded text-blue-400 text-center font-bold transition cursor-pointer"
              >
                STREAMING
              </button>
              <button 
                onClick={() => applyOptimizationProfile('revert')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-3 rounded text-slate-300 text-center font-bold transition cursor-pointer"
              >
                DEFAULT
              </button>
            </div>
          </div>

          {/* One Click FPS Boosters */}
          <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <h3 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase border-b border-blue-500/5 pb-2">
              Windows Gaming Enhancers (FPS Controls)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              
              {/* CPU Priority */}
              <button 
                onClick={forceValorantPriority}
                className={`p-4 rounded-lg border text-left transition group cursor-pointer ${deepCard}`}
              >
                <Cpu className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">High CPU Priority</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Forces scheduler allocation priority class for the game thread.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Force Priority</span>
              </button>

              {/* Game Mode */}
              <button 
                onClick={toggleGameMode}
                className={`p-4 rounded-lg border text-left transition group cursor-pointer ${deepCard}`}
              >
                <Zap className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">Enable Game Mode</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Focuses all graphics processing cores solely on game threads.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Status: {gameModeActive ? 'ACTIVE' : 'OFF'}</span>
              </button>

              {/* Power Plan */}
              <button 
                onClick={togglePowerPlan}
                className={`p-4 rounded-lg border text-left transition group cursor-pointer ${deepCard}`}
              >
                <Settings className="w-5 h-5 text-blue-400 mb-2" />
                <span className="font-bold text-slate-200 block">Max Performance Plan</span>
                <p className="text-xs text-slate-400 font-sans mt-1">Forces Windows to bypass energy savings for max speed.</p>
                <span className="text-cyan-400 font-bold block mt-3 text-[10px] uppercase">Plan: {powerPlanMode.toUpperCase()}</span>
              </button>

            </div>
          </div>

          {/* Storage Cleaners */}
          <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className={`flex justify-between items-center border-b ${sectionBorder} pb-4`}>
              <h3 className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                Game Storage & Shader Cache Scrubbers
              </h3>
              <button onClick={scanValorantCaches} disabled={scanningVal || cleaningVal} className={`px-3 py-1 text-xs border ${activeStyle.btnGhost} cursor-pointer disabled:opacity-50`}>
                {scanningVal ? 'Scanning...' : 'Scan Folders'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              
              {/* Clean logs */}
              <div className={`${deepCard} p-4 rounded-lg border flex flex-col justify-between`}>
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Wipe Game Log Cache</span>
                  <p className={`text-xs ${textS} font-sans`}>Removes crash reports and telemetry logs inside Local AppData.</p>
                  <span className="text-indigo-400 block text-[10px] font-bold">Logs Size: {valorantLogsSize}</span>
                </div>
                <button onClick={clearValorantLogs} disabled={cleaningVal || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-4 transition font-bold cursor-pointer disabled:opacity-50">Clear Logs</button>
              </div>

              {/* Clean shaders */}
              <div className={`${deepCard} p-4 rounded-lg border flex flex-col justify-between`}>
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Scrub NVIDIA DXCache</span>
                  <p className={`text-xs ${textS} font-sans`}>Empties shader database tables. Resolves sudden game stutter issues.</p>
                  <span className="text-indigo-400 block text-[10px] font-bold">Cache Size: {shaderCacheSize}</span>
                </div>
                <button onClick={cleanAllShaderCaches} disabled={cleaningVal || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1.5 rounded mt-4 transition font-bold cursor-pointer disabled:opacity-50">Purge Shader Caches</button>
              </div>

            </div>
          </div>

        </div>

        {/* Right column sidebar: Valorant Optimizer logs feed */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className={`p-6 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
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

          <div className={`${deepCard} p-4 rounded-xl border h-[200px] font-mono text-xs flex flex-col flex-1 mt-6`}>
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
