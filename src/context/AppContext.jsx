import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

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
  { key: 'm-ram', name: 'Free Working Sets', desc: 'Triggers Windows memory manager to page out idle memory.', cmd: 'powershell -Command "..."' }, // Updated description (#22)
  { key: 'm-explorer', name: 'Restart Desktop UI', desc: 'Restores frozen Windows taskbars by restarting explorer.exe.', cmd: 'taskkill /f /im explorer.exe && start explorer.exe' }
];

export function AppProvider({ children }) {
  const [isElectron, setIsElectron] = useState(!!window.api);

  // UI Reorganization State
  const [uiMode, setUiMode] = useState('simple'); // 'simple' | 'advanced'
  const [activeAppTab, setActiveAppTab] = useState('dashboard'); // 'dashboard' | 'advanced' | 'cleaners' | 'settings'

  // #11: Logs use objects with timestamps instead of strings
  const [systemLogs, setSystemLogs] = useState([
    { text: 'NeurOptimize Engine Active...', time: Date.now() },
    { text: 'System monitoring hooks established.', time: Date.now() }
  ]);

  const addLog = (text) => {
    setSystemLogs(prev => [...prev, { text, time: Date.now() }].slice(-200));
  };

  // CPU/RAM Stats
  const [stats, setStats] = useState({
    platform: 'loading...', arch: '...', hostname: '...',
    cpuModel: 'Querying CPU details...', cpuCores: 0, cpuLoad: 0,
    totalMemGB: '0.00', freeMemGB: '0.00', usedMemGB: '0.00', memUsagePercent: 0
  });

  const [tempFolderSize, setTempFolderSize] = useState('Click Scan');
  const [scanningTemp, setScanningTemp] = useState(false);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [defragSectors, setDefragSectors] = useState([]);
  const [files, setFiles] = useState([]);
  const [tweaks, setTweaks] = useState({ darkMode: true, hiddenFiles: false, taskbarAutohide: false });
  const [runningMacro, setRunningMacro] = useState(null);
  const [isWindowVisible, setIsWindowVisible] = useState(true);
  const [runningFix, setRunningFix] = useState(null);
  const [fixStatusText, setFixStatusText] = useState('');

  // Valorant Optimizer State
  const [valorantRunning, setValorantRunning] = useState(false);
  const [autoBoostActive, setAutoBoostActive] = useState(true);
  const [gameModeActive, setGameModeActive] = useState(false);
  const [powerPlanMode, setPowerPlanMode] = useState('balanced');
  const [originalPowerPlan, setOriginalPowerPlan] = useState(null); // #35: Store original power plan

  const [valorantLogsSize, setValorantLogsSize] = useState('Click Scan');
  const [shaderCacheSize, setShaderCacheSize] = useState('Click Scan');
  const [scanningVal, setScanningVal] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);
  const [cleaningShaders, setCleaningShaders] = useState(false);

  // Deep Performance Optimizer States
  const [deepOptimizeActive, setDeepOptimizeActive] = useState(false);
  const [optimizationOptions, setOptimizationOptions] = useState({ pauseUpdates: true, purgeApps: true });
  const [revertQueue, setRevertQueue] = useState([]);
  const [purgeAppsChecklist, setPurgeAppsChecklist] = useState({
    chrome: true, msedge: false, spotify: true, discord: false, steam: false, onedrive: true,
    epicgameslauncher: true, 'battle.net': false,
    slack: false, telegram: false, whatsapp: false, overwolf: false, obs64: false
  });
  const [runningApps, setRunningApps] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [valorantConfigs, setValorantConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  
  const [registryStates, setRegistryStates] = useState({ hagsEnabled: false, gameDvrDisabled: false, priorityOptimized: false });
  const [latencyTweaks, setLatencyTweaks] = useState({ disableMouseAccel: false, disableUsbSuspend: false, disableCoreParking: false, disableDynamicTick: false, disableFullscreenOpt: false, prioritySeparation: false });
  
  const [monitorRefreshRate, setMonitorRefreshRate] = useState(240);
  const [frameLimitMode, setFrameLimitMode] = useState('uncapped');
  const [gsyncDisabled, setGsyncDisabled] = useState(false);
  const [freesyncEnabled, setFreesyncEnabled] = useState(false);
  
  const [vanguardHealth, setVanguardHealth] = useState({ secureBoot: 'unknown', tpm2: 'unknown', vpnActive: false, gpuDriverWarning: false, csmDisabled: 'unknown', flaggedDrivers: [] });
  const [bgServices, setBgServices] = useState({ SysMain: true, XblAuthManager: true });
  const [timerResActive, setTimerResActive] = useState(false);
  const [valorantPath, setValorantPath] = useState('C:\\Riot Games\\VALORANT\\live\\ShooterGame\\Binaries\\Win64\\VALORANT-Win64-Shipping.exe');
  const [valorantPathDetected, setValorantPathDetected] = useState(false);

  // GPU Info State
  const [gpuInfo, setGpuInfo] = useState({ vendor: 'unknown', name: 'Detecting...', driverVersion: '', vramMB: 0, temperature: 0, utilization: 0, refreshRate: 0 });

  // FPS Optimization States
  const [nicPowerSavingDisabled, setNicPowerSavingDisabled] = useState(false);
  const [globalFsoDisabled, setGlobalFsoDisabled] = useState(false);
  const [powerThrottlingDisabled, setPowerThrottlingDisabled] = useState(false);
  const [msiEnabled, setMsiEnabled] = useState(false);
  const [persistentPriorityEnabled, setPersistentPriorityEnabled] = useState(false);

  // Advanced States
  const [vbsStatus, setVbsStatus] = useState({ vbsEnabled: false, memoryIntegrity: false, vmPlatform: 'unknown', hypervisorPlatform: 'unknown' });
  const [vbsRebootRequired, setVbsRebootRequired] = useState(false);
  const [hpetDisabled, setHpetDisabled] = useState(false);
  const [hpetRebootRequired, setHpetRebootRequired] = useState(false);
  const [amdOptimizations, setAmdOptimizations] = useState({ mpoDisabled: false, legacyDxPath: false, shaderCacheAlwaysOn: false });
  const [gpuDriverProfile, setGpuDriverProfile] = useState({ powerMaxPerformance: false, lowLatencyUltra: false, threadedOptimization: false, antiLagEnabled: false, textureFilterPerformance: false, radeonChillDisabled: false, radeonBoostDisabled: false });
  const [hardwareInfo, setHardwareInfo] = useState({ ramModules: [], xmpEnabled: false, rebarEnabled: false, isLegacyAmdGpu: false, legacyRebarForced: false });

  // One-Click Performance Booster State
  const [maxBoostActive, setMaxBoostActive] = useState(false);
  const [maxBoostProgress, setMaxBoostProgress] = useState(0);
  const [maxBoostStatus, setMaxBoostStatus] = useState('idle');
  const [boostProfile, setBoostProfile] = useState('safe');

  // Toast Notifications (#33: Queue overflow, max 3 visible)
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => {
      const next = [...prev, { id, message, type }];
      if (next.length > 3) return next.slice(next.length - 3);
      return next;
    });
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const [isInitializing, setIsInitializing] = useState(true);
  const [initMessage, setInitMessage] = useState('Booting system optimizer...');
  const [registryBackups, setRegistryBackups] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const executeOperation = async (message, asyncFn) => {
    if (isProcessing) { addToast('System is busy. Please wait.', 'warning'); return; }
    setIsProcessing(true); setProcessingMessage(message);
    try { await asyncFn(); } catch (e) { addToast(`Operation failed: ${e.message}`, 'error'); } 
    finally { setIsProcessing(false); setProcessingMessage(''); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // #7: CONSOLIDATED STATE REFRESH — Replaces 8 independent PowerShell spawns
  // ─────────────────────────────────────────────────────────────────────────────
  
  const refreshAllStatus = async (gamePathStr = valorantPath) => {
    if (!window.api || !window.api.getDashboardTweaksStatus) return;
    try {
      const res = await window.api.getDashboardTweaksStatus(gamePathStr);
      if (res.success && res.status) {
        const s = res.status;
        setRegistryStates({ hagsEnabled: s.hagsEnabled, gameDvrDisabled: s.gameDvrDisabled, priorityOptimized: s.priorityOptimized });
        setLatencyTweaks({ disableMouseAccel: s.disableMouseAccel, disableUsbSuspend: s.disableUsbSuspend, disableCoreParking: s.disableCoreParking, disableDynamicTick: s.disableDynamicTick, disableFullscreenOpt: s.disableFullscreenOpt, prioritySeparation: s.prioritySeparation });
        setMsiEnabled(s.msiEnabled);
        setGsyncDisabled(s.gsyncDisabled);
        setFreesyncEnabled(s.freesyncEnabled);
        setNicPowerSavingDisabled(s.nicPowerSavingDisabled);
        setGlobalFsoDisabled(s.globalFsoDisabled);
        setPowerThrottlingDisabled(s.powerThrottlingDisabled);
        setPersistentPriorityEnabled(s.persistentPriorityEnabled);
        
        // #28: Init Game Mode and Power Plan from system status
        setGameModeActive(s.gameModeActive);
        setPowerPlanMode(s.powerPlanMode);

        setBgServices(s.bgServices || { SysMain: false, XblAuthManager: false });
        
        // Retain VBS status check alongside Vanguard
        let vbsReenabled = false;
        if (window.api.checkVbsStatus) {
          const vbsRes = await window.api.checkVbsStatus().catch(()=>({}));
          if (vbsRes.success && vbsRes.vbsEnabled) vbsReenabled = true;
          setVbsStatus({ vbsEnabled: vbsRes.vbsEnabled || false, memoryIntegrity: vbsRes.memoryIntegrity || false, vmPlatform: vbsRes.vmPlatform || 'unknown', hypervisorPlatform: vbsRes.hypervisorPlatform || 'unknown' });
        }
        
        setVanguardHealth({
          secureBoot: s.vanguardHealth?.secureBoot || 'unknown',
          tpm2: s.vanguardHealth?.tpm2 || 'unknown',
          vpnActive: s.vanguardHealth?.vpnActive || false,
          gpuDriverWarning: false,
          csmDisabled: s.vanguardHealth?.csmDisabled || 'unknown',
          flaggedDrivers: [],
          vbsReenabled
        });
      }
    } catch (e) { console.error('Failed to refresh status:', e); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Backups
  // ─────────────────────────────────────────────────────────────────────────────

  const loadRegistryBackups = async () => {
    if (window.api && window.api.getRegistryBackups) {
      const res = await window.api.getRegistryBackups();
      if (res.success) setRegistryBackups(res.backups || []);
    }
  };

  const restoreBackup = async (index) => {
    if (window.api && window.api.restoreRegistryBackup) {
      const res = await window.api.restoreRegistryBackup(index);
      if (res.success) { addToast('Restored successfully!', 'success'); loadRegistryBackups(); refreshAllStatus(); }
      else addToast(`Restore failed: ${res.error}`, 'error');
    }
  };

  const deleteBackup = async (index) => {
    if (window.api && window.api.deleteRegistryBackup) {
      const res = await window.api.deleteRegistryBackup(index);
      if (res.success) { addToast('Backup deleted', 'success'); loadRegistryBackups(); }
    }
  };

  const clearAllBackups = async () => {
    if (window.api && window.api.clearAllRegistryBackups) {
      const res = await window.api.clearAllRegistryBackups();
      if (res.success) { addToast('All backups cleared', 'success'); loadRegistryBackups(); }
    }
  };

  const restoreAllBackups = async () => {
    if (window.api && window.api.restoreAllRegistryBackups) {
      const res = await window.api.restoreAllRegistryBackups();
      if (res.success) { 
        if (res.warnings) addToast('Restored with some errors (see logs)', 'warning');
        else addToast('All restored successfully!', 'success'); 
        loadRegistryBackups(); refreshAllStatus(); 
      }
      else addToast(`Restore all failed: ${res.error}`, 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Toggles (optimistic update + #29: verify via re-fetch)
  // ─────────────────────────────────────────────────────────────────────────────

  const toggleGeneric = async (name, value, optimisticSetter, successMsg, errorMsg, extraArgs = {}) => {
    optimisticSetter(value);
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak(name, value, extraArgs);
      if (res.success) {
        if (successMsg) addLog(`[Tweak] ${successMsg}`);
        refreshAllStatus(); // Verify system state
      } else {
        if (errorMsg) addLog(`[Error] ${errorMsg}: ${res.error}`);
        refreshAllStatus(); // Revert optimistic if failed
      }
    }
  };

  const toggleHags = (v) => toggleGeneric('hags', v, (val) => setRegistryStates(p => ({...p, hagsEnabled: val})), `HAGS ${v ? 'enabled' : 'disabled'}`);
  const toggleGameDvr = (v) => toggleGeneric('gameDvr', v, (val) => setRegistryStates(p => ({...p, gameDvrDisabled: val})), `Game DVR ${v ? 'disabled' : 'enabled'}`);
  const togglePriorityOptimized = (v) => toggleGeneric('priorityOptimized', v, (val) => setRegistryStates(p => ({...p, priorityOptimized: val})));
  
  const toggleLatencyTweak = (name, v) => toggleGeneric(name, v, (val) => setLatencyTweaks(p => ({...p, [name]: val})), `Latency tweak ${name} -> ${v}`, null, { gamePath: valorantPath });
  const toggleGsync = (v) => toggleGeneric('gsyncDisabled', v, setGsyncDisabled, `G-Sync ${v ? 'disabled' : 'enabled'}`);
  const toggleFreesync = (v) => toggleGeneric('freesyncEnabled', v, setFreesyncEnabled, `FreeSync ${v ? 'enabled' : 'disabled'}`);
  const toggleNicPower = (v) => toggleGeneric('nicPowerSavingDisabled', v, setNicPowerSavingDisabled, `NIC Power saving ${v ? 'disabled' : 'enabled'}`);
  const toggleGlobalFso = (v) => toggleGeneric('globalFsoDisabled', v, setGlobalFsoDisabled, `Global FSO ${v ? 'disabled' : 'enabled'}`);
  const togglePowerThrottling = (v) => toggleGeneric('powerThrottlingDisabled', v, setPowerThrottlingDisabled, `Power Throttling ${v ? 'disabled' : 'enabled'}`);
  const toggleMsiMode = (v) => toggleGeneric('msiEnabled', v, setMsiEnabled, `MSI Mode ${v ? 'enabled' : 'disabled'}`);
  const togglePersistentPriority = (v) => toggleGeneric('persistentPriorityEnabled', v, setPersistentPriorityEnabled, `Persistent priority ${v ? 'enabled' : 'disabled'}`, null, { gamePath: valorantPath });
  const toggleBgService = (svc, start) => toggleGeneric('bgService', start, (val) => setBgServices(p => ({...p, [svc]: val})), `${svc} ${start ? 'started' : 'stopped'}`, null, { serviceName: svc });

  // ─────────────────────────────────────────────────────────────────────────────
  // Valorant Configs
  // ─────────────────────────────────────────────────────────────────────────────

  const loadValorantConfigs = async () => {
    if (window.api && window.api.getValorantConfigs) {
      try {
        const res = await window.api.getValorantConfigs();
        if (res.success && res.configs.length > 0) {
          // #31: Do NOT force vsync: false anymore
          setValorantConfigs(res.configs);
          setSelectedConfig(res.configs[0]);
        }
      } catch (e) { console.error('Error loading Valorant configs:', e); }
    }
  };

  // #32: Debounce implementation for slider changes
  const saveTimeoutRef = useRef(null);
  
  const saveValorantConfig = async (updatedSettings) => {
    if (!valorantConfigs || valorantConfigs.length === 0) return;
    
    setValorantConfigs(prev => prev.map(c => ({ ...c, ...updatedSettings })));
    if (selectedConfig) {
      setSelectedConfig(prev => ({ ...prev, ...updatedSettings }));
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    // Capture paths from the current scope
    const pathsToSave = valorantConfigs.map(c => ({ path: c.filePath, accountId: c.accountId }));
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api) {
        let successCount = 0;
        for (const config of pathsToSave) {
          try {
            const res = await window.api.saveValorantConfig(config.path, updatedSettings);
            if (res.success) successCount++;
          } catch (e) { console.error(e); }
        }
        if (successCount > 0) {
          addLog(`[Config] Successfully applied graphics to ${successCount} account(s)`);
        }
      }
    }, 500); // 500ms debounce
  };

  const applyTournamentPreset = async () => {
    if (!selectedConfig) return;
    await saveValorantConfig({
      resolutionQuality: 100, textureQuality: 0, shadowQuality: 0, effectsQuality: 0,
      antiAliasingQuality: 0, postProcessQuality: 0, viewDistanceQuality: 0, shadingQuality: 0, vsync: false
    });
  };

  const applyFrameLimitSettings = async (mode, hz) => {
    setFrameLimitMode(mode);
    setMonitorRefreshRate(hz);
    if (!selectedConfig) return;

    let limit = 0;
    if (mode === 'vrr') limit = Math.max(30, hz - 3);
    else if (mode === 'uncapped') limit = 0;
    else return;

    await saveValorantConfig({ frameRateLimit: limit });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Diagnostics & Hardware
  // ─────────────────────────────────────────────────────────────────────────────

  const detectGpu = async () => {
    if (!window.api || !window.api.detectGpu) return;
    try {
      const res = await window.api.detectGpu();
      if (res.success) setGpuInfo(res.gpu);
    } catch (e) { console.error(e); }
  };

  const detectValorantPath = async () => {
    if (!window.api || !window.api.detectValorantPath) return;
    try {
      const res = await window.api.detectValorantPath();
      if (res.success) { setValorantPath(res.path); setValorantPathDetected(res.exists); }
    } catch (e) {}
  };

  const browseValorantPath = async () => {
    if (!window.api || !window.api.selectValorantPath) return;
    try {
      const res = await window.api.selectValorantPath();
      if (res.success && res.path) { setValorantPath(res.path); setValorantPathDetected(true); addToast('Path configured!', 'success'); refreshAllStatus(res.path); }
    } catch (e) {}
  };

  const checkHpetStatus = async () => {
    if (!window.api || !window.api.checkHpetStatus) return;
    try { const res = await window.api.checkHpetStatus(); if (res.success) setHpetDisabled(res.hpetDisabled); } catch (e) {}
  };

  const checkAmdOptimizations = async () => {
    if (!window.api || !window.api.checkAmdOptimizations) return;
    try { const res = await window.api.checkAmdOptimizations(); if (res.success) setAmdOptimizations({ mpoDisabled: res.mpoDisabled, legacyDxPath: res.legacyDxPath, shaderCacheAlwaysOn: res.shaderCacheAlwaysOn }); } catch (e) {}
  };

  const checkGpuDriverProfile = async () => {
    if (!window.api || !window.api.checkGpuDriverProfile) return;
    try { const res = await window.api.checkGpuDriverProfile(); if (res.success) setGpuDriverProfile(prev => ({ ...prev, ...res })); } catch (e) {}
  };

  const checkHardwareBottlenecks = async () => {
    if (!window.api || !window.api.checkHardwareBottlenecks) return;
    try { const res = await window.api.checkHardwareBottlenecks(); if (res.success) setHardwareInfo(prev => ({ ...prev, ...res })); } catch (e) {}
  };

  const toggleVbs = async (enable) => {
    addLog(`[VBS] ${enable ? 'Enabling' : 'Disabling'} VBS...`);
    if (window.api && window.api.toggleVbs) {
      const res = await window.api.toggleVbs(enable);
      if (res.success) { setVbsStatus(p => ({ ...p, vbsEnabled: enable, memoryIntegrity: enable })); setVbsRebootRequired(true); addToast(`VBS toggled — reboot required`, 'warning'); }
    }
  };

  const toggleHpet = async (disable) => {
    if (window.api && window.api.toggleHpet) {
      const res = await window.api.toggleHpet(disable);
      if (res.success) { setHpetDisabled(disable); setHpetRebootRequired(true); addToast(`HPET toggled — reboot required`, 'warning'); }
    }
  };

  const toggleAmdMpo = async (disable) => {
    if (window.api && window.api.toggleAmdMpo) {
      const res = await window.api.toggleAmdMpo(disable);
      if (res.success) { setAmdOptimizations(p => ({ ...p, mpoDisabled: disable })); addToast(`MPO toggled`, 'success'); }
    }
  };

  const toggleAmdLegacyDx = async (enableLegacy) => {
    if (window.api && window.api.toggleAmdLegacyDx) {
      const res = await window.api.toggleAmdLegacyDx(enableLegacy);
      if (res.success) { setAmdOptimizations(p => ({ ...p, legacyDxPath: enableLegacy })); addToast(`Legacy DX toggled`, 'success'); }
    }
  };

  const toggleAmdShaderCache = async (alwaysOn) => {
    if (window.api && window.api.toggleAmdShaderCache) {
      const res = await window.api.toggleAmdShaderCache(alwaysOn);
      if (res.success) { setAmdOptimizations(p => ({ ...p, shaderCacheAlwaysOn: alwaysOn })); addToast(`Shader Cache policy toggled`, 'success'); }
    }
  };

  const applyGpuDriverProfile = async (profile) => {
    if (window.api && window.api.applyGpuDriverProfile) {
      const res = await window.api.applyGpuDriverProfile({ vendor: gpuInfo.vendor, profile });
      if (res.success) { await checkGpuDriverProfile(); addToast(`Driver profile applied`, 'success'); }
    }
  };

  const toggleLegacyRebar = async (enable) => {
    if (window.api && window.api.toggleLegacyRebar) {
      const res = await window.api.toggleLegacyRebar(enable);
      if (res.success) { setHardwareInfo(p => ({ ...p, legacyRebarForced: enable })); addToast(`Legacy ReBAR toggled`, enable ? 'warning' : 'success'); }
    }
  };

  const cleanAllShaderCaches = async () => {
    if (window.api && window.api.runCacheCleaner) await window.api.runCacheCleaner('purgeShader');
    setShaderCacheSize('0.00 Bytes'); addToast('Shader caches purged', 'success');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Power & Boost Tweaks
  // ─────────────────────────────────────────────────────────────────────────────

  const toggleGameMode = async () => {
    const nextVal = !gameModeActive;
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('gameMode', nextVal);
      if (res.success) setGameModeActive(nextVal);
    }
  };

  const togglePowerPlan = async () => {
    const nextMode = powerPlanMode === 'balanced' ? 'high' : 'balanced';
    if (window.api && window.api.setDashboardTweak) {
      // If we don't have the original plan saved, assume it's the opposite of what we're setting
      if (!originalPowerPlan) setOriginalPowerPlan(powerPlanMode);
      
      const res = await window.api.setDashboardTweak('powerPlan', nextMode);
      if (res.success) setPowerPlanMode(nextMode);
    }
  };

  // #13: Exported forceValorantPriority
  const forceValorantPriority = async () => {
    addLog('[Priority] Elevating VALORANT CPU priority status...');
    if (window.api && window.api.setDashboardTweak) {
      const res = await window.api.setDashboardTweak('forcePriority', true, { gameName: 'VALORANT-Win64-Shipping' });
      if (res.success) addToast('VALORANT CPU priority elevated to High', 'success');
      else addToast('VALORANT process not active. Start game first.', 'warning');
    }
  };

  const toggleTimerResolution = async (active) => {
    if (!window.api) return;
    const res = await window.api.setTimerResolution(active);
    if (res && res.success) setTimerResActive(active);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization & Polling
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const initializeApp = async () => {
      setInitMessage("Loading settings...");
      if (window.api && window.api.loadAppSettings) {
        try {
          const saved = await window.api.loadAppSettings();
          if (saved.success && saved.settings) {
            if (saved.settings.boostProfile) setBoostProfile(saved.settings.boostProfile);
            if (saved.settings.revertQueue) setRevertQueue(saved.settings.revertQueue); // #20
          }
        } catch (e) {}
      }

      try {
        setInitMessage("Scanning system paths...");
        await detectValorantPath();
        
        setInitMessage("Fetching system tweaks status...");
        await refreshAllStatus();

        setInitMessage("Loading configurations...");
        await loadValorantConfigs();
        await detectGpu();
        await checkHpetStatus();
        await checkAmdOptimizations();
        await checkGpuDriverProfile();
        await checkHardwareBottlenecks();
        await loadRegistryBackups();
      } catch (err) { console.error(err); } 
      finally { setIsInitializing(false); }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (window.api && window.api.saveAppSettings && !isInitializing) {
      window.api.saveAppSettings({ boostProfile, revertQueue }).catch(()=>{}); // #20: save revertQueue
    }
  }, [boostProfile, revertQueue, isInitializing]);

  useEffect(() => {
    const handleVisibility = () => setIsWindowVisible(document.visibilityState === 'visible');
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

  const previousValorantRunning = useRef(false);

  useEffect(() => {
    if (!isWindowVisible) return;
    if (!isElectron) return;

    const fetchStats = async () => {
      try {
        const data = await window.api.getSystemStats();
        setStats(data);
        if (typeof data.isAdmin === 'boolean') setIsAdmin(data.isAdmin);
        if (typeof data.valorantRunning === 'boolean') {
          setValorantRunning(data.valorantRunning);
          
          // #21: Auto-revert when VALORANT exits (true -> false transition)
          if (previousValorantRunning.current && !data.valorantRunning) {
            if (revertQueue.length > 0 || powerPlanMode === 'high') {
              triggerValorantAutoRevert();
            }
          }
          previousValorantRunning.current = data.valorantRunning;
        }

        // #23: Poll GPU Temp & Utilization
        if (window.api.detectGpu) {
          const gpuRes = await window.api.detectGpu();
          if (gpuRes.success && gpuRes.gpu) {
            setGpuInfo(prev => ({ ...prev, temperature: gpuRes.gpu.temperature, utilization: gpuRes.gpu.utilization }));
          }
        }

        // Poll Running Apps
        if (window.api.getRunningApps) {
          const appsRes = await window.api.getRunningApps();
          if (appsRes.success && appsRes.runningApps) {
            setRunningApps(appsRes.runningApps);
          }
        }
      } catch (err) {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [isElectron, isWindowVisible, revertQueue, powerPlanMode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Deep Boost & Tasks
  // ─────────────────────────────────────────────────────────────────────────────

  const runDeepPerformanceOptimize = async () => {
    const queue = [];
    if (optimizationOptions.pauseUpdates && bgServices.wuauserv !== false) {
      if (window.api && window.api.setDashboardTweak) {
        const res = await window.api.setDashboardTweak('bgService', false, { serviceName: 'wuauserv' });
        if (res.success) { queue.push('wuauserv'); setBgServices(p => ({...p, wuauserv: false})); }
      }
    }

    if (optimizationOptions.purgeApps) {
      const appsToKill = Object.keys(purgeAppsChecklist).filter(k => purgeAppsChecklist[k]);
      for (const app of appsToKill) {
        let exe = app === 'onedrive' ? 'OneDrive.exe' : `${app}.exe`;
        if (window.api && window.api.killProcess) await window.api.killProcess(exe);
      }
    }
    
    setRevertQueue(queue);
  };

  const triggerValorantAutoRevert = async () => {
    if (window.api && window.api.setDashboardTweak) {
      if (originalPowerPlan) {
        await window.api.setDashboardTweak('powerPlan', originalPowerPlan);
        setPowerPlanMode(originalPowerPlan);
      }
      if (revertQueue.includes('wuauserv')) {
        await window.api.setDashboardTweak('bgService', true, { serviceName: 'wuauserv' });
        setBgServices(p => ({...p, wuauserv: true}));
      }
    }
    setRevertQueue([]);
    addToast("Auto-Reverted temporary parameters", "info");
  };

  const triggerValorantAutoBoost = async () => {
    if (window.api && window.api.setDashboardTweak) {
      await window.api.setDashboardTweak('powerPlan', 'high');
      setPowerPlanMode('high');
      await window.api.setDashboardTweak('forcePriority', true, { gameName: 'VALORANT-Win64-Shipping' });
    }
    if (deepOptimizeActive) await runDeepPerformanceOptimize();
    addToast("Auto-Boost applied successfully!", "success");
  };

  const launchValorant = async () => {
    await triggerValorantAutoBoost();
    if (window.api && window.api.launchValorant) {
      addLog('[Launcher] Launching VALORANT via Riot Client...');
      const res = await window.api.launchValorant(valorantPath);
      if (res.success) addToast("VALORANT launched successfully!", "success");
      else addToast(`Failed to launch: ${res.error}`, "error");
    }
  };

  const toggleMaxBoost = async (enable, profileType = 'safe') => {
    if (enable) {
      setMaxBoostStatus('boosting'); setMaxBoostActive(true); setMaxBoostProgress(10);
      await new Promise(r => setTimeout(r, 200));

      if (profileType === 'safe') {
        setMaxBoostProgress(35);
        if (!gameModeActive) await toggleGameMode();
        if (powerPlanMode !== 'high') await togglePowerPlan();
        
        setMaxBoostProgress(70);
        if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
        for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
          if (!latencyTweaks[tweak]) await toggleLatencyTweak(tweak, true);
        }
        
        setMaxBoostProgress(90);
        await cleanAllShaderCaches();
        
        setMaxBoostProgress(100); setMaxBoostStatus('active');
        addToast("Safe Performance Boost activated!", "success");
      } else {
        setMaxBoostProgress(25);
        if (!gameModeActive) await toggleGameMode();
        if (powerPlanMode !== 'high') await togglePowerPlan();
        
        setMaxBoostProgress(50);
        if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
        for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
          if (!latencyTweaks[tweak]) await toggleLatencyTweak(tweak, true);
        }
        
        setMaxBoostProgress(75);
        if (!powerThrottlingDisabled) await togglePowerThrottling(true);
        if (!nicPowerSavingDisabled) await toggleNicPower(true);
        if (!persistentPriorityEnabled) await togglePersistentPriority(true);
        if (bgServices.XblAuthManager) await toggleBgService('XblAuthManager', false);
        
        setMaxBoostProgress(85);
        if (!timerResActive) await toggleTimerResolution(true);
        await cleanAllShaderCaches();
        
        setMaxBoostProgress(92);
        if (vbsStatus.vbsEnabled) await toggleVbs(false);
        if (gpuInfo.vendor === 'nvidia' || gpuInfo.vendor === 'amd') await applyGpuDriverProfile('performance');
        
        setMaxBoostProgress(100); setMaxBoostStatus('active');
        addToast("Max Performance Boost activated!", "success");
      }
    } else {
      setMaxBoostStatus('reverting'); setMaxBoostProgress(20);
      
      setMaxBoostProgress(50);
      if (registryStates.gameDvrDisabled) await toggleGameDvr(false);
      if (gameModeActive) await toggleGameMode();
      if (powerPlanMode !== 'balanced') await togglePowerPlan();
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend']) {
        if (latencyTweaks[tweak]) await toggleLatencyTweak(tweak, false);
      }
      
      setMaxBoostProgress(80);
      if (powerThrottlingDisabled) await togglePowerThrottling(false);
      if (nicPowerSavingDisabled) await toggleNicPower(false);
      if (persistentPriorityEnabled) await togglePersistentPriority(false);
      if (!bgServices.XblAuthManager) await toggleBgService('XblAuthManager', true);
      if (timerResActive) await toggleTimerResolution(false);

      setMaxBoostProgress(100); setMaxBoostActive(false); setMaxBoostStatus('idle');
      addToast("Restored default parameters", "success");
    }
  };

  const runDiagnosticFix = async (fixName) => {
    if (runningFix) return;
    setRunningFix(fixName); setFixStatusText(`Executing: ${fixName}...`);
    try {
      let macroKey = fixName === 'ramRejuvenation' ? 'm-ram' : (fixName === 'chronosReset' ? 'm-explorer' : '');
      if (window.api && window.api.runMacro && macroKey) {
        const res = await window.api.runMacro(macroKey);
        setFixStatusText(res.success ? `Success: ${fixName} completed.` : `Failed: ${res.error}`);
      }
    } catch (e) { setFixStatusText(`Error: ${e.message}`); } 
    finally { setRunningFix(null); }
  };

  const runMacro = async (macroKey, macroName) => {
    if (runningMacro) return;
    setRunningMacro(macroKey); addLog(`[Macro] Running: "${macroName}"`);
    try {
      const res = await window.api.runMacro(macroKey);
      if (res.success) addLog(`[Macro] Completed.`);
      else addLog(`[Macro Error] ${res.error}`);
    } catch (e) { addLog(`[Macro Exception] ${e.message}`); } 
    finally { setRunningMacro(null); }
  };

  const scanTempFolder = async () => {
    if (scanningTemp) return;
    setScanningTemp(true); addLog('[Storage] Analyzing temp file size...');
    try {
      const res = await window.api.runCacheCleaner('scan');
      if (res.success) { setTempFolderSize(formatBytes(res.tempBytes)); addLog(`[Storage] Temp size: ${formatBytes(res.tempBytes)}`); }
    } catch (e) {} finally { setScanningTemp(false); }
  };

  const purgeTempFolder = async () => {
    if (purgingTemp) return;
    setPurgingTemp(true); addLog('[Storage] Purging temporary files...');
    try {
      if (window.api && window.api.runCacheCleaner) await window.api.runCacheCleaner('purgeTemp');
      setTempFolderSize('0.00 Bytes'); addLog('[Storage] Temporary directories purged.');
    } catch (e) {} finally { setPurgingTemp(false); }
  };

  const scanValorantCaches = async () => {
    if (scanningVal) return;
    setScanningVal(true); addLog('[Scrubber] Scanning cache directories...');
    try {
      const res = await window.api.runCacheCleaner('scan');
      if (res.success) { setValorantLogsSize(formatBytes(res.valLogsBytes)); setShaderCacheSize(formatBytes(res.shaderBytes)); }
    } catch (e) {} finally { setScanningVal(false); }
  };

  const clearValorantLogs = async () => {
    if (cleaningLogs) return;
    setCleaningLogs(true);
    if (window.api && window.api.runCacheCleaner) await window.api.runCacheCleaner('purgeValLogs');
    setValorantLogsSize('0.00 Bytes'); addLog('[Scrubber] Client log directories purged.');
    setCleaningLogs(false);
  };

  const clearShaderCache = async () => {
    if (cleaningShaders) return;
    setCleaningShaders(true);
    if (window.api && window.api.runCacheCleaner) await window.api.runCacheCleaner('purgeShader');
    setShaderCacheSize('0.00 Bytes'); addLog('[Scrubber] DirectX shader caches purged.');
    setCleaningShaders(false);
  };

  const launchAdminPanel = async (utility) => {
    if (window.api && window.api.launchAdminUtility) await window.api.launchAdminUtility(utility);
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

  return (
    <AppContext.Provider value={{
      isElectron, setIsElectron,
      uiMode, setUiMode, activeAppTab, setActiveAppTab,
      systemLogs, setSystemLogs, valorantLogs: systemLogs, addLog,
      stats, setStats, tempFolderSize, setTempFolderSize,
      scanningTemp, setScanningTemp, purgingTemp, setPurgingTemp,
      defragSectors, setDefragSectors, files, setFiles, tweaks, setTweaks,
      runningMacro, setRunningMacro, isWindowVisible, setIsWindowVisible,
      runningFix, setRunningFix, fixStatusText, setFixStatusText,
      valorantRunning, setValorantRunning, autoBoostActive, setAutoBoostActive,
      gameModeActive, setGameModeActive, powerPlanMode, setPowerPlanMode,
      valorantLogsSize, setValorantLogsSize, shaderCacheSize, setShaderCacheSize,
      scanningVal, setScanningVal, cleaningLogs, setCleaningLogs,
      cleaningShaders, setCleaningShaders, deepOptimizeActive, setDeepOptimizeActive,
      optimizationOptions, setOptimizationOptions, revertQueue, setRevertQueue,
      purgeAppsChecklist, setPurgeAppsChecklist, runningApps, setRunningApps, isAdmin, setIsAdmin,
      valorantConfigs, setValorantConfigs, selectedConfig, setSelectedConfig,
      registryStates, setRegistryStates, latencyTweaks, setLatencyTweaks,
      monitorRefreshRate, setMonitorRefreshRate, frameLimitMode, setFrameLimitMode,
      gsyncDisabled, setGsyncDisabled, freesyncEnabled, setFreesyncEnabled,
      vanguardHealth, setVanguardHealth, bgServices, setBgServices,
      timerResActive, setTimerResActive, valorantPath, setValorantPath,
      valorantPathDetected, setValorantPathDetected, gpuInfo, setGpuInfo,
      nicPowerSavingDisabled, setNicPowerSavingDisabled, globalFsoDisabled, setGlobalFsoDisabled,
      powerThrottlingDisabled, setPowerThrottlingDisabled, msiEnabled, setMsiEnabled,
      persistentPriorityEnabled, setPersistentPriorityEnabled, vbsStatus, setVbsStatus,
      vbsRebootRequired, setVbsRebootRequired, hpetDisabled, setHpetDisabled,
      hpetRebootRequired, setHpetRebootRequired, amdOptimizations, setAmdOptimizations,
      gpuDriverProfile, setGpuDriverProfile, hardwareInfo, setHardwareInfo,
      maxBoostActive, setMaxBoostActive, maxBoostProgress, setMaxBoostProgress,
      maxBoostStatus, setMaxBoostStatus, boostProfile, setBoostProfile,
      toasts, setToasts, isInitializing, setIsInitializing,
      initMessage, setInitMessage, registryBackups, setRegistryBackups,
      isProcessing, processingMessage, addToast, removeToast,
      loadRegistryBackups, restoreBackup, deleteBackup, clearAllBackups, restoreAllBackups, executeOperation,
      toggleHags, toggleGameDvr, togglePriorityOptimized,
      loadValorantConfigs, saveValorantConfig, applyTournamentPreset,
      toggleLatencyTweak, applyFrameLimitSettings,
      toggleGsync, toggleFreesync, detectGpu, detectValorantPath, browseValorantPath,
      toggleNicPower, toggleGlobalFso, togglePowerThrottling, toggleMsiMode,
      togglePersistentPriority, toggleVbs, toggleHpet, toggleAmdMpo, toggleAmdLegacyDx,
      toggleAmdShaderCache, applyGpuDriverProfile, toggleLegacyRebar, cleanAllShaderCaches,
      applyOptimizationProfile, toggleMaxBoost, toggleBgService, toggleTimerResolution,
      runDeepPerformanceOptimize, triggerValorantAutoRevert, triggerValorantAutoBoost,
      runDiagnosticFix, runMacro, scanTempFolder, purgeTempFolder, launchAdminPanel, formatBytes, launchValorant,
      forceValorantPriority // #13: Exported
    }}>
      {children}
    </AppContext.Provider>
  );
}
