import React, { useState, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Spinner from './Spinner';
import ConfirmModal from './ConfirmModal';

export default function ValorantOptimizer() {
  const {
    isElectron,
    valorantPath,
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
    optimizationOptions,
    setOptimizationOptions,
    purgeAppsChecklist,
    setPurgeAppsChecklist,
    runningApps,
    selectedConfig,
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
    gsyncDisabled,
    toggleGsync,
    freesyncEnabled,
    toggleFreesync,
    gpuInfo,
    persistentPriorityEnabled,
    togglePersistentPriority,
    vbsStatus,
    toggleVbs,
    hpetDisabled,
    toggleHpet,
    amdOptimizations,
    toggleAmdMpo,
    toggleAmdLegacyDx,
    toggleAmdShaderCache,
    gpuDriverProfile,
    applyGpuDriverProfile,
    hardwareInfo,
    toggleLegacyRebar,
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
    deactivateUltimatePerformance,
    symmetricPriorityActive,
    toggleSymmetricPriority,
    electronIgpuIsolated,
    toggleElectronIgpu,
    intelGmmAllocated,
    toggleIntelGmm,
    optimizeElectronShortcuts,
    applyCompetitiveRenderConfig,
    pageFileOptimized,
    togglePagefile,
    autoStandbyCleanerActive,
    toggleStandbyCleaner,
    explorerTerminated,
    toggleExplorer
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('OS & Registry');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for LCU and Overlay
  const [lcuConnected, setLcuConnected] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

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
  
  // Custom refresh rate
      
  // Per-action loading tracking
  const [processingActionId, setProcessingActionId] = useState(null);
  
  // Wraps executeOperation with per-action loading state + success flash
  const runAction = async (actionId, label, fn) => {
    if (processingActionId) return; // already running
    setProcessingActionId(actionId);
    try {
      await executeOperation(label, fn);
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleToggleLcu = async () => {
    if (!window.api) return;
    const nextState = !lcuConnected;
    if (nextState) {
      const res = await window.api.valorantConnectLcu();
      if (res && res.success) {
        setLcuConnected(true);
      }
    } else {
      await window.api.valorantDisconnectLcu();
      setLcuConnected(false);
    }
  };

  const handleToggleOverlay = async () => {
    if (!window.api) return;
    const nextState = !overlayActive;
    await window.api.valorantToggleOverlay(nextState);
    setOverlayActive(nextState);
  };



  
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
      descDetailed: 'Instructs Windows thread scheduler to prioritize VALORANT game threads. (Note: Can conflict with Symmetric Priority Engine)',
      status: persistentPriorityEnabled ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: persistentPriorityEnabled === true,
      actionType: 'toggle',
      onAction: () => togglePersistentPriority(!persistentPriorityEnabled),
      actionLabel: persistentPriorityEnabled ? 'Restore' : 'Optimize'
    },
    {
      id: 'symmetricPriority',
      name: 'Symmetric Priority Engine',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'high',
      desc: 'Re-balances thread scheduling for VALORANT/Vanguard.',
      descDetailed: 'Sets VALORANT and Electron apps to Normal priority and Vanguard (vgc.exe) to Low/Idle to prevent CPU starvation.',
      status: symmetricPriorityActive ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: symmetricPriorityActive === true,
      actionType: 'toggle',
      onAction: () => toggleSymmetricPriority(!symmetricPriorityActive),
      actionLabel: symmetricPriorityActive ? 'Restore' : 'Optimize'
    },
    {
      id: 'electronIgpu',
      name: 'Electron GPU Isolation',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'medium',
      desc: 'Forces Discord/Spotify to use iGPU.',
      descDetailed: 'Creates DirectX UserGpuPreferences to force hardware-accelerated Electron apps (Discord, Spotify) onto the integrated graphics (iGPU), freeing up the dGPU for VALORANT.',
      status: electronIgpuIsolated ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: electronIgpuIsolated === true,
      actionType: 'toggle',
      onAction: () => toggleElectronIgpu(!electronIgpuIsolated),
      actionLabel: electronIgpuIsolated ? 'Restore' : 'Optimize'
    },
    {
      id: 'intelGmm',
      name: 'Intel GMM VRAM Allocation',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'low',
      desc: 'Pre-allocates iGPU memory.',
      descDetailed: 'Sets DedicatedSegmentSize=1024 for Intel Integrated Graphics to prevent Dynamic Memory Management (DMM) from stealing system RAM while gaming.',
      status: intelGmmAllocated ? 'Optimized' : 'Active (Unoptimized)',
      isOptimized: intelGmmAllocated === true,
      actionType: 'toggle',
      onAction: () => toggleIntelGmm(!intelGmmAllocated),
      actionLabel: intelGmmAllocated ? 'Restore' : 'Optimize'
    },
    {
      id: 'electronShortcuts',
      name: 'Electron App Shortcut Tuner',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'high',
      desc: 'Injects bypass flags into Discord/Spotify shortcuts.',
      descDetailed: 'Modifies desktop and start menu shortcuts for Discord and Spotify to inject --disable-renderer-backgrounding and memory limits, bypassing aggressive Chrome suspension.',
      status: 'Ready',
      isOptimized: false,
      actionType: 'action',
      onAction: optimizeElectronShortcuts,
      actionLabel: 'Optimize Shortcuts'
    },
    {
      id: 'pagefile',
      name: 'Virtual Memory (Static Pagefile)',
      category: 'OS & Registry',
      tier: 'safe',
      impact: 'medium',
      desc: 'Locks pagefile size to 1.5x physical RAM.',
      descDetailed: 'Locks the Windows virtual memory pagefile to 1.5x physical RAM to prevent dynamic resizing disk I/O stutters.',
      status: pageFileOptimized ? 'Optimized (Static)' : 'System Managed',
      isOptimized: pageFileOptimized === true,
      actionType: 'toggle',
      onAction: () => togglePagefile(!pageFileOptimized),
      actionLabel: pageFileOptimized ? 'Restore' : 'Optimize'
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
    {
      id: 'standbyCleaner',
      name: 'Automated Standby Cache Management',
      category: 'Caches & Cleaners',
      tier: 'safe',
      impact: 'high',
      desc: 'Automatically purges standby memory list in the background.',
      descDetailed: 'Runs a background loop (like ISLC) to purge the standby memory list and force garbage collection, maintaining ultra-low scheduling latency.',
      status: autoStandbyCleanerActive ? 'Active (Running)' : 'Inactive',
      isOptimized: autoStandbyCleanerActive === true,
      actionType: 'toggle',
      onAction: () => toggleStandbyCleaner(!autoStandbyCleanerActive),
      actionLabel: autoStandbyCleanerActive ? 'Stop' : 'Start'
    },

    {
      id: 'competitiveRender',
      name: 'Apply Competitive Render Config',
      category: 'Caches & Cleaners',
      tier: 'safe',
      impact: 'high',
      desc: 'Edits GameUserSettings.ini for 80% res scaling and nullified scalability.',
      descDetailed: 'Applies 80% internal resolution scaling, strips out all visual bloat, and enables raw input buffer for maximum framerate and lowest latency.',
      status: 'Ready to Apply',
      isOptimized: false,
      actionType: 'action',
      onAction: applyCompetitiveRenderConfig,
      actionLabel: 'Apply Config'
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
      id: 'explorerTerminate',
      name: 'Explorer.exe Termination (Cortex Mode)',
      category: 'Launch Policies',
      tier: 'aggressive',
      impact: 'high',
      desc: 'Terminates the Windows UI (taskbar, desktop) for maximum FPS.',
      descDetailed: 'Forcefully terminates explorer.exe. This completely removes the Windows UI, taskbar, and desktop rendering, freeing up CPU cycles and removing DWM composition overhead. Your screen will be blank except for the game. (You can restart it when finished).',
      status: explorerTerminated ? 'Terminated (Cortex Mode Active)' : 'Active (Windows UI Running)',
      isOptimized: explorerTerminated === true,
      actionType: 'toggle',
      onAction: () => toggleExplorer(!explorerTerminated),
      actionLabel: explorerTerminated ? 'Restart Explorer' : 'Terminate Explorer'
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
    },
    {
      id: 'lcuTelemetry',
      name: 'Vanguard Compliant LCU Telemetry',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'low',
      desc: 'Connects to VALORANT local server for live match stats.',
      descDetailed: 'Parses lockfile and connects to VALORANT local server via secure WebSockets to get real-time game state telemetry.',
      status: lcuConnected ? 'Connected' : 'Disconnected',
      isOptimized: lcuConnected === true,
      actionType: 'toggle',
      onAction: handleToggleLcu,
      actionLabel: lcuConnected ? 'Disconnect' : 'Connect'
    },
    {
      id: 'overlayHUD',
      name: 'Tactical Overlay HUD',
      category: 'Launch Policies',
      tier: 'safe',
      impact: 'low',
      desc: 'Enables a transparent in-game overlay for telemetry.',
      descDetailed: 'Creates a transparent click-through window that renders live stats over the game without hooking DirectX.',
      status: overlayActive ? 'Active' : 'Inactive',
      isOptimized: overlayActive === true,
      actionType: 'toggle',
      onAction: handleToggleOverlay,
      actionLabel: overlayActive ? 'Hide Overlay' : 'Show Overlay'
    }
  ];

  // Filter helper used by both tab counts and render
  const filterAction = (action) => {
    if (action.showIf === false) return false;
    if (!showAdvanced && action.isAdvanced) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = action.name.toLowerCase().includes(query);
      const descMatch = (action.descDetailed || action.desc).toLowerCase().includes(query);
      const catMatch = action.category.toLowerCase().includes(query);
      if (!nameMatch && !descMatch && !catMatch) return false;
    }
    return true;
  };

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

        {/* Search + Advanced Toggle */}
        <div className="flex items-center gap-3 px-4 md:px-6 pb-2">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search tweaks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
              showAdvanced 
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]' 
                : 'bg-[#141414] border-[#262626] text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            {showAdvanced ? 'Advanced: ON' : 'Advanced: OFF'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-4 md:px-6 pb-3 overflow-x-auto scrollbar-hide">
          {['OS & Registry', 'GPU & Monitor', 'Caches & Cleaners', 'Launch Policies'].map(cat => {
            const catActions = allActions.filter(a => a.category === cat && filterAction(a));
            const catCount = catActions.filter(a => a.isOptimized).length;
            const catTotal = catActions.length;
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
              {allActions.filter(action => action.category === activeTab && filterAction(action)).map((action) => {

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
