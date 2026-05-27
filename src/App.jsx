import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ValorantOptimizer from './components/ValorantOptimizer';
import AutoSentinel from './components/AutoSentinel';
import CommandPanel from './components/CommandPanel';
import Toast from './components/Toast';
import Explorer from './components/Explorer';
import TweakDeck from './components/TweakDeck';
import OneClickOptimize from './components/OneClickOptimize';

// Format Helper
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Premade 1-Click Macros List
const premadeMacros = [
  { key: 'm-dns', name: 'Flush DNS Cache', desc: 'Refreshes address lookup table for faster network requests.', cmd: 'ipconfig /flushdns' },
  { key: 'm-ram', name: 'Purge Memory Heap', desc: 'Runs garbage collector sweeps to clear unused memory blocks.', cmd: 'powershell -Command "[System.GC]::Collect()"' },
  { key: 'm-explorer', name: 'Restart Desktop UI', desc: 'Restores frozen Windows taskbars by restarting explorer.exe.', cmd: 'taskkill /f /im explorer.exe && start explorer.exe' }
];

export default function App() {
  const [isElectron, setIsElectron] = useState(true);
  const [activeTab, setActiveTab] = useState('optimizer');
  const [advancedMode, setAdvancedMode] = useState(false);
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

  // Storage Tweak & Defragmenter State
  const [tempFolderSize, setTempFolderSize] = useState('Click Scan');
  const [scanningTemp, setScanningTemp] = useState(false);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [defragSectors, setDefragSectors] = useState(Array(120).fill('empty'));
  const tweakLogs = systemLogs;
  const setTweakLogs = (val) => {
    setSystemLogs(prev => typeof val === 'function' ? val(prev) : val);
  };
  const [tweaks, setTweaks] = useState({
    darkMode: true,
    hiddenFiles: false,
    taskbarAutohide: false
  });

  // Premade 1-Click Macros State
  const [runningMacro, setRunningMacro] = useState(null);

  // Script Scroll Registry State
  const [scrolls, setScrolls] = useState([
    { id: 's-backup', title: 'Backup Code Workspace', desc: 'Compresses and copies src files', cmd: 'powershell -Command "Tar -cf src_backup.tar src/"' },
    { id: 's-dns', title: 'Flush DNS Cache', desc: 'Refreshes address lookup table', cmd: 'ipconfig /flushdns' },
    { id: 's-explorer', title: 'Restart Explorer', desc: 'Restores stuck taskbar graphics', cmd: 'taskkill /f /im explorer.exe && start explorer.exe' },
    { id: 's-proc', title: 'Kill Node processes', desc: 'Closes heavy node process instances', cmd: 'taskkill /f /im node.exe' }
  ]);
  const [newScroll, setNewScroll] = useState({ title: '', desc: '', cmd: '' });
  const [showAddScroll, setShowAddScroll] = useState(false);

  // Command Console
  const [cmdInput, setCmdInput] = useState('');
  const terminalLogs = systemLogs;
  const setTerminalLogs = (val) => {
    setSystemLogs(prev => typeof val === 'function' ? val(prev) : val);
  };
  const [executing, setExecuting] = useState(false);

  // Files Tab State
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState('');

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
  const [cleaningVal, setCleaningVal] = useState(false);
  const valorantLogs = systemLogs;
  const setValorantLogs = (val) => {
    setSystemLogs(prev => typeof val === 'function' ? val(prev) : val);
  };

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

  // One-Click Performance Booster State
  const [maxBoostActive, setMaxBoostActive] = useState(false);
  const [maxBoostProgress, setMaxBoostProgress] = useState(0);
  const maxBoostLogs = systemLogs;
  const setMaxBoostLogs = (val) => {
    setSystemLogs(prev => typeof val === 'function' ? val(prev) : val);
  };
  const [maxBoostStatus, setMaxBoostStatus] = useState('idle'); // 'idle' | 'boosting' | 'reverting' | 'active'

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

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
      // HAGS
      const hagsRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name 'HwSchMode' -ErrorAction SilentlyContinue).HwSchMode\"");
      setRegistryStates(prev => ({ ...prev, hagsEnabled: hagsRes.output.trim() === '2' }));

      // MSI
      const msiRes = await window.api.runSystemCommand("powershell -Command \"$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\(?<device>.+)') { $p = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\' + $Matches['device'] + '\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties'; if (Test-Path $p) { (Get-ItemProperty -Path $p -Name 'MSISupported' -ErrorAction SilentlyContinue).MSISupported -eq 1 } else { $false } } else { $false }\"");
      setMsiEnabled(msiRes.output.trim().toLowerCase() === 'true');

      // Game DVR
      const dvrRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_Enabled' -ErrorAction SilentlyContinue).GameDVR_Enabled\"");
      const dvrVal = dvrRes.success ? parseInt(dvrRes.output.trim(), 10) : 1;

      const respRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'SystemResponsiveness' -ErrorAction SilentlyContinue).SystemResponsiveness\"");
      const respVal = respRes.success ? parseInt(respRes.output.trim(), 10) : 14;

      setRegistryStates(prev => ({ ...prev, gameDvrDisabled: dvrVal === 0, priorityOptimized: respVal === 0 }));
    } catch (e) {
      console.error('Error checking registry states:', e);
    }
  };

  const toggleHags = async (enable) => {
    const val = enable ? 2 : 1;
    setSystemLogs(prev => [...prev, `[Registry Tweak] HAGS key value set to ${val}...`]);
    if (window.api) {
      const res = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name 'HwSchMode' -Value ${val} -ErrorAction Stop"`);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Registry Tweak] HAGS ${enable ? 'Enabled' : 'Disabled'}. reboot required.`]);
        setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
      } else {
        setSystemLogs(prev => [...prev, `[Registry Tweak Error] HAGS failed: ${res.error || 'Access Denied'}`]);
      }
    } else {
      setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
    }
  };

  const toggleGameDvr = async (disable) => {
    const val = disable ? 0 : 1;
    setSystemLogs(prev => [...prev, `[Registry Tweak] Game DVR status toggle to ${val}...`]);
    if (window.api) {
      const res1 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_Enabled' -Value ${val} -ErrorAction SilentlyContinue"`);
      const res2 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR' -Name 'AppCaptureEnabled' -Value ${val} -ErrorAction SilentlyContinue"`);
      if (res1.success || res2.success) {
        setSystemLogs(prev => [...prev, `[Registry Tweak] Game DVR ${disable ? 'Disabled' : 'Enabled'}.`]);
        setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
      }
    } else {
      setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
    }
  };

  const togglePriorityOptimized = async (enable) => {
    setSystemLogs(prev => [...prev, `[Registry Tweak] Multimedia priority parameters modified...`]);
    if (window.api) {
      if (enable) {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'SystemResponsiveness' -Value 0 -ErrorAction Stop"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 4294967295 -ErrorAction Stop"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'GPU Priority' -Value 8 -ErrorAction Stop"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Priority' -Value 6 -ErrorAction Stop"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Scheduling Category' -Value 'High' -ErrorAction Stop"`);
        setRegistryStates(prev => ({ ...prev, priorityOptimized: true }));
      } else {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'SystemResponsiveness' -Value 20 -ErrorAction SilentlyContinue"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 10 -ErrorAction SilentlyContinue"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'GPU Priority' -Value 8 -ErrorAction SilentlyContinue"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Priority' -Value 2 -ErrorAction SilentlyContinue"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Scheduling Category' -Value 'Medium' -ErrorAction SilentlyContinue"`);
        setRegistryStates(prev => ({ ...prev, priorityOptimized: false }));
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
          setSystemLogs(prev => [...prev, `[Config] Saved settings for client ${selectedConfig.accountId}`]);
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
      const mouseRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKCU:\\Control Panel\\Mouse' -Name 'MouseSpeed' -ErrorAction SilentlyContinue).MouseSpeed\"");
      const mouseVal = mouseRes.success ? mouseRes.output.trim() : '1';

      const usbRes = await window.api.runSystemCommand("powershell -Command \"powercfg /q SCHEME_CURRENT SUB_NONE 48e7d7a8-f3f5-4c07-b395-e7401140034a | Select-String -Pattern 'Current AC Power Setting Index'\"");
      const usbVal = usbRes.success && usbRes.output.includes('0x00000000');

      const parkingRes = await window.api.runSystemCommand("powershell -Command \"powercfg /q SCHEME_CURRENT sub_processor CPMinCores | Select-String -Pattern 'Current AC Power Setting Index'\"");
      const parkingVal = parkingRes.success && parkingRes.output.includes('0x00000064');

      const tickRes = await window.api.runSystemCommand("powershell -Command \"bcdedit /enum {current} | Select-String -Pattern 'disabledynamictick'\"");
      const tickVal = tickRes.success && tickRes.output.toLowerCase().includes('yes');

      const layersRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers' -ErrorAction SilentlyContinue).GetEnumerator() | Where-Object { $_.Name -like '*VALORANT-Win64-Shipping.exe' } | Select-Object -ExpandProperty Value\"");
      const layersVal = layersRes.success && layersRes.output.toLowerCase().includes('disabledxmaximizedwindowedmode');

      const prioRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\PriorityControl' -Name 'Win32PrioritySeparation' -ErrorAction SilentlyContinue).Win32PrioritySeparation\"");
      const prioVal = prioRes.success ? parseInt(prioRes.output.trim(), 10) : 26;

      setLatencyTweaks({
        disableMouseAccel: mouseVal === '0',
        disableUsbSuspend: usbVal,
        disableCoreParking: parkingVal,
        disableDynamicTick: tickVal,
        disableFullscreenOpt: layersVal,
        prioritySeparation: prioVal === 38
      });
    } catch (e) {
      console.error('Error checking latency registry states:', e);
    }
  };

  const toggleLatencyTweak = async (tweakName, active) => {
    setSystemLogs(prev => [...prev, `[Latency] Set ${tweakName} to ${active}...`]);
    if (!window.api) {
      setLatencyTweaks(prev => ({ ...prev, [tweakName]: active }));
      return;
    }
    let success = false;
    let cmd = '';
    try {
      if (tweakName === 'disableMouseAccel') {
        const speed = active ? '0' : '1';
        const t1 = active ? '0' : '6';
        const t2 = active ? '0' : '10';
        cmd = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Mouse' -Name 'MouseSpeed' -Value '${speed}'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Mouse' -Name 'MouseThreshold1' -Value '${t1}'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Mouse' -Name 'MouseThreshold2' -Value '${t2}'"`;
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      } 
      else if (tweakName === 'disableUsbSuspend') {
        const val = active ? '0' : '1';
        cmd = `powershell -Command "powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_NONE 48e7d7a8-f3f5-4c07-b395-e7401140034a ${val}; powercfg /reassociate"`;
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      }
      else if (tweakName === 'disableCoreParking') {
        const val = active ? '100' : '5';
        cmd = `powershell -Command "powercfg -setacvalueindex scheme_current sub_processor CPMinCores ${val}; powercfg /reassociate"`;
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      }
      else if (tweakName === 'disableDynamicTick') {
        cmd = active 
          ? 'powershell -Command "bcdedit /set disabledynamictick yes"' 
          : 'powershell -Command "bcdedit /deletevalue disabledynamictick"';
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      }
      else if (tweakName === 'disableFullscreenOpt') {
        const exePath = valorantPath;
        if (active) {
          cmd = `powershell -Command "New-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers' -Name '${exePath}' -Value '~ DISABLEDXMAXIMIZEDWINDOWEDMODE' -PropertyType String -Force -ErrorAction SilentlyContinue"`;
        } else {
          cmd = `powershell -Command "Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers' -Name '${exePath}' -ErrorAction SilentlyContinue"`;
        }
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      }
      else if (tweakName === 'prioritySeparation') {
        const val = active ? '38' : '26';
        cmd = `powershell -Command "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\PriorityControl' -Name 'Win32PrioritySeparation' -Value ${val} -ErrorAction Stop"`;
        const res = await window.api.runSystemCommand(cmd);
        success = res.success;
      }

      if (success) {
        setLatencyTweaks(prev => ({ ...prev, [tweakName]: active }));
      }
    } catch (e) {
      console.error(e);
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
    if (!window.api) return;
    try {
      const val = disable ? '0' : '1';
      const cmd = `powershell -Command "Set-ItemProperty -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Name 'NvCplGlobalVRREnablement' -Value ${val} -Type DWord -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(cmd);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFreesync = async (enable) => {
    setFreesyncEnabled(enable);
    if (!window.api) return;
    try {
      const freesyncVal = enable ? '1' : '0';
      if (gpuInfo.vendor === 'amd') {
        const amdCmd = `powershell -Command "try { $path = 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Control\\\\Class\\\\{4d36e968-e325-11ce-bfc1-08002be10318}'; $keys = Get-ChildItem $path -ErrorAction SilentlyContinue; foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableInternalLargePage' -Value ${freesyncVal} -Type DWord -ErrorAction SilentlyContinue } } catch {}"`;
        await window.api.runSystemCommand(amdCmd);
      } else if (gpuInfo.vendor === 'nvidia') {
        const nvCmd = `powershell -Command "Set-ItemProperty -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Name 'EnableAdaptiveSync' -Value ${freesyncVal} -Type DWord -ErrorAction SilentlyContinue"`;
        await window.api.runSystemCommand(nvCmd);
      }
    } catch (e) {
      console.error(e);
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
        flaggedDrivers: []
      });
      return;
    }
    try {
      const sbRes = await window.api.runSystemCommand("powershell -Command \"Confirm-SecureBootUEFI\"");
      const sbVal = sbRes.success && sbRes.output.trim().toLowerCase() === 'true' ? 'enabled' : 'disabled';

      const tpmRes = await window.api.runSystemCommand("powershell -Command \"(Get-Tpm).TpmPresent\"");
      const tpmVal = tpmRes.success && tpmRes.output.trim().toLowerCase() === 'true' ? 'active' : 'inactive';

      const vpnRes = await window.api.runSystemCommand("powershell -Command \"Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -ExpandProperty InterfaceDescription\"");
      let vpnActive = false;
      if (vpnRes.success) {
        const desc = vpnRes.output.toLowerCase();
        if (desc.includes('tap') || desc.includes('tun') || desc.includes('vpn') || desc.includes('wireguard') || desc.includes('openvpn')) {
          vpnActive = true;
        }
      }

      setVanguardHealth({
        secureBoot: sbVal,
        tpm2: tpmVal,
        vpnActive,
        gpuDriverWarning: false,
        csmDisabled: sbVal === 'enabled' ? 'disabled' : 'unknown',
        flaggedDrivers: []
      });
    } catch (e) {
      console.error(e);
    }
  };

  const checkBgServices = async () => {
    if (!window.api) return;
    try {
      const services = ['SysMain', 'XblAuthManager'];
      const states = {};
      for (const s of services) {
        const res = await window.api.runSystemCommand(`powershell -Command "(Get-Service -Name '${s}' -ErrorAction SilentlyContinue).Status"`);
        states[s] = res.success && res.output.trim().toLowerCase() === 'running';
      }
      setBgServices(states);
    } catch (e) {
      console.error(e);
    }
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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
      const res = await window.api.runSystemCommand("powershell -Command \"Get-NetAdapterAdvancedProperty -DisplayName 'Energy Efficient Ethernet' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty DisplayValue\"");
      setNicPowerSavingDisabled(res.success && res.output.trim().toLowerCase() === 'disabled');
    } catch (e) { setNicPowerSavingDisabled(false); }
  };

  const toggleNicPower = async (disablePowerSaving) => {
    if (window.api) {
      const val = disablePowerSaving ? 'Disabled' : 'Enabled';
      const cmd = `powershell -Command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Set-NetAdapterAdvancedProperty -DisplayName 'Energy Efficient Ethernet' -DisplayValue '${val}' -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(cmd);
      setNicPowerSavingDisabled(disablePowerSaving);
      addToast(`NIC power saving set to ${val.toLowerCase()}`, 'success');
    } else {
      setNicPowerSavingDisabled(disablePowerSaving);
    }
  };

  const checkPowerThrottling = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Name 'PowerThrottlingOff' -ErrorAction SilentlyContinue).PowerThrottlingOff\"");
      setPowerThrottlingDisabled(res.success && parseInt(res.output.trim(), 10) === 1);
    } catch (e) { setPowerThrottlingDisabled(false); }
  };

  const checkGlobalFso = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -ErrorAction SilentlyContinue).GameDVR_FSEBehaviorMode\"");
      setGlobalFsoDisabled(res.success && parseInt(res.output.trim(), 10) === 2);
    } catch (e) { setGlobalFsoDisabled(false); }
  };

  const toggleGlobalFso = async (disable) => {
    if (window.api) {
      if (disable) {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -Value 2 -Type DWord"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_HonorUserFSEBehaviorMode' -Value 1 -Type DWord"`);
      } else {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -Value 0 -Type DWord"`);
      }
      setGlobalFsoDisabled(disable);
      addToast(`Global FSO set to ${disable ? 'disabled' : 'enabled'}`, 'success');
    } else {
      setGlobalFsoDisabled(disable);
    }
  };

  const togglePowerThrottling = async (disable) => {
    if (isElectron) {
      const val = disable ? 1 : 0;
      const cmd = `powershell -Command "if (-not (Test-Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling')) { New-Item -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Name 'PowerThrottlingOff' -Value ${val} -Type DWord -Force"`;
      await window.api.runSystemCommand(cmd);
      setPowerThrottlingDisabled(disable);
    } else {
      setPowerThrottlingDisabled(disable);
    }
  };

  const toggleMsiMode = async (enable) => {
    if (isElectron) {
      const val = enable ? 1 : 0;
      const cmd = `powershell -Command "$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\(?<device>.+)') { $p = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\' + $Matches['device'] + '\\Device Parameters'; $intMgmt = Join-Path $p 'Interrupt Management'; if (-not (Test-Path $intMgmt)) { New-Item -Path $intMgmt -Force | Out-Null }; $msi = Join-Path $intMgmt 'MessageSignaledInterruptProperties'; if (-not (Test-Path $msi)) { New-Item -Path $msi -Force | Out-Null }; Set-ItemProperty -Path $msi -Name 'MSISupported' -Value ${val} -Type DWord -Force | Out-Null }"`;
      await window.api.runSystemCommand(cmd);
      setMsiEnabled(enable);
    } else {
      setMsiEnabled(enable);
    }
  };

  const checkPersistentPriority = async () => {
    if (!window.api) return;
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Name 'CpuPriorityClass' -ErrorAction SilentlyContinue).CpuPriorityClass\"");
      setPersistentPriorityEnabled(res.success && parseInt(res.output.trim(), 10) === 3);
    } catch (e) { setPersistentPriorityEnabled(false); }
  };

  const togglePersistentPriority = async (enable) => {
    if (window.api) {
      const cmd = enable
        ? `powershell -Command "if (-not (Test-Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions')) { New-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Name 'CpuPriorityClass' -Value 3 -Type DWord -Force"`
        : `powershell -Command "Remove-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Force -ErrorAction SilentlyContinue"`;
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setPersistentPriorityEnabled(enable);
        addToast(`Persistent priority ${enable ? 'enabled' : 'disabled'}`, 'success');
      }
    } else {
      setPersistentPriorityEnabled(enable);
    }
  };

  const cleanAllShaderCaches = async () => {
    if (window.api) {
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\AMD\\DxCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
    }
    setShaderCacheSize('0.00 Bytes');
    addToast('All shader caches purged', 'success');
  };

  const applyOptimizationProfile = async (profileName) => {
    addToast(`Applying ${profileName} preset...`, 'info');
    if (profileName === 'tournament') {
      if (selectedConfig) await applyTournamentPreset();
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      if (!registryStates.priorityOptimized) await togglePriorityOptimized(true);
      if (!globalFsoDisabled) await toggleGlobalFso(true);
      if (!latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', true);
      if (!timerResActive) await toggleTimerResolution(true);
    } else if (profileName === 'balanced') {
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
    } else if (profileName === 'streaming') {
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      if (!registryStates.priorityOptimized) await togglePriorityOptimized(true);
    } else if (profileName === 'revert') {
      if (registryStates.gameDvrDisabled) await toggleGameDvr(false);
      if (registryStates.priorityOptimized) await togglePriorityOptimized(false);
      if (globalFsoDisabled) await toggleGlobalFso(false);
      if (latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', false);
      if (timerResActive) await toggleTimerResolution(false);
    }
  };

  const toggleMaxBoost = async (enable) => {
    if (enable) {
      setMaxBoostStatus('boosting');
      setMaxBoostActive(true);
      setMaxBoostProgress(10);
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(30);
      if (gameModeActive !== true) await toggleGameMode();
      if (powerPlanMode !== 'high') await togglePowerPlan();
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(60);
      if (registryStates.hagsEnabled !== true) await toggleHags(true);
      if (registryStates.gameDvrDisabled !== true) await toggleGameDvr(true);
      if (registryStates.priorityOptimized !== true) await togglePriorityOptimized(true);
      
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend', 'disableCoreParking', 'disableDynamicTick', 'disableFullscreenOpt']) {
        if (latencyTweaks[tweak] !== true) {
          await toggleLatencyTweak(tweak, true);
        }
      }
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(85);
      if (globalFsoDisabled !== true) await toggleGlobalFso(true);
      if (powerThrottlingDisabled !== true) await togglePowerThrottling(true);

      for (const svc of ['SysMain', 'XblAuthManager']) {
        if (bgServices[svc] === true) {
          await toggleBgService(svc, false);
        }
      }
      if (timerResActive !== true) await toggleTimerResolution(true);
      await cleanAllShaderCaches();

      setMaxBoostProgress(100);
      setMaxBoostStatus('active');
      addToast("Performance booster active!", "success");
    } else {
      setMaxBoostStatus('reverting');
      setMaxBoostProgress(20);
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(50);
      if (registryStates.hagsEnabled !== false) await toggleHags(false);
      if (registryStates.gameDvrDisabled !== false) await toggleGameDvr(false);
      if (registryStates.priorityOptimized !== false) await togglePriorityOptimized(false);
      if (gameModeActive !== false) await toggleGameMode();
      if (powerPlanMode !== 'balanced') await togglePowerPlan();
      
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend', 'disableCoreParking', 'disableDynamicTick', 'disableFullscreenOpt']) {
        if (latencyTweaks[tweak] !== false) {
          await toggleLatencyTweak(tweak, false);
        }
      }
      await new Promise(r => setTimeout(r, 200));

      setMaxBoostProgress(80);
      if (globalFsoDisabled !== false) await toggleGlobalFso(false);
      if (powerThrottlingDisabled !== false) await togglePowerThrottling(false);

      for (const svc of ['SysMain', 'XblAuthManager']) {
        if (bgServices[svc] === false) {
          await toggleBgService(svc, true);
        }
      }
      if (timerResActive !== false) await toggleTimerResolution(false);

      setMaxBoostProgress(0);
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
    const action = start ? 'Start-Service' : 'Stop-Service';
    const res = await window.api.runSystemCommand(`powershell -Command "${action} -Name '${serviceName}' -Force"`);
    if (res.success) {
      setBgServices(prev => ({ ...prev, [serviceName]: start }));
      addToast(`${serviceName} modified successfully`, 'success');
    }
  };

  const toggleTimerResolution = async (active) => {
    setTimerResActive(active);
    if (!window.api) return;
    if (window.api.setTimerResolution) {
      await window.api.setTimerResolution(active);
    } else {
      if (active) {
        const startCmd = "powershell -Command \"Start-Process powershell -WindowStyle Hidden -ArgumentList '-Command', '`\"$code = \\'\\'\\`[DllImport(\\\\\\\"ntdll.dll\\\\\")] public static extern int NtSetTimerResolution(uint DesiredResolution, bool SetResolution, out uint CurrentResolution);\\'\\'; Add-Type -MemberDefinition $code -Name \\'\\'Timer\\'\\' -Namespace \\'\\'Win32\\'\\' -PassThru; [uint]$current = 0; while ($true) { \\`[Win32.Timer\\`]::NtSetTimerResolution(5000, $true, [ref]$current); Start-Sleep -Seconds 2 }`\"'\"";
        await window.api.runSystemCommand(startCmd);
      } else {
        const stopCmd = "powershell -Command \"Get-CimInstance Win32_Process -Filter \\\"Name = 'powershell.exe'\\\" | Where-Object { $_.CommandLine -like '*NtSetTimerResolution*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }\"";
        await window.api.runSystemCommand(stopCmd);
      }
    }
  };

  // Check Administrator role, load registry and configs on load
  useEffect(() => {
    const initializeApp = async () => {
      if (window.api) {
        try {
          const res = await window.api.runSystemCommand('net session');
          setIsAdmin(res.success);
        } catch (e) {
          setIsAdmin(false);
        }
      }
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
    };
    initializeApp();
  }, []);

  // Background Daemon for Auto-Boost check
  useEffect(() => {
    const daemon = setInterval(async () => {
      if (!autoBoostActive) return;

      if (isElectron) {
        try {
          const res = await window.api.runSystemCommand('tasklist');
          const isCurrentlyRunning = res.success && res.output.includes('VALORANT-Win64-Shipping');
          
          if (isCurrentlyRunning && !valorantRunning) {
            triggerValorantAutoBoost();
          } else if (!isCurrentlyRunning && valorantRunning) {
            triggerValorantAutoRevert();
          }
          setValorantRunning(isCurrentlyRunning);
        } catch (e) {
          console.error(e);
        }
      }
    }, 4000);

    return () => clearInterval(daemon);
  }, [autoBoostActive, valorantRunning, isElectron, deepOptimizeActive, optimizationOptions, purgeAppsChecklist, revertQueue]);

  // Run deep system performance enhancements
  const runDeepPerformanceOptimize = async () => {
    const queue = [];
    if (optimizationOptions.pauseUpdates) {
      if (isElectron) {
        const res = await window.api.runSystemCommand("powershell -Command \"Stop-Service -Name 'wuauserv' -Force -ErrorAction Stop\"");
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
        if (isElectron) {
          await window.api.runSystemCommand(`taskkill /f /im ${app}`);
        }
      }
    }

    setRevertQueue(queue);
  };

  // Revert temporary deep optimizations
  const triggerValorantAutoRevert = async () => {
    if (isElectron) {
      await window.api.runSystemCommand("powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e");
    }
    if (revertQueue.includes('wuauserv')) {
      if (isElectron) {
        await window.api.runSystemCommand("powershell -Command \"Start-Service -Name 'wuauserv'\"");
      }
    }
    setRevertQueue([]);
    addToast("Auto-Reverted temporary parameters", "info");
  };

  // Trigger automated Valorant priority boosting
  const triggerValorantAutoBoost = async () => {
    if (isElectron) {
      await window.api.runSystemCommand("powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c");
      await window.api.runSystemCommand(
        `powershell -Command "Get-Process -Name 'VALORANT', 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
      );
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

  // System statistics polling
  useEffect(() => {
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
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [isElectron]);

  // Load files
  const loadFiles = async () => {
    setLoadingFiles(true);
    setFileError('');
    if (!isElectron) {
      setTimeout(() => setLoadingFiles(false), 300);
      return;
    }
    try {
      const response = await window.api.listWorkspaceFiles();
      if (response.success) {
        setFiles(response.files);
      } else {
        setFileError(response.error);
      }
    } catch (err) {
      setFileError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Run native command line console script
  const runCommand = async () => {
    const cmd = cmdInput.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, `> ${cmd}`, 'Executing command...']);
    setCmdInput('');
    setExecuting(true);

    if (!isElectron) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev.slice(0, -1),
          `[Mock Terminal Output]: Command "${cmd}" completed.`
        ]);
        setExecuting(false);
      }, 500);
      return;
    }

    try {
      const response = await window.api.runSystemCommand(cmd);
      setTerminalLogs(prev => [
        ...prev.slice(0, -1),
        response.success ? (response.output || 'Done.') : `Error: ${response.error}\n${response.output || ''}`
      ]);
    } catch (err) {
      setTerminalLogs(prev => [...prev.slice(0, -1), `Exception: ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  // Run active diagnostic fixes
  const runDiagnosticFix = async (fixName) => {
    if (runningFix) return;
    setRunningFix(fixName);
    setFixStatusText(`Executing: ${fixName}...`);

    setTimeout(async () => {
      let cmd = '';
      if (fixName === 'ramRejuvenation') cmd = 'powershell -Command "[System.GC]::Collect()"';
      else if (fixName === 'chronosReset') cmd = 'taskkill /f /im explorer.exe && start explorer.exe';

      if (isElectron && cmd) {
        const res = await window.api.runSystemCommand(cmd);
        setFixStatusText(res.success ? `Success: ${fixName} completed.` : `Failed: ${res.error}`);
      } else {
        setFixStatusText(`[Mock Success]: ${fixName} completed.`);
      }
      setTimeout(() => setRunningFix(null), 1000);
    }, 1000);
  };

  // Premade 1-Click Macros Engine
  const runMacro = async (macroKey, macroName, cmd) => {
    if (runningMacro) return;
    
    setRunningMacro(macroKey);
    setSystemLogs(prev => [...prev, `[Macro] Running: "${macroName}"`]);

    if (!isElectron) {
      setTimeout(() => {
        setRunningMacro(null);
        setSystemLogs(prev => [...prev, `[Macro] Completed.`]);
      }, 1000);
      return;
    }

    try {
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Macro] Completed.`]);
      } else {
        setSystemLogs(prev => [...prev, `[Macro Error] ${res.error}`]);
      }
    } catch (e) {
      setSystemLogs(prev => [...prev, `[Macro Exception] ${e.message}`]);
    } finally {
      setRunningMacro(null);
    }
  };

  // Toggle quick registry tweak
  const toggleTweak = async (tweakName, cmdOn, cmdOff) => {
    const nextVal = !tweaks[tweakName];
    setTweaks(prev => ({ ...prev, [tweakName]: nextVal }));
    setSystemLogs(prev => [...prev, `[Tweak] Set ${tweakName} to ${nextVal}`]);

    if (isElectron) {
      const cmd = nextVal ? cmdOn : cmdOff;
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setSystemLogs(prev => [...prev, `[Tweak] Registry key updated.`]);
      }
    }
  };

  // Sector defragmenter drive scanning simulation
  const scanTempFolder = async () => {
    if (scanningTemp) return;
    setScanningTemp(true);
    setSystemLogs(prev => [...prev, '[Storage] Analyzing temp file size...']);

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
        setSystemLogs(prev => [...prev, '[Storage] Scan completed. Size: 1.84 GB']);
      }, 1000);
      return;
    }

    try {
      const scanCmd = `powershell -Command "Get-ChildItem -Path $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`;
      const res = await window.api.runSystemCommand(scanCmd);
      if (res.success) {
        const bytes = parseInt(res.output.trim()) || 0;
        setTempFolderSize(formatBytes(bytes));
        setSystemLogs(prev => [...prev, `[Storage] Scan completed. Size: ${formatBytes(bytes)}`]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningTemp(false);
    }
  };

  // Defrag drive purge
  const purgeTempFolder = async () => {
    if (purgingTemp) return;
    setPurgingTemp(true);
    setSystemLogs(prev => [...prev, '[Storage] Purging temporary files...']);

    let currentRow = 0;
    const rowCount = 10;
    const colsCount = 12;

    const interval = setInterval(() => {
      if (currentRow >= rowCount) {
        clearInterval(interval);
        finalizeDefragWipe();
        return;
      }

      setDefragSectors(prev => {
        const updated = [...prev];
        const startIndex = currentRow * colsCount;
        for (let i = 0; i < colsCount; i++) {
          const cellIndex = startIndex + i;
          if (updated[cellIndex] === 'temp') {
            updated[cellIndex] = 'empty';
          }
        }
        return updated;
      });

      currentRow++;
    }, 80);
  };

  const finalizeDefragWipe = async () => {
    if (isElectron) {
      const purgeCmd = `powershell -Command "Remove-Item -Path '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(purgeCmd);
    }
    setTempFolderSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Storage] Temporary directories purged successfully.']);
    setPurgingTemp(false);
  };

  // Administrative launcher utility
  const launchAdminPanel = async (utility) => {
    let cmd = '';
    if (utility === 'taskmgr') cmd = 'start taskmgr';
    else if (utility === 'regedit') cmd = 'start regedit';
    else if (utility === 'devmgmt') cmd = 'start devmgmt.msc';
    else if (utility === 'envvars') cmd = 'start rundll32.exe sysdm.cpl,EditEnvironmentVariables';

    if (isElectron && cmd) {
      await window.api.runSystemCommand(cmd);
    }
  };

  // Script Scroll creation
  const addScroll = (e) => {
    e.preventDefault();
    if (!newScroll.title || !newScroll.cmd) return;
    const id = `s-${Math.floor(Math.random() * 1000)}`;
    setScrolls(prev => [...prev, { id, ...newScroll }]);
    setNewScroll({ title: '', desc: '', cmd: '' });
    setShowAddScroll(false);
    setSystemLogs(prev => [...prev, `[Scroll Registry] Scroll saved: ${newScroll.title}`]);
  };

  const removeScroll = (id) => {
    setScrolls(prev => prev.filter(s => s.id !== id));
    setSystemLogs(prev => [...prev, `[Scroll Registry] Scroll deleted.`]);
  };

  // Valorant Tweaks Actions
  const toggleGameMode = async () => {
    const nextVal = !gameModeActive;
    setGameModeActive(nextVal);
    
    if (isElectron) {
      const val = nextVal ? 1 : 0;
      await window.api.runSystemCommand(
        `powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\GameBar -Name AllowAutoGameMode -Value ${val}"`
      );
    }
  };

  const togglePowerPlan = async () => {
    const nextMode = powerPlanMode === 'balanced' ? 'high' : 'balanced';
    setPowerPlanMode(nextMode);

    if (isElectron) {
      const guid = nextMode === 'high' 
        ? '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'
        : '381b4222-f694-41f0-9685-ff5bb260df2e';
      
      await window.api.runSystemCommand(`powercfg /setactive ${guid}`);
    }
  };

  const forceValorantPriority = async () => {
    setSystemLogs(prev => [...prev, '[Priority] Elevating VALORANT CPU priority status...']);

    if (isElectron) {
      const check = await window.api.runSystemCommand('tasklist');
      if (check.success && check.output.includes('VALORANT-Win64-Shipping')) {
        const res = await window.api.runSystemCommand(
          `powershell -Command "Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
        );
        if (res.success) {
          setSystemLogs(prev => [...prev, '[Priority] Process priority class elevated.']);
          addToast('VALORANT CPU priority elevated to High', 'success');
        }
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
    setSystemLogs(prev => [...prev, '[Scrubber] Scanning cache directories...']);

    if (!isElectron) {
      setTimeout(() => {
        setScanningVal(false);
        setValorantLogsSize('142 MB');
        setShaderCacheSize('844 MB');
      }, 1000);
      return;
    }

    try {
      const logCmd = `powershell -Command \"if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Get-ChildItem -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum } else { echo 0 }\"`;
      const logRes = await window.api.runSystemCommand(logCmd);
      const logBytes = parseInt(logRes.output.trim()) || 0;
      setValorantLogsSize(formatBytes(logBytes));

      const shaderCmd = `powershell -Command \"(Get-ChildItem -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache', '$env:LOCALAPPDATA\\NVIDIA\\GLCache', '$env:LOCALAPPDATA\\AMD\\DxCache', '$env:LOCALAPPDATA\\D3DSCache' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum\"`;
      const shaderRes = await window.api.runSystemCommand(shaderCmd);
      const shaderBytes = parseInt(shaderRes.output.trim()) || 0;
      setShaderCacheSize(formatBytes(shaderBytes));
    } catch (e) {
      console.error(e);
    } finally {
      setScanningVal(false);
    }
  };

  const clearValorantLogs = async () => {
    if (cleaningVal) return;
    setCleaningVal(true);

    if (isElectron) {
      const purgeLogs = `powershell -Command "if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Remove-Item -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs\\*' -Recurse -Force -ErrorAction SilentlyContinue }"`;
      await window.api.runSystemCommand(purgeLogs);
    }
    setValorantLogsSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Scrubber] Client log directories purged.']);
    setCleaningVal(false);
  };

  const clearShaderCache = async () => {
    if (cleaningVal) return;
    setCleaningVal(true);

    if (isElectron) {
      const purgeShader = `powershell -Command "Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*', '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*', '$env:LOCALAPPDATA\\AMD\\DxCache\\*', '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(purgeShader);
    }
    setShaderCacheSize('0.00 Bytes');
    setSystemLogs(prev => [...prev, '[Scrubber] DirectX shader caches purged.']);
    setCleaningVal(false);
  };

  return (
    <div className="flex flex-col h-screen select-none bg-white text-slate-800 font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Skeleton Window Header */}
      <header className="titlebar-drag h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">NEUROPTIMIZE CYBER DECK [Skeleton Mode]</span>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          {!isElectron && (
            <span className="bg-amber-100 text-amber-800 border border-amber-250 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              Simulation Mode
            </span>
          )}
        </div>
      </header>

      {/* Tabs navigation structure */}
      <Tabs.Root value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === 'files') loadFiles();
      }} className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          stats={stats} 
          advancedMode={advancedMode}
          setAdvancedMode={setAdvancedMode}
          setActiveTab={setActiveTab}
        />

        {/* Tab views content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto relative bg-white">
            
            {/* Tab: 1-Click System Optimizer */}
            <Tabs.Content value="optimizer" className="h-full outline-none">
              <OneClickOptimize 
                isOptimizing={maxBoostStatus === 'boosting'}
                isOptimized={maxBoostStatus === 'active'}
                onOptimize={() => toggleMaxBoost(true)}
                onRevert={() => toggleMaxBoost(false)}
                isAdmin={isAdmin}
              />
            </Tabs.Content>
          
            {/* Tab: Core Dashboard */}
            <Tabs.Content value="dashboard" className="outline-none">
              <Dashboard 
                stats={stats} 
                runDiagnosticFix={runDiagnosticFix} 
                runningFix={runningFix}
                premadeMacros={premadeMacros}
                runningMacro={runningMacro}
                runMacro={runMacro}
                fixStatusText={fixStatusText}
                gpuInfo={gpuInfo}
                maxBoostActive={maxBoostActive}
                maxBoostProgress={maxBoostProgress}
                maxBoostLogs={maxBoostLogs}
                maxBoostStatus={maxBoostStatus}
                toggleMaxBoost={toggleMaxBoost}
                registryStates={registryStates}
                gameModeActive={gameModeActive}
                powerPlanMode={powerPlanMode}
                timerResActive={timerResActive}
              />
            </Tabs.Content>

            {/* Tab: Valorant Optimizer */}
            <Tabs.Content value="valorant" className="outline-none">
              <ValorantOptimizer 
                isElectron={isElectron}
                valorantPath={valorantPath}
                valorantPathDetected={valorantPathDetected}
                browseValorantPath={browseValorantPath}
                valorantRunning={valorantRunning}
                setValorantRunning={setValorantRunning}
                autoBoostActive={autoBoostActive}
                setAutoBoostActive={setAutoBoostActive}
                gameModeActive={gameModeActive}
                toggleGameMode={toggleGameMode}
                powerPlanMode={powerPlanMode}
                togglePowerPlan={togglePowerPlan}
                forceValorantPriority={forceValorantPriority}
                valorantLogsSize={valorantLogsSize}
                shaderCacheSize={shaderCacheSize}
                scanValorantCaches={scanValorantCaches}
                clearValorantLogs={clearValorantLogs}
                clearShaderCache={clearShaderCache}
                scanningVal={scanningVal}
                cleaningVal={cleaningVal}
                valorantLogs={valorantLogs}
                triggerValorantAutoBoost={triggerValorantAutoBoost}
                deepOptimizeActive={deepOptimizeActive}
                setDeepOptimizeActive={setDeepOptimizeActive}
                optimizationOptions={optimizationOptions}
                setOptimizationOptions={setOptimizationOptions}
                purgeAppsChecklist={purgeAppsChecklist}
                setPurgeAppsChecklist={setPurgeAppsChecklist}
                triggerValorantAutoRevert={triggerValorantAutoRevert}
                revertQueue={revertQueue}
                isAdmin={isAdmin}
                valorantConfigs={valorantConfigs}
                selectedConfig={selectedConfig}
                setSelectedConfig={setSelectedConfig}
                saveValorantConfig={saveValorantConfig}
                applyTournamentPreset={applyTournamentPreset}
                registryStates={registryStates}
                toggleHags={toggleHags}
                toggleGameDvr={toggleGameDvr}
                togglePriorityOptimized={togglePriorityOptimized}
                checkRegistryStates={checkRegistryStates}
                latencyTweaks={latencyTweaks}
                toggleLatencyTweak={toggleLatencyTweak}
                monitorRefreshRate={monitorRefreshRate}
                frameLimitMode={frameLimitMode}
                applyFrameLimitSettings={applyFrameLimitSettings}
                vanguardHealth={vanguardHealth}
                bgServices={bgServices}
                timerResActive={timerResActive}
                checkVanguardHealth={checkVanguardHealth}
                checkBgServices={checkBgServices}
                toggleBgService={toggleBgService}
                toggleTimerResolution={toggleTimerResolution}
                gpuInfo={gpuInfo}
                nicPowerSavingDisabled={nicPowerSavingDisabled}
                toggleNicPower={toggleNicPower}
                globalFsoDisabled={globalFsoDisabled}
                toggleGlobalFso={toggleGlobalFso}
                powerThrottlingDisabled={powerThrottlingDisabled}
                togglePowerThrottling={togglePowerThrottling}
                msiEnabled={msiEnabled}
                toggleMsiMode={toggleMsiMode}
                cleanAllShaderCaches={cleanAllShaderCaches}
                applyOptimizationProfile={applyOptimizationProfile}
                gsyncDisabled={gsyncDisabled}
                freesyncEnabled={freesyncEnabled}
                toggleGsync={toggleGsync}
                toggleFreesync={toggleFreesync}
                persistentPriorityEnabled={persistentPriorityEnabled}
                togglePersistentPriority={togglePersistentPriority}
              />
            </Tabs.Content>

            {/* Tab: Tweak Deck & Registry Settings */}
            <Tabs.Content value="tweaks" className="outline-none">
              <TweakDeck 
                tempFolderSize={tempFolderSize}
                scanningTemp={scanningTemp}
                purgingTemp={purgingTemp}
                defragSectors={defragSectors}
                tweakLogs={tweakLogs}
                tweaks={tweaks}
                toggleTweak={toggleTweak}
                scanTempFolder={scanTempFolder}
                purgeTempFolder={purgeTempFolder}
                launchAdminPanel={launchAdminPanel}
                scrolls={scrolls}
                removeScroll={removeScroll}
                newScroll={newScroll}
                setNewScroll={setNewScroll}
                addScroll={addScroll}
                showAddScroll={showAddScroll}
                setShowAddScroll={setShowAddScroll}
              />
            </Tabs.Content>

            {/* Tab: Auto Sentinel flowchart */}
            <Tabs.Content value="automation" className="h-full flex flex-col outline-none">
              <AutoSentinel 
                stats={stats}
                scrolls={scrolls}
                isElectron={isElectron}
                setTerminalLogs={setTerminalLogs}
              />
            </Tabs.Content>

            {/* Tab: Command Line Console */}
            <Tabs.Content value="terminal" className="outline-none">
              <CommandPanel 
                cmdInput={cmdInput}
                setCmdInput={setCmdInput}
                terminalLogs={terminalLogs}
                executing={executing}
                runCommand={runCommand}
                terminalEndRef={null}
              />
            </Tabs.Content>

            {/* Tab: File Explorer */}
            <Tabs.Content value="files" className="outline-none">
              <Explorer 
                loadingFiles={loadingFiles}
                fileError={fileError}
                files={files}
                loadFiles={loadFiles}
                formatBytes={formatBytes}
              />
            </Tabs.Content>

          </main>
        </div>
      </Tabs.Root>
    </div>
  );
}
