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
    executeOperation,
    optimizedCount,
    totalOptimizations,
    // New performance features
    networkLatencyOptimized,
    toggleNetworkLatency,
    nicInterruptModDisabled,
    toggleNicInterruptMod,
    cpuTopology,
    cpuAffinityActive,
    toggleCpuAffinity,
    visualEffectsStripped,
    toggleVisualEffects,
    defenderExcluded,
    toggleDefenderExclusion,
    focusAssistActive,
    toggleFocusAssist,
    scheduledTasksDisabled,
    toggleScheduledTasks,
    ultimatePerformanceActive,
    activateUltimatePerformance,
    deactivateUltimatePerformance
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('OS & Registry');
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
    },

    // --- New Performance Features ---
    {
      id: 'networkLatency',
      name: 'TCP/Nagle Latency Optimization',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'high',
      desc: 'Disables Nagle algorithm and delayed ACK for faster packets.',
      descDetailed: 'Sets TcpAckFrequency=1 and TCPNoDelay=1 on all active NICs to eliminate TCP buffering delays, reducing input-to-server latency by 5-15ms.',
      status: networkLatencyOptimized ? 'Optimized' : 'Default (Buffered)',
      isOptimized: networkLatencyOptimized === true,
      actionType: 'toggle',
      onAction: () => toggleNetworkLatency(!networkLatencyOptimized),
      actionLabel: networkLatencyOptimized ? 'Restore' : 'Optimize'
    },
    {
      id: 'nicInterruptMod',
      name: 'NIC Interrupt Moderation',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'medium',
      isAdvanced: true,
      desc: 'Disables NIC interrupt coalescing for lower network latency.',
      descDetailed: 'Disables interrupt moderation on network adapters so packets are processed immediately instead of being batched.',
      status: nicInterruptModDisabled ? 'Optimized (Disabled)' : 'Active (Enabled)',
      isOptimized: nicInterruptModDisabled === true,
      actionType: 'toggle',
      onAction: () => toggleNicInterruptMod(!nicInterruptModDisabled),
      actionLabel: nicInterruptModDisabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'cpuAffinity',
      name: 'CPU Core Affinity (P-Core Pinning)',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'high',
      desc: 'Pins VALORANT to performance cores on hybrid CPUs.',
      descDetailed: 'On Intel 12th+ gen hybrid CPUs, pins VALORANT threads to P-cores and moves OS overhead (DWM, audio) to E-cores for maximum single-thread performance.',
      status: cpuAffinityActive ? 'Pinned to P-Cores' : (cpuTopology.isHybrid ? 'All Cores (Default)' : 'Non-Hybrid CPU'),
      isOptimized: cpuAffinityActive === true,
      showIf: cpuTopology.isHybrid,
      actionType: 'toggle',
      onAction: () => toggleCpuAffinity(!cpuAffinityActive),
      actionLabel: cpuAffinityActive ? 'Restore' : 'Optimize'
    },
    {
      id: 'visualEffects',
      name: 'Windows Visual Effects Strip',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Disables desktop animations and transparency.',
      descDetailed: 'Strips Windows desktop visual effects (animations, transparency, Aero Peek, taskbar thumbnails) to reduce DWM composition overhead.',
      status: visualEffectsStripped ? 'Stripped (Performance)' : 'Default (Visual)',
      isOptimized: visualEffectsStripped === true,
      actionType: 'toggle',
      onAction: () => toggleVisualEffects(!visualEffectsStripped),
      actionLabel: visualEffectsStripped ? 'Restore' : 'Strip'
    },
    {
      id: 'defenderExclusion',
      name: 'Defender Exclusions (VALORANT)',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Excludes VALORANT from real-time antivirus scanning.',
      descDetailed: 'Adds Riot Games and VALORANT directories to Windows Defender exclusions to prevent real-time scanning I/O spikes during shader compilation.',
      status: defenderExcluded ? 'Excluded' : 'Not Excluded',
      isOptimized: defenderExcluded === true,
      actionType: 'toggle',
      onAction: () => toggleDefenderExclusion(!defenderExcluded),
      actionLabel: defenderExcluded ? 'Remove' : 'Add Exclusion'
    },
    {
      id: 'focusAssist',
      name: 'Focus Assist (Notification Suppression)',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'low',
      desc: 'Blocks all Windows notifications during gameplay.',
      descDetailed: 'Suppresses Windows toast notifications, sounds, and lock screen alerts to prevent DWM composition spikes during gameplay.',
      status: focusAssistActive ? 'Suppressed' : 'Active (Notifications On)',
      isOptimized: focusAssistActive === true,
      actionType: 'toggle',
      onAction: () => toggleFocusAssist(!focusAssistActive),
      actionLabel: focusAssistActive ? 'Restore' : 'Suppress'
    },
    {
      id: 'scheduledTasks',
      name: 'Telemetry Scheduled Task Cleanup',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'medium',
      desc: 'Disables Windows telemetry tasks that spike CPU.',
      descDetailed: 'Disables Compatibility Appraiser, CEIP, Disk Diagnostics, Error Reporting and other scheduled tasks that randomly spike CPU and disk during gameplay.',
      status: scheduledTasksDisabled ? 'Disabled' : 'Active',
      isOptimized: scheduledTasksDisabled === true,
      actionType: 'toggle',
      onAction: () => toggleScheduledTasks(!scheduledTasksDisabled),
      actionLabel: scheduledTasksDisabled ? 'Restore' : 'Disable'
    },
    {
      id: 'ultimatePerformance',
      name: 'Ultimate Performance Power Plan',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'high',
      desc: 'Activates the hidden Windows Ultimate Performance plan.',
      descDetailed: 'Imports and activates the hidden Ultimate Performance power plan which is more aggressive than High Performance — fully disables core parking, maximizes timer resolution, eliminates power-saving states. Auto-activates when you launch VALORANT.',
      status: ultimatePerformanceActive ? 'Active (Ultimate Performance)' : 'Inactive (High/Balanced)',
      isOptimized: ultimatePerformanceActive === true,
      actionType: 'toggle',
      onAction: () => ultimatePerformanceActive
        ? deactivateUltimatePerformance()
        : activateUltimatePerformance(),
      actionLabel: ultimatePerformanceActive ? 'Restore' : 'Activate'
    }
  ];

  // Filtering actions based on tab selection, search query and display rules
  const filteredActions = allActions.filter(action => {
    if (action.showIf === false) return false;
    
    // Advanced filtering
    if (!showAdvanced && action.isAdvanced) return false;
    
    // Tab filtering — activeTab is always a category name
    if (action.category !== activeTab) return false;
    
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
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden font-inter text-gray-200 bg-[#0a0a0a]">
      
      {/* ── Sticky Header Zone ── */}
      <div className="shrink-0 border-b border-[#262626] bg-[#0a0a0a]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <h1 className="text-lg font-bold font-outfit text-white">Advanced Tweaks</h1>
            <p className="text-[11px] text-gray-500">Low-level system modifications for maximum gaming performance.</p>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            {!valorantRunning ? (
              <button 
                onClick={launchValorant}
                className="px-3.5 py-2 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white font-outfit rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer text-[11px]"
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
                  className="border border-[#262626] px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#262626] cursor-pointer text-gray-300 font-semibold text-[11px]"
                >
                  Simulate Exit
                </button>
              )
            )}
            <span className={`px-2.5 py-1.5 border rounded-lg font-semibold text-[11px] ${valorantRunning ? 'border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#262626] bg-[#141414] text-gray-500'}`}>
              {valorantRunning ? '● VALORANT ACTIVE' : '○ VALORANT IDLE'}
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-4 md:px-6 pb-3 overflow-x-auto scrollbar-hide">
          {['OS & Registry', 'GPU & Monitor', 'Caches & Cleaners', 'Launch Policies'].map(cat => {
            const catCount = allActions.filter(a => a.category === cat && a.showIf !== false && a.isOptimized).length;
            const catTotal = allActions.filter(a => a.category === cat && a.showIf !== false).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[12px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === cat 
                    ? 'bg-[#1a1a1a] text-white border border-[#3f3f46]'
                    : 'text-gray-400 hover:bg-[#141414] hover:text-gray-300 border border-transparent'
                }`}
              >
                {cat}
                {catCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#3b82f6]/15 text-[#3b82f6]">
                    {catCount}/{catTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="px-4 md:px-6 py-4 space-y-4">

          {/* Tweak Cards */}
          <div className="border border-[#262626] rounded-xl bg-[#141414]/30 overflow-hidden">
            <div className="divide-y divide-[#262626]/60">
              {allActions.filter(action => action.category === activeTab).map((action) => {
                if (action.showIf === false) return null;

                const isThisLoading = processingActionId === action.id;
                const isAnyLoading = processingActionId !== null;

                return (
                  <div key={action.id} className="px-4 md:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#141414]/60 transition-colors">
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[13px] text-gray-200">{action.name}</span>
                        {action.tier === 'aggressive' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20">
                            Aggressive
                          </span>
                        )}
                        {action.tier === 'experimental' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            Experimental
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{action.desc}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${action.isOptimized ? 'text-[#3b82f6]' : 'text-gray-600'}`}>
                        {isThisLoading ? '...' : action.isOptimized ? 'On' : 'Off'}
                      </span>
                      
                      {action.actionType === 'toggle' && (
                        <button
                          onClick={() => runAction(action.id, action.name, action.onAction)}
                          disabled={isAnyLoading}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            action.isOptimized ? 'bg-[#3b82f6]' : 'bg-[#262626]'
                          } ${isAnyLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            action.isOptimized ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          }`} />
                        </button>
                      )}

                      {action.actionType === 'action' && (
                        <button
                          onClick={() => runAction(action.id, action.name, action.onAction)}
                          disabled={action.disabled || isAnyLoading}
                          className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#262626] text-white text-[11px] font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#262626]"
                        >
                          {isThisLoading ? <Spinner className="w-3.5 h-3.5" /> : action.actionLabel}
                        </button>
                      )}

                      {action.actionType === 'multiple' && (
                        <div className="flex gap-1.5">
                          {action.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => runAction(`${action.id}-${oIdx}`, opt.label, opt.onClick)}
                              disabled={isAnyLoading}
                              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer border ${
                                opt.primary 
                                  ? 'bg-[#1a1a1a] border-[#3f3f46] text-white hover:bg-[#262626]' 
                                  : 'bg-transparent border-[#262626] text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                              } disabled:opacity-40`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Checklist sub-options for Background App Purging */}
          {optimizationOptions.purgeApps && activeTab === 'Launch Policies' && (
            <div className="p-4 border border-[#262626] bg-[#141414]/30 rounded-xl text-xs space-y-3">
              <div>
                <span className="font-bold text-gray-200 font-outfit text-sm block">Background App Manager</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Auto-close these apps when VALORANT launches. Currently running apps shown below.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {Object.keys(purgeAppsChecklist).filter(appKey => runningApps && runningApps[appKey]).length === 0 ? (
                  <div className="col-span-full p-3 border border-dashed border-[#262626] rounded-lg text-center text-gray-500 text-xs">
                    No managed applications are currently running.
                  </div>
                ) : (
                  Object.keys(purgeAppsChecklist)
                    .filter(appKey => runningApps && runningApps[appKey])
                    .map(appKey => {
                      const isChecked = !!purgeAppsChecklist[appKey];
                      
                      return (
                    <div 
                      key={appKey} 
                      className={`flex items-center justify-between p-2.5 border rounded-lg transition-all ${
                        isChecked ? 'border-[#3b82f6]/30 bg-[#3b82f6]/5' : 'border-[#262626] bg-[#0a0a0a]'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input 
                          type="checkbox" 
                          className="accent-[#3b82f6] w-3.5 h-3.5"
                          checked={isChecked}
                          onChange={(e) => {
                            setPurgeAppsChecklist({ ...purgeAppsChecklist, [appKey]: e.target.checked });
                          }}
                        />
                        <span className="capitalize font-semibold text-[11px] text-gray-200 truncate">{appKey}</span>
                      </label>
                      
                      <button
                        onClick={async () => {
                          if (window.api && window.api.killProcess) {
                            const exeName = appKey === 'onedrive' ? 'OneDrive.exe' : (appKey === 'battle.net' ? 'battle.net.exe' : `${appKey}.exe`);
                            await window.api.killProcess(exeName);
                          }
                        }}
                        className="text-[9px] font-bold text-[#ff4655] hover:text-[#ff4655]/80 shrink-0 ml-2"
                        title={`Kill ${appKey}`}
                      >
                        KILL
                      </button>
                    </div>
                  );
                }))}
              </div>
            </div>
          )}

          {/* ── Diagnostics & Graphics (Inline Cards) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Diagnostics Panel */}
            <div className="border border-[#262626] bg-[#141414]/30 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-200 font-outfit text-sm">Diagnostics</span>
                <button
                  onClick={async () => {
                    await Promise.all([scanValorantCaches(), checkVanguardHealth()]);
                    setLastScannedAt(new Date().toLocaleTimeString());
                  }}
                  disabled={scanningVal}
                  className="text-[10px] font-semibold px-2.5 py-1 border border-[#262626] rounded-lg bg-[#1a1a1a] text-gray-300 hover:bg-[#262626] transition-all disabled:opacity-50"
                >
                  {scanningVal ? 'Scanning...' : 'Scan Now'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 border border-[#262626] rounded-lg text-center text-[10px] font-semibold ${vanguardHealth.secureBoot === 'enabled' ? 'text-[#3b82f6]' : 'text-[#ff4655]'}`}>
                  SecureBoot: {vanguardHealth.secureBoot.toUpperCase()}
                </div>
                <div className={`p-2 border border-[#262626] rounded-lg text-center text-[10px] font-semibold ${vanguardHealth.tpm2 === 'active' ? 'text-[#3b82f6]' : 'text-[#ff4655]'}`}>
                  TPM: {vanguardHealth.tpm2.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex justify-between p-2 bg-[#0a0a0a] border border-[#262626] rounded-lg font-semibold">
                  <span className="text-gray-400">XMP</span>
                  <span className={hardwareInfo.xmpEnabled ? 'text-[#3b82f6]' : 'text-[#ff4655]'}>{hardwareInfo.xmpEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0a0a0a] border border-[#262626] rounded-lg font-semibold">
                  <span className="text-gray-400">ReBAR</span>
                  <span className={hardwareInfo.rebarEnabled ? 'text-[#3b82f6]' : 'text-gray-500'}>{hardwareInfo.rebarEnabled ? 'ON' : 'OFF'}</span>
                </div>
              </div>

              {lastScannedAt && !scanningVal && (
                <div className="text-[10px] text-gray-500">Last scan: {lastScannedAt}</div>
              )}
            </div>

            {/* Graphics Config Panel */}
            <div className="border border-[#262626] bg-[#141414]/30 p-4 rounded-xl space-y-3 text-xs">
              <h2 className="font-bold text-gray-200 font-outfit text-sm">Game Graphics</h2>
              
              {selectedConfig ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-semibold text-[11px] mb-1">
                      <span className="text-gray-300">Resolution Scale</span>
                      <span className="text-[#3b82f6] font-mono">{Math.round(selectedConfig.resolutionQuality)}%</span>
                    </div>
                    <input
                      type="range" min="50" max="100"
                      value={Math.round(selectedConfig.resolutionQuality)}
                      onChange={(e) => saveValorantConfig({ resolutionQuality: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer accent-[#3b82f6] h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
                      <span>50% (FPS)</span><span>100% (Native)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 font-semibold uppercase font-outfit">Textures</span>
                      <select value={selectedConfig.textureQuality} onChange={(e) => saveValorantConfig({ textureQuality: parseInt(e.target.value, 10) })} className="p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg text-[11px]">
                        <option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 font-semibold uppercase font-outfit">Shadows</span>
                      <select value={selectedConfig.shadowQuality} onChange={(e) => saveValorantConfig({ shadowQuality: parseInt(e.target.value, 10) })} className="p-1.5 border border-[#262626] bg-[#0a0a0a] rounded-lg text-[11px]">
                        <option value="0">Low (Off)</option><option value="1">Medium</option><option value="2">High</option><option value="3">Ultra</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                    <button
                      onClick={() => applyFrameLimitSettings('uncapped', monitorRefreshRate)}
                      className={`p-1.5 border border-[#262626] text-center rounded-lg transition-all cursor-pointer ${frameLimitMode === 'uncapped' ? 'bg-[#1a1a1a] text-white' : 'bg-[#0a0a0a] text-gray-400 hover:text-white'}`}
                    >
                      UNCAPPED
                    </button>
                    <button
                      onClick={() => applyFrameLimitSettings('vrr', monitorRefreshRate)}
                      className={`p-1.5 border border-[#262626] text-center rounded-lg transition-all cursor-pointer ${frameLimitMode === 'vrr' ? 'bg-[#1a1a1a] text-white' : 'bg-[#0a0a0a] text-gray-400 hover:text-white'}`}
                    >
                      VRR CAP ({Math.max(30, monitorRefreshRate - 3)})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-[11px]">No VALORANT config detected.</div>
              )}
            </div>

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
