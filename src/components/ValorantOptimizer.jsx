import React, { useState, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';

// Inline spinner
function Spinner({ className = 'w-3 h-3' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export default function ValorantOptimizer() {
  const {
    isElectron,
    valorantPath,
    valorantPathDetected,
    browseValorantPath,
    valorantRunning,
    setValorantRunning,
    launchValorant,
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
    latencyTweaks,
    toggleLatencyTweak,
    monitorRefreshRate,
    frameLimitMode,
    applyFrameLimitSettings,
    vanguardHealth,
    bgServices,
    timerResActive,
    checkVanguardHealth,
    toggleBgService,
    toggleTimerResolution,
    nicPowerSavingDisabled,
    toggleNicPower,
    powerThrottlingDisabled,
    togglePowerThrottling,
    cleanAllShaderCaches,
    applyOptimizationProfile,
    gsyncDisabled,
    toggleGsync,
    freesyncEnabled,
    toggleFreesync,
    gpuInfo,
    persistentPriorityEnabled,
    togglePersistentPriority,
    vbsStatus,
    vbsRebootRequired,
    toggleVbs,
    hpetDisabled,
    hpetRebootRequired,
    toggleHpet,
    amdOptimizations,
    toggleAmdMpo,
    toggleAmdLegacyDx,
    toggleAmdShaderCache,
    gpuDriverProfile,
    applyGpuDriverProfile,
    hardwareInfo,
    toggleLegacyRebar,
    isProcessing,
    executeOperation
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Scan feedback state
  const [lastScannedAt, setLastScannedAt] = useState(null);

  // Resolution scale tooltip
  const [showResTooltip, setShowResTooltip] = useState(false);

  // Custom refresh rate
  const [customRateValue, setCustomRateValue] = useState('');
  const [showCustomRateInput, setShowCustomRateInput] = useState(false);
  const customRateInputRef = useRef(null);

  // Per-action loading tracking
  const [processingActionId, setProcessingActionId] = useState(null);
  const [justDoneActionId, setJustDoneActionId] = useState(null);

  // Wraps executeOperation with per-action loading state + success flash
  const runAction = async (actionId, label, fn) => {
    if (processingActionId) return; // already running
    setProcessingActionId(actionId);
    try {
      await executeOperation(label, fn);
      setJustDoneActionId(actionId);
      setTimeout(() => setJustDoneActionId(prev => prev === actionId ? null : prev), 1200);
    } finally {
      setProcessingActionId(null);
    }
  };

  // Track which categories are collapsed
  const [collapsedCategories, setCollapsedCategories] = useState({
    'OS & Registry': false,
    'GPU & Monitor': false,
    'Caches & Cleaners': false,
    'Launch Policies': false
  });

  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Count active optimizations
  const optimizedCount = [
    registryStates.gameDvrDisabled === true,
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
  const totalOptimizations = 11;
  const optimizationPercentage = Math.round((optimizedCount / totalOptimizations) * 100);

  // Compile all optimization actions into 1 unified list
  const allActions = [
    // --- Registry & OS ---
    {
      id: 'gameDvr',
      name: 'Windows GameDVR Telemetry',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'medium',
      desc: 'Disables background game capture telemetry to prevent CPU frame time spikes.',
      status: registryStates.gameDvrDisabled ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: registryStates.gameDvrDisabled === true,
      actionType: 'toggle',
      onAction: () => toggleGameDvr(!registryStates.gameDvrDisabled),
      actionLabel: registryStates.gameDvrDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'mouseAccel',
      name: 'Disable Mouse Acceleration',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'low',
      desc: 'Eliminates Windows pointer precision enhancement for direct 1:1 mouse input.',
      status: latencyTweaks.disableMouseAccel ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: latencyTweaks.disableMouseAccel === true,
      actionType: 'toggle',
      onAction: () => toggleLatencyTweak('disableMouseAccel', !latencyTweaks.disableMouseAccel),
      actionLabel: latencyTweaks.disableMouseAccel ? 'Restore' : 'Optimize'
    },
    {
      id: 'usbSuspend',
      name: 'Disable USB Selective Suspend',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'low',
      desc: 'Prevents USB controllers from entering low-power sleep modes to stop peripheral latency.',
      status: latencyTweaks.disableUsbSuspend ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: latencyTweaks.disableUsbSuspend === true,
      actionType: 'toggle',
      onAction: () => toggleLatencyTweak('disableUsbSuspend', !latencyTweaks.disableUsbSuspend),
      actionLabel: latencyTweaks.disableUsbSuspend ? 'Restore' : 'Optimize'
    },
    {
      id: 'cpuPriority',
      name: 'Persistent High CPU Priority',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'high',
      desc: 'Instructs Windows thread scheduler to prioritize VALORANT game threads.',
      status: persistentPriorityEnabled ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: persistentPriorityEnabled === true,
      actionType: 'toggle',
      onAction: () => togglePersistentPriority(!persistentPriorityEnabled),
      actionLabel: persistentPriorityEnabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'timerResolution',
      name: 'System Clock Lock (0.5ms)',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'medium',
      desc: 'Forces system timer resolution to sub-millisecond 0.5ms mode to reduce micro-stutters.',
      status: timerResActive ? 'Optimized (0.5ms)' : 'Default (Windows Timer)',
      isOptimized: timerResActive === true,
      actionType: 'toggle',
      onAction: () => toggleTimerResolution(!timerResActive),
      actionLabel: timerResActive ? 'Restore' : 'Optimize'
    },
    {
      id: 'nicPower',
      name: 'NIC Power Savings Tweak',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'low',
      desc: 'Disables Energy Efficient Ethernet power scaling on your network card to stabilize ping.',
      status: nicPowerSavingDisabled ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: nicPowerSavingDisabled === true,
      actionType: 'toggle',
      onAction: () => toggleNicPower(!nicPowerSavingDisabled),
      actionLabel: nicPowerSavingDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'xboxLive',
      name: 'Xbox Live Background Services',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'low',
      desc: 'Disables Xbox Live Auth manager and telemetry daemon to free memory heap.',
      status: !bgServices.XblAuthManager ? 'Optimized (Stopped)' : 'Running',
      isOptimized: !bgServices.XblAuthManager,
      actionType: 'toggle',
      onAction: () => toggleBgService('XblAuthManager', !bgServices.XblAuthManager),
      actionLabel: !bgServices.XblAuthManager ? 'Restore' : 'Optimize'
    },
    {
      id: 'powerThrottling',
      name: 'Power Throttling Policy',
      category: 'OS & Registry',
      tier: 'aggressive',
      impact: 'high',
      desc: 'Disables Windows CPU core power gating policies to ensure stable maximum clocks.',
      status: powerThrottlingDisabled ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: powerThrottlingDisabled === true,
      actionType: 'toggle',
      onAction: () => togglePowerThrottling(!powerThrottlingDisabled),
      actionLabel: powerThrottlingDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'hpet',
      name: 'Disable High Precision Event Timer (HPET)',
      category: 'OS & Registry',
      tier: 'aggressive',
      impact: 'high',
      desc: 'Disables HPET platform clock to reduce Ryzen/Intel frame pacing overhead (requires reboot).',
      status: hpetDisabled ? 'Optimized' : 'Active',
      isOptimized: hpetDisabled === true,
      actionType: 'toggle',
      onAction: () => {
        const action = hpetDisabled ? 'enable' : 'disable';
        if (window.confirm(`Warning: This modifies Windows Boot Configuration Data to ${action} HPET. A reboot will be required. Proceed?`)) {
          toggleHpet(!hpetDisabled);
        }
      },
      actionLabel: hpetDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'vbs',
      name: 'Virtualization-Based Security (VBS)',
      category: 'OS & Registry',
      tier: 'aggressive',
      impact: 'high',
      desc: 'Disables hypervisor virtualization security features (Memory Integrity) to regain up to 20% FPS (requires reboot).',
      status: (!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity) ? 'Optimized (Disabled)' : 'Active (VBS / Core Isolation On)',
      isOptimized: (!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity),
      actionType: 'toggle',
      onAction: () => {
        const targetState = (vbsStatus.vbsEnabled || vbsStatus.memoryIntegrity);
        const actionStr = targetState ? 'disable' : 'enable';
        if (window.confirm(`Disabling Virtualization-Based Security (VBS) lowers protection to improve game frame rates. Change requires reboot. Proceed?`)) {
          toggleVbs(!targetState);
        }
      },
      actionLabel: (!vbsStatus.vbsEnabled && !vbsStatus.memoryIntegrity) ? 'Restore' : 'Optimize'
    },

    // --- GPU & Monitor Sync ---
    {
      id: 'gsync',
      name: 'NVIDIA G-Sync Buffer Bypass',
      category: 'GPU & Monitor',
      tier: 'safe',
      impact: 'medium',
      desc: 'Skips variable frame buffer alignment timing checks to minimize click latency.',
      status: gsyncDisabled ? 'Optimized (Bypassed)' : 'Active',
      isOptimized: gsyncDisabled === true,
      showIf: gpuInfo && gpuInfo.vendor === 'nvidia',
      actionType: 'toggle',
      onAction: () => toggleGsync(!gsyncDisabled),
      actionLabel: gsyncDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'freesync',
      name: 'AMD FreeSync Tweak',
      category: 'GPU & Monitor',
      tier: 'safe',
      impact: 'medium',
      desc: 'Configures adaptive sync keys. Disable for maximum frames, or enable to stop screen tearing.',
      status: freesyncEnabled ? 'Enabled' : 'Disabled',
      isOptimized: freesyncEnabled === true,
      showIf: gpuInfo && gpuInfo.vendor === 'amd',
      actionType: 'toggle',
      onAction: () => toggleFreesync(!freesyncEnabled),
      actionLabel: freesyncEnabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'mpo',
      name: 'AMD Multi-Plane Overlay (MPO)',
      category: 'GPU & Monitor',
      tier: 'safe',
      impact: 'high',
      desc: 'Prevents screen flickering and random frame time spikes on RX 5000/6000+ series GPUs.',
      status: amdOptimizations.mpoDisabled ? 'Optimized (MPO Off)' : 'Active (MPO On)',
      isOptimized: amdOptimizations.mpoDisabled === true,
      showIf: gpuInfo && gpuInfo.vendor === 'amd',
      actionType: 'toggle',
      onAction: () => toggleAmdMpo(!amdOptimizations.mpoDisabled),
      actionLabel: amdOptimizations.mpoDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'amdShaderCache',
      name: 'AMD Shader Cache Forced Always-On',
      category: 'GPU & Monitor',
      tier: 'safe',
      impact: 'medium',
      desc: 'Eliminates recompilation hitches in games by keeping shader caches persistent across sessions.',
      status: amdOptimizations.shaderCacheAlwaysOn ? 'Optimized (Always On)' : 'Default (AMD Driver Managed)',
      isOptimized: amdOptimizations.shaderCacheAlwaysOn === true,
      showIf: gpuInfo && gpuInfo.vendor === 'amd',
      actionType: 'toggle',
      onAction: () => toggleAmdShaderCache(!amdOptimizations.shaderCacheAlwaysOn),
      actionLabel: amdOptimizations.shaderCacheAlwaysOn ? 'Restore' : 'Optimize'
    },
    {
      id: 'amdLegacyDx',
      name: 'AMD Legacy DX11 Driver Pipeline',
      category: 'GPU & Monitor',
      tier: 'aggressive',
      impact: 'high',
      desc: 'Forces the legacy DX11 driver pipeline (amdxx64.dll → atidxx64.dll) to bypass modern DXNavi stutters.',
      status: amdOptimizations.legacyDxPath ? 'Optimized (Legacy DX11)' : 'Modern (DXNavi active)',
      isOptimized: amdOptimizations.legacyDxPath === true,
      showIf: gpuInfo && gpuInfo.vendor === 'amd',
      actionType: 'toggle',
      onAction: () => {
        const action = amdOptimizations.legacyDxPath ? 'restoring modern' : 'forcing legacy';
        if (window.confirm(`Warning: You are ${action} the AMD DX11 driver path. This affects all DX11 games on your system. Proceed?`)) {
          toggleAmdLegacyDx(!amdOptimizations.legacyDxPath);
        }
      },
      actionLabel: amdOptimizations.legacyDxPath ? 'Restore' : 'Optimize'
    },
    {
      id: 'legacyRebar',
      name: 'Force ReBAR on Legacy AMD GPUs',
      category: 'GPU & Monitor',
      tier: 'experimental',
      impact: 'medium',
      desc: 'Injects registry keys to force enable ReBAR on unsupported GPUs like RX 580/570.',
      status: hardwareInfo.legacyRebarForced ? 'Forced On' : 'Default (Off)',
      isOptimized: hardwareInfo.legacyRebarForced === true,
      showIf: hardwareInfo.isLegacyAmdGpu,
      actionType: 'toggle',
      onAction: () => toggleLegacyRebar(!hardwareInfo.legacyRebarForced),
      actionLabel: hardwareInfo.legacyRebarForced ? 'Restore' : 'Optimize'
    },
    {
      id: 'gpuProfile',
      name: 'GPU Driver Tuning Profile',
      category: 'GPU & Monitor',
      tier: 'safe',
      impact: 'high',
      desc: 'Applies system-wide GPU driver optimizations (Max Performance power mode, low latency settings, threaded draw calls).',
      status: (gpuDriverProfile.powerMaxPerformance || gpuDriverProfile.antiLagEnabled) ? 'Optimized Profile Applied' : 'Default driver settings',
      isOptimized: (gpuDriverProfile.powerMaxPerformance || gpuDriverProfile.antiLagEnabled),
      showIf: gpuInfo && (gpuInfo.vendor === 'nvidia' || gpuInfo.vendor === 'amd'),
      actionType: 'multiple',
      options: [
        { label: 'Apply Performance', onClick: () => applyGpuDriverProfile('performance'), primary: true },
        { label: 'Restore Defaults', onClick: () => applyGpuDriverProfile('default'), primary: false }
      ]
    },

    // --- Caches & Cleaners ---
    {
      id: 'valCaches',
      name: 'VALORANT Telemetry & Log Purge',
      category: 'Caches & Cleaners',
      tier: 'safe',
      impact: 'low',
      desc: 'Deletes local client debug logs and telemetry dumps which degrade file search speed.',
      status: `Logs Size: ${valorantLogsSize}`,
      isOptimized: valorantLogsSize === '0.00 Bytes',
      actionType: 'action',
      onAction: clearValorantLogs,
      actionLabel: 'Purge Logs',
      disabled: cleaningLogs || valorantLogsSize === 'Click Scan' || valorantLogsSize === '0.00 Bytes'
    },
    {
      id: 'shaderCaches',
      name: 'DirectX Shader Cache Purge',
      category: 'Caches & Cleaners',
      tier: 'safe',
      impact: 'medium',
      desc: 'Wipes corrupt or bloated Windows DirectX compilation shaders to force fresh compilations.',
      status: `Shader Cache: ${shaderCacheSize}`,
      isOptimized: shaderCacheSize === '0.00 Bytes',
      actionType: 'action',
      onAction: cleanAllShaderCaches,
      actionLabel: 'Purge Shaders',
      disabled: cleaningShaders || shaderCacheSize === 'Click Scan' || shaderCacheSize === '0.00 Bytes'
    },

    // --- Gaming Launch policies ---
    {
      id: 'pauseUpdates',
      name: 'Suspend Windows Updates on Launch',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Blocks Windows Update installation process from firing while playing.',
      status: optimizationOptions.pauseUpdates ? 'Active (Will Suspend)' : 'Inactive',
      isOptimized: optimizationOptions.pauseUpdates === true,
      actionType: 'toggle',
      onAction: () => setOptimizationOptions(prev => ({ ...prev, pauseUpdates: !prev.pauseUpdates })),
      actionLabel: optimizationOptions.pauseUpdates ? 'Disable' : 'Enable'
    },
    {
      id: 'purgeApps',
      name: 'Background Process Purging',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Closes resource-heavy background tools (browsers, discord, game launchers) on match start.',
      status: optimizationOptions.purgeApps ? 'Active (Will Purge)' : 'Inactive',
      isOptimized: optimizationOptions.purgeApps === true,
      actionType: 'toggle',
      onAction: () => setOptimizationOptions(prev => ({ ...prev, purgeApps: !prev.purgeApps })),
      actionLabel: optimizationOptions.purgeApps ? 'Disable' : 'Enable'
    },
    {
      id: 'gameMode',
      name: 'Windows Game Mode Policy',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Configures Windows native Game Mode scheduling parameters.',
      status: gameModeActive ? 'Enabled' : 'Disabled',
      isOptimized: gameModeActive === true,
      actionType: 'toggle',
      onAction: toggleGameMode,
      actionLabel: gameModeActive ? 'Disable' : 'Enable'
    },
    {
      id: 'powerPlan',
      name: 'High Performance Power Plan',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'high',
      desc: 'Forces system power settings to highest performance plan to maximize CPU scheduler power delivery.',
      status: powerPlanMode === 'high' ? 'High Performance Mode' : 'Balanced / Default',
      isOptimized: powerPlanMode === 'high',
      actionType: 'toggle',
      onAction: togglePowerPlan,
      actionLabel: powerPlanMode === 'high' ? 'Balanced' : 'Max Boost'
    },
    {
      id: 'launchPriority',
      name: 'One-Time Scheduler Elevation',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'high',
      desc: 'Forces immediate high CPU scheduler priority class allocation for the running process.',
      status: 'Ready',
      isOptimized: false,
      actionType: 'action',
      onAction: forceValorantPriority,
      actionLabel: 'Elevate Now'
    }
  ];

  // Filtering actions based on tab selection, search query and display rules
  const filteredActions = allActions.filter(action => {
    if (action.showIf === false) return false;
    
    // Tab filtering
    if (activeTab === 'safe' && action.tier !== 'safe') return false;
    if (activeTab === 'aggressive' && action.tier !== 'aggressive' && action.tier !== 'experimental') return false;
    if (activeTab === 'gpu' && action.category !== 'GPU & Monitor') return false;
    if (activeTab === 'cleanup' && action.category !== 'Caches & Cleaners' && action.category !== 'Launch Policies') return false;
    
    // Search query filtering
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = action.name.toLowerCase().includes(query);
      const descMatch = action.desc.toLowerCase().includes(query);
      const catMatch = action.category.toLowerCase().includes(query);
      return nameMatch || descMatch || catMatch;
    }
    
    return true;
  });

  // Unique categories list to render accordions
  const activeCategories = ['OS & Registry', 'GPU & Monitor', 'Caches & Cleaners', 'Launch Policies'].filter(cat => 
    filteredActions.some(action => action.category === cat)
  );

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
              className="px-3 py-1.5 bg-rose-650 hover:bg-rose-700 text-white rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-sm"
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
                className="border border-slate-350 px-2.5 py-1 rounded bg-white hover:bg-slate-50 cursor-pointer text-slate-700"
              >
                Simulate Exit
              </button>
            )
          )}
          <span className={`px-2.5 py-1 border rounded font-mono font-bold ${valorantRunning ? 'bg-green-50 border-green-300 text-green-700' : 'bg-slate-100 border-slate-350 text-slate-500'}`}>
            GAME STATUS: {valorantRunning ? 'VALORANT IS OPEN (BOOST ACTIVE)' : 'VALORANT IS CLOSED'}
          </span>
        </div>
      </header>

      {/* Optimization Score & Core Settings Top Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tracker Score Card */}
        <div className="p-4 border border-indigo-150 bg-indigo-50/40 rounded-lg flex flex-col justify-between text-xs col-span-1 md:col-span-2">
          <div className="space-y-1">
            <span className="font-bold text-slate-700 block">Overall Performance Optimization Score</span>
            <p className="text-[10px] text-slate-500">This score measures how many system tweaks are currently configured to maximize gaming FPS.</p>
          </div>
          <div className="w-full mt-4 space-y-1.5">
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

        {/* Path Setup and Profile Presets (Compact Column) */}
        <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">Optimization Profiles</span>
            <span className="text-[10px] text-slate-400 font-mono">Fast Presets</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => applyOptimizationProfile('tournament')} className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-center cursor-pointer font-bold text-[10px]">TOURNAMENT</button>
            <button onClick={() => applyOptimizationProfile('balanced')} className="py-1 px-2 border border-slate-250 bg-white hover:bg-slate-100 rounded text-center cursor-pointer font-bold text-[10px] text-slate-700">BALANCED</button>
            <button onClick={() => applyOptimizationProfile('revert')} className="py-1 px-2 border border-slate-250 bg-white hover:bg-slate-100 rounded text-center cursor-pointer font-bold text-[10px] text-slate-700">DEFAULTS</button>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-1">
              <span>Client settings profile</span>
              {isElectron && (
                <button onClick={browseValorantPath} className="text-slate-660 hover:text-slate-800 underline">Browse exe</button>
              )}
            </div>
            {valorantConfigs.length === 0 ? (
              <div className="text-slate-400 italic text-[10px]">No client configs found.</div>
            ) : (
              <select
                value={selectedConfig ? selectedConfig.filePath : ''}
                onChange={(e) => {
                  const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                  if (cfg) setSelectedConfig(cfg);
                }}
                className="w-full p-1 border border-slate-250 rounded text-[10px] bg-white cursor-pointer focus:outline-none"
              >
                {valorantConfigs.map((cfg) => (
                  <option key={cfg.filePath} value={cfg.filePath}>
                    {cfg.accountId.slice(0, 12)}... (Settings Profile)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 border border-amber-350 bg-amber-50 text-amber-800 text-xs rounded">
          <strong>Notice:</strong> Windows is running in standard user mode. Some core registry tweaks will be skipped.
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Master Optimization List (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar: Tabs and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Tweaks' },
                { id: 'safe', label: 'Safe' },
                { id: 'aggressive', label: 'Aggressive' },
                { id: 'gpu', label: 'GPU & Sync' },
                { id: 'cleanup', label: 'Caches & Launch' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 border text-xs font-semibold rounded cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                      : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-650 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Master Collapsible Categories List */}
          <div className="space-y-3">
            {activeCategories.length === 0 ? (
              <div className="p-8 border border-slate-200 rounded-lg text-center text-slate-400 italic text-xs bg-white">
                No optimization actions matched your search or tab filter.
              </div>
            ) : (
              activeCategories.map(cat => {
                const categoryActions = filteredActions.filter(action => action.category === cat);
                const isCollapsed = collapsedCategories[cat];
                const activeCount = categoryActions.filter(a => a.isOptimized).length;

                return (
                  <div key={cat} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    {/* Collapsible Accordion Header */}
                    <div 
                      onClick={() => toggleCategoryCollapse(cat)}
                      className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex justify-between items-center cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{cat}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 border border-slate-305">
                          {activeCount} of {categoryActions.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <span>{isCollapsed ? 'EXPAND' : 'COLLAPSE'}</span>
                        <span className="text-xs">{isCollapsed ? '＋' : '－'}</span>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {!isCollapsed && (
                      <div className="divide-y divide-slate-150">
                        {categoryActions.map((action) => {
                          const isThisLoading = processingActionId === action.id;
                          const isThisDone = justDoneActionId === action.id;
                          const isAnyLoading = processingActionId !== null;

                          return (
                          <div
                            key={action.id}
                            className={`px-4 py-3 transition-all grid grid-cols-12 gap-4 items-center ${
                              isThisLoading
                                ? 'bg-indigo-50/60'
                                : isThisDone
                                ? 'bg-green-50/50'
                                : isAnyLoading
                                ? 'opacity-50'
                                : 'hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Name, Details & Performance Impact */}
                            <div className="col-span-6 sm:col-span-7 space-y-1 pr-2">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="font-bold text-slate-800 text-xs">{action.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                                  action.tier === 'safe'
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : action.tier === 'aggressive'
                                    ? 'bg-amber-50 border-amber-250 text-amber-700'
                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                }`}>
                                  {action.tier}
                                </span>
                                {action.impact && (
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                                    action.impact === 'high'
                                      ? 'bg-rose-50/50 border-rose-200 text-rose-700'
                                      : action.impact === 'medium'
                                      ? 'bg-amber-50/40 border-amber-200 text-amber-750'
                                      : 'bg-slate-100 border-slate-200 text-slate-550'
                                  }`}>
                                    {action.impact} impact
                                  </span>
                                )}
                                {isThisLoading && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-100 border border-indigo-300 text-indigo-700">
                                    <Spinner className="w-2 h-2" /> Applying...
                                  </span>
                                )}
                                {isThisDone && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 border border-green-300 text-green-700">
                                    ✓ Done
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">{action.desc}</p>
                            </div>

                            {/* Telemetry/Status Column */}
                            <div className="col-span-3 sm:col-span-2 text-xs">
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                {isThisLoading ? (
                                  <Spinner className="w-2 h-2 text-indigo-500" />
                                ) : (
                                  <span className={`w-2 h-2 rounded-full ${
                                    action.isOptimized ? 'bg-green-500' : 'bg-rose-450'
                                  }`} />
                                )}
                                <span className={`font-semibold ${
                                  isThisLoading
                                    ? 'text-indigo-600'
                                    : action.isOptimized
                                    ? 'text-green-700'
                                    : 'text-rose-650'
                                }`}>
                                  {isThisLoading ? 'Working...' : action.status}
                                </span>
                              </div>
                            </div>

                            {/* Action Column */}
                            <div className="col-span-3 text-right">
                              {action.actionType === 'toggle' && (
                                <button
                                  onClick={() => runAction(action.id, action.name, action.onAction)}
                                  disabled={isAnyLoading}
                                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
                                    isThisLoading
                                      ? 'bg-indigo-600 border-indigo-700 text-white cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                      : isAnyLoading
                                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                      : action.isOptimized
                                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer'
                                      : 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700 shadow-sm cursor-pointer'
                                  }`}
                                >
                                  {isThisLoading ? (
                                    <><Spinner className="w-2.5 h-2.5" /> Working...</>
                                  ) : isThisDone ? (
                                    '✓ Done'
                                  ) : action.actionLabel}
                                </button>
                              )}

                              {action.actionType === 'action' && (
                                <button
                                  onClick={() => runAction(action.id, action.name, action.onAction)}
                                  disabled={action.disabled || isAnyLoading}
                                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
                                    isThisLoading
                                      ? 'bg-indigo-50 border-indigo-300 text-indigo-600 cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed'
                                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer'
                                  }`}
                                >
                                  {isThisLoading ? (
                                    <><Spinner className="w-2.5 h-2.5" /> Working...</>
                                  ) : isThisDone ? (
                                    '✓ Done'
                                  ) : action.actionLabel}
                                </button>
                              )}

                              {action.actionType === 'multiple' && (
                                <div className="flex flex-col sm:flex-row justify-end gap-1">
                                  {action.options.map((opt, oIdx) => {
                                    const optId = `${action.id}-${oIdx}`;
                                    const isOptLoading = processingActionId === optId;
                                    const isOptDone = justDoneActionId === optId;
                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => runAction(optId, action.name + ' - ' + opt.label, opt.onClick)}
                                        disabled={isAnyLoading}
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-[9px] font-bold rounded transition-all border ${
                                          isOptLoading
                                            ? 'bg-indigo-600 border-indigo-700 text-white cursor-not-allowed'
                                            : isOptDone
                                            ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                            : isAnyLoading
                                            ? 'opacity-50 cursor-not-allowed ' + (opt.primary ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-250 text-slate-650')
                                            : opt.primary
                                            ? 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700 cursor-pointer'
                                            : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-100 cursor-pointer'
                                        }`}
                                      >
                                        {isOptLoading ? (
                                          <><Spinner className="w-2 h-2" /> Working...</>
                                        ) : isOptDone ? '✓ Done' : opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Checklist sub-options for Background App Purging */}
          {optimizationOptions.purgeApps && (
            <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Configure Background Applications to Close</span>
              <p className="text-[10px] text-slate-500">Check apps you want closed automatically upon launching VALORANT:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {Object.keys(purgeAppsChecklist).map(appKey => (
                  <label key={appKey} className="flex items-center gap-2 p-2 border border-slate-200 bg-white rounded cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={!!Reflect.get(purgeAppsChecklist, appKey)}
                      onChange={(e) => {
                        const nextList = { ...purgeAppsChecklist };
                        Reflect.set(nextList, appKey, e.target.checked);
                        setPurgeAppsChecklist(nextList);
                      }}
                      className="cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="capitalize font-semibold text-slate-750">{appKey}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Auxiliary Panels (Takes 1 column) */}
        <div className="space-y-6">
          
          {/* Quick Telemetry & Scan Size Action */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded-lg space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <div>
                <span className="font-bold text-slate-750">Subsystem Diagnostics</span>
                {lastScannedAt && !scanningVal && (
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Last scan: {lastScannedAt}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  await Promise.all([scanValorantCaches(), checkVanguardHealth()]);
                  setLastScannedAt(new Date().toLocaleTimeString());
                }}
                disabled={scanningVal}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border transition-all ${
                  scanningVal
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-500 cursor-not-allowed'
                    : 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer'
                }`}
              >
                {scanningVal ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Scan Now
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-2.5">
              <div className="p-2 border border-slate-250 bg-white rounded space-y-1.5">
                <span className="font-bold text-slate-700 block">Anticheat Diagnostics</span>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-semibold">
                  <div className={`p-1 border rounded text-center ${vanguardHealth.secureBoot === 'enabled' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    SecureBoot: {vanguardHealth.secureBoot.toUpperCase()}
                  </div>
                  <div className={`p-1 border rounded text-center ${vanguardHealth.tpm2 === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    TPM: {vanguardHealth.tpm2.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-2 border border-slate-250 bg-white rounded space-y-1.5">
                <span className="font-bold text-slate-700 block">Hardware Status</span>
                <div className="space-y-1 text-[9px]">
                  <div className="flex justify-between p-1 bg-slate-50 rounded">
                    <span className="text-slate-500 font-semibold">RAM XMP</span>
                    <span className={hardwareInfo.xmpEnabled ? 'text-green-600 font-bold' : 'text-rose-600 font-bold'}>
                      {hardwareInfo.xmpEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between p-1 bg-slate-50 rounded">
                    <span className="text-slate-500 font-semibold">PCIe ReBAR</span>
                    <span className={hardwareInfo.rebarEnabled ? 'text-green-600 font-bold' : 'text-slate-500 font-bold'}>
                      {hardwareInfo.rebarEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphics Settings Tuner (Standalone card) */}
          <div className="border border-slate-200 bg-slate-50 p-4 rounded-lg space-y-3 text-xs">
            <h2 className="font-bold text-slate-750 border-b border-slate-200 pb-1.5">Game Graphics Config</h2>
            
            {selectedConfig ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      <span>Resolution Quality Scale</span>
                      {/* Info tooltip */}
                      <div className="relative inline-block">
                        <button
                          onMouseEnter={() => setShowResTooltip(true)}
                          onMouseLeave={() => setShowResTooltip(false)}
                          onFocus={() => setShowResTooltip(true)}
                          onBlur={() => setShowResTooltip(false)}
                          className="w-3.5 h-3.5 rounded-full bg-slate-300 text-slate-600 text-[8px] font-bold flex items-center justify-center cursor-default hover:bg-slate-400 transition-colors"
                          tabIndex={0}
                          aria-label="What is Resolution Quality Scale?"
                        >
                          ?
                        </button>
                        {showResTooltip && (
                          <div className="absolute left-5 top-0 z-50 w-52 p-2.5 bg-slate-800 text-white text-[9px] leading-relaxed rounded-lg shadow-xl border border-slate-700">
                            <div className="font-bold text-[10px] mb-1 text-amber-300">What is Resolution Scale?</div>
                            <p>This renders the game at a <strong>percentage of your native resolution</strong> and upscales it. Lower values (e.g. 75%) boost FPS significantly with minor visual loss. 100% = native resolution, no upscaling.</p>
                            <div className="mt-1.5 text-slate-400">
                              <span className="text-green-400 font-bold">75–85%</span> = Max FPS boost &nbsp;
                              <span className="text-amber-400 font-bold">90–95%</span> = Balanced &nbsp;
                              <span className="text-white font-bold">100%</span> = Native
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`font-mono ${
                      selectedConfig.resolutionQuality < 80 ? 'text-amber-600' :
                      selectedConfig.resolutionQuality < 95 ? 'text-slate-700' : 'text-green-700'
                    }`}>{Math.round(selectedConfig.resolutionQuality)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={Math.round(selectedConfig.resolutionQuality)}
                    onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-slate-800"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
                    <span>50% (Max FPS)</span>
                    <span>100% (Native)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Texture Quality</span>
                    <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Shadows</span>
                    <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="p-1 border border-slate-200 bg-white rounded">
                      <option value="0">Low (Off)</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Raw Input Buffer</span>
                    <select value={selectedConfig.rawInputBuffer ? 'true' : 'false'} onChange={(e) => saveValorantConfig({ rawInputBuffer: e.target.value === 'true' })} className="p-1 border border-slate-200 bg-white rounded w-full">
                      <option value="true">On (Raw Input)</option><option value="false">Off</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-600">Monitor Refresh Rate</span>
                      <span className="text-[9px] text-slate-400">Used for VRR cap calculation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={showCustomRateInput ? 'custom' : ([60,144,240,360].includes(monitorRefreshRate) ? monitorRefreshRate : 'custom')}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setShowCustomRateInput(true);
                            setCustomRateValue(String(monitorRefreshRate));
                            setTimeout(() => customRateInputRef.current?.focus(), 50);
                          } else {
                            setShowCustomRateInput(false);
                            applyFrameLimitSettings(frameLimitMode, parseInt(e.target.value, 10));
                          }
                        }}
                        className="flex-1 p-1 border border-slate-200 bg-white rounded text-[10px]"
                      >
                        <option value="60">60 Hz</option>
                        <option value="144">144 Hz</option>
                        <option value="240">240 Hz</option>
                        <option value="360">360 Hz</option>
                        <option value="custom">Custom Hz...</option>
                      </select>
                      {showCustomRateInput && (
                        <div className="flex items-center gap-1">
                          <input
                            ref={customRateInputRef}
                            type="number"
                            min="24"
                            max="999"
                            value={customRateValue}
                            onChange={(e) => setCustomRateValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const hz = parseInt(customRateValue, 10);
                                if (!isNaN(hz) && hz >= 24 && hz <= 999) {
                                  applyFrameLimitSettings(frameLimitMode, hz);
                                  setShowCustomRateInput(false);
                                }
                              } else if (e.key === 'Escape') {
                                setShowCustomRateInput(false);
                              }
                            }}
                            placeholder="e.g. 165"
                            className="w-16 p-1 border border-indigo-300 bg-white rounded text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          <button
                            onClick={() => {
                              const hz = parseInt(customRateValue, 10);
                              if (!isNaN(hz) && hz >= 24 && hz <= 999) {
                                applyFrameLimitSettings(frameLimitMode, hz);
                                setShowCustomRateInput(false);
                              }
                            }}
                            className="text-[9px] font-bold px-1.5 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                    {!showCustomRateInput && (
                      <div className="text-[9px] text-slate-400">
                        Active target: <span className="font-bold text-slate-600">{monitorRefreshRate} Hz</span>
                        {![60,144,240,360].includes(monitorRefreshRate) && (
                          <span className="ml-1 text-indigo-500">(custom)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                    <button
                      onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)}
                      title="No frame cap — maximum FPS output"
                      className={`p-1 border text-center rounded transition-colors ${frameLimitMode === 'uncapped' ? 'bg-slate-900 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      UNCAPPED
                    </button>
                    <button
                      onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)}
                      title={`Cap frames just below your ${monitorRefreshRate}Hz refresh rate to stabilize VRR/G-Sync/FreeSync`}
                      className={`p-1 border text-center rounded transition-colors ${frameLimitMode === 'vrr' ? 'bg-slate-900 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      VRR CAP
                    </button>
                  </div>
                  <div className="text-[8px] text-slate-400">
                    {frameLimitMode === 'vrr'
                      ? `VRR cap = ${Math.max(30, monitorRefreshRate - 3)} FPS (3 below refresh for stable sync)`
                      : 'Uncapped = no frame limit applied to config'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[10px]">Profile not selected.</div>
            )}
          </div>

          {/* Logger Stream removed - redundant with bottom console */}

        </div>

      </div>

    </div>
  );
}
