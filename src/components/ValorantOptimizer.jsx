import React from 'react';

export default function ValorantOptimizer({
  isElectron,
  valorantPath,
  valorantPathDetected,
  browseValorantPath,
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
  deepOptimizeActive,
  setDeepOptimizeActive,
  optimizationOptions,
  setOptimizationOptions,
  purgeAppsChecklist,
  setPurgeAppsChecklist,
  isAdmin,
  valorantConfigs,
  selectedConfig,
  setSelectedConfig,
  saveValorantConfig,
  registryStates,
  toggleHags,
  toggleGameDvr,
  togglePriorityOptimized,
  latencyTweaks,
  toggleLatencyTweak,
  monitorRefreshRate,
  frameLimitMode,
  applyFrameLimitSettings,
  vanguardHealth,
  bgServices,
  timerResActive,
  checkVanguardHealth,
  checkBgServices,
  toggleBgService,
  toggleTimerResolution,
  nicPowerSavingDisabled, toggleNicPower,
  globalFsoDisabled, toggleGlobalFso,
  powerThrottlingDisabled, togglePowerThrottling,
  msiEnabled, toggleMsiMode,
  cleanAllShaderCaches,
  applyOptimizationProfile,
  gsyncDisabled, toggleGsync,
  freesyncEnabled, toggleFreesync,
  gpuInfo,
  persistentPriorityEnabled, togglePersistentPriority
}) {
  return (
    <div className="space-y-6 font-sans text-slate-800 bg-white p-2">
      
      {/* Page Header */}
      <header className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold">Valorant Engine Booster</h1>
          <p className="text-[11px] text-slate-500">System tweaks and caches for tactile gaming performance.</p>
        </div>
        <div className="flex gap-2 text-xs">
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
              className="border border-slate-300 px-2 py-1 rounded bg-white hover:bg-slate-50 cursor-pointer"
            >
              {valorantRunning ? 'Simulate Exit' : 'Simulate Launch'}
            </button>
          )}
          <span className={`px-2 py-1 border rounded font-mono font-bold ${valorantRunning ? 'bg-green-50 border-green-300 text-green-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
            STATUS: {valorantRunning ? 'RUNNING' : 'NOT RUNNING'}
          </span>
        </div>
      </header>

      {!isAdmin && (
        <div className="p-3 border border-amber-350 bg-amber-50 text-amber-800 text-xs rounded">
          <strong>Notice:</strong> Windows is running in standard user mode. Some core registry tweaks will be skipped.
        </div>
      )}

      {/* Main Skeleton Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Tweak Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Preset Profile Engine */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Profile Presets & Auto Boost</h2>
            
            <div className="flex justify-between items-center text-xs p-2 border border-slate-200 bg-white rounded">
              <div>
                <span className="font-bold">Background Auto-Boost Check</span>
                <p className="text-[10px] text-slate-500">Enable in-memory scheduling and resource locks on launch.</p>
              </div>
              <button 
                onClick={() => setAutoBoostActive(!autoBoostActive)}
                className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${
                  autoBoostActive ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-650 border-slate-200'
                }`}
              >
                {autoBoostActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded space-y-2 text-xs">
              <span className="font-bold block">Apply Optimization Profile</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={() => applyOptimizationProfile('tournament')} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">TOURNAMENT</button>
                <button onClick={() => applyOptimizationProfile('balanced')} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">BALANCED</button>
                <button onClick={() => applyOptimizationProfile('streaming')} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">STREAMING</button>
                <button onClick={() => applyOptimizationProfile('revert')} className="p-2 border border-slate-250 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">DEFAULTS</button>
              </div>
            </div>
          </div>

          {/* Directory & Vanguard Diagnostics */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Path Setup & Vanguard Status</h2>
            
            <div className="p-2 border border-slate-200 bg-white rounded text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Valorant Executable Path</span>
                <span className="text-[10px] font-bold">{valorantPathDetected ? 'DETECTED' : 'MISSING'}</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={valorantPath} 
                  readOnly 
                  className="flex-1 text-[10px] font-mono p-1 border border-slate-200 bg-slate-50 rounded"
                />
                {isElectron && (
                  <button onClick={browseValorantPath} className="px-3 py-1 bg-slate-800 text-white hover:bg-slate-700 text-xs rounded cursor-pointer font-bold">Browse</button>
                )}
              </div>
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded text-xs space-y-2">
              <span className="font-bold block">Settings Profile (GameUserSettings.ini)</span>
              {valorantConfigs.length === 0 ? (
                <div className="text-slate-400 italic text-[11px]">No client profiles detected.</div>
              ) : (
                <select
                  value={selectedConfig ? selectedConfig.filePath : ''}
                  onChange={(e) => {
                    const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                    if (cfg) setSelectedConfig(cfg);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white cursor-pointer focus:outline-none"
                >
                  {valorantConfigs.map((cfg) => (
                    <option key={cfg.filePath} value={cfg.filePath}>
                      {cfg.accountId.slice(0, 16)}... (Client Settings)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                <span className="font-bold">Anti-Cheat System Check</span>
                <button onClick={checkVanguardHealth} className="text-slate-500 hover:text-slate-800 underline font-bold">Refresh Scan</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Secure Boot', ok: vanguardHealth.secureBoot === 'enabled' },
                  { label: 'TPM 2.0', ok: vanguardHealth.tpm2 === 'active' },
                  { label: 'CSM Off', ok: vanguardHealth.csmDisabled === 'disabled' },
                  { label: 'VPN Allowed', ok: !vanguardHealth.vpnActive },
                  { label: 'Driver Check', ok: !vanguardHealth.gpuDriverWarning },
                  { label: 'Clean Kernel', ok: (!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0) }
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 border border-slate-200 bg-slate-50 rounded text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-500">{item.label}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${item.ok ? 'text-green-600' : 'text-rose-600'}`}>
                      {item.ok ? 'COMPLIANT' : 'WARN'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graphics Settings Tuner */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">In-Game Graphics Configuration</h2>
            
            {selectedConfig ? (
              <div className="p-3 border border-slate-200 bg-white rounded space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Resolution Quality Scale</span>
                    <span>{Math.round(selectedConfig.resolutionQuality)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={Math.round(selectedConfig.resolutionQuality)}
                    onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Texture Quality</span>
                    <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Shadows Quality</span>
                    <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Low (Off)</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Effects Quality</span>
                    <select value={selectedConfig.effectsQuality} onChange={(e) => saveValorantConfig({ effectsQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Anti-Aliasing</span>
                    <select value={selectedConfig.antiAliasingQuality} onChange={(e) => saveValorantConfig({ antiAliasingQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Off</option><option value="1">MSAA 2x</option><option value="2">MSAA 4x</option><option value="3">MSAA 8x</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Raw Input Buffer</span>
                    <select value={selectedConfig.rawInputBuffer ? 'true' : 'false'} onChange={(e) => saveValorantConfig({ rawInputBuffer: e.target.value === 'true' })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="true">On (Raw)</option><option value="false">Off</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-slate-200 bg-white rounded text-center text-slate-400 italic text-xs">
                Graphics profile config parameters not loaded.
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Hardware GPU Scheduling (HAGS)</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-amber-50 border-amber-200 text-amber-700">Aggressive</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Toggles Windows GPU scheduler optimization registry key.</p>
                    <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                      ⚠️ Warning: HAGS can cause micro-stuttering and memory leaks in CPU-bound games like VALORANT.
                    </p>
                  </div>
                  <button onClick={() => toggleHags(!registryStates.hagsEnabled)} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{registryStates.hagsEnabled ? 'ENABLED' : 'DISABLED'}</button>
                </div>
              </div>

              <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Disable Windows GameDVR</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">Safe</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Suspends background game capture telemetry tools.</p>
                  </div>
                  <button onClick={() => toggleGameDvr(!registryStates.gameDvrDisabled)} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{registryStates.gameDvrDisabled ? 'DISABLED' : 'ENABLED'}</button>
                </div>
              </div>

              <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Multimedia Priority Lock</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-amber-50 border-amber-200 text-amber-700">Aggressive</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Sets scheduling class preferences to GPU High.</p>
                    <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                      ⚠️ Warning: Starves background system tasks (audio, keyboard/mouse polling, Vanguard check) causing severe 1% low frame drops.
                    </p>
                  </div>
                  <button onClick={() => togglePriorityOptimized(!registryStates.priorityOptimized)} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{registryStates.priorityOptimized ? 'OPTIMIZED' : 'DEFAULT'}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Latency Tweaks Checkboxes */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Monitor Sync & Input Latency Controls</h2>
            
            <div className="p-2 border border-slate-200 bg-white rounded text-xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">Disable NVIDIA G-Sync</span>
                  <p className="text-[10px] text-slate-500">Skips timing alignment controls on NV display buffers.</p>
                </div>
                <button 
                  onClick={() => toggleGsync(!gsyncDisabled)} 
                  disabled={gpuInfo && gpuInfo.vendor !== 'nvidia'}
                  className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  {gsyncDisabled ? 'DISABLED' : 'ENABLED'}
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <div>
                  <span className="font-bold">Adaptive Sync Tweak</span>
                  <p className="text-[10px] text-slate-500">Toggles registry keys for FreeSync pipelines.</p>
                </div>
                <button onClick={() => toggleFreesync(!freesyncEnabled)} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer">{freesyncEnabled ? 'ACTIVE' : 'OFF'}</button>
              </div>

              <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-700">Monitor Refresh Rate Target</span>
                <select
                  value={monitorRefreshRate}
                  onChange={(e) => applyFrameLimitSettings(frameLimitMode, parseInt(e.target.value, 10))}
                  className="p-1.5 border border-slate-200 bg-white rounded w-full cursor-pointer"
                >
                  <option value="60">60 Hz</option><option value="120">120 Hz</option><option value="144">144 Hz</option><option value="165">165 Hz</option><option value="240">240 Hz</option><option value="360">360 Hz</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)} className={`p-2 border text-center font-bold rounded cursor-pointer ${frameLimitMode === 'uncapped' ? 'bg-slate-200 border-slate-400' : 'bg-white border-slate-200'}`}>UNCAPPED</button>
                <button onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)} className={`p-2 border text-center font-bold rounded cursor-pointer ${frameLimitMode === 'vrr' ? 'bg-slate-200 border-slate-400' : 'bg-white border-slate-200'}`}>VRR CAP ({monitorRefreshRate - 3}Hz)</button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { 
                  label: 'Disable Mouse Acceleration', 
                  active: latencyTweaks.disableMouseAccel, 
                  onClick: () => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel),
                  tier: 'safe',
                  desc: 'Eliminates precision enhancement scaling for raw tracking.'
                },
                { 
                  label: 'Disable USB Selective Suspend', 
                  active: latencyTweaks.disableUsbSuspend, 
                  onClick: () => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend),
                  tier: 'safe',
                  desc: 'Prevents USB controllers from dropping power, reducing mouse/keyboard wake latency.'
                },
                { 
                  label: 'Disable CPU Core Parking', 
                  active: latencyTweaks.disableCoreParking, 
                  onClick: () => toggleLatencyTweak('disableCoreParking', !latencyTweaks.disableCoreParking),
                  tier: 'aggressive',
                  desc: 'Keeps all cores active.',
                  warning: 'Can cause high heat and thermal throttling on laptops/low-cooling setups.'
                },
                { 
                  label: 'Disable Windows Dynamic Tick', 
                  active: latencyTweaks.disableDynamicTick, 
                  onClick: () => toggleLatencyTweak('disableDynamicTick', !latencyTweaks.disableDynamicTick),
                  tier: 'aggressive',
                  desc: 'Stops the OS clock timer from turning off during CPU idle.',
                  warning: 'May increase interrupt overhead and destabilize frame rate on modern architectures.'
                },
                { 
                  label: 'Force Exclusive Fullscreen Mode', 
                  active: latencyTweaks.disableFullscreenOpt, 
                  onClick: () => toggleLatencyTweak('disableFullscreenOpt', !latencyTweaks.disableFullscreenOpt),
                  tier: 'aggressive',
                  desc: 'Applies compatibility override to the game executable.',
                  warning: 'Can increase input latency on modern Windows Flip Model display pipelines.'
                },
                { 
                  label: 'Force MSI Interrupt Mode', 
                  active: msiEnabled, 
                  onClick: () => toggleMsiMode(!msiEnabled),
                  tier: 'aggressive',
                  desc: 'Configures GPU to use Message Signaled Interrupts (MSI).',
                  warning: 'If driver or device doesn\'t support MSI, it can crash your display driver or cause mouse stuttering.'
                },
                { 
                  label: 'Foreground CPU Quantum Boost', 
                  active: latencyTweaks.prioritySeparation, 
                  onClick: () => toggleLatencyTweak('prioritySeparation', !latencyTweaks.prioritySeparation),
                  tier: 'aggressive',
                  desc: 'Allocates shorter, variable priority quanta slices to the game thread.',
                  warning: 'Can starve crucial background system threads (like mouse input, audio, and Vanguard), causing severe 1% low spikes.'
                },
                { 
                  label: 'Persistent High CPU Priority', 
                  active: persistentPriorityEnabled, 
                  onClick: () => togglePersistentPriority(!persistentPriorityEnabled),
                  tier: 'safe',
                  desc: 'Configures Windows IFEO to automatically run the game in high priority.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-200 bg-white rounded space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                          item.tier === 'safe' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {item.tier}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      {item.warning && (
                        <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                          ⚠️ Warning: {item.warning}
                        </p>
                      )}
                    </div>
                    <button onClick={item.onClick} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{item.active ? 'TWEAKED' : 'DEFAULT'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Clock & Purging */}
        <div className="space-y-6 text-xs">

          {/* Timers & OS Services */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Timers & Services</h2>
            
            <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">System Clock Lock (0.5ms)</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-amber-50 border-amber-200 text-amber-700">Aggressive</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">Locks hardware timer resolution value to 0.5ms.</p>
                  <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                    ⚠️ Warning: The background loop for setting timer resolution can add context switching overhead and heat on modern CPUs.
                  </p>
                </div>
                <button onClick={() => toggleTimerResolution(!timerResActive)} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{timerResActive ? 'LOCKED' : 'DEFAULT'}</button>
              </div>
            </div>

            <div className="p-3 border border-slate-200 bg-white rounded space-y-3">
              <span className="font-bold block text-slate-700 border-b border-slate-100 pb-1">Windows OS Services</span>
              <div className="space-y-3">
                {[
                  { 
                    label: 'NIC Power Savings', 
                    active: nicPowerSavingDisabled, 
                    onClick: () => toggleNicPower(!nicPowerSavingDisabled), 
                    actL: 'DISABLED', 
                    inactL: 'ENABLED',
                    tier: 'safe',
                    desc: 'Disables Energy Efficient Ethernet to stop adapter latency spikes.'
                  },
                  { 
                    label: 'Global Fullscreen Opt', 
                    active: globalFsoDisabled, 
                    onClick: () => toggleGlobalFso(!globalFsoDisabled), 
                    actL: 'DISABLED', 
                    inactL: 'ENABLED',
                    tier: 'aggressive',
                    desc: 'Disables Windows FSO globally.',
                    warning: 'Can degrade performance on modern Flip Model DX12 displays.'
                  },
                  { 
                    label: 'Power Throttling Policy', 
                    active: powerThrottlingDisabled, 
                    onClick: () => togglePowerThrottling(!powerThrottlingDisabled), 
                    actL: 'DISABLED', 
                    inactL: 'ENABLED',
                    tier: 'aggressive',
                    desc: 'Stops Windows from power-throttling background processes.',
                    warning: 'Can cause higher battery consumption and scheduling issues on hybrid CPUs.'
                  },
                  { 
                    label: 'SysMain (Superfetch)', 
                    active: !bgServices.SysMain, 
                    onClick: () => toggleBgService('SysMain', !bgServices.SysMain), 
                    actL: 'DISABLED', 
                    inactL: 'RUNNING',
                    tier: 'aggressive',
                    desc: 'Disables SysMain page-caching service.',
                    warning: 'May slow down game launch/load times on setups with SSDs or 16GB+ RAM.'
                  },
                  { 
                    label: 'Xbox Live Auth Service', 
                    active: !bgServices.XblAuthManager, 
                    onClick: () => toggleBgService('XblAuthManager', !bgServices.XblAuthManager), 
                    actL: 'DISABLED', 
                    inactL: 'RUNNING',
                    tier: 'safe',
                    desc: 'Safe to disable if you do not use Xbox Live / Game Pass services.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-[11px]">{item.label}</span>
                        <span className={`px-1 rounded text-[7px] font-bold uppercase tracking-wide border ${
                          item.tier === 'safe' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {item.tier}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      {item.warning && (
                        <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                          ⚠️ {item.warning}
                        </p>
                      )}
                    </div>
                    <button onClick={item.onClick} className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer shrink-0">{item.active ? item.actL : item.inactL}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* App Purger & Scrubbers */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Cache & Service Purges</h2>
            
            <div className="p-2 border border-slate-200 bg-white rounded">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={optimizationOptions.pauseUpdates} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, pauseUpdates: e.target.checked }))} className="mt-0.5 cursor-pointer w-3.5 h-3.5" />
                <div>
                  <span className="font-bold block">Suspend Windows Updates</span>
                  <p className="text-[10px] text-slate-500">Stops update scheduler during game launch.</p>
                </div>
              </label>
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={optimizationOptions.purgeApps} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, purgeApps: e.target.checked }))} className="mt-0.5 cursor-pointer w-3.5 h-3.5" />
                <div>
                  <span className="font-bold block">Background App Purging</span>
                  <p className="text-[10px] text-slate-500">Closes the selected applications on launch.</p>
                </div>
              </label>

              {optimizationOptions.purgeApps && (
                <div className="grid grid-cols-2 gap-2 pl-6 pt-1 text-[11px] border-l border-slate-200">
                  {Object.keys(purgeAppsChecklist).map(appKey => (
                    <label key={appKey} className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={purgeAppsChecklist[appKey]}
                        onChange={(e) => setPurgeAppsChecklist(prev => ({ ...prev, [appKey]: e.target.checked }))}
                        className="cursor-pointer"
                      />
                      <span className="capitalize">{appKey}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded space-y-2">
              <span className="font-bold block text-slate-700">Gaming Enhancers</span>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={forceValorantPriority} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold text-[10px]">HI PRIO</button>
                <button onClick={toggleGameMode} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold text-[10px] truncate">{gameModeActive ? 'MODE ON' : 'GAME MODE'}</button>
                <button onClick={togglePowerPlan} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold text-[10px] truncate">{powerPlanMode === 'high' ? 'MAX PERF' : 'POWER PLAN'}</button>
              </div>
            </div>

            <div className="p-2 border border-slate-200 bg-white rounded space-y-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                <span className="font-bold">Log & Shader Caches</span>
                <button onClick={scanValorantCaches} disabled={scanningVal || cleaningVal} className="text-slate-500 hover:text-slate-800 underline font-bold">Scan Size</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 border border-slate-100 bg-slate-50 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block">Telemetry Logs</span>
                    <span className="font-bold block mt-0.5">{valorantLogsSize}</span>
                  </div>
                  <button onClick={clearValorantLogs} disabled={cleaningVal || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="w-full py-1 bg-slate-800 text-white rounded mt-2 cursor-pointer font-bold disabled:opacity-50">Clear</button>
                </div>
                <div className="p-2 border border-slate-100 bg-slate-50 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block">GPU Shaders</span>
                    <span className="font-bold block mt-0.5">{shaderCacheSize}</span>
                  </div>
                  <button onClick={cleanAllShaderCaches} disabled={cleaningVal || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="w-full py-1 bg-slate-800 text-white rounded mt-2 cursor-pointer font-bold disabled:opacity-50">Purge</button>
                </div>
              </div>
            </div>
          </div>

          {/* Logger Stream */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1.5">Booster Daemon Logger</span>
            <div className="border border-slate-200 bg-white p-2 font-mono text-[9px] rounded h-32 overflow-y-auto leading-relaxed">
              {valorantLogs.map((log, idx) => (
                <div key={idx} className="text-slate-650 truncate">&gt; {log}</div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
