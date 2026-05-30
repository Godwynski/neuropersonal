import React from 'react';

import { useAppContext } from '../hooks/useAppContext';

export default function ValorantOptimizer() {
  const {
    isElectron,
    valorantPath,
    valorantPathDetected,
    browseValorantPath,
    valorantRunning,
    setValorantRunning,
    launchValorant,
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
    scanningVal,
    cleaningLogs,
    cleaningShaders,
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
    toggleGameDvr,
    checkRegistryStates,
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
    powerThrottlingDisabled, togglePowerThrottling,
    cleanAllShaderCaches,
    applyOptimizationProfile,
    gsyncDisabled, toggleGsync,
    freesyncEnabled, toggleFreesync,
    gpuInfo,
    persistentPriorityEnabled, togglePersistentPriority,
    // Feature 1: VBS
    vbsStatus, vbsRebootRequired, toggleVbs,
    // Feature 2: HPET
    hpetDisabled, hpetRebootRequired, toggleHpet,
    // Feature 3: AMD
    amdOptimizations, toggleAmdMpo, toggleAmdLegacyDx, toggleAmdShaderCache,
    // Feature 4: GPU Driver Profile
    gpuDriverProfile, applyGpuDriverProfile,
    // Feature 5: Hardware Bottleneck
    hardwareInfo, toggleLegacyRebar
  } = useAppContext();
  const optimizedCount = [
    registryStates.gameDvrDisabled === true,
    registryStates.priorityOptimized === true,
    latencyTweaks.disableMouseAccel === true,
    latencyTweaks.disableUsbSuspend === true,
    persistentPriorityEnabled === true,
    timerResActive === true,
    hpetDisabled === true,
    nicPowerSavingDisabled === true,
    powerThrottlingDisabled === true,
    !bgServices.XblAuthManager,
    !vbsStatus.vbsEnabled,
    (gpuInfo.vendor === 'nvidia' && gsyncDisabled) || (gpuInfo.vendor === 'amd' && amdOptimizations.mpoDisabled)
  ].filter(Boolean).length;
  const totalOptimizations = 12;
  const optimizationPercentage = Math.round((optimizedCount / totalOptimizations) * 100);

  return (
    <div className="space-y-6 font-sans text-slate-800 bg-white p-2">
      
      {/* Page Header */}
      <header className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold">Valorant Engine Booster</h1>
          <p className="text-[11px] text-slate-500">System tweaks and caches for tactile gaming performance.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {!valorantRunning ? (
            <button 
              onClick={launchValorant}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              LAUNCH VALORANT
            </button>
          ) : (
            !isElectron && (
              <button 
                onClick={() => setValorantRunning(false)} 
                className="border border-slate-300 px-2 py-1 rounded bg-white hover:bg-slate-50 cursor-pointer"
              >
                Simulate Exit
              </button>
            )
          )}
          <span className={`px-2 py-1 border rounded font-mono font-bold ${valorantRunning ? 'bg-green-50 border-green-300 text-green-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
            GAME STATUS: {valorantRunning ? 'VALORANT IS OPEN (BOOST ACTIVE)' : 'VALORANT IS CLOSED'}
          </span>
        </div>
      </header>

      {/* Optimization Score Dashboard Tracker */}
      <div className="p-4 border border-indigo-150 bg-indigo-50/50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-slate-700 block">Overall Performance Optimization Score</span>
          <p className="text-[10px] text-slate-500">This score measures how many system tweaks are currently configured to maximize gaming FPS.</p>
        </div>
        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between font-bold text-indigo-750 text-[10px]">
            <span>{optimizedCount} of {totalOptimizations} Tweaks Active</span>
            <span>{optimizationPercentage}% OPTIMIZED</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-350">
            <div className={`h-full transition-all duration-500 ${
              optimizationPercentage >= 80 ? 'bg-green-500' : optimizationPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`} style={{ width: `${optimizationPercentage}%` }} />
          </div>
        </div>
      </div>

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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Profile Presets</h2>

            <div className="p-2 border border-slate-200 bg-white rounded space-y-2 text-xs">
              <span className="font-bold block">Apply Optimization Profile</span>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => applyOptimizationProfile('tournament')} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">TOURNAMENT</button>
                <button onClick={() => applyOptimizationProfile('balanced')} className="p-2 border border-slate-200 hover:bg-slate-100 rounded text-center cursor-pointer font-bold">BALANCED</button>
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
                  { label: 'VBS Throttle', ok: !vbsStatus.vbsEnabled }
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 border border-slate-200 bg-slate-50 rounded text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-500">{item.label}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${item.ok ? 'text-green-600' : 'text-rose-600'}`}>
                      {item.ok ? 'COMPLIANT' : 'WARN'}
                    </div>
                  </div>
                ))}
              </div>
              {vanguardHealth.vbsReenabled && (
                <div className="mt-2 p-2 border border-amber-300 bg-amber-50 rounded text-[10px] text-amber-800 font-semibold">
                  ⚠️ VBS was re-enabled by a Windows Update. Your FPS may be throttled by up to 20%. Disable it in the Virtualization Security panel below.
                </div>
              )}
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
                      <span className="font-bold text-slate-800">Windows GameDVR Telemetry</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">Safe Tweak</span>
                      <span className="text-[10px] font-semibold text-green-600">(+1-2% FPS / Prevents Telemetry Spikes)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Background game capture telemetry tools consume CPU cycles.
                      <span className="font-bold text-indigo-600 ml-1">Recommendation: DISABLE for best FPS.</span>
                    </p>
                    <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                      Current Status: {registryStates.gameDvrDisabled ? '🔴 Disabled (Optimal)' : '🟢 Active (May Throttling CPU)'}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleGameDvr(!registryStates.gameDvrDisabled)} 
                    className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      registryStates.gameDvrDisabled 
                        ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {registryStates.gameDvrDisabled ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                  </button>
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold">NVIDIA G-Sync Bypass</span>
                    <span className="text-[10px] font-semibold text-green-600">(Reduces Input Latency)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Skips buffer alignment timing checks. <span className="font-bold text-indigo-600">Recommendation: DISABLE for lowest input delay.</span></p>
                  <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                    Current Status: {gsyncDisabled ? '🔴 Disabled (Optimal for Latency)' : '🟢 Enabled (Variable Frame Align)'}
                  </div>
                </div>
                <button 
                  onClick={() => toggleGsync(!gsyncDisabled)} 
                  disabled={gpuInfo && gpuInfo.vendor !== 'nvidia'}
                  className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 ${
                    gsyncDisabled 
                      ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {gsyncDisabled ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">AMD FreeSync Tweak</span>
                    <span className="text-[10px] font-semibold text-green-600">(Minimizes AMD Sync Overhead)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Configures adaptive sync keys. <span className="font-bold text-indigo-600">Recommendation: DISABLE for maximum frames, or ENABLE to stop screen tearing.</span></p>
                  <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                    Current Status: {freesyncEnabled ? '🟢 Enabled' : '🔴 Disabled'}
                  </div>
                </div>
                <button 
                  onClick={() => toggleFreesync(!freesyncEnabled)} 
                  className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    freesyncEnabled 
                      ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {freesyncEnabled ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                </button>
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
                <button onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)} className={`p-2 border text-center font-bold rounded cursor-pointer ${frameLimitMode === 'uncapped' ? 'bg-green-600 border-green-700 text-white' : 'bg-white border-slate-200'}`}>UNCAPPED (⚡ MAX FPS)</button>
                <button onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)} className={`p-2 border text-center font-bold rounded cursor-pointer ${frameLimitMode === 'vrr' ? 'bg-green-600 border-green-700 text-white' : 'bg-white border-slate-200'}`}>VRR CAP ({monitorRefreshRate - 3}Hz)</button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { 
                  label: 'Disable Mouse Acceleration', 
                  active: latencyTweaks.disableMouseAccel, 
                  onClick: () => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel),
                  tier: 'safe',
                  desc: 'Eliminates speed-based acceleration. Recommendation: DISABLE for raw 1:1 mouse input accuracy.',
                  status: (act) => act ? '🔴 Disabled (Optimal)' : '🟢 Enabled (Throttles Precision)',
                  benefit: 'Raw 1:1 Cursor Precision'
                },
                { 
                  label: 'Disable USB Selective Suspend', 
                  active: latencyTweaks.disableUsbSuspend, 
                  onClick: () => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend),
                  tier: 'safe',
                  desc: 'Prevents USB slots from powering down. Recommendation: DISABLE for instant peripheral response.',
                  status: (act) => act ? '🔴 Disabled (Optimal)' : '🟢 Active (May Sleep USB Devices)',
                  benefit: 'Zero Wake-up USB Latency'
                },
                { 
                  label: 'Persistent High CPU Priority', 
                  active: persistentPriorityEnabled, 
                  onClick: () => togglePersistentPriority(!persistentPriorityEnabled),
                  tier: 'safe',
                  desc: 'Instructs Windows scheduler to run Valorant on priority. Recommendation: ENABLE for best frame delivery.',
                  status: (act) => act ? '🟢 Active (Optimal)' : '🔴 Inactive (Normal Scheduler)',
                  benefit: '+3-5% Game Thread FPS'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-200 bg-white rounded space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">
                          {item.tier}
                        </span>
                        <span className="text-[10px] font-semibold text-green-600">({item.benefit})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                        Current Status: {item.status(item.active)}
                      </div>
                    </div>
                    <button 
                      onClick={item.onClick} 
                      className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        item.active 
                          ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.active ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: AMD GPU Optimization Panel (AMD only) */}
          {gpuInfo && gpuInfo.vendor === 'amd' && (
            <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">AMD GPU Optimization</h2>
              <div className="space-y-2 text-xs">
                {[
                  {
                    label: 'Disable Multi-Plane Overlay (MPO)',
                    active: amdOptimizations.mpoDisabled,
                    onClick: () => toggleAmdMpo(!amdOptimizations.mpoDisabled),
                    tier: 'safe',
                    desc: 'Sets OverlayTestMode=5 to prevent screen flickering and frame time spikes on RX 5000/6000 series.'
                  },
                  {
                    label: 'Force Legacy DX11 Path',
                    active: amdOptimizations.legacyDxPath,
                    onClick: () => {
                      const action = amdOptimizations.legacyDxPath ? 'restoring modern' : 'forcing legacy';
                      if (window.confirm(`Warning: You are ${action} the AMD DX11 driver path. This affects all DX11 games on your system. Proceed?`)) {
                        toggleAmdLegacyDx(!amdOptimizations.legacyDxPath);
                      }
                    },
                    tier: 'aggressive',
                    desc: 'Swaps amdxx64.dll → atidxx64.dll to bypass modern DXNavi pipeline stutters.',
                    warning: 'Affects all DirectX applications on the system. Revert if you experience issues in other apps.'
                  },
                  {
                    label: 'Shader Cache Always On',
                    active: amdOptimizations.shaderCacheAlwaysOn,
                    onClick: () => toggleAmdShaderCache(!amdOptimizations.shaderCacheAlwaysOn),
                    tier: 'safe',
                    desc: 'Eliminates recompilation hitches by keeping the shader cache persistent across sessions.'
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
                            ⚠️ {item.warning}
                          </p>
                        )}
                      </div>
                      <button onClick={item.onClick} className="px-3 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-xs font-bold cursor-pointer shrink-0">{item.active ? 'TWEAKED' : 'DEFAULT'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 4: GPU Driver Profile Panel */}
          {gpuInfo && (gpuInfo.vendor === 'nvidia' || gpuInfo.vendor === 'amd') && (
            <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {gpuInfo.vendor === 'nvidia' ? 'NVIDIA' : 'AMD'} Driver Profile
                </h2>
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-48">{gpuInfo.name}</span>
              </div>

              <div className="space-y-2 text-xs">
                {gpuInfo.vendor === 'nvidia' ? (
                  // NVIDIA tweaks
                  <>
                    {[
                      { label: 'Power Management → Max Performance', active: gpuDriverProfile.powerMaxPerformance, desc: 'Forces GPU to maintain highest clock speeds at all times.' },
                      { label: 'Low Latency Mode → Ultra', active: gpuDriverProfile.lowLatencyUltra, desc: 'Minimizes CPU render queue buffering for fastest frame delivery.' },
                      { label: 'Threaded Optimization → On', active: gpuDriverProfile.threadedOptimization, desc: 'Enables multi-threaded driver optimizations for draw calls.' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2 border border-slate-200 bg-white rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-[11px]">{item.label}</span>
                            <span className="px-1 rounded text-[7px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">safe</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${item.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                          {item.active ? 'SET' : 'DEFAULT'}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  // AMD tweaks
                  <>
                    {[
                      { label: 'Radeon Anti-Lag → Enabled', active: gpuDriverProfile.antiLagEnabled, desc: 'Shrinks CPU render queue to minimize input-to-display delay.' },
                      { label: 'Texture Filtering → Performance', active: gpuDriverProfile.textureFilterPerformance, desc: 'Prioritizes speed over visual fidelity in texture sampling.' },
                      { label: 'Radeon Chill → Disabled', active: gpuDriverProfile.radeonChillDisabled, desc: 'Prevents frame rate throttling during low-motion scenes.' },
                      { label: 'Radeon Boost → Disabled', active: gpuDriverProfile.radeonBoostDisabled, desc: 'Stops dynamic resolution scaling that introduces input latency.' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2 border border-slate-200 bg-white rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-[11px]">{item.label}</span>
                            <span className="px-1 rounded text-[7px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">safe</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${item.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                          {item.active ? 'SET' : 'DEFAULT'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyGpuDriverProfile('performance')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold cursor-pointer text-center"
                >
                  APPLY PERFORMANCE
                </button>
                <button
                  onClick={() => applyGpuDriverProfile('default')}
                  className="py-2 px-3 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer text-center"
                >
                  REVERT DEFAULTS
                </button>
              </div>
            </div>
          )}

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
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-green-50 border-green-200 text-green-700">Safe Tweak</span>
                    <span className="text-[10px] font-semibold text-green-600">(Reduces Micro-Stuttering)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">Forces system timer precision to 0.5ms. <span className="font-bold text-indigo-600">Recommendation: ENABLE for smooth frame delivery.</span></p>
                  <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                    Current Status: {timerResActive ? '🟢 Locked to 0.5ms (Optimal)' : '🔴 Default Windows Timer'}
                  </div>
                </div>
                <button 
                  onClick={() => toggleTimerResolution(!timerResActive)} 
                  className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    timerResActive 
                      ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {timerResActive ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                </button>
              </div>
            </div>

            {/* Feature 2: HPET Override */}
            <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Disable HPET (Platform Clock)</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-amber-50 border-amber-200 text-amber-700">aggressive</span>
                    <span className="text-[10px] font-semibold text-green-600">(Solves Frametime Spikes)</span>
                    {hpetRebootRequired && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-rose-50 border-rose-200 text-rose-700 animate-pulse">REBOOT REQUIRED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">Bypasses BIOS platform clock. <span className="font-bold text-indigo-600">Recommendation: DISABLE to stop frame time variance on Ryzen platforms.</span></p>
                  <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                    Current Status: {hpetDisabled ? '🔴 Disabled (Optimal)' : '🟢 Active'}
                  </div>
                  <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                    ⚠️ Modifies Boot Manager clock sync. Requires system restart to take effect.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const action = hpetDisabled ? 'enable' : 'disable';
                    if (window.confirm(`Warning: This modifies Windows Boot Configuration Data to ${action} HPET. A reboot will be required. Proceed?`)) {
                      toggleHpet(!hpetDisabled);
                    }
                  }} 
                  className={`px-3 py-1.5 border rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    hpetDisabled 
                      ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {hpetDisabled ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                </button>
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
                    tier: 'safe',
                    desc: 'Disables Energy Efficient Ethernet. Recommendation: DISABLE to prevent network latency spikes.',
                    status: (act) => act ? '🔴 Disabled (Optimal)' : '🟢 Active (Adaptive Power)',
                    benefit: 'Stable Ping / No Adapter sleep'
                  },
                  { 
                    label: 'Power Throttling Policy', 
                    active: powerThrottlingDisabled, 
                    onClick: () => togglePowerThrottling(!powerThrottlingDisabled), 
                    tier: 'aggressive',
                    desc: 'Stops thread power gating. Recommendation: DISABLE to allocate full CPU core throughput.',
                    status: (act) => act ? '🔴 Disabled (Optimal)' : '🟢 Active (Core Power Throttling)',
                    warning: 'Can cause higher battery consumption on laptops.',
                    benefit: 'Stable High Core Clocks'
                  },
                  { 
                    label: 'Xbox Live Auth Service', 
                    active: !bgServices.XblAuthManager, 
                    onClick: () => toggleBgService('XblAuthManager', !bgServices.XblAuthManager), 
                    tier: 'safe',
                    desc: 'Stops Xbox login background services. Recommendation: DISABLE if you do not play Xbox games.',
                    status: (act) => act ? '🔴 Disabled (Optimal)' : '🟢 Active (Consuming Thread Heap)',
                    benefit: 'Saves System Memory'
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
                        <span className="text-[10px] font-semibold text-green-600">({item.benefit})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      {item.warning && (
                        <p className="text-[9px] text-amber-700 bg-amber-50/50 p-1 border border-amber-100 rounded leading-normal font-semibold">
                          ⚠️ {item.warning}
                        </p>
                      )}
                      <div className="text-[10px] font-mono text-slate-550 pt-0.5">
                        Current Status: {item.status(item.active)}
                      </div>
                    </div>
                    <button 
                      onClick={item.onClick} 
                      className={`px-2.5 py-1 border rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        item.active 
                          ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item.active ? '⚡ OPTIMIZED' : '⚠️ OPTIMIZE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 1: VBS & Core Isolation Panel */}
            <div className="p-3 border border-slate-200 bg-white rounded space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                <div>
                  <span className="font-bold block text-slate-750">Virtualization Security (VBS)</span>
                  <span className="text-[10px] font-semibold text-rose-600 leading-none">(Up to -20% FPS Throttle)</span>
                </div>
                {vbsRebootRequired && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border bg-rose-50 border-rose-200 text-rose-700 animate-pulse">REBOOT REQUIRED</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'VBS Shield', ok: !vbsStatus.vbsEnabled, detail: vbsStatus.vbsEnabled ? '🟢 ACTIVE (Warn)' : '🔴 DISABLED (Optimal)' },
                  { label: 'Core Isolation', ok: !vbsStatus.memoryIntegrity, detail: vbsStatus.memoryIntegrity ? '🟢 ACTIVE (Warn)' : '🔴 DISABLED (Optimal)' },
                  { label: 'VM Support', ok: vbsStatus.vmPlatform !== 'enabled', detail: (vbsStatus.vmPlatform || 'unknown').toUpperCase() },
                  { label: 'Hypervisor', ok: vbsStatus.hypervisorPlatform !== 'enabled', detail: (vbsStatus.hypervisorPlatform || 'unknown').toUpperCase() }
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 border border-slate-200 bg-slate-50 rounded text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-500">{item.label}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${item.ok ? 'text-green-600' : 'text-rose-600'}`}>{item.detail}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm("Disabling Virtualization-Based Security (VBS) and Memory Integrity lowers system protection to improve game frame rates. Change requires reboot. Proceed?")) {
                      toggleVbs(false);
                    }
                  }}
                  disabled={!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold cursor-pointer disabled:opacity-40 text-center ${
                    (!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity)
                      ? 'bg-green-600 border-green-700 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {(!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity) ? '⚡ OPTIMIZED' : 'DISABLE ALL'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Enabling Virtualization-Based Security (VBS) restores default Windows security mechanisms. Change requires reboot. Proceed?")) {
                      toggleVbs(true);
                    }
                  }}
                  disabled={vbsStatus.vbsEnabled && vbsStatus.memoryIntegrity}
                  className="flex-1 py-1.5 px-2 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer disabled:opacity-40 text-center"
                >
                  ENABLE ALL
                </button>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">Virtualization security adds a hypervisor overlay that degrades gaming framerates by up to 20%. Safe to disable for gaming-only computers. Windows Updates may silently re-enable it.</p>
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
                        checked={!!Reflect.get(purgeAppsChecklist, appKey)}
                        onChange={(e) => {
                          const nextList = { ...purgeAppsChecklist };
                          Reflect.set(nextList, appKey, e.target.checked);
                          setPurgeAppsChecklist(nextList);
                        }}
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
                <button onClick={scanValorantCaches} disabled={scanningVal || cleaningLogs || cleaningShaders} className="text-slate-500 hover:text-slate-800 underline font-bold">Scan Size</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 border border-slate-100 bg-slate-50 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block">Telemetry Logs</span>
                    <span className="font-bold block mt-0.5">{valorantLogsSize}</span>
                  </div>
                  <button onClick={clearValorantLogs} disabled={cleaningLogs || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="w-full py-1 bg-slate-800 text-white rounded mt-2 cursor-pointer font-bold disabled:opacity-50">Clear</button>
                </div>
                <div className="p-2 border border-slate-100 bg-slate-50 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block">GPU Shaders</span>
                    <span className="font-bold block mt-0.5">{shaderCacheSize}</span>
                  </div>
                  <button onClick={cleanAllShaderCaches} disabled={cleaningShaders || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="w-full py-1 bg-slate-800 text-white rounded mt-2 cursor-pointer font-bold disabled:opacity-50">Purge</button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Hardware Bottleneck Scanner */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1.5">Hardware Bottleneck Scanner</h2>

            {/* RAM Status */}
            <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">RAM / XMP Status</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${hardwareInfo.xmpEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  {hardwareInfo.xmpEnabled ? 'XMP ENABLED' : 'XMP DISABLED'}
                </span>
              </div>
              {hardwareInfo.ramModules.length > 0 ? (
                <div className="space-y-1">
                  {hardwareInfo.ramModules.map((mod, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-mono p-1.5 bg-slate-50 border border-slate-100 rounded">
                      <span className="text-slate-600">{mod.manufacturer} — {mod.capacityGB}GB</span>
                      <span className={`font-bold ${mod.configuredSpeed > 2133 ? 'text-green-700' : 'text-rose-700'}`}>{mod.configuredSpeed} MHz</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 italic">No RAM module data available.</div>
              )}
              {!hardwareInfo.xmpEnabled && hardwareInfo.ramModules.length > 0 && (
                <p className="text-[9px] text-rose-700 bg-rose-50/50 p-1.5 border border-rose-100 rounded leading-normal font-semibold">
                  ⚠️ RAM running at stock 2133 MHz. Enable XMP/DOCP in BIOS for up to 30% CPU performance gain on Ryzen systems.
                </p>
              )}
            </div>

            {/* ReBAR Status */}
            <div className="p-3 border border-slate-200 bg-white rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Resizable BAR (ReBAR)</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${hardwareInfo.rebarEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  {hardwareInfo.rebarEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              {!hardwareInfo.rebarEnabled && (
                <p className="text-[10px] text-slate-500 leading-normal">
                  ReBAR can offer up to 20% performance gain. Enable "Above 4G Decoding" and "Resizable BAR" in your BIOS settings.
                </p>
              )}

              {/* Legacy ReBAR for unsupported AMD GPUs */}
              {hardwareInfo.isLegacyAmdGpu && (
                <div className="mt-1 p-2 border border-rose-200 bg-rose-50/30 rounded space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-[11px]">Force ReBAR (Legacy GPU)</span>
                        <span className="px-1 rounded text-[7px] font-bold uppercase tracking-wide border bg-rose-50 border-rose-300 text-rose-700">experimental</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal">Injects KMD_EnableReBarForLegacyASIC registry keys for unsupported GPUs like the RX 580.</p>
                      <p className="text-[9px] text-rose-700 bg-rose-50/50 p-1 border border-rose-100 rounded leading-normal font-semibold">
                        ⚠️ Experimental. Use at your own risk. Requires Above 4G Decoding in BIOS.
                      </p>
                    </div>
                    <button onClick={() => toggleLegacyRebar(!hardwareInfo.legacyRebarForced)} className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer shrink-0">
                      {hardwareInfo.legacyRebarForced ? 'FORCED' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
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
