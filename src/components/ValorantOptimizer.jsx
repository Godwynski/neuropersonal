import React from 'react';
import { Cpu, Settings, Zap, Trash2, Monitor, Shield, Sliders, Clock, MousePointer, FolderOpen } from 'lucide-react';

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
  // Theme-aware local helpers
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
    <div className="space-y-6 outline-none animate-in fade-in duration-300 font-sans">
      
      {/* 1. Page Header */}
      <header className={`flex justify-between items-center border-b ${sectionBorder} pb-4`}>
        <div>
          <h1 className={`text-xl font-bold tracking-wide ${textH}`}>Valorant Engine Booster</h1>
          <p className={`text-xs ${activeStyle.textAccent} mt-1`}>Optimize system configurations and purge junk caches to stabilize FPS</p>
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
              {valorantRunning ? 'Simulate Exit' : 'Simulate Launch'}
            </button>
          )}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${valorantRunning ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse' : `${pillInactive}`}`}>
            <div className={`w-2 h-2 rounded-full ${valorantRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-xs font-bold">{valorantRunning ? 'BOOST ACTIVE' : 'VALORANT NOT DETECTED'}</span>
          </div>
        </div>
      </header>

      {/* 2. Consolidated User Mode Alert */}
      {!isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-lg flex items-start gap-3 text-xs leading-relaxed">
          <span className="text-sm mt-0.5">⚠️</span>
          <span><strong>Running in User Mode:</strong> Elevated Administrator rights are recommended. Without them, advanced registry tweaks, CPU priorities, and background service controls will fail to apply.</span>
        </div>
      )}

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Controls & Tweaks Unified List */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION 1: CORE BOOSTER & PROFILE ENGINE */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Zap className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">1. Core Booster & Profile Engine</h2>
            </div>

            <div className="space-y-4">
              {/* Background Auto-Boost */}
              <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                <div className="space-y-1">
                  <span className="text-slate-200 font-bold block text-sm">Background Auto-Boost</span>
                  <p className={`text-xs ${textS} leading-relaxed`}>Locks game priority and network parameters on launch.</p>
                </div>
                <button 
                  onClick={() => setAutoBoostActive(!autoBoostActive)}
                  className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer text-center ${
                    autoBoostActive ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive
                  }`}
                >
                  {autoBoostActive ? 'ACTIVE' : 'STANDBY'}
                </button>
              </div>

              {/* Profile Presets Selection */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-3`}>
                <div className="space-y-1">
                  <span className="text-slate-200 font-bold block text-sm">Active Optimization Preset</span>
                  <p className={`text-xs ${textS} leading-relaxed`}>Applies optimized configurations tailored to your system profile.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <button 
                    onClick={() => applyOptimizationProfile('tournament')}
                    className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 p-2.5 rounded text-purple-400 text-center font-bold transition shadow-[0_0_6px_rgba(168,85,247,0.15)] cursor-pointer text-xs"
                  >
                    TOURNAMENT
                  </button>
                  <button 
                    onClick={() => applyOptimizationProfile('balanced')}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-2.5 rounded text-emerald-400 text-center font-bold transition cursor-pointer text-xs"
                  >
                    BALANCED
                  </button>
                  <button 
                    onClick={() => applyOptimizationProfile('streaming')}
                    className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-2.5 rounded text-blue-400 text-center font-bold transition cursor-pointer text-xs"
                  >
                    STREAMING
                  </button>
                  <button 
                    onClick={() => applyOptimizationProfile('revert')}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2.5 rounded text-slate-300 text-center font-bold transition cursor-pointer text-xs"
                  >
                    DEFAULT
                  </button>
                </div>
              </div>

              {/* Auto Power Plan */}
              <div className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                <div className="space-y-1">
                  <span className="text-slate-200 font-bold block text-sm">Auto Power Plan Management</span>
                  <p className={`text-xs ${textS} leading-relaxed`}>Dynamically sets OS energy profiles when gaming.</p>
                </div>
                <span className="px-3 py-1 rounded text-xs font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: GAME DIRECTORY & VANGUARD HUD */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">2. Directory Setup & Vanguard Compliance</h2>
            </div>

            <div className="space-y-4 text-sm">
              {/* Game Path configuration */}
              <div className={`p-4 rounded-lg border ${cardInner} flex flex-col gap-3`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold text-sm">VALORANT Directory Path</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${valorantPathDetected ? 'bg-emerald-100/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-100/10 text-rose-400 border-rose-500/20'}`}>
                    {valorantPathDetected ? 'DETECTED' : 'NOT FOUND'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 bg-slate-950/80 border border-white/5 p-2 rounded truncate select-all text-slate-400 text-xs font-mono" title={valorantPath}>
                    {valorantPath || 'Not Configured'}
                  </code>
                  {isElectron && (
                    <button onClick={browseValorantPath} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded transition cursor-pointer shrink-0 font-bold">BROWSE</button>
                  )}
                </div>
              </div>

              {/* Selected config profile */}
              <div className={`p-4 rounded-lg border ${cardInner} flex flex-col gap-3`}>
                <div className="space-y-1">
                  <span className="text-slate-200 font-bold block text-sm">Active Client Settings Profile</span>
                  <p className={`text-xs ${textS} leading-relaxed`}>Currently modified graphics configuration file.</p>
                </div>
                {valorantConfigs.length === 0 ? (
                  <div className="text-slate-500 italic py-1">No configs detected. Start the game once to generate settings.</div>
                ) : (
                  <select
                    value={selectedConfig ? selectedConfig.filePath : ''}
                    onChange={(e) => {
                      const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                      if (cfg) setSelectedConfig(cfg);
                    }}
                    className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-slate-350 focus:outline-none focus:border-cyan-500 transition text-xs cursor-pointer w-full"
                  >
                    {valorantConfigs.map((cfg) => (
                      <option key={cfg.filePath} value={cfg.filePath}>
                        {cfg.accountId.slice(0, 24)}... (Windows Config)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vanguard compliance HUD */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-3`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-200 font-bold block text-sm">Anti-Cheat Diagnostics</span>
                  <button
                    onClick={checkVanguardHealth}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer"
                  >
                    Re-Scan Health
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  {[
                    { label: 'Secure Boot', value: vanguardHealth.secureBoot === 'enabled', detail: 'Required on Windows 11' },
                    { label: 'TPM 2.0', value: vanguardHealth.tpm2 === 'active', detail: 'Platform Trust Module check' },
                    { label: 'CSM Bypass', value: vanguardHealth.csmDisabled === 'disabled', detail: 'CSM must be OFF' },
                    { label: 'VPN Status', value: !vanguardHealth.vpnActive, detail: 'Matchmaking proxy check' },
                    { label: gpuInfo && gpuInfo.vendor === 'amd' ? 'AMD Driver' : gpuInfo && gpuInfo.vendor === 'nvidia' ? 'NVIDIA Driver' : 'GPU Driver', value: !vanguardHealth.gpuDriverWarning, detail: 'GPU driver check' },
                    { label: 'Safe Drivers', value: (!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0), detail: 'Kernel driver check' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-2.5 rounded border ${deepCard} flex flex-col justify-between`} title={item.detail}>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{item.label}</span>
                      <div className="flex items-center gap-1.5 mt-2 font-bold text-xs">
                        <span className={`w-2 h-2 rounded-full ${item.value ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.3)]'}`} />
                        <span className={item.value ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.value ? 'COMPLIANT' : 'WARN'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: GRAPHICS & GPU ENGINE */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">3. Graphics & GPU Engine</h2>
            </div>

            <div className="space-y-4 text-sm">
              {selectedConfig ? (
                <div className={`p-4 rounded-lg border ${cardInner} space-y-4`}>
                  <div className="text-xs text-slate-305 font-bold border-b border-white/5 pb-2">In-Game Configuration Tuning</div>
                  
                  {/* Resolution scale */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-bold">Resolution Scale</span>
                      <span className="text-indigo-400 font-bold">{Math.round(selectedConfig.resolutionQuality)}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={Math.round(selectedConfig.resolutionQuality)}
                      onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  {/* Quality Settings Grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Textures</span>
                      <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="0">Low</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shadows</span>
                      <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="0">Low (Off)</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Effects</span>
                      <select value={selectedConfig.effectsQuality} onChange={(e) => saveValorantConfig({ effectsQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="0">Low</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Anti-Aliasing</span>
                      <select value={selectedConfig.antiAliasingQuality} onChange={(e) => saveValorantConfig({ antiAliasingQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="0">Off</option> <option value="1">MSAA 2x</option> <option value="2">MSAA 4x</option> <option value="3">MSAA 8x</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Raw Input Buffer</span>
                      <select value={selectedConfig.rawInputBuffer ? 'true' : 'false'} onChange={(e) => saveValorantConfig({ rawInputBuffer: e.target.value === 'true' })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="true">Enabled (Raw)</option> <option value="false">Disabled</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Texture Pool Size</span>
                      <select value={selectedConfig.texturePoolSizeLimit !== undefined ? selectedConfig.texturePoolSizeLimit : 0} onChange={(e) => saveValorantConfig({ texturePoolSizeLimit: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer">
                        <option value="0">0 (No Limit / Managed)</option>
                        <option value="500">500 MB (Low VRAM)</option>
                        <option value="1000">1000 MB (Medium VRAM)</option>
                        <option value="2000">2000 MB (High VRAM)</option>
                        <option value="4000">4000 MB (Ultra VRAM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-lg border ${cardInner} text-center py-6 text-slate-500 italic`}>
                  Graphics tuner is unavailable because no config profile is currently loaded.
                </div>
              )}

              {/* Windows GPU Enhancers */}
              <div className="space-y-3">
                <div className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                  <div className="space-y-1">
                    <span className="text-slate-200 font-bold block text-sm">Hardware Scheduling (HAGS)</span>
                    <p className={`text-xs ${textS} leading-relaxed`}>Enables OS GPU-accelerated scheduling controls.</p>
                  </div>
                  <button onClick={() => toggleHags(!registryStates.hagsEnabled)} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${registryStates.hagsEnabled ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.hagsEnabled ? 'ENABLED' : 'DISABLED'}</button>
                </div>

                <div className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                  <div className="space-y-1">
                    <span className="text-slate-200 font-bold block text-sm">Disable Windows DVR</span>
                    <p className={`text-xs ${textS} leading-relaxed`}>Turns off Game Bar telemetry overlays.</p>
                  </div>
                  <button onClick={() => toggleGameDvr(!registryStates.gameDvrDisabled)} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${registryStates.gameDvrDisabled ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.gameDvrDisabled ? 'DISABLED' : 'ENABLED'}</button>
                </div>

                <div className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                  <div className="space-y-1">
                    <span className="text-slate-200 font-bold block text-sm">Multimedia Priority</span>
                    <p className={`text-xs ${textS} leading-relaxed`}>Locks Multimedia Scheduler thread values to High.</p>
                  </div>
                  <button onClick={() => togglePriorityOptimized(!registryStates.priorityOptimized)} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${registryStates.priorityOptimized ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.priorityOptimized ? 'OPTIMIZED' : 'DEFAULT'}</button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: SYNC & INPUT LATENCY */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">4. Monitor Sync & Input Latency</h2>
            </div>

            <div className="space-y-4 text-sm">
              {/* Monitor Sync card */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-4`}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-200 font-bold block">Disable NVIDIA G-Sync</span>
                    <p className={`text-xs ${textS} leading-relaxed`}>
                      {gpuInfo && gpuInfo.vendor !== 'nvidia' ? 'Requires NVIDIA graphics card.' : 'Prevents frame timing overhead locks.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleGsync(!gsyncDisabled)} 
                    disabled={gpuInfo && gpuInfo.vendor !== 'nvidia'}
                    className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 ${
                      gpuInfo && gpuInfo.vendor !== 'nvidia'
                        ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-500'
                        : gsyncDisabled 
                          ? 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.15)] cursor-pointer' 
                          : `${pillInactive} cursor-pointer`
                    }`}
                  >
                    {gsyncDisabled ? 'OFF' : 'ON'}
                  </button>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-200 font-bold block">Adaptive Sync / FRTC</span>
                    <p className={`text-xs ${textS} leading-relaxed`}>Limits display buffer spikes (AMD/NV).</p>
                  </div>
                  <button onClick={() => toggleFreesync(!freesyncEnabled)} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${freesyncEnabled ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]' : pillInactive}`}>{freesyncEnabled ? 'ACTIVE' : 'OFF'}</button>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monitor Refresh Rate</span>
                  <select
                    value={monitorRefreshRate}
                    onChange={(e) => applyFrameLimitSettings(frameLimitMode, parseInt(e.target.value, 10))}
                    className="bg-[#05080e] border border-white/10 rounded-lg p-2 text-xs text-slate-300 cursor-pointer"
                  >
                    <option value="60">60 Hz</option><option value="120">120 Hz</option><option value="144">144 Hz</option><option value="165">165 Hz</option><option value="240">240 Hz</option><option value="280">280 Hz</option><option value="360">360 Hz</option><option value="540">540 Hz</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                  <button onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)} className={`p-3 rounded-lg border transition text-xs cursor-pointer flex flex-col items-center justify-center font-bold ${frameLimitMode === 'uncapped' ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' : pillInactive}`}>
                    <span>UNCAPPED</span>
                  </button>
                  <button onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)} className={`p-3 rounded-lg border transition text-xs cursor-pointer flex flex-col items-center justify-center font-bold ${frameLimitMode === 'vrr' ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400' : pillInactive}`}>
                    <span>VRR CAP ({monitorRefreshRate - 3} Hz)</span>
                  </button>
                </div>
              </div>

              {/* Registry Latency Tweaks */}
              <div className="space-y-3">
                {[
                  { label: 'Disable Mouse Acceleration', active: latencyTweaks.disableMouseAccel, onClick: () => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel), desc: 'Sets 1-to-1 raw input ratios.' },
                  { label: 'Disable USB Selective Suspend', active: latencyTweaks.disableUsbSuspend, onClick: () => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend), desc: 'Halts USB root power downs.' },
                  { label: 'Disable CPU Core Parking', active: latencyTweaks.disableCoreParking, onClick: () => toggleLatencyTweak('disableCoreParking', !latencyTweaks.disableCoreParking), desc: 'Keeps physical cores awake.' },
                  { label: 'Disable Windows Dynamic Tick', active: latencyTweaks.disableDynamicTick, onClick: () => toggleLatencyTweak('disableDynamicTick', !latencyTweaks.disableDynamicTick), desc: 'Keeps scheduler timer ticks constant.' },
                  { label: 'Force Exclusive Fullscreen', active: latencyTweaks.disableFullscreenOpt, onClick: () => toggleLatencyTweak('disableFullscreenOpt', !latencyTweaks.disableFullscreenOpt), desc: 'Bypasses the DWM overlay pipeline.' },
                  { label: 'Force MSI Interrupt Mode', active: msiEnabled, onClick: () => toggleMsiMode(!msiEnabled), desc: 'Enables Message Signaled Interrupts.' },
                  { label: 'Foreground CPU Quantum Boost', active: latencyTweaks.prioritySeparation, onClick: () => toggleLatencyTweak('prioritySeparation', !latencyTweaks.prioritySeparation), desc: 'Prioritizes CPU scheduling time for the active game window.' },
                  { label: 'Persistent High CPU Priority', active: persistentPriorityEnabled, onClick: () => togglePersistentPriority(!persistentPriorityEnabled), desc: 'Sets HKLM registry to always run VALORANT in High Priority mode.' }
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                    <div className="space-y-1">
                      <span className="text-slate-200 font-bold block text-sm">{item.label}</span>
                      <p className={`text-xs ${textS} leading-relaxed`}>{item.desc}</p>
                    </div>
                    <button onClick={item.onClick} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${item.active ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{item.active ? 'TWEAKED' : 'DEFAULT'}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: CLOCK TIMERS & OS SERVICES */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">5. Clock Timers & OS Services</h2>
            </div>

            <div className="space-y-4 text-sm">
              {/* System Clock Lock */}
              <div className={`flex justify-between items-center gap-3 ${cardInner} p-4 rounded-lg border`}>
                <div className="space-y-1">
                  <span className="text-slate-200 font-bold block text-sm">System Clock Lock</span>
                  <p className={`text-xs ${textS} leading-relaxed`}>Locks tick resolution to 0.5ms.</p>
                </div>
                <button onClick={toggleTimerResolution} className={`px-4 py-2 rounded font-bold border transition text-xs shrink-0 cursor-pointer ${timerResActive ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]' : pillInactive}`}>{timerResActive ? '0.5ms LOCK' : 'DEFAULT'}</button>
              </div>

              {/* Services toggle lists */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-4`}>
                <div className="text-sm text-slate-350 font-bold border-b border-white/5 pb-2">Windows OS Services Tweaks</div>
                <div className="space-y-4">
                  {[
                    { label: 'NIC Power Savings', active: nicPowerSavingDisabled, onClick: () => toggleNicPower(!nicPowerSavingDisabled), actL: 'DISABLED', inactL: 'ENABLED', desc: 'Halts network interface sleeping.' },
                    { label: 'Global Fullscreen Opt', active: globalFsoDisabled, onClick: () => toggleGlobalFso(!globalFsoDisabled), actL: 'DISABLED', inactL: 'ENABLED', desc: 'Stops multi-plane overlay lags system-wide.' },
                    { label: 'Power Throttling Tweak', active: powerThrottlingDisabled, onClick: () => togglePowerThrottling(!powerThrottlingDisabled), actL: 'DISABLED', inactL: 'ENABLED', desc: 'Allows full CPU power allocation to games.' },
                    { label: 'SysMain Service', active: !bgServices.SysMain, onClick: () => toggleBgService('SysMain', !bgServices.SysMain), actL: 'DISABLED', inactL: 'RUNNING', desc: 'Deactivates background disk prefetching.' },
                    { label: 'Xbox Live Auth Manager', active: !bgServices.XblAuthManager, onClick: () => toggleBgService('XblAuthManager', !bgServices.XblAuthManager), actL: 'DISABLED', inactL: 'RUNNING', desc: 'Disables telemetry auth background processes.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-3 border-b border-white/5 last:border-b-0 pb-3 last:pb-0">
                      <div className="space-y-1">
                        <span className="text-slate-300 font-bold block text-sm">{item.label}</span>
                        <p className={`text-xs ${textS} leading-relaxed`}>{item.desc}</p>
                      </div>
                      <button onClick={item.onClick} className={`px-3 py-1.5 rounded text-xs font-bold border transition shrink-0 cursor-pointer ${item.active ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' : pillInactive}`}>{item.active ? item.actL : item.inactL}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: APP PURGING & CACHE SCRUBBING */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Trash2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">6. App Purging & Cache Scrubbing</h2>
            </div>

            <div className="space-y-4 text-sm">
              {/* Windows update pause */}
              <div className={`p-4 rounded-lg border ${cardInner}`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={optimizationOptions.pauseUpdates} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, pauseUpdates: e.target.checked }))} className="mt-1.5 accent-rose-500 cursor-pointer w-4 h-4" />
                  <div className="space-y-1">
                    <span className="text-slate-200 group-hover:text-rose-400 font-bold block text-sm">Suspend Windows Update</span>
                    <span className="text-xs text-slate-500 block leading-relaxed">Pauses background update checks (`wuauserv`) to free up queues. (Admin Required)</span>
                  </div>
                </label>
              </div>

              {/* Background purge list */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-4`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={optimizationOptions.purgeApps} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, purgeApps: e.target.checked }))} className="mt-1.5 accent-rose-500 cursor-pointer w-4 h-4" />
                  <div className="space-y-1">
                    <span className="text-slate-200 group-hover:text-rose-400 font-bold block text-sm">Enable Background Process Purging</span>
                    <span className="text-xs text-slate-500 block leading-relaxed">Force-closes the checked apps below when Valorant starts.</span>
                  </div>
                </label>

                {optimizationOptions.purgeApps && (
                  <div className="grid grid-cols-2 gap-3 pl-6 pt-2 border-l border-rose-500/10 text-xs">
                    {Object.keys(purgeAppsChecklist).map(appKey => (
                      <label key={appKey} className="flex items-center gap-2.5 cursor-pointer group py-1">
                        <input 
                          type="checkbox" 
                          checked={purgeAppsChecklist[appKey]}
                          onChange={(e) => setPurgeAppsChecklist(prev => ({ ...prev, [appKey]: e.target.checked }))}
                          className="accent-rose-500 cursor-pointer w-4 h-4"
                        />
                        <span className="text-slate-350 group-hover:text-slate-100 font-semibold capitalize">{appKey}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* One Click Enhancers */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-3`}>
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Windows Gaming Enhancers</span>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={forceValorantPriority} className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                    <Cpu className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-slate-300 text-xs block uppercase">High Priority</span>
                  </button>

                  <button onClick={toggleGameMode} className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-slate-300 text-xs block uppercase truncate max-w-full">{gameModeActive ? 'MODE ON ✓' : 'GAME MODE'}</span>
                  </button>

                  <button onClick={togglePowerPlan} className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-slate-300 text-xs block uppercase truncate max-w-full">{powerPlanMode === 'high' ? 'MAX PERF ✓' : 'POWER PLAN'}</span>
                  </button>
                </div>
              </div>

              {/* Storage & Shader caches cleaners */}
              <div className={`p-4 rounded-lg border ${cardInner} space-y-4`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Cache Scrubbers</span>
                  <button onClick={scanValorantCaches} disabled={scanningVal || cleaningVal} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer disabled:opacity-50">
                    {scanningVal ? 'SCANNING...' : 'SCAN FOLDERS'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`${deepCard} p-4 rounded-lg border flex flex-col justify-between`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300 text-xs truncate">Game Logs</span>
                      <span className="text-indigo-400 font-bold text-xs">{valorantLogsSize}</span>
                    </div>
                    <button onClick={clearValorantLogs} disabled={cleaningVal || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-2 rounded-lg mt-3 transition text-xs font-bold cursor-pointer disabled:opacity-50">Clear Logs</button>
                  </div>

                  <div className={`${deepCard} p-4 rounded-lg border flex flex-col justify-between`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300 text-xs truncate">DirectX Cache</span>
                      <span className="text-indigo-400 font-bold text-xs">{shaderCacheSize}</span>
                    </div>
                    <button onClick={cleanAllShaderCaches} disabled={cleaningVal || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-2 rounded-lg mt-3 transition text-xs font-bold cursor-pointer disabled:opacity-50">Purge Shaders</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 7: DRIVERS & UPDATE VERIFIER */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-blue-500/10 pb-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold tracking-wide text-blue-400 uppercase">7. Drivers & Update Verifier</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-lg border ${cardInner} space-y-3`}>
                <div className="text-xs text-slate-300 font-bold border-b border-white/5 pb-2 flex justify-between items-center">
                  <span>Display Driver Uninstaller (DDU) Advice</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">RECOMMENDED</span>
                </div>
                <p className={`text-xs ${textS} leading-relaxed`}>
                  If you experience sudden FPS drops or graphics-related micro-stutters in Valorant, a clean GPU driver reinstall using DDU is highly recommended. DDU completely removes leftover registry settings, folders, and conflict drivers that standard Nvidia/AMD uninstallers miss.
                </p>
                <div className={`p-3 rounded-lg border ${deepCard} space-y-2`}>
                  <div className="font-bold text-slate-200 text-xs uppercase">DDU Standard Protocol:</div>
                  <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400 leading-relaxed font-sans">
                    <li>Download the latest DDU executable and your target stable GPU driver package.</li>
                    <li>Reboot Windows into <strong>Safe Mode</strong> (prevents active GPU drivers from blocking removal).</li>
                    <li>Launch DDU, select device type "GPU", and click <strong>"Clean and restart"</strong>.</li>
                    <li>After reboot, install your downloaded driver package with network disconnected to prevent Windows from auto-installing generic drivers.</li>
                  </ol>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${cardInner} space-y-3`}>
                <div className="text-xs text-slate-300 font-bold border-b border-white/5 pb-2">Stable Driver Recommendations (Valorant V10)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-lg border ${deepCard} space-y-2`}>
                    <div className="font-bold text-emerald-400 text-xs">NVIDIA GEFORCE</div>
                    <p className={`text-xs ${textS} leading-relaxed`}>
                      <strong>v560.94</strong> or <strong>v556.12</strong> are highly rated for frame timing consistency and low input latency in tactical shooters. Avoid drivers with open DPC latency issues.
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${deepCard} space-y-2`}>
                    <div className="font-bold text-rose-400 text-xs">AMD RADEON</div>
                    <p className={`text-xs ${textS} leading-relaxed`}>
                      <strong>Adrenalin 24.5.1</strong> is currently verified as extremely stable for DX11/DX12 shader caching. Clean cache folder after driver updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar HUD & Log Streams */}
        <div className="space-y-5 lg:h-[calc(100vh-140px)] lg:sticky lg:top-4 flex flex-col justify-start">
          
          {/* Optimization Stats HUD */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-3`}>
            <h3 className="text-xs font-bold tracking-wider text-blue-400 uppercase border-b border-blue-500/10 pb-2">
              Live HUD Telemetry
            </h3>
            <div className="text-xs space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Game Mode Status</span>
                <span className={gameModeActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{gameModeActive ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">OS Power Profile</span>
                <span className="text-blue-400 font-bold capitalize">{powerPlanMode} Plan</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-medium">Auto-Boost Core</span>
                <span className="text-emerald-400 font-bold">{autoBoostActive ? 'ACTIVE' : 'STANDBY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Active Game Thread</span>
                <span className={valorantRunning ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{valorantRunning ? 'ACTIVE' : 'NONE'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Logs Feed console */}
          <div className={`${deepCard} p-4 rounded-xl border flex flex-col flex-1 min-h-[360px] lg:h-[450px]`}>
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-widest border-b border-blue-500/5 pb-2 mb-2 shrink-0">BOOST EVENT FEED</span>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 text-slate-400 select-text font-mono text-xs">
              {valorantLogs.length === 0 ? (
                <div className="italic text-slate-500 text-xs">Waiting for Valorant boost events...</div>
              ) : (
                valorantLogs.map((l, i) => (
                  <div key={i} className="leading-5 border-l-2 border-blue-500/10 pl-2">{l}</div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
