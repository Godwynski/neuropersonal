import React, { createContext, useState, useEffect, useRef } from 'react';

export const AppContext = createContext();

// Format Helper
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Premade 1-Click Macros List
export const premadeMacros = [
  { key: 'm-dns', name: 'Flush DNS Cache', desc: 'Refreshes address lookup table for faster network requests.', cmd: 'ipconfig /flushdns' },
  { key: 'm-ram', name: 'Purge Memory Heap', desc: 'Runs garbage collector sweeps to clear unused memory blocks.', cmd: 'powershell -Command "[System.GC]::Collect()"' },
  { key: 'm-explorer', name: 'Restart Desktop UI', desc: 'Restores frozen Windows taskbars by restarting explorer.exe.', cmd: 'taskkill /f /im explorer.exe && start explorer.exe' }
];

export function AppProvider({ children }) {
  const [isElectron, setIsElectron] = useState(!!window.api);

  const [systemLogs, setSystemLogs] = useState([
    'NeurOptimize Engine Active...',
    'System monitoring hooks established.'
  ]);

  // CPU/RAM Stats
  const [stats, setStats] = useState({
    platform: 'loading...',
    arch: '...',
    hostname: '...',
    cpuModel: 'Querying CPU details...',
    cpuCores: 0,
    cpuLoad: 0,
    totalMemGB: '0.00',
    freeMemGB: '0.00',
    usedMemGB: '0.00',
    memUsagePercent: 0
  });

  // Storage Tweak State
  const [tempFolderSize, setTempFolderSize] = useState('Click Scan');
  const [scanningTemp, setScanningTemp] = useState(false);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [defragSectors, setDefragSectors] = useState([]);
  const [files, setFiles] = useState([]);
  const [tweaks, setTweaks] = useState({
    darkMode: true,
    hiddenFiles: false,
    taskbarAutohide: false
  });

  // Premade 1-Click Macros State
  const [runningMacro, setRunningMacro] = useState(null);

  // Window Focus Detection
  const [isWindowVisible, setIsWindowVisible] = useState(true);

  // Diagnostic Fixes state
  const [runningFix, setRunningFix] = useState(null);
  const [fixStatusText, setFixStatusText] = useState('');

  // Valorant Optimizer State
  const [valorantRunning, setValorantRunning] = useState(false);
  const [autoBoostActive, setAutoBoostActive] = useState(true);
  const [gameModeActive, setGameModeActive] = useState(false);
  const [powerPlanMode, setPowerPlanMode] = useState('balanced');
  const [valorantLogsSize, setValorantLogsSize] = useState('Click Scan');
  const [shaderCacheSize, setShaderCacheSize] = useState('Click Scan');
  const [scanningVal, setScanningVal] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);
  const [cleaningShaders, setCleaningShaders] = useState(false);

  // Deep Performance Optimizer States
  const [deepOptimizeActive, setDeepOptimizeActive] = useState(false);
  const [optimizationOptions, setOptimizationOptions] = useState({
    pauseUpdates: true,
    purgeApps: true
  });
  const [revertQueue, setRevertQueue] = useState([]);
  const [purgeAppsChecklist, setPurgeAppsChecklist] = useState({
    chrome: true,
    msedge: false,
    spotify: true,
    discord: false,
    steam: false,
    onedrive: true
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [valorantConfigs, setValorantConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [registryStates, setRegistryStates] = useState({
    hagsEnabled: false,
    gameDvrDisabled: false,
    priorityOptimized: false
  });
  const [latencyTweaks, setLatencyTweaks] = useState({
    disableMouseAccel: false,
    disableUsbSuspend: false,
    disableCoreParking: false,
    disableDynamicTick: false,
    disableFullscreenOpt: false,
    prioritySeparation: false
  });
  const [monitorRefreshRate, setMonitorRefreshRate] = useState(240);
  const [frameLimitMode, setFrameLimitMode] = useState('uncapped');
  const [gsyncDisabled, setGsyncDisabled] = useState(false);
  const [freesyncEnabled, setFreesyncEnabled] = useState(false);
  const [vanguardHealth, setVanguardHealth] = useState({
    secureBoot: 'unknown',
    tpm2: 'unknown',
    vpnActive: false,
    gpuDriverWarning: false,
    csmDisabled: 'unknown',
    flaggedDrivers: []
  });
  const [bgServices, setBgServices] = useState({
    SysMain: true,
    XblAuthManager: true
  });
  const [timerResActive, setTimerResActive] = useState(false);
  const [valorantPath, setValorantPath] = useState('C:\\Riot Games\\VALORANT\\live\\ShooterGame\\Binaries\\Win64\\VALORANT-Win64-Shipping.exe');
  const [valorantPathDetected, setValorantPathDetected] = useState(false);

  // GPU Info State
  const [gpuInfo, setGpuInfo] = useState({ vendor: 'unknown', name: 'Detecting...', driverVersion: '', vramMB: 0, temperature: 0, utilization: 0, refreshRate: 0 });

  // New FPS Optimization States
  const [nicPowerSavingDisabled, setNicPowerSavingDisabled] = useState(false);
  const [globalFsoDisabled, setGlobalFsoDisabled] = useState(false);
  const [powerThrottlingDisabled, setPowerThrottlingDisabled] = useState(false);

  // EXTREME-LEVEL TWEAKS
  const [msiEnabled, setMsiEnabled] = useState(false);

  // Persistent Priority State
  const [persistentPriorityEnabled, setPersistentPriorityEnabled] = useState(false);

  // Feature 1: VBS & Core Isolation State
  const [vbsStatus, setVbsStatus] = useState({
    vbsEnabled: false,
    memoryIntegrity: false,
    vmPlatform: 'unknown',
    hypervisorPlatform: 'unknown'
  });
  const [vbsRebootRequired, setVbsRebootRequired] = useState(false);

  // Feature 2: HPET Override State
  const [hpetDisabled, setHpetDisabled] = useState(false);
  const [hpetRebootRequired, setHpetRebootRequired] = useState(false);

  // Feature 3: AMD DXNavi & MPO State
  const [amdOptimizations, setAmdOptimizations] = useState({
    mpoDisabled: false,
    legacyDxPath: false,
    shaderCacheAlwaysOn: false
  });

  // Feature 4: GPU Driver Profile State
  const [gpuDriverProfile, setGpuDriverProfile] = useState({
    powerMaxPerformance: false,
    lowLatencyUltra: false,
    threadedOptimization: false,
    antiLagEnabled: false,
    textureFilterPerformance: false,
    radeonChillDisabled: false,
    radeonBoostDisabled: false
  });

  // Feature 5: Hardware Bottleneck State
  const [hardwareInfo, setHardwareInfo] = useState({
    ramModules: [],
    xmpEnabled: false,
    rebarEnabled: false,
    isLegacyAmdGpu: false,
    legacyRebarForced: false
  });

  // One-Click Performance Booster State
  const [maxBoostActive, setMaxBoostActive] = useState(false);
  const [maxBoostProgress, setMaxBoostProgress] = useState(0);
  const [maxBoostStatus, setMaxBoostStatus] = useState('idle'); // 'idle' | 'boosting' | 'reverting' | 'active'
  const [boostProfile, setBoostProfile] = useState('safe'); // 'safe' | 'aggressive'

  // Toast Notifications
  const [toasts, setToasts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Registry Rollback State & Actions
  const [registryBackups, setRegistryBackups] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const loadRegistryBackups = async () => {
    if (window.api && window.api.getRegistryBackups) {
      const res = await window.api.getRegistryBackups();
      if (res.success) {
        setRegistryBackups(res.backups || []);
      }
    }
  };

  const restoreBackup = async (index) => {
    if (window.api && window.api.restoreRegistryBackup) {
      const res = await window.api.restoreRegistryBackup(index);
      if (res.success) {
        addToast('Registry value restored successfully!', 'success');
        await loadRegistryBackups();
        await checkRegistryStates();
        await checkLatencyRegistryStates();
      } else {
        addToast(`Restore failed: ${res.error}`, 'error');
      }
    }
  };

  const deleteBackup = async (index) => {
    if (window.api && window.api.deleteRegistryBackup) {
      const res = await window.api.deleteRegistryBackup(index);
      if (res.success) {
        addToast('Backup entry deleted', 'success');
        await loadRegistryBackups();
      } else {
        addToast(`Delete failed: ${res.error}`, 'error');
      }
    }
  };

  const clearAllBackups = async () => {
    if (window.api && window.api.clearAllRegistryBackups) {
      const res = await window.api.clearAllRegistryBackups();
      if (res.success) {
        addToast('All registry backups cleared', 'success');
        await loadRegistryBackups();
      } else {
        addToast(`Failed to clear backups: ${res.error}`, 'error');
      }
    }
  };

  const checkRegistryStates = async () => {
    if (!window.api) {
      setRegistryStates({
        hagsEnabled: true,
        gameDvrDisabled: true,
        priorityOptimized: true
      });
      return;
    }
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setRegistryStates({
          hagsEnabled: res.status.hagsEnabled,
          gameDvrDisabled: res.status.gameDvrDisabled,
          priorityOptimized: res.status.priorityOptimized
        });
        setMsiEnabled(res.status.msiEnabled);
      }
    } catch (e) {
      console.error('Error checking registry states:', e);
    }
  };

  const toggleHags = async (enable) => {
    setSystemLogs(prev => [...prev, `[Registry Tweak] HAGS key value toggled...`].slice(-200));
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('hags', enable);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Registry Tweak] HAGS ${enable ? 'Enabled' : 'Disabled'}. reboot required.`].slice(-200));
        setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
      } else {
        setSystemLogs(prev => [...prev, `[Registry Tweak Error] HAGS failed: ${res.error || 'Access Denied'}`].slice(-200));
      }
    } else {
      setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
    }
  };

  const toggleGameDvr = async (disable) => {
    setSystemLogs(prev => [...prev, `[Registry Tweak] Game DVR status toggle...`].slice(-200));
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('gameDvr', disable);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Registry Tweak] Game DVR ${disable ? 'Disabled' : 'Enabled'}.`].slice(-200));
        setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
      }
    } else {
      setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
    }
  };

  const togglePriorityOptimized = async (enable) => {
    setSystemLogs(prev => [...prev, `[Registry Tweak] Multimedia priority parameters toggled...`].slice(-200));
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('priorityOptimized', enable);
      if (res.success) {
        setRegistryStates(prev => ({ ...prev, priorityOptimized: enable }));
      }
    } else {
      setRegistryStates(prev => ({ ...prev, priorityOptimized: enable }));
    }
  };

  const loadValorantConfigs = async () => {
    if (window.api) {
      try {
        const res = await window.api.getValorantConfigs();
        if (res.success && res.configs.length > 0) {
          const configsWithVsyncOff = res.configs.map(c => ({ ...c, vsync: false }));
          setValorantConfigs(configsWithVsyncOff);
          setSelectedConfig(configsWithVsyncOff[0]);
        }
      } catch (e) {
        console.error('Error loading Valorant configs:', e);
      }
    } else {
      const mockConfigs = [
        {
          filePath: 'C:\\Users\\kuyag\\AppData\\Local\\VALORANT\\Saved\\Config\\8cfcfa2c-5678-5e83-9b2f-7c15ba829281-ap\\Windows\\GameUserSettings.ini',
          accountId: '8cfcfa2c-5678-5e83-9b2f',
          resolutionQuality: 100,
          textureQuality: 3,
          shadowQuality: 3,
          effectsQuality: 3,
          antiAliasingQuality: 3,
          postProcessQuality: 3,
          viewDistanceQuality: 3,
          shadingQuality: 3,
          vsync: false
        }
      ];
      setValorantConfigs(mockConfigs);
      setSelectedConfig(mockConfigs[0]);
    }
  };

  const saveValorantConfig = async (updatedSettings) => {
    if (!selectedConfig) return;
    const settingsWithVsyncOff = { ...updatedSettings, vsync: false };
    const newConfig = { ...selectedConfig, ...settingsWithVsyncOff };
    
    setValorantConfigs(prev => prev.map(c => c.filePath === selectedConfig.filePath ? newConfig : c));
    setSelectedConfig(newConfig);

    if (window.api) {
      try {
        const res = await window.api.saveValorantConfig(selectedConfig.filePath, settingsWithVsyncOff);
        if (res.success) {
          setSystemLogs(prev => [...prev, `[Config] Saved settings for client ${selectedConfig.accountId}`].slice(-200));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const applyTournamentPreset = async () => {
    if (!selectedConfig) return;
    const preset = {
      resolutionQuality: 100,
      textureQuality: 0,
      shadowQuality: 0,
      effectsQuality: 0,
      antiAliasingQuality: 0,
      postProcessQuality: 0,
      viewDistanceQuality: 0,
      shadingQuality: 0,
      vsync: false
    };
    await saveValorantConfig(preset);
  };

  const checkLatencyRegistryStates = async () => {
    if (!window.api) {
      setLatencyTweaks({
        disableMouseAccel: true,
        disableUsbSuspend: true,
        disableCoreParking: true,
        disableDynamicTick: true,
        disableFullscreenOpt: true,
        prioritySeparation: true
      });
      return;
    }
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setLatencyTweaks({
          disableMouseAccel: res.status.disableMouseAccel,
          disableUsbSuspend: res.status.disableUsbSuspend,
          disableCoreParking: res.status.disableCoreParking,
          disableDynamicTick: res.status.disableDynamicTick,
          disableFullscreenOpt: res.status.disableFullscreenOpt,
          prioritySeparation: res.status.prioritySeparation
        });
      }
    } catch (e) {
      console.error('Error checking latency registry states:', e);
    }
  };

  const toggleLatencyTweak = async (tweakName, active) => {
    setSystemLogs(prev => [...prev, `[Latency] Set ${tweakName} to ${active}...`].slice(-200));
    if (!window.api || !window.api.setDashboardTweak) {
      setLatencyTweaks(prev => ({ ...prev, [tweakName]: active }));
      return;
    }
    try {
      const res = await window.api.setDashboardTweak(tweakName, active, { gamePath: valorantPath });
      if (res.success) {
        setLatencyTweaks(prev => ({ ...prev, [tweakName]: active }));
      } else {
        setSystemLogs(prev => [...prev, `[Latency Error] Failed to update ${tweakName}.`].slice(-200));
      }
    } catch (e) {
      console.error(e);
      setSystemLogs(prev => [...prev, `[Latency Exception] ${e.message}`].slice(-200));
    }
  };

  const applyFrameLimitSettings = async (mode, hz) => {
    setFrameLimitMode(mode);
    setMonitorRefreshRate(hz);
    if (!selectedConfig) return;

    let limit = 0;
    if (mode === 'vrr') {
      limit = Math.max(30, hz - 3);
    } else if (mode === 'uncapped') {
      limit = 0;
    } else {
      return;
    }

    const updatedSettings = {
      resolutionQuality: selectedConfig.resolutionQuality,
      textureQuality: selectedConfig.textureQuality,
      shadowQuality: selectedConfig.shadowQuality,
      effectsQuality: selectedConfig.effectsQuality,
      antiAliasingQuality: selectedConfig.antiAliasingQuality,
      postProcessQuality: selectedConfig.postProcessQuality,
      viewDistanceQuality: selectedConfig.viewDistanceQuality,
      shadingQuality: selectedConfig.shadingQuality,
      vsync: false,
      frameRateLimit: limit
    };

    await saveValorantConfig(updatedSettings);
  };

  const toggleGsync = async (disable) => {
    if (gpuInfo.vendor !== 'nvidia') return;
    setGsyncDisabled(disable);
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('gsyncDisabled', disable);
    }
  };

  const toggleFreesync = async (enable) => {
    setFreesyncEnabled(enable);
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('freesyncEnabled', enable);
    }
  };

  const checkVanguardHealth = async () => {
    if (!window.api) {
      setVanguardHealth({
        secureBoot: 'enabled',
        tpm2: 'active',
        vpnActive: false,
        gpuDriverWarning: false,
        csmDisabled: 'disabled',
        flaggedDrivers: [],
        vbsReenabled: false
      });
      return;
    }
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        let vbsReenabled = false;
        if (window.api.checkVbsStatus) {
          try {
            const vbsRes = await window.api.checkVbsStatus();
            if (vbsRes.success && vbsRes.vbsEnabled) {
              vbsReenabled = true;
            }
          } catch (e) {}
        }
        setVanguardHealth({
          secureBoot: res.status.vanguardHealth.secureBoot,
          tpm2: res.status.vanguardHealth.tpm2,
          vpnActive: res.status.vanguardHealth.vpnActive,
          gpuDriverWarning: false,
          csmDisabled: res.status.vanguardHealth.csmDisabled,
          flaggedDrivers: [],
          vbsReenabled
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkBgServices = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status && res.status.bgServices) {
        setBgServices(res.status.bgServices);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const detectGpu = async () => {
    if (!window.api || !window.api.detectGpu) {
      setGpuInfo({ vendor: 'nvidia', name: 'NVIDIA GeForce RTX 4070 (Mock)', driverVersion: '560.94', vramMB: 12288, temperature: 52, utilization: 15, refreshRate: 165 });
      return;
    }
    try {
      const res = await window.api.detectGpu();
      if (res.success) setGpuInfo(res.gpu);
    } catch (e) { console.error(e); }
  };

  const detectValorantPath = async () => {
    if (!window.api || !window.api.detectValorantPath) return;
    try {
      const res = await window.api.detectValorantPath();
      if (res.success) {
        setValorantPath(res.path);
        setValorantPathDetected(res.exists);
      }
    } catch (e) { console.error(e); }
  };

  const browseValorantPath = async () => {
    if (!window.api || !window.api.selectValorantPath) return;
    try {
      const res = await window.api.selectValorantPath();
      if (res.success && res.path) {
        setValorantPath(res.path);
        setValorantPathDetected(true);
        addToast('VALORANT path configured successfully!', 'success');
      }
    } catch (e) { console.error(e); }
  };

  const checkNicPower = async () => {
    if (!window.api) { setNicPowerSavingDisabled(true); return; }
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setNicPowerSavingDisabled(res.status.nicPowerSavingDisabled);
      }
    } catch (e) { setNicPowerSavingDisabled(false); }
  };

  const toggleNicPower = async (disablePowerSaving) => {
    if (window.api && window.api.setDashboardTweak) {
      const val = disablePowerSaving ? 'disabled' : 'enabled';
      await window.api.setDashboardTweak('nicPowerSavingDisabled', disablePowerSaving);
      setNicPowerSavingDisabled(disablePowerSaving);
      addToast(`NIC power saving set to ${val}`, 'success');
    } else {
      setNicPowerSavingDisabled(disablePowerSaving);
    }
  };

  const checkPowerThrottling = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setPowerThrottlingDisabled(res.status.powerThrottlingDisabled);
      }
    } catch (e) { setPowerThrottlingDisabled(false); }
  };

  const checkGlobalFso = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setGlobalFsoDisabled(res.status.globalFsoDisabled);
      }
    } catch (e) { setGlobalFsoDisabled(false); }
  };

  const toggleGlobalFso = async (disable) => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('globalFsoDisabled', disable);
      setGlobalFsoDisabled(disable);
      addToast(`Global FSO set to ${disable ? 'disabled' : 'enabled'}`, 'success');
    } else {
      setGlobalFsoDisabled(disable);
    }
  };

  const togglePowerThrottling = async (disable) => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('powerThrottlingDisabled', disable);
      setPowerThrottlingDisabled(disable);
    } else {
      setPowerThrottlingDisabled(disable);
    }
  };

  const toggleMsiMode = async (enable) => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('msiEnabled', enable);
      setMsiEnabled(enable);
    } else {
      setMsiEnabled(enable);
    }
  };

  const checkPersistentPriority = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.getDashboardTweaksStatus(valorantPath);
      if (res.success && res.status) {
        setPersistentPriorityEnabled(res.status.persistentPriorityEnabled);
      }
    } catch (e) { setPersistentPriorityEnabled(false); }
  };

  const togglePersistentPriority = async (enable) => {
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('persistentPriorityEnabled', enable, { gamePath: valorantPath });
      if (res.success) {
        setPersistentPriorityEnabled(enable);
        addToast(`Persistent priority ${enable ? 'enabled' : 'disabled'}`, 'success');
      }
    } else {
      setPersistentPriorityEnabled(enable);
    }
  };

  // ===== Feature 1: VBS & Core Isolation =====
  const checkVbsStatus = async () => {
    if (!window.api || !window.api.checkVbsStatus) {
      setVbsStatus({ vbsEnabled: false, memoryIntegrity: false, vmPlatform: 'disabled', hypervisorPlatform: 'disabled' });
      return;
    }
    try {
      const res = await window.api.checkVbsStatus();
      if (res.success) {
        setVbsStatus({
          vbsEnabled: res.vbsEnabled,
          memoryIntegrity: res.memoryIntegrity,
          vmPlatform: res.vmPlatform,
          hypervisorPlatform: res.hypervisorPlatform
        });
      }
    } catch (e) { console.error(e); }
  };

  const toggleVbs = async (enable) => {
    setSystemLogs(prev => [...prev, `[VBS] ${enable ? 'Enabling' : 'Disabling'} Virtualization-Based Security...`].slice(-200));
    if (window.api && window.api.toggleVbs) {
      const res = await window.api.toggleVbs(enable);
      if (res.success) {
        setVbsStatus(prev => ({ ...prev, vbsEnabled: enable, memoryIntegrity: enable }));
        setVbsRebootRequired(true);
        setSystemLogs(prev => [...prev, `[VBS] ${enable ? 'Enabled' : 'Disabled'}. Reboot required.`].slice(-200));
        addToast(`VBS ${enable ? 'enabled' : 'disabled'} — reboot required`, 'warning');
      } else {
        setSystemLogs(prev => [...prev, `[VBS Error] ${res.error || 'Access denied'}`].slice(-200));
      }
    } else {
      setVbsStatus(prev => ({ ...prev, vbsEnabled: enable, memoryIntegrity: enable }));
    }
  };

  // ===== Feature 2: HPET Override =====
  const checkHpetStatus = async () => {
    if (!window.api || !window.api.checkHpetStatus) return;
    try {
      const res = await window.api.checkHpetStatus();
      if (res.success) setHpetDisabled(res.hpetDisabled);
    } catch (e) { console.error(e); }
  };

  const toggleHpet = async (disable) => {
    setSystemLogs(prev => [...prev, `[HPET] ${disable ? 'Disabling' : 'Enabling'} platform clock...`].slice(-200));
    if (window.api && window.api.toggleHpet) {
      const res = await window.api.toggleHpet(disable);
      if (res.success) {
        setHpetDisabled(disable);
        setHpetRebootRequired(true);
        setSystemLogs(prev => [...prev, `[HPET] Platform clock ${disable ? 'disabled' : 'enabled'}. Reboot required.`].slice(-200));
        addToast(`HPET ${disable ? 'disabled' : 'restored'} — reboot required`, 'warning');
      } else {
        setSystemLogs(prev => [...prev, `[HPET Error] ${res.error}`].slice(-200));
      }
    } else {
      setHpetDisabled(disable);
    }
  };

  // ===== Feature 3: AMD DXNavi & MPO =====
  const checkAmdOptimizations = async () => {
    if (!window.api || !window.api.checkAmdOptimizations) {
      setAmdOptimizations({ mpoDisabled: false, legacyDxPath: false, shaderCacheAlwaysOn: false });
      return;
    }
    try {
      const res = await window.api.checkAmdOptimizations();
      if (res.success) setAmdOptimizations({ mpoDisabled: res.mpoDisabled, legacyDxPath: res.legacyDxPath, shaderCacheAlwaysOn: res.shaderCacheAlwaysOn });
    } catch (e) { console.error(e); }
  };

  const toggleAmdMpo = async (disable) => {
    setSystemLogs(prev => [...prev, `[AMD] ${disable ? 'Disabling' : 'Enabling'} Multi-Plane Overlay...`].slice(-200));
    if (window.api && window.api.toggleAmdMpo) {
      const res = await window.api.toggleAmdMpo(disable);
      if (res.success) { setAmdOptimizations(prev => ({ ...prev, mpoDisabled: disable })); addToast(`MPO ${disable ? 'disabled' : 'enabled'}`, 'success'); }
    } else { setAmdOptimizations(prev => ({ ...prev, mpoDisabled: disable })); }
  };

  const toggleAmdLegacyDx = async (enableLegacy) => {
    setSystemLogs(prev => [...prev, `[AMD] ${enableLegacy ? 'Forcing legacy' : 'Restoring modern'} DX11 path...`].slice(-200));
    if (window.api && window.api.toggleAmdLegacyDx) {
      const res = await window.api.toggleAmdLegacyDx(enableLegacy);
      if (res.success) { setAmdOptimizations(prev => ({ ...prev, legacyDxPath: enableLegacy })); addToast(`DX11 path ${enableLegacy ? 'set to legacy' : 'restored'}`, 'success'); }
    } else { setAmdOptimizations(prev => ({ ...prev, legacyDxPath: enableLegacy })); }
  };

  const toggleAmdShaderCache = async (alwaysOn) => {
    setSystemLogs(prev => [...prev, `[AMD] Shader cache set to ${alwaysOn ? 'Always On' : 'default'}...`].slice(-200));
    if (window.api && window.api.toggleAmdShaderCache) {
      const res = await window.api.toggleAmdShaderCache(alwaysOn);
      if (res.success) { setAmdOptimizations(prev => ({ ...prev, shaderCacheAlwaysOn: alwaysOn })); addToast(`Shader cache ${alwaysOn ? 'always on' : 'default'}`, 'success'); }
    } else { setAmdOptimizations(prev => ({ ...prev, shaderCacheAlwaysOn: alwaysOn })); }
  };

  // ===== Feature 4: GPU Driver Profile =====
  const checkGpuDriverProfile = async () => {
    if (!window.api || !window.api.checkGpuDriverProfile) {
      setGpuDriverProfile({ powerMaxPerformance: false, lowLatencyUltra: false, threadedOptimization: false, antiLagEnabled: false, textureFilterPerformance: false, radeonChillDisabled: false, radeonBoostDisabled: false });
      return;
    }
    try {
      const res = await window.api.checkGpuDriverProfile();
      if (res.success) {
        setGpuDriverProfile(prev => ({
          ...prev,
          powerMaxPerformance: res.powerMaxPerformance || false,
          lowLatencyUltra: res.lowLatencyUltra || false,
          threadedOptimization: res.threadedOptimization || false,
          antiLagEnabled: res.antiLagEnabled || false,
          textureFilterPerformance: res.textureFilterPerformance || false,
          radeonChillDisabled: res.radeonChillDisabled || false,
          radeonBoostDisabled: res.radeonBoostDisabled || false
        }));
      }
    } catch (e) { console.error(e); }
  };

  const applyGpuDriverProfile = async (profile) => {
    const vendor = gpuInfo.vendor;
    setSystemLogs(prev => [...prev, `[GPU Driver] Applying ${profile} profile for ${vendor}...`].slice(-200));
    if (window.api && window.api.applyGpuDriverProfile) {
      const res = await window.api.applyGpuDriverProfile({ vendor, profile });
      if (res.success) {
        await checkGpuDriverProfile();
        addToast(`GPU driver ${profile} profile applied`, 'success');
      } else {
        setSystemLogs(prev => [...prev, `[GPU Driver Error] ${res.error}`].slice(-200));
      }
    }
  };

  // ===== Feature 5: Hardware Bottleneck Scanner =====
  const checkHardwareBottlenecks = async () => {
    if (!window.api || !window.api.checkHardwareBottlenecks) {
      setHardwareInfo({
        ramModules: [{ speed: 3200, configuredSpeed: 3200, capacityGB: 16, manufacturer: 'G.Skill' }, { speed: 3200, configuredSpeed: 3200, capacityGB: 16, manufacturer: 'G.Skill' }],
        xmpEnabled: true,
        rebarEnabled: true,
        isLegacyAmdGpu: false,
        legacyRebarForced: false
      });
      return;
    }
    try {
      const res = await window.api.checkHardwareBottlenecks();
      if (res.success) {
        setHardwareInfo({
          ramModules: res.ramModules || [],
          xmpEnabled: res.xmpEnabled || false,
          rebarEnabled: res.rebarEnabled || false,
          isLegacyAmdGpu: res.isLegacyAmdGpu || false,
          legacyRebarForced: res.legacyRebarForced || false
        });
      }
    } catch (e) { console.error(e); }
  };

  const toggleLegacyRebar = async (enable) => {
    setSystemLogs(prev => [...prev, `[ReBAR] ${enable ? 'Force-enabling' : 'Removing'} legacy ReBAR hack...`].slice(-200));
    if (window.api && window.api.toggleLegacyRebar) {
      const res = await window.api.toggleLegacyRebar(enable);
      if (res.success) {
        setHardwareInfo(prev => ({ ...prev, legacyRebarForced: enable }));
        addToast(`Legacy ReBAR ${enable ? 'force-enabled' : 'removed'}`, enable ? 'warning' : 'success');
      }
    } else {
      setHardwareInfo(prev => ({ ...prev, legacyRebarForced: enable }));
    }
  };

  const cleanAllShaderCaches = async () => {
    if (window.api && window.api.runCacheCleaner) {
      await window.api.runCacheCleaner('purgeShader');
    }
    setShaderCacheSize('0.00 Bytes');
    addToast('All shader caches purged', 'success');
  };

  const applyOptimizationProfile = async (profileName) => {
    addToast(`Applying ${profileName} preset...`, 'info');
    if (profileName === 'tournament') {
      if (selectedConfig) await applyTournamentPreset();
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      if (!latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', true);
      if (!latencyTweaks.disableUsbSuspend) await toggleLatencyTweak('disableUsbSuspend', true);
      if (!persistentPriorityEnabled) await togglePersistentPriority(true);
      if (!timerResActive) await toggleTimerResolution(true);
      if (!nicPowerSavingDisabled) await toggleNicPower(true);
      if (!powerThrottlingDisabled) await togglePowerThrottling(true);
    } else if (profileName === 'balanced') {
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
    } else if (profileName === 'revert') {
      if (registryStates.gameDvrDisabled) await toggleGameDvr(false);
      if (latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', false);
      if (latencyTweaks.disableUsbSuspend) await toggleLatencyTweak('disableUsbSuspend', false);
      if (persistentPriorityEnabled) await togglePersistentPriority(false);
      if (timerResActive) await toggleTimerResolution(false);
      if (nicPowerSavingDisabled) await toggleNicPower(false);
      if (powerThrottlingDisabled) await togglePowerThrottling(false);
    }
  };

  const toggleMaxBoost = async (enable, profileType = 'safe') => {
    if (enable) {
      setMaxBoostStatus('boosting');
      setMaxBoostActive(true);
      setMaxBoostProgress(10);
      await new Promise(r => setTimeout(r, 200));

      if (profileType === 'safe') {
        setMaxBoostProgress(35);
        if (gameModeActive !== true) await toggleGameMode();
        if (powerPlanMode !== 'high') await togglePowerPlan();
        await new Promise(r => setTimeout(r, 200));

        setMaxBoostProgress(70);
        if (registryStates.gameDvrDisabled !== true) await toggleGameDvr(true);
        for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
          if (latencyTweaks[tweak] !== true) {
            await toggleLatencyTweak(tweak, true);
          }
        }
        await new Promise(r => setTimeout(r, 200));

        setMaxBoostProgress(90);
        await cleanAllShaderCaches();

        setMaxBoostProgress(100);
        setMaxBoostStatus('active');
        addToast("Safe Performance Boost activated!", "success");
      } else {
        // Max Boost (Aggressive / Competitive, but with bottlenecks removed)
        setMaxBoostProgress(25);
        if (gameModeActive !== true) await toggleGameMode();
        if (powerPlanMode !== 'high') await togglePowerPlan();
        await new Promise(r => setTimeout(r, 200));

        setMaxBoostProgress(50);
        if (registryStates.gameDvrDisabled !== true) await toggleGameDvr(true);
        for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
          if (latencyTweaks[tweak] !== true) {
            await toggleLatencyTweak(tweak, true);
          }
        }
        await new Promise(r => setTimeout(r, 200));

        setMaxBoostProgress(75);
        if (powerThrottlingDisabled !== true) await togglePowerThrottling(true);
        if (nicPowerSavingDisabled !== true) await toggleNicPower(true);
        if (persistentPriorityEnabled !== true) await togglePersistentPriority(true);
        if (bgServices.XblAuthManager === true) await toggleBgService('XblAuthManager', false);
        await new Promise(r => setTimeout(r, 200));

        setMaxBoostProgress(85);
        if (timerResActive !== true) await toggleTimerResolution(true);
        await cleanAllShaderCaches();
        await new Promise(r => setTimeout(r, 200));

        // Feature 1 & 4: VBS + GPU driver profile in aggressive mode
        setMaxBoostProgress(92);
        if (vbsStatus.vbsEnabled) await toggleVbs(false);
        if (gpuInfo.vendor === 'nvidia' || gpuInfo.vendor === 'amd') {
          await applyGpuDriverProfile('performance');
        }

        setMaxBoostProgress(100);
        setMaxBoostStatus('active');
        addToast("Max Performance Boost activated! System optimized.", "success");
      }
    } else {
      setMaxBoostStatus('reverting');
      setMaxBoostProgress(20);
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(50);
      if (registryStates.gameDvrDisabled !== false) await toggleGameDvr(false);
      if (gameModeActive !== false) await toggleGameMode();
      if (powerPlanMode !== 'balanced') await togglePowerPlan();
      
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
        if (latencyTweaks[tweak] !== false) {
          await toggleLatencyTweak(tweak, false);
        }
      }
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(80);
      if (powerThrottlingDisabled !== false) await togglePowerThrottling(false);
      if (nicPowerSavingDisabled !== false) await toggleNicPower(false);
      if (persistentPriorityEnabled !== false) await togglePersistentPriority(false);
      if (bgServices.XblAuthManager === false) await toggleBgService('XblAuthManager', true);
      if (timerResActive !== false) await toggleTimerResolution(false);

      setMaxBoostProgress(100);
      setMaxBoostActive(false);
      setMaxBoostStatus('idle');
      addToast("Restored default parameters", "success");
    }
  };

  const toggleBgService = async (serviceName, start) => {
    if (!window.api) {
      setBgServices(prev => ({ ...prev, [serviceName]: start }));
      return;
    }
    const res = await window.api.setDashboardTweak('bgService', start, { serviceName });
    if (res.success) {
      setBgServices(prev => ({ ...prev, [serviceName]: start }));
      addToast(`${serviceName} modified successfully`, 'success');
    }
  };

  const toggleTimerResolution = async (active) => {
    setTimerResActive(active);
    if (!window.api) return;
    await window.api.setTimerResolution(active);
  };

  // Check Administrator role, load registry and configs on load
  useEffect(() => {
    const initializeApp = async () => {
      // Load persisted settings first
      if (window.api && window.api.loadAppSettings) {
        try {
          const saved = await window.api.loadAppSettings();
          if (saved.success && saved.settings) {
            if (saved.settings.boostProfile) setBoostProfile(saved.settings.boostProfile);
            if (saved.settings.powerPlanMode) setPowerPlanMode(saved.settings.powerPlanMode);
          }
        } catch (e) { console.error('Failed to load saved settings:', e); }
      }

      // Eager isAdmin check
      if (window.api && window.api.getSystemStats) {
        try {
          const data = await window.api.getSystemStats();
          setStats(data);
          if (typeof data.isAdmin === 'boolean') setIsAdmin(data.isAdmin);
        } catch (e) { /* will retry via 2s polling */ }
      }

      try {
        await detectValorantPath();
        await checkRegistryStates();
        await loadValorantConfigs();
        await checkLatencyRegistryStates();
        await checkVanguardHealth();
        await checkBgServices();
        await detectGpu();
        await checkPersistentPriority();
        await checkNicPower();
        await checkGlobalFso();
        await checkPowerThrottling();
        await checkVbsStatus();
        await checkHpetStatus();
        await checkAmdOptimizations();
        await checkGpuDriverProfile();
        await checkHardwareBottlenecks();
        await loadRegistryBackups();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, []);

  // Save settings automatically when profile/powerplan mode changes
  useEffect(() => {
    if (window.api && window.api.saveAppSettings && !isInitializing) {
      window.api.saveAppSettings({ boostProfile, powerPlanMode }).catch(err => {
        console.error('Failed to save settings:', err);
      });
    }
  }, [boostProfile, powerPlanMode, isInitializing]);

  // Visibility/Focus Listeners to suspend background telemetry
  useEffect(() => {
    const handleVisibility = () => {
      setIsWindowVisible(document.visibilityState === 'visible');
    };
    const handleFocus = () => setIsWindowVisible(true);
    const handleBlur = () => setIsWindowVisible(false);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Run deep system performance enhancements
  const runDeepPerformanceOptimize = async () => {
    const queue = [];
    if (optimizationOptions.pauseUpdates) {
      if (window.api && window.api.setDashboardTweak) {
        const res = await window.api.setDashboardTweak('bgService', false, { serviceName: 'wuauserv' });
        if (res.success) queue.push('wuauserv');
      } else {
        queue.push('wuauserv');
      }
    }

    if (optimizationOptions.purgeApps) {
      const appsToKill = [];
      if (purgeAppsChecklist.chrome) appsToKill.push('chrome.exe');
      if (purgeAppsChecklist.msedge) appsToKill.push('msedge.exe');
      if (purgeAppsChecklist.spotify) appsToKill.push('spotify.exe');
      if (purgeAppsChecklist.discord) appsToKill.push('discord.exe');
      if (purgeAppsChecklist.steam) appsToKill.push('steam.exe');
      if (purgeAppsChecklist.onedrive) appsToKill.push('OneDrive.exe');

      for (const app of appsToKill) {
        if (window.api && window.api.killProcess) {
          await window.api.killProcess(app);
        }
      }
    }

    setRevertQueue(queue);
  };

  // Revert temporary deep optimizations
  const triggerValorantAutoRevert = async () => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('powerPlan', 'balanced');
    }
    if (revertQueue.includes('wuauserv')) {
      if (window.api && window.api.setDashboardTweak) {
        await window.api.setDashboardTweak('bgService', true, { serviceName: 'wuauserv' });
      }
    }
    setRevertQueue([]);
    addToast("Auto-Reverted temporary parameters", "info");
  };

  // Trigger automated Valorant priority boosting
  const triggerValorantAutoBoost = async () => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('powerPlan', 'high');
      await window.api.setDashboardTweak('forcePriority', true, { gameName: 'VALORANT-Win64-Shipping' });
    }
    if (deepOptimizeActive) {
      await runDeepPerformanceOptimize();
    }
    addToast("Auto-Boost applied successfully!", "success");
  };

  // Environment Check
  useEffect(() => {
    if (!window.api) {
      setIsElectron(false);
      setStats({
        platform: 'win32',
        arch: 'x64',
        hostname: 'NEUROPTIMIZE-SUMMONER',
        cpuModel: 'Intel Core i9-13900K @ 3.00GHz',
        cpuCores: 24,
        cpuLoad: 12,
        totalMemGB: '32.00',
        freeMemGB: '22.40',
        usedMemGB: '9.60',
        memUsagePercent: 30
      });
      setFiles([
        { name: 'electron', isDirectory: true, size: 0, modified: new Date() },
        { name: 'src', isDirectory: true, size: 0, modified: new Date() },
        { name: 'package.json', isDirectory: false, size: 779, modified: new Date() }
      ]);
    }
  }, []);

  // System statistics polling - Pauses when application is minimized or unfocused
  useEffect(() => {
    if (!isWindowVisible) return;

    if (!isElectron) {
      const interval = setInterval(() => {
        setStats(prev => {
          const mockCpu = Math.max(5, Math.min(95, Math.round(prev.cpuLoad + (Math.random() * 10 - 5))));
          const mockMemPercent = Math.max(20, Math.min(90, Math.round(prev.memUsagePercent + (Math.random() * 2 - 1))));
          return {
            ...prev,
            cpuLoad: mockCpu,
            memUsagePercent: mockMemPercent,
            usedMemGB: (32 * (mockMemPercent / 100)).toFixed(2),
            freeMemGB: (32 * ((100 - mockMemPercent) / 100)).toFixed(2)
          };
        });
      }, 2000);
      return () => clearInterval(interval);
    }

    const fetchStats = async () => {
      try {
        const data = await window.api.getSystemStats();
        setStats(data);
        if (typeof data.isAdmin === 'boolean') {
          setIsAdmin(data.isAdmin);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [isElectron, isWindowVisible]);

  // Run active diagnostic fixes
  const runDiagnosticFix = async (fixName) => {
    if (runningFix) return;
    setRunningFix(fixName);
    setFixStatusText(`Executing: ${fixName}...`);

    try {
      let macroKey = '';
      if (fixName === 'ramRejuvenation') macroKey = 'm-ram';
      else if (fixName === 'chronosReset') macroKey = 'm-explorer';

      if (window.api && window.api.runMacro && macroKey) {
        const res = await window.api.runMacro(macroKey);
        setFixStatusText(res.success ? `Success: ${fixName} completed.` : `Failed: ${res.error}`);
      } else {
        setFixStatusText(`[Mock Success]: ${fixName} completed.`);
      }
    } catch (e) {
      setFixStatusText(`Error: ${e.message}`);
    } finally {
      setRunningFix(null);
    }
  };

  // Premade 1-Click Macros Engine
  const runMacro = async (macroKey, macroName) => {
    if (runningMacro) return;
    
    setRunningMacro(macroKey);
    setSystemLogs(prev => [...prev, `[Macro] Running: "${macroName}"`].slice(-200));

    if (!isElectron) {
      setTimeout(() => {
        setRunningMacro(null);
        setSystemLogs(prev => [...prev, `[Macro] Completed.`].slice(-200));
      }, 1000);
      return;
    }

    try {
      const res = await window.api.runMacro(macroKey);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Macro] Completed.`].slice(-200));
      } else {
        setSystemLogs(prev => [...prev, `[Macro Error] ${res.error}`].slice(-200));
      }
    } catch (e) {
      setSystemLogs(prev => [...prev, `[Macro Exception] ${e.message}`].slice(-200));
    } finally {
      setRunningMacro(null);
    }
  };

  // Sector defragmenter drive scanning simulation
  const scanTempFolder = async () => {
    if (scanningTemp) return;
    setScanningTemp(true);
    setSystemLogs(prev => [...prev, '[Storage] Analyzing temp file size...'].slice(-200));

    const generatedSectors = Array(120).fill('empty').map(() => {
      const rng = Math.random();
      if (rng < 0.2) return 'system';
      if (rng < 0.5) return 'files';
      if (rng < 0.8) return 'temp';
      return 'empty';
    });
    setDefragSectors(generatedSectors);

    if (!isElectron) {
      setTimeout(() => {
        setScanningTemp(false);
        setTempFolderSize('1.84 GB');
        setSystemLogs(prev => [...prev, '[Storage] Scan completed. Size: 1.84 GB'].slice(-200));
      }, 1000);
      return;
    }

    try {
      const res = await window.api.runCacheCleaner('scan');
      if (res.success) {
        setTempFolderSize(formatBytes(res.tempBytes));
        setSystemLogs(prev => [...prev, `[Storage] Scan completed. Size: ${formatBytes(res.tempBytes)}`].slice(-200));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningTemp(false);
    }
  };

  // Temp folder cache purge
  const purgeTempFolder = async () => {
    if (purgingTemp) return;
    setPurgingTemp(true);
    setSystemLogs(prev => [...prev, '[Storage] Purging temporary files...'].slice(-200));
    try {
      await finalizeDefragWipe();
    } catch (e) {
      setSystemLogs(prev => [...prev, `[Storage Error] Purge failed: ${e.message}`].slice(-200));
    } finally {
      setPurgingTemp(false);
    }
  };

  const finalizeDefragWipe = async () => {
    if (window.api && window.api.runCacheCleaner) {
      await window.api.runCacheCleaner('purgeTemp');
    }
    setTempFolderSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Storage] Temporary directories purged successfully.'].slice(-200));
  };

  // Administrative launcher utility
  const launchAdminPanel = async (utility) => {
    if (window.api && window.api.launchAdminUtility) {
      await window.api.launchAdminUtility(utility);
    }
  };

  // Valorant Tweaks Actions
  const toggleGameMode = async () => {
    const nextVal = !gameModeActive;
    setGameModeActive(nextVal);
    
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('gameMode', nextVal);
    }
  };

  const togglePowerPlan = async () => {
    const nextMode = powerPlanMode === 'balanced' ? 'high' : 'balanced';
    setPowerPlanMode(nextMode);

    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('powerPlan', nextMode);
    }
  };

  const forceValorantPriority = async () => {
    setSystemLogs(prev => [...prev, '[Priority] Elevating VALORANT CPU priority status...'].slice(-200));

    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('forcePriority', true, { gameName: 'VALORANT-Win64-Shipping' });
      if (res.success) {
        setSystemLogs(prev => [...prev, '[Priority] Process priority class elevated.'].slice(-200));
        addToast('VALORANT CPU priority elevated to High', 'success');
      } else {
        addToast('VALORANT process not active. Start game first.', 'warning');
      }
    } else {
      addToast('Simulated priority boost (Mock)', 'info');
    }
  };

  const scanValorantCaches = async () => {
    if (scanningVal) return;
    setScanningVal(true);
    setSystemLogs(prev => [...prev, '[Scrubber] Scanning cache directories...'].slice(-200));

    if (!isElectron) {
      setTimeout(() => {
        setScanningVal(false);
        setValorantLogsSize('142 MB');
        setShaderCacheSize('844 MB');
      }, 1000);
      return;
    }

    try {
      const res = await window.api.runCacheCleaner('scan');
      if (res.success) {
        setValorantLogsSize(formatBytes(res.valLogsBytes));
        setShaderCacheSize(formatBytes(res.shaderBytes));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningVal(false);
    }
  };

  const clearValorantLogs = async () => {
    if (cleaningLogs) return;
    setCleaningLogs(true);

    if (window.api && window.api.runCacheCleaner) {
      await window.api.runCacheCleaner('purgeValLogs');
    }
    setValorantLogsSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Scrubber] Client log directories purged.'].slice(-200));
    setCleaningLogs(false);
  };

  const clearShaderCache = async () => {
    if (cleaningShaders) return;
    setCleaningShaders(true);

    if (window.api && window.api.runCacheCleaner) {
      await window.api.runCacheCleaner('purgeShader');
    }
    setShaderCacheSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Scrubber] DirectX shader caches purged.'].slice(-200));
    setCleaningShaders(false);
  };

  return (
    <AppContext.Provider value={{
      isElectron, setIsElectron,
      systemLogs, setSystemLogs,
      stats, setStats,
      tempFolderSize, setTempFolderSize,
      scanningTemp, setScanningTemp,
      purgingTemp, setPurgingTemp,
      defragSectors, setDefragSectors,
      files, setFiles,
      tweaks, setTweaks,
      runningMacro, setRunningMacro,
      isWindowVisible, setIsWindowVisible,
      runningFix, setRunningFix,
      fixStatusText, setFixStatusText,
      valorantRunning, setValorantRunning,
      autoBoostActive, setAutoBoostActive,
      gameModeActive, setGameModeActive,
      powerPlanMode, setPowerPlanMode,
      valorantLogsSize, setValorantLogsSize,
      shaderCacheSize, setShaderCacheSize,
      scanningVal, setScanningVal,
      cleaningLogs, setCleaningLogs,
      cleaningShaders, setCleaningShaders,
      deepOptimizeActive, setDeepOptimizeActive,
      optimizationOptions, setOptimizationOptions,
      revertQueue, setRevertQueue,
      purgeAppsChecklist, setPurgeAppsChecklist,
      isAdmin, setIsAdmin,
      valorantConfigs, setValorantConfigs,
      selectedConfig, setSelectedConfig,
      registryStates, setRegistryStates,
      latencyTweaks, setLatencyTweaks,
      monitorRefreshRate, setMonitorRefreshRate,
      frameLimitMode, setFrameLimitMode,
      gsyncDisabled, setGsyncDisabled,
      freesyncEnabled, setFreesyncEnabled,
      vanguardHealth, setVanguardHealth,
      bgServices, setBgServices,
      timerResActive, setTimerResActive,
      valorantPath, setValorantPath,
      valorantPathDetected, setValorantPathDetected,
      gpuInfo, setGpuInfo,
      nicPowerSavingDisabled, setNicPowerSavingDisabled,
      globalFsoDisabled, setGlobalFsoDisabled,
      powerThrottlingDisabled, setPowerThrottlingDisabled,
      msiEnabled, setMsiEnabled,
      persistentPriorityEnabled, setPersistentPriorityEnabled,
      vbsStatus, setVbsStatus,
      vbsRebootRequired, setVbsRebootRequired,
      hpetDisabled, setHpetDisabled,
      hpetRebootRequired, setHpetRebootRequired,
      amdOptimizations, setAmdOptimizations,
      gpuDriverProfile, setGpuDriverProfile,
      hardwareInfo, setHardwareInfo,
      maxBoostActive, setMaxBoostActive,
      maxBoostProgress, setMaxBoostProgress,
      maxBoostStatus, setMaxBoostStatus,
      boostProfile, setBoostProfile,
      toasts, setToasts,
      isInitializing, setIsInitializing,
      registryBackups, setRegistryBackups,
      addToast, removeToast,
      loadRegistryBackups, restoreBackup, deleteBackup, clearAllBackups,
      checkRegistryStates, toggleHags, toggleGameDvr, togglePriorityOptimized,
      loadValorantConfigs, saveValorantConfig, applyTournamentPreset,
      checkLatencyRegistryStates, toggleLatencyTweak, applyFrameLimitSettings,
      toggleGsync, toggleFreesync, checkVanguardHealth, checkBgServices,
      detectGpu, detectValorantPath, browseValorantPath, checkNicPower,
      toggleNicPower, checkPowerThrottling, checkGlobalFso, toggleGlobalFso,
      togglePowerThrottling, toggleMsiMode, checkPersistentPriority,
      togglePersistentPriority, checkVbsStatus, toggleVbs, checkHpetStatus,
      toggleHpet, checkAmdOptimizations, toggleAmdMpo, toggleAmdLegacyDx,
      toggleAmdShaderCache, checkGpuDriverProfile, applyGpuDriverProfile,
      checkHardwareBottlenecks, toggleLegacyRebar, cleanAllShaderCaches,
      applyOptimizationProfile, toggleMaxBoost, toggleBgService,
      toggleTimerResolution, runDeepPerformanceOptimize, triggerValorantAutoRevert,
      triggerValorantAutoBoost, runDiagnosticFix, runMacro, scanTempFolder,
      purgeTempFolder, launchAdminPanel, formatBytes
    }}>
      {children}
    </AppContext.Provider>
  );
}
