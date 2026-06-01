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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      desc: 'Disables GameDVR background capture telemetry.',
      descDetailed: 'Disables background game capture telemetry to prevent CPU frame time spikes.',
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
      desc: 'Eliminates pointer precision for direct 1:1 input.',
      descDetailed: 'Eliminates Windows pointer precision enhancement for direct 1:1 mouse input.',
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
      isAdvanced: true,
      desc: 'Prevents USB controllers from entering power sleep modes.',
      descDetailed: 'Prevents USB controllers from entering low-power sleep modes to stop peripheral latency.',
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
      desc: 'Prioritizes VALORANT CPU threads.',
      descDetailed: 'Instructs Windows thread scheduler to prioritize VALORANT game threads.',
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
      desc: 'Forces system timer to sub-millisecond 0.5ms mode.',
      descDetailed: 'Forces system timer resolution to sub-millisecond 0.5ms mode to reduce micro-stutters.',
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
      isAdvanced: true,
      desc: 'Stops network card power scaling to stabilize ping.',
      descDetailed: 'Disables Energy Efficient Ethernet power scaling on your network card to stabilize ping.',
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
      desc: 'Disables Xbox telemetry and auth helpers.',
      descDetailed: 'Disables Xbox Live Auth manager and telemetry daemon to free memory heap.',
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
      isAdvanced: true,
      desc: 'Ensures CPU cores run at maximum speed.',
      descDetailed: 'Disables Windows CPU core power gating policies to ensure stable maximum clocks.',
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
      isAdvanced: true,
      desc: 'Disables system timer platform clock.',
      descDetailed: 'Disables HPET platform clock to reduce Ryzen/Intel frame pacing overhead (requires reboot).',
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
      isAdvanced: true,
      desc: 'Disables hypervisor virtualization features.',
      descDetailed: 'Disables hypervisor virtualization security features (Memory Integrity) to regain up to 20% FPS (requires reboot).',
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
      isAdvanced: true,
      desc: 'Bypasses sync buffers for lower click latency.',
      descDetailed: 'Skips variable frame buffer alignment timing checks to minimize click latency.',
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
      isAdvanced: true,
      desc: 'Toggles adaptive sync variable refresh keys.',
      descDetailed: 'Configures adaptive sync keys. Disable for maximum frames, or enable to stop screen tearing.',
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
      isAdvanced: true,
      desc: 'Fixes multi-plane overlay flickering stutters.',
      descDetailed: 'Prevents screen flickering and random frame time spikes on RX 5000/6000+ series GPUs.',
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
      isAdvanced: true,
      desc: 'Forces shader caching to prevent game stutter.',
      descDetailed: 'Eliminates recompilation hitches in games by keeping shader caches persistent across sessions.',
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
      isAdvanced: true,
      desc: 'Forces old DX11 pipeline to bypass stutters.',
      descDetailed: 'Forces the legacy DX11 driver pipeline (amdxx64.dll → atidxx64.dll) to bypass modern DXNavi stutters.',
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
      isAdvanced: true,
      desc: 'Forces ReBAR on unsupported older AMD GPUs.',
      descDetailed: 'Injects registry keys to force enable ReBAR on unsupported GPUs like RX 580/570.',
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
      isAdvanced: true,
      desc: 'Applies pre-tuned GPU latency settings.',
      descDetailed: 'Applies system-wide GPU driver optimizations (Max Performance power mode, low latency settings, threaded draw calls).',
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
      desc: 'Deletes local debug logs and telemetry dumps.',
      descDetailed: 'Deletes local client debug logs and telemetry dumps which degrade file search speed.',
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
      desc: 'Wipes corrupt or bloated DirectX shaders.',
      descDetailed: 'Wipes corrupt or bloated Windows DirectX compilation shaders to force fresh compilations.',
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
      desc: 'Blocks Windows Update installations while playing.',
      descDetailed: 'Blocks Windows Update installation process from firing while playing.',
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
      desc: 'Closes resource-heavy background tools on match start.',
      descDetailed: 'Closes resource-heavy background tools (browsers, discord, game launchers) on match start.',
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
      desc: 'Configures Windows native Game Mode parameters.',
      descDetailed: 'Configures Windows native Game Mode scheduling parameters.',
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
      desc: 'Forces system power settings to highest performance plan.',
      descDetailed: 'Forces system power settings to highest performance plan to maximize CPU scheduler power delivery.',
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
      desc: 'Forces immediate high CPU scheduler priority.',
      descDetailed: 'Forces immediate high CPU scheduler priority class allocation for the running process.',
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
    
    // Advanced filtering
    if (!showAdvanced && action.isAdvanced) return false;
    
    // Tab filtering
    if (activeTab === 'safe' && action.tier !== 'safe') return false;
    if (activeTab === 'aggressive' && action.tier !== 'aggressive' && action.tier !== 'experimental') return false;
    if (activeTab === 'gpu' && action.category !== 'GPU & Monitor') return false;
    if (activeTab === 'cleanup' && action.category !== 'Caches & Cleaners' && action.category !== 'Launch Policies') return false;
    
    // Search query filtering
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = action.name.toLowerCase().includes(query);
      const descMatch = (action.descDetailed || action.desc).toLowerCase().includes(query);
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
    <div className="space-y-6 font-patrick text-pencil-black bg-white p-2">
      
      {/* Page Header */}
      <header className="flex justify-between items-center border-b-2 border-pencil-black pb-3">
        <div>
          <h1 className="text-xl font-bold font-kalam">Valorant Engine Booster</h1>
          <p className="text-[11.5px] text-pencil-black/70">System tweaks and caches for tactile gaming performance.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {!valorantRunning ? (
            <button 
              onClick={launchValorant}
              className="px-4 py-2 bg-accent-red hover:bg-accent-red/90 text-white border-2 border-pencil-black font-kalam wobbly flex items-center gap-1.5 font-bold transition-all cursor-pointer hand-shadow hover:hand-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              LAUNCH VALORANT
            </button>
          ) : (
            !isElectron && (
              <button 
                onClick={() => setValorantRunning(false)} 
                className="border-2 border-pencil-black px-3 py-1 wobbly-md bg-white hover:bg-paper-muted cursor-pointer text-pencil-black font-bold"
              >
                Simulate Exit
              </button>
            )
          )}
          <span className={`px-3 py-1.5 border-2 border-pencil-black font-mono font-bold wobbly-md ${valorantRunning ? 'bg-green-50 text-accent-blue' : 'bg-paper-muted text-pencil-black/60'}`}>
            STATUS: {valorantRunning ? 'VALORANT IS OPEN (BOOST ACTIVE)' : 'VALORANT IS CLOSED'}
          </span>
        </div>
      </header>

      {/* Optimization Score & Core Settings Top Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tracker Score Card */}
        <div className="p-4 border-2 border-pencil-black bg-paper-muted/30 wobbly-md flex flex-col justify-between text-xs col-span-1 md:col-span-2 relative">
          {/* Post-it pin decoration */}
          <div className="absolute -top-1.5 left-4 w-3.5 h-3.5 rounded-full bg-accent-red border border-pencil-black shadow-sm" />
          <div className="space-y-1">
            <span className="font-bold text-pencil-black font-kalam block">Overall Performance Optimization Score</span>
            <p className="text-[11px] text-pencil-black/75">This score measures how many system tweaks are currently configured to maximize gaming FPS.</p>
          </div>
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between font-bold text-pencil-black text-[11px] font-kalam">
              <span>{optimizedCount} of {totalOptimizations} Tweaks Active</span>
              <span className="text-accent-blue">{optimizationPercentage}% OPTIMIZED</span>
            </div>
            <div className="w-full h-4 bg-paper-muted border-2 border-pencil-black wobbly overflow-hidden">
              <div className={`h-full transition-all duration-500 ${
                optimizationPercentage >= 80 ? 'bg-accent-blue' : optimizationPercentage >= 50 ? 'bg-[#fff9c4]' : 'bg-accent-red'
              }`} style={{ width: `${optimizationPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Path Setup and Profile Presets (Compact Column) */}
        <div className="p-4 border-2 border-pencil-black bg-paper-muted/20 wobbly-md space-y-3 text-xs relative">
          {/* Post-it pin decoration */}
          <div className="absolute -top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-accent-blue border border-pencil-black shadow-sm" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-pencil-black font-kalam">Optimization Profiles</span>
            <span className="text-[10px] text-pencil-black/50 font-mono">Fast Presets</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => applyOptimizationProfile('tournament')} className="py-1 px-1.5 border-2 border-pencil-black bg-pencil-black text-white hover:bg-pencil-black/90 wobbly-md text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">TOURNAMENT</button>
            <button onClick={() => applyOptimizationProfile('balanced')} className="py-1 px-1.5 border-2 border-pencil-black bg-white hover:bg-paper-muted text-pencil-black wobbly-md text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">BALANCED</button>
            <button onClick={() => applyOptimizationProfile('revert')} className="py-1 px-1.5 border-2 border-pencil-black bg-white hover:bg-paper-muted text-pencil-black wobbly-md text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">DEFAULTS</button>
          </div>
          <div className="border-t-2 border-dashed border-pencil-black/50 pt-2">
            <div className="flex justify-between items-center text-[10.5px] text-pencil-black/60 font-semibold mb-1">
              <span>Client settings profile</span>
              {isElectron && (
                <button onClick={browseValorantPath} className="text-accent-blue hover:underline font-bold">Browse exe</button>
              )}
            </div>
            {valorantConfigs.length === 0 ? (
              <div className="text-pencil-black/50 italic text-[11px]">No client configs found.</div>
            ) : (
              <select
                value={selectedConfig ? selectedConfig.filePath : ''}
                onChange={(e) => {
                  const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                  if (cfg) setSelectedConfig(cfg);
                }}
                className="w-full p-1.5 border-2 border-pencil-black wobbly-md text-[11px] bg-white cursor-pointer focus:outline-none font-patrick"
              >
                {valorantConfigs.map((cfg) => (
                  <option key={cfg.filePath} value={cfg.filePath}>
                    {cfg.accountId.slice(0, 12)}... (Config)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 border-2 border-dashed border-accent-red bg-accent-red/5 text-pencil-black text-xs rounded-none wobbly font-bold">
          <strong>Notice:</strong> Windows is running in standard user mode. Some core registry tweaks will be skipped.
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Master Optimization List (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar: Tabs and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-pencil-black pb-3">
            <div className="flex flex-wrap gap-1.5">
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
                  className={`px-3 py-1.5 border-2 border-pencil-black text-xs font-bold wobbly-md cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-pencil-black text-white shadow-none'
                      : 'bg-white text-pencil-black hover:bg-paper-muted hand-shadow-sm hover:hand-shadow-sm/50 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <label className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-pencil-black text-xs font-bold wobbly-md bg-white hover:bg-paper-muted cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="w-3.5 h-3.5 accent-pencil-black cursor-pointer"
                />
                <span>Show Advanced</span>
              </label>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-1.5 border-2 border-pencil-black wobbly-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 bg-white font-patrick"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-pencil-black/50 hover:text-pencil-black font-bold text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Master Collapsible Categories List */}
          <div className="space-y-4">
            {activeCategories.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-pencil-black wobbly-md text-center text-pencil-black/50 italic text-xs bg-white">
                No optimization actions matched your search or tab filter.
              </div>
            ) : (
              activeCategories.map(cat => {
                const categoryActions = filteredActions.filter(action => action.category === cat);
                const isCollapsed = collapsedCategories[cat];
                const activeCount = categoryActions.filter(a => a.isOptimized).length;

                return (
                  <div key={cat} className="border-[3px] border-pencil-black wobbly-md bg-white overflow-hidden hand-shadow">
                    {/* Collapsible Accordion Header */}
                    <div 
                      onClick={() => toggleCategoryCollapse(cat)}
                      className="bg-paper-muted border-b-[3px] border-pencil-black px-4 py-2.5 flex justify-between items-center cursor-pointer select-none hover:bg-paper-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-pencil-black font-kalam uppercase tracking-wider">{cat}</span>
                        <span className="px-1.5 py-0.5 rounded-none font-bold text-[9px] bg-white border border-pencil-black wobbly-md">
                          {activeCount} of {categoryActions.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-pencil-black/60 font-bold">
                        <span>{isCollapsed ? 'EXPAND' : 'COLLAPSE'}</span>
                        <span className="text-xs">{isCollapsed ? '＋' : '－'}</span>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {!isCollapsed && (
                      <div className="divide-y-2 divide-pencil-black/20">
                        {categoryActions.map((action) => {
                          const isThisLoading = processingActionId === action.id;
                          const isThisDone = justDoneActionId === action.id;
                          const isAnyLoading = processingActionId !== null;

                          return (
                          <div
                            key={action.id}
                            className={`px-4 py-3.5 transition-all grid grid-cols-12 gap-4 items-center ${
                              isThisLoading
                                ? 'bg-accent-blue/5'
                                : isThisDone
                                ? 'bg-green-50/50'
                                : isAnyLoading
                                ? 'opacity-50'
                                : 'hover:bg-paper-muted/10'
                            }`}
                          >
                            {/* Name, Details & Performance Impact */}
                            <div className="col-span-6 sm:col-span-7 space-y-1 pr-2">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="font-bold text-pencil-black font-kalam text-xs">{action.name}</span>
                                <div className="relative group inline-block">
                                  <span className="text-[9px] text-accent-blue border border-accent-blue px-1 cursor-help wobbly-sm font-bold font-kalam select-none bg-white">?</span>
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 bg-[#fff9c4] text-pencil-black text-[10.5px] p-2.5 border-2 border-pencil-black wobbly-md hand-shadow w-56 font-bold leading-snug">
                                    {action.descDetailed || action.desc}
                                  </div>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-wide border border-pencil-black wobbly-md ${
                                  action.tier === 'safe'
                                    ? 'bg-[#fff9c4] text-pencil-black'
                                    : action.tier === 'aggressive'
                                    ? 'bg-accent-red text-white'
                                    : 'bg-accent-blue text-white'
                                }`}>
                                  {action.tier}
                                </span>
                                {action.impact && (
                                  <span className="px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-wide border-2 border-pencil-black wobbly bg-paper-bg text-pencil-black">
                                    {action.impact} impact
                                  </span>
                                )}
                                {isThisLoading && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[8px] font-bold bg-accent-blue/10 border border-accent-blue text-accent-blue">
                                    <Spinner className="w-2 h-2" /> Applying...
                                  </span>
                                )}
                                {isThisDone && (
                                  <span className="px-1.5 py-0.5 rounded-none text-[8px] font-bold bg-green-100 border border-green-500 text-green-700">
                                    ✓ Done
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-pencil-black/75 leading-normal">{action.desc}</p>
                            </div>

                            {/* Telemetry/Status Column */}
                            <div className="col-span-3 sm:col-span-2 text-xs">
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                                {isThisLoading ? (
                                  <Spinner className="w-2.5 h-2.5 text-accent-blue" />
                                ) : (
                                  <span className={`w-2.5 h-2.5 border border-pencil-black ${
                                    action.isOptimized ? 'bg-accent-blue' : 'bg-accent-red'
                                  }`} style={{ borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px' }} />
                                )}
                                <span className={
                                  isThisLoading
                                    ? 'text-accent-blue'
                                    : action.isOptimized
                                    ? 'text-accent-blue font-bold'
                                    : 'text-accent-red font-bold'
                                }>
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
                                  className={`flex items-center justify-center gap-1 px-3 py-1.5 text-[10.5px] font-bold border-2 border-pencil-black wobbly-md transition-all cursor-pointer ${
                                    isThisLoading
                                      ? 'bg-accent-blue text-white cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                      : isAnyLoading
                                      ? 'bg-paper-muted text-pencil-black/40 cursor-not-allowed shadow-none'
                                      : action.isOptimized
                                      ? 'bg-white hover:bg-paper-muted text-pencil-black hand-shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                                      : 'bg-[#fff9c4] hover:bg-[#fff7b1] text-pencil-black hand-shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none font-kalam'
                                  }`}
                                >
                                  {isThisLoading ? '...' : isThisDone ? '✓ Done' : action.actionLabel}
                                </button>
                              )}

                              {action.actionType === 'action' && (
                                <button
                                  onClick={() => runAction(action.id, action.name, action.onAction)}
                                  disabled={action.disabled || isAnyLoading}
                                  className={`flex items-center justify-center gap-1 px-3 py-1.5 text-[10.5px] font-bold border-2 border-pencil-black wobbly-md transition-all cursor-pointer ${
                                    isThisLoading
                                      ? 'bg-accent-blue text-white cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                      : 'border-pencil-black bg-white hover:bg-paper-muted text-pencil-black disabled:opacity-40 disabled:cursor-not-allowed hand-shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                                  }`}
                                >
                                  {isThisLoading ? '...' : isThisDone ? '✓ Done' : action.actionLabel}
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
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-[9.5px] font-bold rounded-none border-2 border-pencil-black wobbly-md transition-all ${
                                          isOptLoading
                                            ? 'bg-accent-blue text-white cursor-not-allowed shadow-none'
                                            : isOptDone
                                            ? 'bg-green-600 text-white cursor-not-allowed shadow-none'
                                            : isAnyLoading
                                            ? 'opacity-50 cursor-not-allowed bg-white text-pencil-black shadow-none'
                                            : opt.primary
                                            ? 'bg-pencil-black text-white hover:bg-pencil-black/90 cursor-pointer hand-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                                            : 'bg-white text-pencil-black hover:bg-paper-muted cursor-pointer hand-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                                        }`}
                                      >
                                        {isOptLoading ? '...' : isOptDone ? '✓' : opt.label}
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
            <div className="p-4 border-2 border-pencil-black bg-paper-muted/20 wobbly-md text-xs space-y-2 relative">
              {/* Tape decoration */}
              <div className="absolute -top-3 left-6 w-16 h-4 bg-pencil-black/10 border border-pencil-black/20 rotate-1 pointer-events-none" />
              <span className="font-bold text-pencil-black font-kalam block">Configure Background Applications to Close</span>
              <p className="text-[11px] text-pencil-black/70">Check apps you want closed automatically upon launching VALORANT:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {Object.keys(purgeAppsChecklist).map(appKey => (
                  <label key={appKey} className="flex items-center gap-2 p-2 border-2 border-pencil-black bg-white wobbly-md cursor-pointer hover:bg-paper-muted/30">
                    <input 
                      type="checkbox" 
                      checked={!!Reflect.get(purgeAppsChecklist, appKey)}
                      onChange={(e) => {
                        const nextList = { ...purgeAppsChecklist };
                        Reflect.set(nextList, appKey, e.target.checked);
                        setPurgeAppsChecklist(nextList);
                      }}
                      className="cursor-pointer w-4 h-4 accent-pencil-black"
                    />
                    <span className="capitalize font-bold text-pencil-black font-kalam text-[11px]">{appKey}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Auxiliary Panels (Takes 1 column) */}
        <div className="space-y-6">
          
          {/* Quick Telemetry & Scan Size Action */}
          <div className="border-[3px] border-pencil-black bg-white p-4 wobbly-md hand-shadow space-y-3.5 text-xs relative">
            {/* Post-it pin decoration */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-red border border-pencil-black shadow-sm" />
            
            <div className="flex justify-between items-center border-b-2 border-pencil-black pb-2">
              <div>
                <span className="font-bold text-pencil-black font-kalam">Diagnostics</span>
                {lastScannedAt && !scanningVal && (
                  <div className="text-[10px] text-pencil-black/55 font-mono mt-0.5">
                    Last: {lastScannedAt}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  await Promise.all([scanValorantCaches(), checkVanguardHealth()]);
                  setLastScannedAt(new Date().toLocaleTimeString());
                }}
                disabled={scanningVal}
                className={`flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-1 border-2 border-pencil-black wobbly-md transition-all ${
                  scanningVal
                    ? 'bg-paper-muted text-pencil-black/50 cursor-not-allowed shadow-none'
                    : 'bg-[#fff9c4] text-pencil-black hover:bg-[#fff7b1] cursor-pointer hand-shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                }`}
              >
                {scanningVal ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-2 border-2 border-pencil-black bg-paper-muted/20 wobbly-md space-y-1.5">
                <span className="font-bold text-pencil-black font-kalam block">Anticheat Diagnostics</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  <div className={`p-1.5 border border-pencil-black wobbly text-center ${vanguardHealth.secureBoot === 'enabled' ? 'bg-white text-accent-blue' : 'bg-accent-red text-white'}`}>
                    SecureBoot: {vanguardHealth.secureBoot.toUpperCase()}
                  </div>
                  <div className={`p-1.5 border border-pencil-black wobbly text-center ${vanguardHealth.tpm2 === 'active' ? 'bg-white text-accent-blue' : 'bg-accent-red text-white'}`}>
                    TPM: {vanguardHealth.tpm2.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-2 border-2 border-pencil-black bg-paper-muted/20 wobbly-md space-y-1.5">
                <span className="font-bold text-pencil-black font-kalam block">Hardware Status</span>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between p-1 bg-white border border-pencil-black wobbly-md font-bold">
                    <span>RAM XMP</span>
                    <span className={hardwareInfo.xmpEnabled ? 'text-accent-blue font-bold' : 'text-accent-red font-bold'}>
                      {hardwareInfo.xmpEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between p-1 bg-white border border-pencil-black wobbly-md font-bold">
                    <span>PCIe ReBAR</span>
                    <span className={hardwareInfo.rebarEnabled ? 'text-accent-blue font-bold' : 'text-pencil-black/50 font-bold'}>
                      {hardwareInfo.rebarEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphics Settings Tuner (Standalone card) */}
          <div className="border-[3px] border-pencil-black bg-[#fff9c4] p-4 wobbly hand-shadow space-y-4 text-xs relative">
            {/* Post-it pin decoration */}
            <div className="absolute -top-1.5 right-6 w-4 h-4 rounded-full bg-accent-blue border border-pencil-black shadow-sm" />
            <h2 className="font-bold text-pencil-black font-kalam border-b-2 border-pencil-black pb-1.5 text-sm">Game Graphics Config</h2>
            
            {selectedConfig ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-pencil-black mb-1 text-[11px] font-kalam">
                    <div className="flex items-center gap-1">
                      <span>Resolution Quality Scale</span>
                      <div className="relative inline-block">
                        <button
                          onMouseEnter={() => setShowResTooltip(true)}
                          onMouseLeave={() => setShowResTooltip(false)}
                          onFocus={() => setShowResTooltip(true)}
                          onBlur={() => setShowResTooltip(false)}
                          className="w-4 h-4 rounded-full border border-pencil-black bg-white text-pencil-black text-[9px] font-bold flex items-center justify-center cursor-default"
                          tabIndex={0}
                          aria-label="What is Resolution Quality Scale?"
                        >
                          ?
                        </button>
                        {showResTooltip && (
                          <div className="absolute left-6 top-0 z-50 w-52 p-3 bg-pencil-black text-white text-[10px] leading-relaxed wobbly border-2 border-white shadow-xl">
                            <div className="font-bold text-[11px] mb-1 font-kalam text-[#fff9c4]">What is Resolution Scale?</div>
                            <p>Renders the game at a percentage of native resolution and upscales it. Lower values boost FPS.</p>
                            <div className="mt-1.5 font-bold font-mono text-[9px]">
                              75–85% = Max Boost | 100% = Native
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-accent-blue font-bold">{Math.round(selectedConfig.resolutionQuality)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={Math.round(selectedConfig.resolutionQuality)}
                    onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-pencil-black"
                  />
                  <div className="flex justify-between text-[9px] text-pencil-black/50 font-bold mt-0.5">
                    <span>50% (Max FPS)</span>
                    <span>100% (Native)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-pencil-black/60 font-bold uppercase tracking-wider text-[9px] font-kalam">Texture Quality</span>
                    <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="p-1.5 border-2 border-pencil-black bg-white wobbly-md font-patrick">
                      <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-pencil-black/60 font-bold uppercase tracking-wider text-[9px] font-kalam">Shadows</span>
                    <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="p-1.5 border-2 border-pencil-black bg-white wobbly-md font-patrick">
                      <option value="0">Low (Off)</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-pencil-black/60 font-bold uppercase tracking-wider text-[9px] font-kalam">Raw Input Buffer</span>
                    <select value={selectedConfig.rawInputBuffer ? 'true' : 'false'} onChange={(e) => saveValorantConfig({ rawInputBuffer: e.target.value === 'true' })} className="p-1.5 border-2 border-pencil-black bg-white wobbly-md font-patrick">
                      <option value="true">On (Raw Input)</option><option value="false">Off</option>
                    </select>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-pencil-black pt-3 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-pencil-black font-kalam">Monitor Refresh Rate</span>
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
                        className="flex-1 p-1.5 border-2 border-pencil-black bg-white wobbly-md text-[11px] font-patrick cursor-pointer"
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
                            className="w-16 p-1.5 border-2 border-pencil-black bg-white wobbly-md text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                          />
                          <button
                            onClick={() => {
                              const hz = parseInt(customRateValue, 10);
                              if (!isNaN(hz) && hz >= 24 && hz <= 999) {
                                applyFrameLimitSettings(frameLimitMode, hz);
                                setShowCustomRateInput(false);
                              }
                            }}
                            className="text-[10px] font-bold px-2 py-1 bg-pencil-black text-white wobbly-md cursor-pointer border-2 border-pencil-black"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                    {!showCustomRateInput && (
                      <div className="text-[10px] text-pencil-black/55 font-bold">
                        Active target: <span className="text-pencil-black">{monitorRefreshRate} Hz</span>
                        {![60,144,240,360].includes(monitorRefreshRate) && (
                          <span className="ml-1 text-accent-blue font-kalam">(custom)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button
                      onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)}
                      title="No frame cap — maximum FPS output"
                      className={`p-1.5 border-2 border-pencil-black text-center wobbly-md transition-all cursor-pointer ${frameLimitMode === 'uncapped' ? 'bg-pencil-black text-white shadow-none' : 'bg-white text-pencil-black hand-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}
                    >
                      UNCAPPED
                    </button>
                    <button
                      onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)}
                      title={`Cap frames just below your ${monitorRefreshRate}Hz refresh rate to stabilize VRR/G-Sync/FreeSync`}
                      className={`p-1.5 border-2 border-pencil-black text-center wobbly-md transition-all cursor-pointer ${frameLimitMode === 'vrr' ? 'bg-pencil-black text-white shadow-none' : 'bg-white text-pencil-black hand-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}
                    >
                      VRR CAP
                    </button>
                  </div>
                  <div className="text-[9.5px] text-pencil-black/60 font-bold">
                    {frameLimitMode === 'vrr'
                      ? `VRR target = ${Math.max(30, monitorRefreshRate - 3)} FPS (3 below refresh)`
                      : 'Uncapped = no limit config'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-pencil-black/50 italic text-[11px]">Profile not selected.</div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
