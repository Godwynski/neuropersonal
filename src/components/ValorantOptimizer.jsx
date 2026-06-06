import React, { useState, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';
import ConfirmModal from './ConfirmModal';

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
    runningApps,
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

  const [lastScannedAt, setLastScannedAt] = useState(null);

  // Confirm Modal state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

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
        setConfirmDialog({
          isOpen: true,
          title: 'Modify Platform Clock',
          message: `Warning: This modifies Windows Boot Configuration Data to ${action} HPET. A reboot will be required. Proceed?`,
          variant: 'warning',
          onConfirm: () => {
            toggleHpet(!hpetDisabled);
            closeConfirm();
          }
        });
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
        setConfirmDialog({
          isOpen: true,
          title: 'Virtualization-Based Security',
          message: `Disabling Virtualization-Based Security (VBS) lowers protection to improve game frame rates. Change requires reboot. Proceed?`,
          variant: 'danger',
          onConfirm: () => {
            toggleVbs(!targetState);
            closeConfirm();
          }
        });
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
        setConfirmDialog({
          isOpen: true,
          title: 'Legacy AMD DX11 Pipeline',
          message: `Warning: You are ${action} the AMD DX11 driver path. This affects all DX11 games on your system. Proceed?`,
          variant: 'warning',
          onConfirm: () => {
            toggleAmdLegacyDx(!amdOptimizations.legacyDxPath);
            closeConfirm();
          }
        });
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
    <>
    <div className="space-y-6 font-inter text-gray-200 bg-[#0a0a0a] p-2">
      
      {/* Page Header */}
      <header className="flex justify-between items-center border-b-2 border-[#262626] pb-3">
        <div>
          <h1 className="text-xl font-bold font-outfit">Valorant Engine Booster</h1>
          <p className="text-[11.5px] text-gray-400">System tweaks and caches for tactile gaming performance.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {!valorantRunning ? (
            <button 
              onClick={launchValorant}
              className="px-4 py-2 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white border border-[#262626] font-outfit rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-md hover:shadow-sm active:scale-95"
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
                className="border border-[#262626] px-3 py-1 rounded-lg bg-[#0a0a0a] hover:bg-[#141414] cursor-pointer text-gray-200 font-bold"
              >
                Simulate Exit
              </button>
            )
          )}
          <span className={`px-3 py-1.5 border border-[#262626] font-mono font-bold rounded-lg ${valorantRunning ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-[#141414] text-gray-400'}`}>
            STATUS: {valorantRunning ? 'VALORANT IS OPEN (BOOST ACTIVE)' : 'VALORANT IS CLOSED'}
          </span>
        </div>
      </header>

      {/* Optimization Score & Core Settings Top Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tracker Score Card */}
        <div className="p-4 border border-[#262626] bg-[#141414]/30 rounded-lg flex flex-col justify-between text-xs col-span-1 md:col-span-2 relative">
          {/* Post-it pin decoration */}
          <div className="absolute -top-1.5 left-4 w-3.5 h-3.5 rounded-full bg-[#ff4655] border border-[#262626] shadow-sm" />
          <div className="space-y-1">
            <span className="font-bold text-gray-200 font-outfit block">Overall Performance Optimization Score</span>
            <p className="text-[11px] text-gray-300">This score measures how many system tweaks are currently configured to maximize gaming FPS.</p>
          </div>
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between font-bold text-gray-200 text-[11px] font-outfit">
              <span>{optimizedCount} of {totalOptimizations} Tweaks Active</span>
              <span className="text-[#3b82f6]">{optimizationPercentage}% OPTIMIZED</span>
            </div>
            <div className="w-full h-4 bg-[#141414] border border-[#262626] rounded-lg overflow-hidden">
              <div className={`h-full transition-all duration-500 ${
                optimizationPercentage >= 80 ? 'bg-[#3b82f6]' : optimizationPercentage >= 50 ? 'bg-[#262626]' : 'bg-[#ff4655]'
              }`} style={{ width: `${optimizationPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Path Setup and Profile Presets (Compact Column) */}
        <div className="p-4 border border-[#262626] bg-[#141414]/20 rounded-lg space-y-3 text-xs relative">
          {/* Post-it pin decoration */}
          <div className="absolute -top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-[#3b82f6] border border-[#262626] shadow-sm" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-200 font-outfit">Optimization Profiles</span>
            <span className="text-[10px] text-gray-400 font-mono">Fast Presets</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => applyOptimizationProfile('tournament')} className="py-1 px-1.5 border border-[#262626] bg-pencil-black text-white hover:bg-pencil-black/90 rounded-lg text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">TOURNAMENT</button>
            <button onClick={() => applyOptimizationProfile('balanced')} className="py-1 px-1.5 border border-[#262626] bg-[#0a0a0a] hover:bg-[#141414] text-gray-200 rounded-lg text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">BALANCED</button>
            <button onClick={() => applyOptimizationProfile('revert')} className="py-1 px-1.5 border border-[#262626] bg-[#0a0a0a] hover:bg-[#141414] text-gray-200 rounded-lg text-center cursor-pointer font-bold text-[10px] active:translate-x-[1px] active:translate-y-[1px]">DEFAULTS</button>
          </div>
          <div className="border-t-2 border-dashed border-[#3f3f46] pt-2">
            <div className="flex justify-between items-center text-[10.5px] text-gray-400 font-semibold mb-1">
              <span>Client settings profile</span>
              {isElectron && (
                <button onClick={browseValorantPath} className="text-[#3b82f6] hover:underline font-bold">Browse exe</button>
              )}
            </div>
            {valorantConfigs.length === 0 ? (
              <div className="text-gray-400 italic text-[11px]">No client configs found.</div>
            ) : (
              <select
                value={selectedConfig ? selectedConfig.filePath : ''}
                onChange={(e) => {
                  const cfg = valorantConfigs.find(c => c.filePath === e.target.value);
                  if (cfg) setSelectedConfig(cfg);
                }}
                className="w-full p-1.5 border border-[#262626] rounded-lg text-[11px] bg-[#0a0a0a] cursor-pointer focus:outline-none font-inter"
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
        <div className="p-3 border border-dashed border-[#ff4655] bg-[#ff4655]/5 text-gray-200 text-xs rounded-none rounded-lg font-bold">
          <strong>Notice:</strong> Windows is running in standard user mode. Some core registry tweaks will be skipped.
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Master Optimization List (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar: Tabs and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#262626] pb-3">
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
                  className={`px-3 py-1.5 border border-[#262626] text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-pencil-black text-white shadow-none'
                      : 'bg-[#0a0a0a] text-gray-200 hover:bg-[#141414] shadow-sm hover:shadow-sm/50 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] text-xs font-bold rounded-lg bg-[#0a0a0a] hover:bg-[#141414] cursor-pointer select-none">
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
                  className="w-full text-xs p-1.5 border border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/20 bg-[#0a0a0a] font-inter"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-200 font-bold text-xs"
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
              <div className="p-8 border border-dashed border-[#262626] rounded-lg text-center text-gray-400 italic text-xs bg-[#0a0a0a]">
                No optimization actions matched your search or tab filter.
              </div>
            ) : (
              activeCategories.map(cat => {
                const categoryActions = filteredActions.filter(action => action.category === cat);
                const isCollapsed = collapsedCategories[cat];
                const activeCount = categoryActions.filter(a => a.isOptimized).length;

                return (
                  <div key={cat} className="border border-[#262626] rounded-lg bg-[#0a0a0a] overflow-hidden shadow-md">
                    {/* Collapsible Accordion Header */}
                    <div 
                      onClick={() => toggleCategoryCollapse(cat)}
                      className="bg-[#141414] border-b-[3px] border-[#262626] px-4 py-2.5 flex justify-between items-center cursor-pointer select-none hover:bg-[#141414]/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-200 font-outfit uppercase tracking-wider">{cat}</span>
                        <span className="px-1.5 py-0.5 rounded-none font-bold text-[9px] bg-[#0a0a0a] border border-[#262626] rounded-lg">
                          {activeCount} of {categoryActions.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
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
                                ? 'bg-[#3b82f6]/5'
                                : isThisDone
                                ? 'bg-[#3b82f6]/10/50'
                                : isAnyLoading
                                ? 'opacity-50'
                                : 'hover:bg-[#141414]/10'
                            }`}
                          >
                            {/* Name, Details & Performance Impact */}
                            <div className="col-span-6 sm:col-span-7 space-y-1 pr-2">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="font-bold text-gray-200 font-outfit text-xs">{action.name}</span>
                                <div className="relative group inline-block">
                                  <span className="text-[9px] text-[#3b82f6] border border-[#3b82f6] px-1 cursor-help rounded-md font-bold font-outfit select-none bg-[#0a0a0a]">?</span>
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 bg-[#262626] text-gray-200 text-[10.5px] p-2.5 border border-[#262626] rounded-lg shadow-md w-56 font-bold leading-snug">
                                    {action.descDetailed || action.desc}
                                  </div>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-wide border border-[#262626] rounded-lg ${
                                  action.tier === 'safe'
                                    ? 'bg-[#262626] text-gray-200'
                                    : action.tier === 'aggressive'
                                    ? 'bg-[#ff4655] text-white'
                                    : 'bg-[#3b82f6] text-white'
                                }`}>
                                  {action.tier}
                                </span>
                                {action.impact && (
                                  <span className="px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-wide border border-[#262626] rounded-lg bg-[#0a0a0a] text-gray-200">
                                    {action.impact} impact
                                  </span>
                                )}
                                {isThisLoading && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[8px] font-bold bg-[#3b82f6]/10 border border-[#3b82f6] text-[#3b82f6]">
                                    <Spinner className="w-2 h-2" /> Applying...
                                  </span>
                                )}
                                {isThisDone && (
                                  <span className="px-1.5 py-0.5 rounded-none text-[8px] font-bold bg-green-100 border border-green-500 text-green-700">
                                    ✓ Done
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-300 leading-normal">{action.desc}</p>
                            </div>

                            {/* Telemetry/Status Column */}
                            <div className="col-span-3 sm:col-span-2 text-xs">
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                                {isThisLoading ? (
                                  <Spinner className="w-2.5 h-2.5 text-[#3b82f6]" />
                                ) : (
                                  <span className={`w-2.5 h-2.5 border border-[#262626] ${
                                    action.isOptimized ? 'bg-[#3b82f6]' : 'bg-[#ff4655]'
                                  }`} style={{ borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px' }} />
                                )}
                                <span className={
                                  isThisLoading
                                    ? 'text-[#3b82f6]'
                                    : action.isOptimized
                                    ? 'text-[#3b82f6] font-bold'
                                    : 'text-[#ff4655] font-bold'
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
                                  className={`flex items-center justify-center gap-1 px-3 py-1.5 text-[10.5px] font-bold border border-[#262626] rounded-lg transition-all cursor-pointer ${
                                    isThisLoading
                                      ? 'bg-[#3b82f6] text-white cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                      : isAnyLoading
                                      ? 'bg-[#141414] text-gray-500 cursor-not-allowed shadow-none'
                                      : action.isOptimized
                                      ? 'bg-[#0a0a0a] hover:bg-[#141414] text-gray-200 shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                                      : 'bg-[#262626] hover:bg-[#3f3f46] text-gray-200 shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none font-outfit'
                                  }`}
                                >
                                  {isThisLoading ? '...' : isThisDone ? '✓ Done' : action.actionLabel}
                                </button>
                              )}

                              {action.actionType === 'action' && (
                                <button
                                  onClick={() => runAction(action.id, action.name, action.onAction)}
                                  disabled={action.disabled || isAnyLoading}
                                  className={`flex items-center justify-center gap-1 px-3 py-1.5 text-[10.5px] font-bold border border-[#262626] rounded-lg transition-all cursor-pointer ${
                                    isThisLoading
                                      ? 'bg-[#3b82f6] text-white cursor-not-allowed'
                                      : isThisDone
                                      ? 'bg-green-600 border-green-700 text-white cursor-not-allowed'
                                      : 'border-[#262626] bg-[#0a0a0a] hover:bg-[#141414] text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
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
                                        className={`flex items-center justify-center gap-1 px-2 py-1 text-[9.5px] font-bold rounded-none border border-[#262626] rounded-lg transition-all ${
                                          isOptLoading
                                            ? 'bg-[#3b82f6] text-white cursor-not-allowed shadow-none'
                                            : isOptDone
                                            ? 'bg-green-600 text-white cursor-not-allowed shadow-none'
                                            : isAnyLoading
                                            ? 'opacity-50 cursor-not-allowed bg-[#0a0a0a] text-gray-200 shadow-none'
                                            : opt.primary
                                            ? 'bg-pencil-black text-white hover:bg-pencil-black/90 cursor-pointer shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                                            : 'bg-[#0a0a0a] text-gray-200 hover:bg-[#141414] cursor-pointer shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
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
            <div className="p-4 border border-[#262626] bg-[#141414]/20 rounded-lg text-xs space-y-3 relative">
              {/* Tape decoration */}
              <div className="absolute -top-3 left-6 w-16 h-4 bg-pencil-black/10 border border-[#3f3f46] rotate-1 pointer-events-none" />
              <div>
                <span className="font-bold text-gray-200 font-outfit text-sm block">Background Application Manager</span>
                <p className="text-[11px] text-gray-400 mt-1">Select applications to automatically close when launching VALORANT. You can also forcefully close currently active applications immediately.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
                {Object.keys(purgeAppsChecklist).map(appKey => {
                  const isRunning = runningApps && runningApps[appKey];
                  const isChecked = !!purgeAppsChecklist[appKey];
                  
                  return (
                    <div 
                      key={appKey} 
                      className={`flex flex-col gap-2 p-3 border rounded-lg transition-all ${
                        isChecked ? 'border-pencil-black/50 bg-[#141414]/80 shadow-sm' : 'border-[#262626] bg-[#0a0a0a]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-pencil-black border-pencil-black' : 'border-[#3f3f46] bg-[#141414] group-hover:border-gray-400'
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={isChecked}
                            onChange={(e) => {
                              setPurgeAppsChecklist({ ...purgeAppsChecklist, [appKey]: e.target.checked });
                            }}
                          />
                          <span className="capitalize font-bold text-gray-200 font-outfit text-[12px]">{appKey}</span>
                        </label>
                        
                        {isRunning ? (
                          <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-500">
                            IDLE
                          </span>
                        )}
                      </div>
                      
                      {isRunning && (
                        <div className="pt-2 mt-auto border-t border-[#262626]">
                          <button
                            onClick={async () => {
                              if (window.api && window.api.killProcess) {
                                const exeName = appKey === 'onedrive' ? 'OneDrive.exe' : (appKey === 'battle.net' ? 'battle.net.exe' : `${appKey}.exe`);
                                await window.api.killProcess(exeName);
                              }
                            }}
                            className="w-full py-1.5 bg-[#ff4655]/10 hover:bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30 rounded-lg text-[10px] font-bold font-outfit transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            FORCE CLOSE NOW
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Auxiliary Panels (Takes 1 column) */}
        <div className="space-y-6">
          
          {/* Quick Telemetry & Scan Size Action */}
          <div className="border border-[#262626] bg-[#0a0a0a] p-4 rounded-lg shadow-md space-y-3.5 text-xs relative">
            {/* Post-it pin decoration */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#ff4655] border border-[#262626] shadow-sm" />
            
            <div className="flex justify-between items-center border-b-2 border-[#262626] pb-2">
              <div>
                <span className="font-bold text-gray-200 font-outfit">Diagnostics</span>
                {lastScannedAt && !scanningVal && (
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
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
                className={`flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-1 border border-[#262626] rounded-lg transition-all ${
                  scanningVal
                    ? 'bg-[#141414] text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#262626] text-gray-200 hover:bg-[#3f3f46] cursor-pointer shadow-sm active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none'
                }`}
              >
                {scanningVal ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-2 border border-[#262626] bg-[#141414]/20 rounded-lg space-y-1.5">
                <span className="font-bold text-gray-200 font-outfit block">Anticheat Diagnostics</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  <div className={`p-1.5 border border-[#262626] rounded-lg text-center ${vanguardHealth.secureBoot === 'enabled' ? 'bg-[#0a0a0a] text-[#3b82f6]' : 'bg-[#ff4655] text-white'}`}>
                    SecureBoot: {vanguardHealth.secureBoot.toUpperCase()}
                  </div>
                  <div className={`p-1.5 border border-[#262626] rounded-lg text-center ${vanguardHealth.tpm2 === 'active' ? 'bg-[#0a0a0a] text-[#3b82f6]' : 'bg-[#ff4655] text-white'}`}>
                    TPM: {vanguardHealth.tpm2.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-2 border border-[#262626] bg-[#141414]/20 rounded-lg space-y-1.5">
                <span className="font-bold text-gray-200 font-outfit block">Hardware Status</span>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between p-1 bg-[#0a0a0a] border border-[#262626] rounded-lg font-bold">
                    <span>RAM XMP</span>
                    <span className={hardwareInfo.xmpEnabled ? 'text-[#3b82f6] font-bold' : 'text-[#ff4655] font-bold'}>
                      {hardwareInfo.xmpEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between p-1 bg-[#0a0a0a] border border-[#262626] rounded-lg font-bold">
                    <span>PCIe ReBAR</span>
                    <span className={hardwareInfo.rebarEnabled ? 'text-[#3b82f6] font-bold' : 'text-gray-400 font-bold'}>
                      {hardwareInfo.rebarEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphics Settings Tuner (Standalone card) */}
          <div className="border border-[#262626] bg-[#262626] p-4 rounded-lg shadow-md space-y-4 text-xs relative">
            {/* Post-it pin decoration */}
            <div className="absolute -top-1.5 right-6 w-4 h-4 rounded-full bg-[#3b82f6] border border-[#262626] shadow-sm" />
            <h2 className="font-bold text-gray-200 font-outfit border-b-2 border-[#262626] pb-1.5 text-sm">Game Graphics Config</h2>
            
            {selectedConfig ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-gray-200 mb-1 text-[11px] font-outfit">
                    <div className="flex items-center gap-1">
                      <span>Resolution Quality Scale</span>
                      <div className="relative inline-block">
                        <button
                          onMouseEnter={() => setShowResTooltip(true)}
                          onMouseLeave={() => setShowResTooltip(false)}
                          onFocus={() => setShowResTooltip(true)}
                          onBlur={() => setShowResTooltip(false)}
                          className="w-4 h-4 rounded-full border border-[#262626] bg-[#0a0a0a] text-gray-200 text-[9px] font-bold flex items-center justify-center cursor-default"
                          tabIndex={0}
                          aria-label="What is Resolution Quality Scale?"
                        >
                          ?
                        </button>
                        {showResTooltip && (
                          <div className="absolute left-6 top-0 z-50 w-52 p-3 bg-pencil-black text-white text-[10px] leading-relaxed rounded-lg border border-white shadow-xl">
                            <div className="font-bold text-[11px] mb-1 font-outfit text-[#fff9c4]">What is Resolution Scale?</div>
                            <p>Renders the game at a percentage of native resolution and upscales it. Lower values boost FPS.</p>
                            <div className="mt-1.5 font-bold font-mono text-[9px]">
                              75–85% = Max Boost | 100% = Native
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-[#3b82f6] font-bold">{Math.round(selectedConfig.resolutionQuality)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={Math.round(selectedConfig.resolutionQuality)}
                    onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-pencil-black"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-0.5">
                    <span>50% (Max FPS)</span>
                    <span>100% (Native)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] font-outfit">Texture Quality</span>
                    <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg font-inter">
                      <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] font-outfit">Shadows</span>
                    <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg font-inter">
                      <option value="0">Low (Off)</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] font-outfit">Raw Input Buffer</span>
                    <select value={selectedConfig.rawInputBuffer ? 'true' : 'false'} onChange={(e) => saveValorantConfig({ rawInputBuffer: e.target.value === 'true' })} className="p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg font-inter">
                      <option value="true">On (Raw Input)</option><option value="false">Off</option>
                    </select>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-[#262626] pt-3 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-gray-200 font-outfit">Monitor Refresh Rate</span>
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
                        className="flex-1 p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg text-[11px] font-inter cursor-pointer"
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
                            className="w-16 p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
                          />
                          <button
                            onClick={() => {
                              const hz = parseInt(customRateValue, 10);
                              if (!isNaN(hz) && hz >= 24 && hz <= 999) {
                                applyFrameLimitSettings(frameLimitMode, hz);
                                setShowCustomRateInput(false);
                              }
                            }}
                            className="text-[10px] font-bold px-2 py-1 bg-pencil-black text-white rounded-lg cursor-pointer border border-[#262626]"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                    {!showCustomRateInput && (
                      <div className="text-[10px] text-gray-400 font-bold">
                        Active target: <span className="text-gray-200">{monitorRefreshRate} Hz</span>
                        {![60,144,240,360].includes(monitorRefreshRate) && (
                          <span className="ml-1 text-[#3b82f6] font-outfit">(custom)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button
                      onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)}
                      title="No frame cap — maximum FPS output"
                      className={`p-1.5 border border-[#262626] text-center rounded-lg transition-all cursor-pointer ${frameLimitMode === 'uncapped' ? 'bg-pencil-black text-white shadow-none' : 'bg-[#0a0a0a] text-gray-200 shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}
                    >
                      UNCAPPED
                    </button>
                    <button
                      onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)}
                      title={`Cap frames just below your ${monitorRefreshRate}Hz refresh rate to stabilize VRR/G-Sync/FreeSync`}
                      className={`p-1.5 border border-[#262626] text-center rounded-lg transition-all cursor-pointer ${frameLimitMode === 'vrr' ? 'bg-pencil-black text-white shadow-none' : 'bg-[#0a0a0a] text-gray-200 shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}
                    >
                      VRR CAP
                    </button>
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-bold">
                    {frameLimitMode === 'vrr'
                      ? `VRR target = ${Math.max(30, monitorRefreshRate - 3)} FPS (3 below refresh)`
                      : 'Uncapped = no limit config'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 italic text-[11px]">Profile not selected.</div>
            )}
          </div>

        </div>

      </div>

    </div>
    
    <ConfirmModal
      isOpen={confirmDialog.isOpen}
      title={confirmDialog.title}
      message={confirmDialog.message}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
}
