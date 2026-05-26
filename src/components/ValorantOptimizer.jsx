import React from 'react';
import { Cpu, Settings, Zap, Trash2, Monitor } from 'lucide-react';

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
  nicOffloadsDisabled, toggleNicOffloads,
  hpetDisabled, toggleHpet,
  islcActive, setIslcActive,
  cleanAllShaderCaches,
  applyOptimizationProfile,
  gsyncDisabled, toggleGsync,
  freesyncEnabled, toggleFreesync
}) {
  // Sub-tab selection state inside Tweak Hub
  const [optSubTab, setOptSubTab] = React.useState('graphics');

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
    <div className="space-y-4 outline-none animate-in fade-in duration-300">
      
      {/* 1. Page Header */}
      <header className={`flex justify-between items-center border-b ${sectionBorder} pb-3`}>
        <div>
          <h1 className={`text-lg font-bold tracking-widest font-mono ${textH}`}>VALORANT ENGINE BOOSTER</h1>
          <p className={`text-[11px] ${activeStyle.textAccent} font-mono mt-0.5`}>Optimize system configurations and purge junk caches to stabilize FPS</p>
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
              className={`border text-[10px] px-2.5 py-1.5 rounded cursor-pointer transition ${simBtn}`}
            >
              {valorantRunning ? 'Simulate Exit' : 'Simulate Launch'}
            </button>
          )}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${valorantRunning ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse' : `${pillInactive}`}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${valorantRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-bold">{valorantRunning ? 'BOOST ACTIVE' : 'VALORANT NOT DETECTED'}</span>
          </div>
        </div>
      </header>

      {/* 2. Consolidated User Mode Alert */}
      {!isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-lg flex items-center gap-2.5 font-mono text-[11px] leading-relaxed">
          <span>⚠️</span>
          <span><strong>Running in User Mode:</strong> Elevated Administrator rights are recommended. Without them, advanced registry tweaks, CPU priorities, and background service controls will fail to apply.</span>
        </div>
      )}

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Side: Controls & Tweaks Center */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Row A: Daemons & Vanguard Compliance HUD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Unified Daemon Controls */}
            <div className={`p-4 rounded-xl border ${activeStyle.panelBg} space-y-3 flex flex-col justify-between`}>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block border-b border-white/5 pb-1">Daemon Controllers</span>
              
              <div className="flex justify-between items-center gap-2 text-[11px] font-mono">
                <div className="space-y-0.5">
                  <span className="text-slate-200 font-bold block">Background Auto-Boost</span>
                  <span className={`text-[10px] ${textS} font-sans block leading-none`}>Locks game priority and network parameters on launch.</span>
                </div>
                <button 
                  onClick={() => setAutoBoostActive(!autoBoostActive)}
                  className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${
                    autoBoostActive ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive
                  }`}
                >
                  {autoBoostActive ? 'ACTIVE' : 'STANDBY'}
                </button>
              </div>

              <div className="flex justify-between items-center gap-2 text-[11px] font-mono border-t border-white/5 pt-2">
                <div className="space-y-0.5">
                  <span className="text-slate-200 font-bold block">Standby Memory Cleaner (ISLC)</span>
                  <span className={`text-[10px] ${textS} font-sans block leading-none`}>Garbage collection of RAM standby lists every 30s.</span>
                </div>
                <button 
                  onClick={() => setIslcActive(!islcActive)}
                  className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${
                    islcActive ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]' : pillInactive
                  }`}
                >
                  {islcActive ? 'ACTIVE' : 'STANDBY'}
                </button>
              </div>
            </div>

            {/* Vanguard Compliance HUD */}
            <div className={`p-4 rounded-xl border ${activeStyle.panelBg} flex flex-col justify-between gap-2`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block">Vanguard Compliance</span>
                <button
                  onClick={checkVanguardHealth}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold transition cursor-pointer"
                >
                  Re-scan
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                {[
                  { label: 'Secure Boot', value: vanguardHealth.secureBoot === 'enabled', detail: 'Required on Windows 11' },
                  { label: 'TPM 2.0', value: vanguardHealth.tpm2 === 'active', detail: 'Platform Trust Module check' },
                  { label: 'CSM Bypass', value: vanguardHealth.csmDisabled === 'disabled', detail: 'CSM must be OFF' },
                  { label: 'VPN Status', value: !vanguardHealth.vpnActive, detail: 'Matchmaking proxy check' },
                  { label: 'AMD Driver', value: !vanguardHealth.gpuDriverWarning, detail: 'RX driver check' },
                  { label: 'Safe Drivers', value: (!vanguardHealth.flaggedDrivers || vanguardHealth.flaggedDrivers.length === 0), detail: 'Kernel driver check' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-1.5 rounded border ${cardInner} flex flex-col justify-between`} title={item.detail}>
                    <span className="text-slate-500 text-[8px] font-bold uppercase truncate">{item.label}</span>
                    <div className="flex items-center gap-1 mt-1 font-bold text-[9px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.value ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.3)]'}`} />
                      <span className={item.value ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.value ? 'OK' : 'WARN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row B: Optimization Profile Engine */}
          <div className={`p-4 rounded-xl border ${activeStyle.panelBg} space-y-3`}>
            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block border-b border-white/5 pb-1">Optimization Profile Engine</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              <button 
                onClick={() => applyOptimizationProfile('tournament')}
                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 p-2 rounded text-purple-400 text-center font-bold transition shadow-[0_0_6px_rgba(168,85,247,0.15)] cursor-pointer text-[11px]"
              >
                TOURNAMENT
              </button>
              <button 
                onClick={() => applyOptimizationProfile('balanced')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-2 rounded text-emerald-400 text-center font-bold transition cursor-pointer text-[11px]"
              >
                BALANCED
              </button>
              <button 
                onClick={() => applyOptimizationProfile('streaming')}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-2 rounded text-blue-400 text-center font-bold transition cursor-pointer text-[11px]"
              >
                STREAMING
              </button>
              <button 
                onClick={() => applyOptimizationProfile('revert')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded text-slate-300 text-center font-bold transition cursor-pointer text-[11px]"
              >
                DEFAULT
              </button>
            </div>
          </div>

          {/* Row C: The Tweak Hub (Horizontal sub-tabs layout) */}
          <div className={`p-4 rounded-xl border ${activeStyle.panelBg} space-y-4`}>
            
            {/* Sub-tab Switcher */}
            <div className="flex border-b border-white/5 pb-1.5 overflow-x-auto gap-2">
              {[
                { id: 'graphics', label: 'Graphics & GPU', icon: Monitor },
                { id: 'latency', label: 'Latency & Inputs', icon: Zap },
                { id: 'system', label: 'CPU & Services', icon: Cpu },
                { id: 'deep', label: 'Deep App Purger', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = optSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOptSubTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      active 
                        ? 'bg-blue-500/10 border-blue-500/35 text-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.15)]'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={12} className={active ? 'text-blue-400' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-tab content area */}
            <div className="mt-2 animate-in fade-in duration-200">
              
              {/* SUBTAB 1: GRAPHICS & GPU REGISTRY */}
              {optSubTab === 'graphics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  {/* Column 1: Graphics Settings */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Graphics Settings Tuner</span>
                    
                    {/* Exe Path */}
                    <div className={`p-2.5 rounded-lg border ${cardInner} flex flex-col gap-1.5`}>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 font-sans font-bold">VALORANT Path</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${valorantPathDetected ? 'bg-emerald-100/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-100/10 text-rose-400 border-rose-500/20'}`}>
                          {valorantPathDetected ? 'DETECTED' : 'NOT FOUND'}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 bg-slate-950/80 border border-white/5 p-1 rounded truncate select-all text-slate-400 text-[10px]" title={valorantPath}>
                          {valorantPath}
                        </code>
                        {isElectron && (
                          <button onClick={browseValorantPath} className="bg-blue-600 hover:bg-blue-500 text-white font-sans text-[10px] px-2 py-1 rounded transition cursor-pointer shrink-0 font-bold">BROWSE</button>
                        )}
                      </div>
                    </div>

                    {valorantConfigs.length === 0 ? (
                      <div className="text-slate-500 italic font-sans py-2">No configs detected. Run game once.</div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Settings Profile</label>
                          <select
                            value={selectedConfig ? selectedConfig.filePath : ''}
                            onChange={(e) => {
                              const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                              if (cfg) setSelectedConfig(cfg);
                            }}
                            className="bg-[#05080e] border border-white/10 rounded-lg p-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 transition text-[11px] cursor-pointer"
                          >
                            {valorantConfigs.map((cfg) => (
                              <option key={cfg.filePath} value={cfg.filePath}>
                                {cfg.accountId.slice(0, 18)}... (Windows)
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedConfig && (
                          <div className={`space-y-3 p-3 rounded-lg border ${cardInner}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 font-sans font-bold">Enable VSync</span>
                              <button
                                onClick={() => saveValorantConfig({ vsync: !selectedConfig.vsync })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${selectedConfig.vsync ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'}`}
                              >
                                {selectedConfig.vsync ? 'ON (Adds Lag)' : 'OFF (Optimal)'}
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-300 font-sans font-bold">Resolution Scale</span>
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

                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Textures</span>
                                <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/5 rounded p-1 text-[10px] text-slate-300 cursor-pointer">
                                  <option value="0">Low</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Shadows</span>
                                <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/5 rounded p-1 text-[10px] text-slate-300 cursor-pointer">
                                  <option value="0">Low (Off)</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Effects</span>
                                <select value={selectedConfig.effectsQuality} onChange={(e) => saveValorantConfig({ effectsQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/5 rounded p-1 text-[10px] text-slate-300 cursor-pointer">
                                  <option value="0">Low</option> <option value="1">Medium</option> <option value="2">High</option> <option value="3">Ultra</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Anti-Aliasing</span>
                                <select value={selectedConfig.antiAliasingQuality} onChange={(e) => saveValorantConfig({ antiAliasingQuality: parseInt(e.target.value, 10) })} className="bg-[#05080e] border border-white/5 rounded p-1 text-[10px] text-slate-300 cursor-pointer">
                                  <option value="0">Off</option> <option value="1">MSAA 2x</option> <option value="2">MSAA 4x</option> <option value="3">MSAA 8x</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 2: GPU Registry */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">GPU Registry Boosts</span>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center gap-3 ${cardInner} p-2.5 rounded-lg border`}>
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block text-[11px]">Hardware Scheduling (HAGS)</span>
                          <p className={`text-[9px] ${textS} font-sans leading-none`}>Enables OS GPU-accelerated scheduling controls.</p>
                        </div>
                        <button onClick={() => toggleHags(!registryStates.hagsEnabled)} className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${registryStates.hagsEnabled ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.hagsEnabled ? 'ENABLED' : 'DISABLED'}</button>
                      </div>

                      <div className={`flex justify-between items-center gap-3 ${cardInner} p-2.5 rounded-lg border`}>
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block text-[11px]">Disable Windows DVR</span>
                          <p className={`text-[9px] ${textS} font-sans leading-none`}>Turns off Game Bar telemetry overlays.</p>
                        </div>
                        <button onClick={() => toggleGameDvr(!registryStates.gameDvrDisabled)} className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${registryStates.gameDvrDisabled ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.gameDvrDisabled ? 'DISABLED' : 'ENABLED'}</button>
                      </div>

                      <div className={`flex justify-between items-center gap-3 ${cardInner} p-2.5 rounded-lg border`}>
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block text-[11px]">Multimedia Priority</span>
                          <p className={`text-[9px] ${textS} font-sans leading-none`}>Locks Multimedia Scheduler thread values to High.</p>
                        </div>
                        <button onClick={() => togglePriorityOptimized(!registryStates.priorityOptimized)} className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${registryStates.priorityOptimized ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{registryStates.priorityOptimized ? 'OPTIMIZED' : 'DEFAULT'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: LATENCY & INPUTS */}
              {optSubTab === 'latency' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  
                  {/* Monitor Sync controls */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Monitor Synchronization & Cap</span>
                    
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-3`}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-200 font-bold block">Disable G-Sync</span>
                          <p className={`text-[9px] ${textS} font-sans leading-none`}>Prevents frame timing overhead locks.</p>
                        </div>
                        <button onClick={() => toggleGsync(!gsyncDisabled)} className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${gsyncDisabled ? 'bg-rose-500/10 border-rose-500/35 text-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.15)]' : pillInactive}`}>{gsyncDisabled ? 'OFF' : 'ON'}</button>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-200 font-bold block">Adaptive Sync / FRTC</span>
                          <p className={`text-[9px] ${textS} font-sans leading-none`}>Limits display buffer spikes (AMD/NV).</p>
                        </div>
                        <button onClick={() => toggleFreesync(!freesyncEnabled)} className={`px-2 py-1 rounded font-bold border transition text-[10px] shrink-0 cursor-pointer ${freesyncEnabled ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]' : pillInactive}`}>{freesyncEnabled ? 'ACTIVE' : 'OFF'}</button>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Monitor Refresh Rate</span>
                        <select
                          value={monitorRefreshRate}
                          onChange={(e) => applyFrameLimitSettings(frameLimitMode, parseInt(e.target.value, 10))}
                          className="bg-[#05080e] border border-white/10 rounded p-1 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <option value="60">60 Hz</option><option value="120">120 Hz</option><option value="144">144 Hz</option><option value="165">165 Hz</option><option value="240">240 Hz</option><option value="280">280 Hz</option><option value="360">360 Hz</option><option value="540">540 Hz</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
                        <button onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)} className={`p-1.5 rounded border transition text-[10px] cursor-pointer flex flex-col items-center justify-center font-bold ${frameLimitMode === 'uncapped' ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' : pillInactive}`}>
                          <span>UNCAPPED</span>
                        </button>
                        <button onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)} className={`p-1.5 rounded border transition text-[10px] cursor-pointer flex flex-col items-center justify-center font-bold ${frameLimitMode === 'vrr' ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400' : pillInactive}`}>
                          <span>VRR CAP ({monitorRefreshRate - 3})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Core input tweaks */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Input & Core Latency Registry</span>
                    
                    <div className="space-y-2">
                      {[
                        { label: 'Disable Mouse Acceleration', active: latencyTweaks.disableMouseAccel, onClick: () => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel), desc: 'Sets 1-to-1 raw input ratios.' },
                        { label: 'Disable USB Selective Suspend', active: latencyTweaks.disableUsbSuspend, onClick: () => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend), desc: 'Halts USB root power downs.' },
                        { label: 'Disable CPU Core Parking', active: latencyTweaks.disableCoreParking, onClick: () => toggleLatencyTweak('disableCoreParking', !latencyTweaks.disableCoreParking), desc: 'Keeps physical cores awake.' },
                        { label: 'Disable Windows Dynamic Tick', active: latencyTweaks.disableDynamicTick, onClick: () => toggleLatencyTweak('disableDynamicTick', !latencyTweaks.disableDynamicTick), desc: 'Keeps scheduler timer ticks constant.' },
                        { label: 'Force Exclusive Fullscreen', active: latencyTweaks.disableFullscreenOpt, onClick: () => toggleLatencyTweak('disableFullscreenOpt', !latencyTweaks.disableFullscreenOpt), desc: 'Bypasses the DWM overlay pipeline.' },
                        { label: 'Force MSI Interrupt Mode', active: msiEnabled, onClick: () => toggleMsiMode(!msiEnabled), desc: 'Enables Message Signaled Interrupts.' }
                      ].map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-center gap-3 ${cardInner} p-2 rounded-lg border`}>
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-bold block text-[11px]">{item.label}</span>
                            <p className={`text-[9px] ${textS} font-sans leading-none`}>{item.desc}</p>
                          </div>
                          <button onClick={item.onClick} className={`px-2 py-0.75 rounded font-bold border transition text-[9px] shrink-0 cursor-pointer ${item.active ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]' : pillInactive}`}>{item.active ? 'TWEAKED' : 'DEFAULT'}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: CPU & ENVIRONMENT SERVICES */}
              {optSubTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
                  
                  {/* Column 1: Process Affinities & Power */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">CPU Scheduling</span>
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-3`}>
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={hyperthreadingDisabled} onChange={(e) => setHyperthreadingDisabled(e.target.checked)} className="mt-0.5 accent-cyan-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-cyan-400 font-bold block">Disable Hyperthreading</span>
                          <span className={`text-[9px] ${textM} font-sans block leading-tight`}>Binds game process only to physical CPU cores.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer group border-t border-white/5 pt-2">
                        <input type="checkbox" checked={backgroundAppsToEcores} onChange={(e) => setBackgroundAppsToEcores(e.target.checked)} className="mt-0.5 accent-cyan-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-cyan-400 font-bold block">Restrain Background Apps</span>
                          <span className={`text-[9px] ${textM} font-sans block leading-tight`}>Pushes Discord and browsers onto efficiency cores.</span>
                        </div>
                      </label>

                      <div className="border-t border-white/5 pt-2 text-[10px] space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-300">Auto Power Plan</span>
                          <span className="text-emerald-400">ACTIVE</span>
                        </div>
                        <p className={`text-[9px] ${textS} font-sans leading-relaxed`}>Switches scheme to High Performance on launch.</p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Timers & DNS */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Timers & DNS</span>
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-3`}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block">System Clock Lock</span>
                          <span className={`text-[9px] ${textS} font-sans block`}>Locks tick resolution to 0.5ms.</span>
                        </div>
                        <button onClick={toggleTimerResolution} className={`px-2 py-0.75 rounded font-bold border transition text-[9px] shrink-0 cursor-pointer ${timerResActive ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400' : pillInactive}`}>{timerResActive ? '0.5ms LOCK' : 'DEFAULT'}</button>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block">Disable HPET</span>
                          <span className={`text-[9px] ${textS} font-sans block`}>Enforces CPU native clock (TSC).</span>
                        </div>
                        <button onClick={() => toggleHpet(!hpetDisabled)} className={`px-2 py-0.75 rounded font-bold border transition text-[9px] shrink-0 cursor-pointer ${hpetDisabled ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' : pillInactive}`}>{hpetDisabled ? 'DISABLED' : 'DEFAULT'}</button>
                      </div>

                      <div className="space-y-1.5 border-t border-white/5 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">DNS Switcher</span>
                        <div className="grid grid-cols-3 gap-1">
                          {['cloudflare', 'google', 'default'].map(d => (
                            <button
                              key={d}
                              onClick={() => changeDns(d)}
                              className={`py-1 rounded border font-bold text-center transition cursor-pointer text-[8px] ${
                                activeDns === d ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400' : pillInactive
                              }`}
                            >
                              {d === 'cloudflare' ? 'Cloudflare' : d === 'google' ? 'Google' : 'Reset DHCP'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Windows Services Grid */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Windows Services Toggles</span>
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-2`}>
                      {[
                        { label: 'VBS/Core Integrity', active: !vbsEnabled, onClick: () => toggleVbs(!vbsEnabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'Net Checksum Offloads', active: nicOffloadsDisabled, onClick: () => toggleNicOffloads(!nicOffloadsDisabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: "Nagle's TCP Algo", active: nagleDisabled, onClick: () => toggleNagle(!nagleDisabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'Memory Compression', active: !memCompressionEnabled, onClick: () => toggleMemCompression(!memCompressionEnabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'NIC Power Savings', active: nicPowerSavingDisabled, onClick: () => toggleNicPower(!nicPowerSavingDisabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'Global Fullscreen Opt', active: globalFsoDisabled, onClick: () => toggleGlobalFso(!globalFsoDisabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'Power Throttling Tweak', active: powerThrottlingDisabled, onClick: () => togglePowerThrottling(!powerThrottlingDisabled), actL: 'DISABLED', inactL: 'ENABLED' },
                        { label: 'SysMain Service', active: !bgServices.SysMain, onClick: () => toggleBgService('SysMain', !bgServices.SysMain), actL: 'DISABLED', inactL: 'RUNNING' },
                        { label: 'Print Spooler Service', active: !bgServices.Spooler, onClick: () => toggleBgService('Spooler', !bgServices.Spooler), actL: 'DISABLED', inactL: 'RUNNING' },
                        { label: 'Connected Telemetry', active: !bgServices.DiagTrack, onClick: () => toggleBgService('DiagTrack', !bgServices.DiagTrack), actL: 'DISABLED', inactL: 'RUNNING' },
                        { label: 'Xbox Live Auth Manager', active: !bgServices.XblAuthManager, onClick: () => toggleBgService('XblAuthManager', !bgServices.XblAuthManager), actL: 'DISABLED', inactL: 'RUNNING' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300 font-bold block truncate max-w-[120px]">{item.label}</span>
                          <button onClick={item.onClick} className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition ${item.active ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' : pillInactive}`}>{item.active ? item.actL : item.inactL}</button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SUBTAB 4: DEEP PERFORMANCE OPTIONS */}
              {optSubTab === 'deep' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  {/* System services checklist */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">System Services Tweaks</span>
                    
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-3.5`}>
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={optimizationOptions.pauseUpdates} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, pauseUpdates: e.target.checked }))} className="mt-0.5 accent-rose-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-rose-400 font-bold block">Suspend Windows Update</span>
                          <span className="text-[10px] text-slate-500 font-sans block leading-tight">Pauses background update checks (`wuauserv`) to free up queues. (Admin)</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer group border-t border-white/5 pt-2">
                        <input type="checkbox" checked={optimizationOptions.disableDefender} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, disableDefender: e.target.checked }))} className="mt-0.5 accent-rose-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-rose-400 font-bold block">Tweak Windows Defender</span>
                          <span className="text-[10px] text-slate-500 font-sans block leading-tight">Excludes game directories and limits real-time scans. (Admin)</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer group border-t border-white/5 pt-2">
                        <input type="checkbox" checked={optimizationOptions.clearStandby} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, clearStandby: e.target.checked }))} className="mt-0.5 accent-rose-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-rose-400 font-bold block">Flush RAM Standby Lists</span>
                          <span className="text-[10px] text-slate-500 font-sans block leading-tight">Empties cached pages to preserve game memory heaps.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Purge Apps Checklist */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 font-bold block border-b border-white/5 pb-1">Background Processes Purge List</span>
                    
                    <div className={`p-3 rounded-lg border ${cardInner} space-y-3`}>
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={optimizationOptions.purgeApps} onChange={(e) => setOptimizationOptions(prev => ({ ...prev, purgeApps: e.target.checked }))} className="mt-0.5 accent-rose-500 cursor-pointer" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 group-hover:text-rose-400 font-bold block">Enable Background Process Purging</span>
                          <span className="text-[10px] text-slate-500 font-sans block leading-tight">Force-closes the checked apps below when Valorant starts.</span>
                        </div>
                      </label>

                      {optimizationOptions.purgeApps && (
                        <div className="grid grid-cols-2 gap-2 pl-5 pt-2 border-l border-rose-500/10 text-[11px]">
                          {Object.keys(purgeAppsChecklist).map(appKey => (
                            <label key={appKey} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={purgeAppsChecklist[appKey]}
                                onChange={(e) => setPurgeAppsChecklist(prev => ({ ...prev, [appKey]: e.target.checked }))}
                                className="accent-rose-500 cursor-pointer"
                              />
                              <span className="text-slate-300 group-hover:text-slate-100 capitalize">{appKey}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Row D: Windows Gaming Enhancers & Storage Scrubbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* One Click FPS Boosters */}
            <div className={`p-4 rounded-xl border ${activeStyle.panelBg} space-y-3 flex flex-col justify-between`}>
              <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block border-b border-white/5 pb-1">Windows Gaming Enhancers</span>
              <div className="grid grid-cols-3 gap-1.5">
                
                {/* CPU Priority */}
                <button onClick={forceValorantPriority} className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-slate-300 text-[9px] block uppercase">High Priority</span>
                </button>

                {/* Game Mode */}
                <button onClick={toggleGameMode} className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-slate-300 text-[9px] block uppercase">{gameModeActive ? 'MODE ON ✓' : 'GAME MODE'}</span>
                </button>

                {/* Power Plan */}
                <button onClick={togglePowerPlan} className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cyan-500/30 ${deepCard}`}>
                  <Settings className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-slate-300 text-[9px] block uppercase truncate max-w-full">{powerPlanMode === 'high' ? 'MAX PERF ✓' : 'POWER PLAN'}</span>
                </button>

              </div>
            </div>

            {/* Storage & Cache Cleaners */}
            <div className={`p-4 rounded-xl border ${activeStyle.panelBg} space-y-3 flex flex-col justify-between`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block">Cache Scrubbers</span>
                <button onClick={scanValorantCaches} disabled={scanningVal || cleaningVal} className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono font-bold cursor-pointer disabled:opacity-50">
                  {scanningVal ? 'SCANNING...' : 'SCAN FOLDERS'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                {/* Clean logs */}
                <div className={`${deepCard} p-2 rounded-lg border flex flex-col justify-between`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300 text-[9px]">Game Logs</span>
                    <span className="text-indigo-400 font-bold text-[8px]">{valorantLogsSize}</span>
                  </div>
                  <button onClick={clearValorantLogs} disabled={cleaningVal || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1 rounded mt-2 transition text-[9px] font-bold cursor-pointer disabled:opacity-50">Clear Logs</button>
                </div>

                {/* Clean shaders */}
                <div className={`${deepCard} p-2 rounded-lg border flex flex-col justify-between`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300 text-[9px]">DirectX Cache</span>
                    <span className="text-indigo-400 font-bold text-[8px]">{shaderCacheSize}</span>
                  </div>
                  <button onClick={cleanAllShaderCaches} disabled={cleaningVal || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-1 rounded mt-2 transition text-[9px] font-bold cursor-pointer disabled:opacity-50">Purge Shaders</button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Sidebar HUD & Log Streams */}
        <div className="space-y-5 flex flex-col justify-between">
          
          {/* Optimization Stats HUD */}
          <div className={`p-5 rounded-xl border ${activeStyle.panelBg} space-y-3`}>
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase border-b border-blue-500/10 pb-1.5">
              Live HUD Telemetry
            </h3>
            <div className="font-mono text-[11px] space-y-2.5">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Game Mode Status</span>
                <span className={gameModeActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{gameModeActive ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">OS Power Profile</span>
                <span className="text-blue-400 font-bold capitalize">{powerPlanMode} Plan</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Auto-Boost Core</span>
                <span className="text-emerald-400 font-bold">STANDBY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Game Thread</span>
                <span className={valorantRunning ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{valorantRunning ? 'ACTIVE' : 'NONE'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Logs Feed console */}
          <div className={`${deepCard} p-4 rounded-xl border h-[420px] font-mono text-[11px] flex flex-col flex-1 mt-2`}>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest border-b border-blue-500/5 pb-1.5 mb-2 shrink-0">BOOST EVENT FEED</span>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 text-slate-400 select-text">
              {valorantLogs.length === 0 ? (
                <div className="italic text-slate-600 text-xs">Waiting for Valorant boost events...</div>
              ) : (
                valorantLogs.map((l, i) => (
                  <div key={i} className="leading-4 border-l-2 border-blue-500/10 pl-2 text-[10px]">{l}</div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
