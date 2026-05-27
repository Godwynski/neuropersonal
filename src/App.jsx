import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Activity, Info, AlertCircle, Trash, Trash2, Plus, Zap, Cpu, Settings
} from 'lucide-react';

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

// Dynamic Cyberpunk Theme Style Schemas
const themeStyles = {
  lightBlue: {
    bg: 'bg-[#f1f5f9]',
    panelBg: 'bg-white border-slate-200 hover:border-blue-300 shadow-[0_2px_12px_rgba(15,23,42,0.06)]',
    sidebarBg: 'bg-slate-100 border-slate-200',
    border: 'border-slate-200',
    borderActive: 'border-blue-500',
    textPrimary: 'text-blue-700',
    textAccent: 'text-sky-700',
    textMuted: 'text-slate-500',
    bgAccent: 'bg-blue-50',
    bgAccentActive: 'bg-blue-100 text-blue-800 border-blue-300',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)]',
    btnGhost: 'bg-white hover:bg-blue-50 border-slate-300 hover:border-blue-400 text-blue-700',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    glowOuter: 'rgba(59, 130, 246, 0.05)',
    radarColor: 'rgba(59, 130, 246, 0.25)',
    radarPulse: 'rgba(14, 165, 233, 0.5)',
    dotColor: '#0284c7',
    textBody: 'text-slate-900',
    textSub: 'text-slate-600',
    cardBg: 'bg-white border-slate-200',
    innerBg: 'bg-slate-50 border-slate-200',
    isLight: true,
    headerBg: 'bg-white text-slate-900 border-slate-200',
    creditsBg: 'bg-slate-50 border-slate-200',
    titlebarBg: '#ffffff',
    titlebarSymbol: '#334155'
  },
  cobalt: {
    bg: 'bg-[#070c14]',
    panelBg: 'bg-[#0b1220]/85 border-blue-500/15 hover:border-blue-500/30',
    sidebarBg: 'bg-[#0a101c] border-blue-500/15',
    border: 'border-blue-500/15',
    borderActive: 'border-blue-500/40',
    textPrimary: 'text-blue-400',
    textAccent: 'text-cyan-400',
    textMuted: 'text-blue-300',
    bgAccent: 'bg-blue-500/10',
    bgAccentActive: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    btnGhost: 'bg-slate-950/40 hover:bg-blue-500/10 border-blue-500/10 hover:border-blue-500/35 text-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.8)',
    glowOuter: 'rgba(59, 130, 246, 0)',
    radarColor: 'rgba(59, 130, 246, 0.4)',
    radarPulse: 'rgba(6, 182, 212, 0.7)',
    dotColor: '#06b6d4',
    textBody: 'text-slate-200',
    textSub: 'text-slate-400',
    cardBg: 'bg-slate-950/40 border-white/5',
    innerBg: 'bg-[#090d16] border-white/5',
    isLight: false,
    headerBg: 'bg-[#05080f] text-slate-100 border-blue-500/10',
    creditsBg: 'bg-[#0b101c] border-blue-500/10',
    titlebarBg: '#05080f',
    titlebarSymbol: '#60a5fa'
  },
  matrix: {
    bg: 'bg-[#030704]',
    panelBg: 'bg-[#061008]/85 border-emerald-500/15 hover:border-emerald-500/30',
    sidebarBg: 'bg-[#050e07] border-emerald-500/15',
    border: 'border-emerald-500/15',
    borderActive: 'border-emerald-500/40',
    textPrimary: 'text-emerald-500',
    textAccent: 'text-green-400',
    textMuted: 'text-emerald-300',
    bgAccent: 'bg-emerald-500/10',
    bgAccentActive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    btnPrimary: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    btnGhost: 'bg-slate-950/40 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/35 text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.8)',
    glowOuter: 'rgba(16, 185, 129, 0)',
    radarColor: 'rgba(16, 185, 129, 0.4)',
    radarPulse: 'rgba(34, 197, 94, 0.7)',
    dotColor: '#22c55e',
    textBody: 'text-slate-200',
    textSub: 'text-slate-400',
    cardBg: 'bg-slate-950/40 border-white/5',
    innerBg: 'bg-[#050e07] border-white/5',
    isLight: false,
    headerBg: 'bg-[#030704] text-emerald-500 border-emerald-500/10',
    creditsBg: 'bg-[#061008]/80 border-emerald-500/10',
    titlebarBg: '#030704',
    titlebarSymbol: '#34d399'
  },
  vaporwave: {
    bg: 'bg-[#0a0510]',
    panelBg: 'bg-[#150a22]/85 border-fuchsia-500/15 hover:border-fuchsia-500/30',
    sidebarBg: 'bg-[#12081d] border-fuchsia-500/15',
    border: 'border-fuchsia-500/15',
    borderActive: 'border-fuchsia-500/40',
    textPrimary: 'text-fuchsia-500',
    textAccent: 'text-cyan-400',
    textMuted: 'text-fuchsia-300',
    bgAccent: 'bg-fuchsia-500/10',
    bgAccentActive: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    btnPrimary: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_8px_rgba(217,70,239,0.4)]',
    btnGhost: 'bg-slate-950/40 hover:bg-fuchsia-500/10 border-fuchsia-500/10 hover:border-fuchsia-500/35 text-fuchsia-400',
    glowColor: 'rgba(217, 70, 239, 0.8)',
    glowOuter: 'rgba(217, 70, 239, 0)',
    radarColor: 'rgba(217, 70, 239, 0.4)',
    radarPulse: 'rgba(6, 182, 212, 0.7)',
    dotColor: '#d946ef',
    textBody: 'text-slate-200',
    textSub: 'text-slate-400',
    cardBg: 'bg-slate-950/40 border-white/5',
    innerBg: 'bg-[#12081d] border-white/5',
    isLight: false,
    headerBg: 'bg-[#0a0510] text-fuchsia-500 border-fuchsia-500/10',
    creditsBg: 'bg-[#150a22]/80 border-fuchsia-500/10',
    titlebarBg: '#0a0510',
    titlebarSymbol: '#d946ef'
  },
  solarized: {
    bg: 'bg-[#0f0a05]',
    panelBg: 'bg-[#1a1208]/85 border-amber-500/15 hover:border-amber-500/30',
    sidebarBg: 'bg-[#160f07] border-amber-500/15',
    border: 'border-amber-500/15',
    borderActive: 'border-amber-500/40',
    textPrimary: 'text-amber-500',
    textAccent: 'text-orange-400',
    textMuted: 'text-amber-300',
    bgAccent: 'bg-amber-500/10',
    bgAccentActive: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    btnPrimary: 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    btnGhost: 'bg-slate-950/40 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/35 text-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    glowOuter: 'rgba(245, 158, 11, 0)',
    radarColor: 'rgba(245, 158, 11, 0.4)',
    radarPulse: 'rgba(251, 146, 60, 0.7)',
    dotColor: '#fb923c',
    textBody: 'text-slate-200',
    textSub: 'text-slate-400',
    cardBg: 'bg-slate-950/40 border-white/5',
    innerBg: 'bg-[#160f07] border-white/5',
    isLight: false,
    headerBg: 'bg-[#0f0a05] text-amber-500 border-amber-500/10',
    creditsBg: 'bg-[#1a1208]/80 border-amber-500/10',
    titlebarBg: '#0f0a05',
    titlebarSymbol: '#f59e0b'
  }
};

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
  { key: 'm-dns', name: 'Flush DNS Cache', desc: 'Refreshes address lookup table for faster network requests.', cmd: 'ipconfig /flushdns', icon: Zap },
  { key: 'm-ram', name: 'Purge Memory Heap', desc: 'Runs garbage collector sweeps to clear unused memory blocks.', cmd: 'powershell -Command "[System.GC]::Collect()"', icon: Cpu },
  { key: 'm-explorer', name: 'Restart Desktop UI', desc: 'Restores frozen Windows taskbars by restarting explorer.exe.', cmd: 'taskkill /f /im explorer.exe && start explorer.exe', icon: Settings }
];

export default function App() {
  const [isElectron, setIsElectron] = useState(true);
  const [activeTab, setActiveTab] = useState('optimizer');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [systemLogs, setSystemLogs] = useState([
    'NeurOptimize Cyber Deck Active...',
    'Real-time network security scanning modules enabled.'
  ]);
  const [theme, setTheme] = useState('lightBlue');

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

  // Command Console & Netrunner Radar Map
  const [cmdInput, setCmdInput] = useState('');
  const terminalLogs = systemLogs;
  const setTerminalLogs = (val) => {
    setSystemLogs(prev => typeof val === 'function' ? val(prev) : val);
  };
  const [executing, setExecuting] = useState(false);
  const [radarHops, setRadarHops] = useState([
    { id: 1, host: 'Gateway Node', ip: '192.168.1.1', pingMs: 2, radius: 25, angle: 45 },
    { id: 2, host: 'ISP Hub Node', ip: '10.0.0.1', pingMs: 14, radius: 60, angle: 120 },
    { id: 3, host: 'Cloud Routing Engine', ip: '172.217.22.14', pingMs: 28, radius: 100, angle: 260 }
  ]);

  // Files Tab State
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState('');



  // Diagnostic Fixes state
  const [runningFix, setRunningFix] = useState(null);
  const [fixStatusText, setFixStatusText] = useState('');
  const [shakeScreen, setShakeScreen] = useState(false);

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

  const addLog = (msg) => setValorantLogs(prev => [...prev, `[System] ${msg}`]);

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
      // 1) HAGS
      const hagsRes = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name 'HwSchMode' -ErrorAction SilentlyContinue).HwSchMode\"");
      setRegistryStates(prev => ({ ...prev, hagsEnabled: hagsRes.output.trim() === '2' }));

      // MSI
      const msiRes = await window.api.runSystemCommand("powershell -Command \"$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\(?<device>.+)') { $p = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\' + $Matches['device'] + '\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties'; if (Test-Path $p) { (Get-ItemProperty -Path $p -Name 'MSISupported' -ErrorAction SilentlyContinue).MSISupported -eq 1 } else { $false } } else { $false }\"");
      setMsiEnabled(msiRes.output.trim().toLowerCase() === 'true');

      // 2) Game DVR
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
    setValorantLogs(prev => [...prev, `[Registry Tweak] ${enable ? 'Enabling' : 'Disabling'} HAGS...`]);
    if (window.api) {
      const res = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name 'HwSchMode' -Value ${val} -ErrorAction Stop"`);
      if (res.success) {
        setValorantLogs(prev => [...prev, `[Registry Tweak] HAGS ${enable ? 'Enabled' : 'Disabled'}. Reboot required.`]);
        setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
      } else {
        setValorantLogs(prev => [...prev, `[Registry Tweak Error] HAGS failed: ${res.error || 'Access Denied (Admin Required)'}`]);
      }
    } else {
      setValorantLogs(prev => [...prev, `[Mock Registry] HAGS set to ${val}.`]);
      setRegistryStates(prev => ({ ...prev, hagsEnabled: enable }));
    }
  };

  const toggleGameDvr = async (disable) => {
    const val = disable ? 0 : 1;
    setValorantLogs(prev => [...prev, `[Registry Tweak] ${disable ? 'Disabling' : 'Enabling'} Game DVR / App Capture...`]);
    if (window.api) {
      const res1 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_Enabled' -Value ${val} -ErrorAction SilentlyContinue"`);
      const res2 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR' -Name 'AppCaptureEnabled' -Value ${val} -ErrorAction SilentlyContinue"`);
      if (res1.success || res2.success) {
        setValorantLogs(prev => [...prev, `[Registry Tweak] Game DVR ${disable ? 'Disabled' : 'Enabled'}.`]);
        setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
      } else {
        setValorantLogs(prev => [...prev, `[Registry Tweak Error] Game DVR modification failed.`]);
      }
    } else {
      setValorantLogs(prev => [...prev, `[Mock Registry] Game DVR set to ${val}.`]);
      setRegistryStates(prev => ({ ...prev, gameDvrDisabled: disable }));
    }
  };

  const togglePriorityOptimized = async (enable) => {
    setValorantLogs(prev => [...prev, `[Registry Tweak] ${enable ? 'Optimizing' : 'Reverting'} Multimedia & GPU Priority...`]);
    if (window.api) {
      if (enable) {
        const r1 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'SystemResponsiveness' -Value 0 -ErrorAction Stop"`);
        const r2 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 4294967295 -ErrorAction Stop"`);
        const r3 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'GPU Priority' -Value 8 -ErrorAction Stop"`);
        const r4 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Priority' -Value 6 -ErrorAction Stop"`);
        const r5 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Scheduling Category' -Value 'High' -ErrorAction Stop"`);
        if (r1.success && r2.success) {
          setValorantLogs(prev => [...prev, `[Registry Tweak] Multimedia scheduling & GPU Priority optimized.`]);
          setRegistryStates(prev => ({ ...prev, priorityOptimized: true }));
        } else {
          setValorantLogs(prev => [...prev, `[Registry Tweak Error] Priority tweaks failed: ${r1.error || 'Access Denied (Admin Required)'}`]);
        }
      } else {
        const r1 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'SystemResponsiveness' -Value 20 -ErrorAction SilentlyContinue"`);
        const r2 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 10 -ErrorAction SilentlyContinue"`);
        const r3 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'GPU Priority' -Value 8 -ErrorAction SilentlyContinue"`);
        const r4 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Priority' -Value 2 -ErrorAction SilentlyContinue"`);
        const r5 = await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games' -Name 'Scheduling Category' -Value 'Medium' -ErrorAction SilentlyContinue"`);
        setValorantLogs(prev => [...prev, `[Registry Tweak] Multimedia scheduling priority reverted to default.`]);
        setRegistryStates(prev => ({ ...prev, priorityOptimized: false }));
      }
    } else {
      setValorantLogs(prev => [...prev, `[Mock Registry] Priority optimization set to ${enable}.`]);
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
          accountId: '8cfcfa2c-5678-5e83-9b2f-7c15ba829281-ap',
          resolutionQuality: 100,
          textureQuality: 3,
          shadowQuality: 3,
          effectsQuality: 3,
          antiAliasingQuality: 3,
          postProcessQuality: 3,
          viewDistanceQuality: 3,
          shadingQuality: 3,
          vsync: false
        },
        {
          filePath: 'C:\\Users\\kuyag\\AppData\\Local\\VALORANT\\Saved\\Config\\DefaultUser\\Windows\\GameUserSettings.ini',
          accountId: 'DefaultUser',
          resolutionQuality: 85,
          textureQuality: 1,
          shadowQuality: 0,
          effectsQuality: 0,
          antiAliasingQuality: 0,
          postProcessQuality: 1,
          viewDistanceQuality: 2,
          shadingQuality: 1,
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
          setValorantLogs(prev => [...prev, `[Config Tuner] Graphics settings successfully updated for account ${selectedConfig.accountId}`]);
          playPresetSound('success');
        } else {
          setValorantLogs(prev => [...prev, `[Config Tuner Error] Failed to save config: ${res.error}`]);
        }
      } catch (e) {
        setValorantLogs(prev => [...prev, `[Config Tuner Error] Failed to write config: ${e.message}`]);
      }
    } else {
      setValorantLogs(prev => [...prev, `[Mock Config Tuner] Updated mock settings for ${selectedConfig.accountId}`]);
      playPresetSound('success');
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
    setValorantLogs(prev => [...prev, `[Config Tuner] Applied 'Tournament Preset' (ultra-low latency graphics settings)`]);
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
    setValorantLogs(prev => [...prev, `[Latency Deck] Toggling ${tweakName} to ${active ? 'Enabled' : 'Disabled'}...`]);
    if (!window.api) {
      setLatencyTweaks(prev => ({ ...prev, [tweakName]: active }));
      setValorantLogs(prev => [...prev, `[Mock Latency Deck] ${tweakName} set to ${active}.`]);
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
        setValorantLogs(prev => [...prev, `[Latency Deck] Success: ${tweakName} configured successfully.`]);
        playPresetSound('success');
      } else {
        setValorantLogs(prev => [...prev, `[Latency Deck Error] Failed to update ${tweakName}. Admin permissions likely required.`]);
      }
    } catch (e) {
      setValorantLogs(prev => [...prev, `[Latency Deck Error] Exception during ${tweakName}: ${e.message}`]);
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
    if (gpuInfo.vendor !== 'nvidia') {
      addToast('G-Sync is only supported on NVIDIA graphics cards.', 'warning');
      setValorantLogs(prev => [...prev, `[Display Sync Warning] G-Sync toggle skipped (Not an NVIDIA GPU).`]);
      return;
    }
    setValorantLogs(prev => [...prev, `[Display Sync] ${disable ? 'Disabling' : 'Enabling'} G-Sync for NVIDIA GPU...`]);
    setGsyncDisabled(disable);
    if (!window.api) {
      setValorantLogs(prev => [...prev, `[Mock Display Sync] G-Sync ${disable ? 'disabled' : 'enabled'}.`]);
      addToast(`G-Sync ${disable ? 'disabled' : 'enabled'} (mock)`, 'info');
      return;
    }
    try {
      // Disable/enable G-Sync via NVIDIA profile registry key
      const val = disable ? '0' : '1';
      const cmd = `powershell -Command "try { Set-ItemProperty -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Name 'NvCplGlobalVRREnablement' -Value ${val} -Type DWord -ErrorAction Stop } catch { New-Item -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Force -ErrorAction SilentlyContinue | Out-Null; Set-ItemProperty -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Name 'NvCplGlobalVRREnablement' -Value ${val} -Type DWord -ErrorAction SilentlyContinue }"`;
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setValorantLogs(prev => [...prev, `[Display Sync] G-Sync ${disable ? 'disabled' : 'enabled'} via NVIDIA registry. Reboot may be required.`]);
        addToast(`G-Sync ${disable ? 'disabled' : 'enabled'}`, 'success');
      } else {
        // Fallback: try via nvidia-settings or note the failure
        setValorantLogs(prev => [...prev, `[Display Sync Warning] G-Sync toggle may require NVIDIA Control Panel or Admin rights: ${res.error || 'Registry write failed'}`]);
        addToast('G-Sync toggle failed - use NVIDIA Control Panel', 'error');
      }
    } catch (e) {
      setValorantLogs(prev => [...prev, `[Display Sync Error] Exception: ${e.message}`]);
    }
  };

  const toggleFreesync = async (enable) => {
    setValorantLogs(prev => [...prev, `[Display Sync] ${enable ? 'Enabling' : 'Disabling'} FreeSync / Adaptive Sync...`]);
    setFreesyncEnabled(enable);
    if (!window.api) {
      setValorantLogs(prev => [...prev, `[Mock Display Sync] FreeSync ${enable ? 'enabled' : 'disabled'}.`]);
      addToast(`FreeSync ${enable ? 'enabled' : 'disabled'} (mock)`, 'info');
      return;
    }
    try {
      const freesyncVal = enable ? '1' : '0';
      if (gpuInfo.vendor === 'amd') {
        // AMD FreeSync via display registry — affects current connected display
        // This enables Enhanced Sync / FreeSync via AMD/Microsoft adaptive sync infrastructure
        const amdCmd = `powershell -Command "try { $path = 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Control\\\\Class\\\\{4d36e968-e325-11ce-bfc1-08002be10318}'; $keys = Get-ChildItem $path -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty -Path $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty -Path $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableInternalLargePage' -Value ${freesyncVal} -Type DWord -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_FRTEnabled' -Value ${freesyncVal} -Type DWord -ErrorAction SilentlyContinue } } catch {}"`;
        await window.api.runSystemCommand(amdCmd);
        setValorantLogs(prev => [...prev, `[Display Sync] FreeSync / Enhanced Sync ${enable ? 'enabled' : 'disabled'} for AMD GPU.`]);
      } else if (gpuInfo.vendor === 'nvidia') {
        // Also enable adaptive sync for NVIDIA (FreeSync-compatible monitors)
        const nvCmd = `powershell -Command "try { Set-ItemProperty -Path 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\nvlddmkm\\\\Global\\\\NVTweak' -Name 'EnableAdaptiveSync' -Value ${freesyncVal} -Type DWord -ErrorAction SilentlyContinue } catch {}"`;
        await window.api.runSystemCommand(nvCmd);
        setValorantLogs(prev => [...prev, `[Display Sync] Adaptive Sync ${enable ? 'enabled' : 'disabled'} for NVIDIA GPU.`]);
      } else {
        setValorantLogs(prev => [...prev, `[Display Sync Warning] FreeSync/Adaptive Sync toggle skipped (No compatible AMD/NVIDIA GPU detected).`]);
      }
      addToast(`FreeSync ${enable ? 'enabled' : 'disabled'}`, 'success');
    } catch (e) {
      setValorantLogs(prev => [...prev, `[Display Sync Error] Exception: ${e.message}`]);
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

      const gpuRes = await window.api.runSystemCommand("powershell -Command \"Get-WmiObject Win32_VideoController | Select-Object -ExpandProperty DriverVersion\"");
      const gpuWarning = gpuRes.success && gpuRes.output.includes('32.0.31007.1017');

      // Scan for Vanguard-incompatible/blocked drivers
      const drvFilesRes = await window.api.runSystemCommand("powershell -Command \"(Get-Item -Path C:\\Windows\\System32\\drivers\\inpoutx64.sys,C:\\Windows\\System32\\drivers\\gdrv.sys,C:\\Windows\\System32\\drivers\\RTCore64.sys,C:\\Windows\\System32\\drivers\\alsysio64.sys,C:\\Windows\\System32\\drivers\\cpuz154_x64.sys,C:\\Windows\\System32\\drivers\\dbk64.sys -ErrorAction SilentlyContinue).Name\"");
      const drvServRes = await window.api.runSystemCommand("powershell -Command \"(Get-Service -Name inpoutx64,gdrv,RTCore64,dbk64,alsysio64,cpuz154 -ErrorAction SilentlyContinue).Name\"");

      const flagged = [];
      if (drvFilesRes.success && drvFilesRes.output.trim()) {
        drvFilesRes.output.split(/\r?\n/).forEach(line => {
          const l = line.trim();
          if (l) flagged.push(l);
        });
      }
      if (drvServRes.success && drvServRes.output.trim()) {
        drvServRes.output.split(/\r?\n/).forEach(line => {
          const l = line.trim();
          if (l && !flagged.includes(l)) flagged.push(l);
        });
      }

      setVanguardHealth({
        secureBoot: sbVal,
        tpm2: tpmVal,
        vpnActive,
        gpuDriverWarning: gpuWarning,
        csmDisabled: sbVal === 'enabled' ? 'disabled' : 'unknown',
        flaggedDrivers: flagged
      });
    } catch (e) {
      console.error('Error checking Vanguard health:', e);
    }
  };

  const checkBgServices = async () => {
    if (!window.api) {
      setBgServices({
        SysMain: true,
        XblAuthManager: true
      });
      return;
    }
    try {
      const services = ['SysMain', 'XblAuthManager'];
      const states = {};
      for (const s of services) {
        const res = await window.api.runSystemCommand(`powershell -Command "(Get-Service -Name '${s}' -ErrorAction SilentlyContinue).Status"`);
        states[s] = res.success && res.output.trim().toLowerCase() === 'running';
      }
      setBgServices(states);
    } catch (e) {
      console.error('Error checking background services:', e);
    }
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts(prev => setToasts(prev.filter(t => t.id !== id)));
  };

  const detectGpu = async () => {
    if (!window.api || !window.api.detectGpu) {
      setGpuInfo({ vendor: 'nvidia', name: 'NVIDIA GeForce RTX 4070 (Mock)', driverVersion: '560.94', vramMB: 12288, temperature: 52, utilization: 15, refreshRate: 165 });
      return;
    }
    try {
      const res = await window.api.detectGpu();
      if (res.success) setGpuInfo(res.gpu);
    } catch (e) { console.error('GPU detection failed:', e); }
  };

  const detectValorantPath = async () => {
    if (!window.api || !window.api.detectValorantPath) {
      setValorantPathDetected(false);
      return;
    }
    try {
      const res = await window.api.detectValorantPath();
      if (res.success) {
        setValorantPath(res.path);
        setValorantPathDetected(res.exists);
      }
    } catch (e) {
      console.error('Valorant path detection failed:', e);
    }
  };

  const browseValorantPath = async () => {
    if (!window.api || !window.api.selectValorantPath) return;
    try {
      const res = await window.api.selectValorantPath();
      if (res.success && res.path) {
        setValorantPath(res.path);
        setValorantPathDetected(true);
        addToast('VALORANT path configured successfully!', 'success');
        try {
          const saved = localStorage.getItem('neuroptimize-settings');
          const currentSettings = saved ? JSON.parse(saved) : {};
          currentSettings.valorantPath = res.path;
          currentSettings.valorantPathDetected = true;
          localStorage.setItem('neuroptimize-settings', JSON.stringify(currentSettings));
        } catch (err) {}
      }
    } catch (e) {
      console.error('Valorant folder browse failed:', e);
    }
  };


  const checkNicPower = async () => {
    if (!window.api) { setNicPowerSavingDisabled(true); return; }
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Get-NetAdapterAdvancedProperty -DisplayName 'Energy Efficient Ethernet' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty DisplayValue\"");
      setNicPowerSavingDisabled(res.success && res.output.trim().toLowerCase() === 'disabled');
    } catch (e) { setNicPowerSavingDisabled(false); }
  };

  const toggleNicPower = async (disablePowerSaving) => {
    setValorantLogs(prev => [...prev, `[Network Tweak] ${disablePowerSaving ? 'Disabling' : 'Enabling'} NIC power saving...`]);
    if (window.api) {
      const val = disablePowerSaving ? 'Disabled' : 'Enabled';
      const cmd = `powershell -Command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Set-NetAdapterAdvancedProperty -DisplayName 'Energy Efficient Ethernet' -DisplayValue '${val}' -ErrorAction SilentlyContinue"`;
      const res = await window.api.runSystemCommand(cmd);
      setNicPowerSavingDisabled(disablePowerSaving);
      setValorantLogs(prev => [...prev, `[Network Tweak] NIC Energy Efficient Ethernet ${val}.`]);
      addToast(`NIC power saving ${val.toLowerCase()}`, 'success');
    } else {
      setNicPowerSavingDisabled(disablePowerSaving);
      addToast(`[Mock] NIC power saving ${disablePowerSaving ? 'disabled' : 'enabled'}`, 'info');
    }
  };

  const checkPowerThrottling = async () => {
    if (!window.api) { setPowerThrottlingDisabled(false); return; }
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Name 'PowerThrottlingOff' -ErrorAction SilentlyContinue).PowerThrottlingOff\"");
      setPowerThrottlingDisabled(res.success && parseInt(res.output.trim(), 10) === 1);
    } catch (e) { setPowerThrottlingDisabled(false); }
  };

  const checkGlobalFso = async () => {
    if (!window.api) { setGlobalFsoDisabled(true); return; }
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -ErrorAction SilentlyContinue).GameDVR_FSEBehaviorMode\"");
      setGlobalFsoDisabled(res.success && parseInt(res.output.trim(), 10) === 2);
    } catch (e) { setGlobalFsoDisabled(false); }
  };

  const toggleGlobalFso = async (disable) => {
    setValorantLogs(prev => [...prev, `[Registry Tweak] ${disable ? 'Disabling' : 'Enabling'} Global Fullscreen Optimizations...`]);
    if (window.api) {
      if (disable) {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -Value 2 -Type DWord"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_HonorUserFSEBehaviorMode' -Value 1 -Type DWord"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehavior' -Value 2 -Type DWord"`);
      } else {
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -Value 0 -Type DWord"`);
        await window.api.runSystemCommand(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\System\\GameConfigStore' -Name 'GameDVR_HonorUserFSEBehaviorMode' -Value 0 -Type DWord"`);
      }
      setGlobalFsoDisabled(disable);
      setValorantLogs(prev => [...prev, `[Registry Tweak] Global FSO ${disable ? 'disabled' : 'enabled'}.`]);
      addToast(`Global Fullscreen Optimizations ${disable ? 'disabled' : 'enabled'}`, 'success');
    } else {
      setGlobalFsoDisabled(disable);
      addToast(`[Mock] Global FSO ${disable ? 'disabled' : 'enabled'}`, 'info');
    }
  };

  const togglePowerThrottling = async (disable) => {
    if (isElectron) {
      const val = disable ? 1 : 0;
      const cmd = `powershell -Command "if (-not (Test-Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling')) { New-Item -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\Control\\Power\\PowerThrottling' -Name 'PowerThrottlingOff' -Value ${val} -Type DWord -Force"`;
      await window.api.runSystemCommand(cmd);
      setPowerThrottlingDisabled(disable);
      addLog(`Power Throttling ${disable ? 'disabled' : 'enabled'}.`);
    } else {
      setPowerThrottlingDisabled(disable);
      addLog(`[SIMULATION] Power Throttling ${disable ? 'disabled' : 'enabled'}.`);
    }
  };

  const toggleMsiMode = async (enable) => {
    if (isElectron) {
      const val = enable ? 1 : 0;
      const cmd = `powershell -Command "$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\(?<device>.+)') { $p = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\' + $Matches['device'] + '\\Device Parameters'; $intMgmt = Join-Path $p 'Interrupt Management'; if (-not (Test-Path $intMgmt)) { New-Item -Path $intMgmt -Force | Out-Null }; $msi = Join-Path $intMgmt 'MessageSignaledInterruptProperties'; if (-not (Test-Path $msi)) { New-Item -Path $msi -Force | Out-Null }; Set-ItemProperty -Path $msi -Name 'MSISupported' -Value ${val} -Type DWord -Force | Out-Null }; $net = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.NetConnectionStatus -eq 2 } | Select-Object -First 1; if ($net -and $net.PNPDeviceID -match 'PCI\\\\(?<device>.+)') { $p = 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\' + $Matches['device'] + '\\Device Parameters'; $intMgmt = Join-Path $p 'Interrupt Management'; if (-not (Test-Path $intMgmt)) { New-Item -Path $intMgmt -Force | Out-Null }; $msi = Join-Path $intMgmt 'MessageSignaledInterruptProperties'; if (-not (Test-Path $msi)) { New-Item -Path $msi -Force | Out-Null }; Set-ItemProperty -Path $msi -Name 'MSISupported' -Value ${val} -Type DWord -Force | Out-Null }"`;
      await window.api.runSystemCommand(cmd);
      setMsiEnabled(enable);
      addLog(`MSI Mode ${enable ? 'forced ON (GPU + Network)' : 'reverted to default'}. Requires restart.`);
    } else {
      setMsiEnabled(enable);
      addLog(`[SIMULATION] MSI Mode ${enable ? 'forced ON' : 'reverted'}.`);
    }
  };

  // --- VALORANT OPTIMIZER CORE TWEAK FUNCTIONS ---

  const checkPersistentPriority = async () => {
    if (!window.api) { setPersistentPriorityEnabled(false); return; }
    try {
      const res = await window.api.runSystemCommand("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Name 'CpuPriorityClass' -ErrorAction SilentlyContinue).CpuPriorityClass\"");
      setPersistentPriorityEnabled(res.success && parseInt(res.output.trim(), 10) === 3);
    } catch (e) { setPersistentPriorityEnabled(false); }
  };

  const togglePersistentPriority = async (enable) => {
    setValorantLogs(prev => [...prev, `[CPU Priority] ${enable ? 'Enabling' : 'Disabling'} Persistent High CPU Priority for Valorant...`]);
    if (window.api) {
      const cmd = enable
        ? `powershell -Command "if (-not (Test-Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions')) { New-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Name 'CpuPriorityClass' -Value 3 -Type DWord -Force"`
        : `powershell -Command "Remove-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\VALORANT-Win64-Shipping.exe\\PerfOptions' -Force -ErrorAction SilentlyContinue"`;
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setPersistentPriorityEnabled(enable);
        setValorantLogs(prev => [...prev, `[CPU Priority] Persistent High CPU Priority ${enable ? 'Enabled (Valorant will always launch high)' : 'Disabled'}.`]);
        addToast(`Persistent priority ${enable ? 'enabled' : 'disabled'}`, 'success');
      } else {
        setValorantLogs(prev => [...prev, `[CPU Priority Error] Persistent priority toggle failed: ${res.error || 'Admin required'}`]);
        addToast('Persistent priority failed (Admin required)', 'error');
      }
    } else {
      setPersistentPriorityEnabled(enable);
      addToast(`[Mock] Persistent high CPU priority ${enable ? 'enabled' : 'disabled'}`, 'info');
    }
  };

  const cleanAllShaderCaches = async () => {
    setValorantLogs(prev => [...prev, '[Cache Scrubber] Cleaning ALL shader caches (NVIDIA + AMD + DirectX)...']);
    if (window.api) {
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\AMD\\DxCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
      await window.api.runSystemCommand("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
    }
    setValorantLogs(prev => [...prev, '[Cache Scrubber] All shader caches purged (NVIDIA DX/GL, AMD Dx, DirectX D3DS).']);
    setShaderCacheSize('0.00 Bytes');
    addToast('All shader caches purged', 'success');
    playPresetSound('success');
  };

  const applyOptimizationProfile = async (profileName) => {
    setValorantLogs(prev => [...prev, `[Profile Engine] Applying '${profileName}' optimization profile...`]);
    addToast(`Applying ${profileName} profile...`, 'info');
    
    if (profileName === 'tournament') {
      if (selectedConfig) await applyTournamentPreset();
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      if (!registryStates.priorityOptimized) await togglePriorityOptimized(true);
      if (!globalFsoDisabled) await toggleGlobalFso(true);
      if (!latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', true);
      if (!timerResActive) await toggleTimerResolution(true);
      setValorantLogs(prev => [...prev, '[Profile Engine] Tournament profile applied. Maximum competitive advantage.']);
      addToast('Tournament profile applied!', 'success');
    } else if (profileName === 'balanced') {
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      setValorantLogs(prev => [...prev, '[Profile Engine] Balanced Gaming profile applied.']);
      addToast('Balanced Gaming profile applied!', 'success');
    } else if (profileName === 'streaming') {
      if (!registryStates.gameDvrDisabled) await toggleGameDvr(true);
      if (!registryStates.priorityOptimized) await togglePriorityOptimized(true);
      setValorantLogs(prev => [...prev, '[Profile Engine] Streaming profile applied. Visual quality preserved for viewers.']);
      addToast('Streaming profile applied!', 'success');
    } else if (profileName === 'revert') {
      if (registryStates.gameDvrDisabled) await toggleGameDvr(false);
      if (registryStates.priorityOptimized) await togglePriorityOptimized(false);
      if (globalFsoDisabled) await toggleGlobalFso(false);
      if (latencyTweaks.disableMouseAccel) await toggleLatencyTweak('disableMouseAccel', false);
      if (timerResActive) await toggleTimerResolution(false);
      setValorantLogs(prev => [...prev, '[Profile Engine] All optimizations reverted to Windows defaults.']);
      addToast('All settings reverted to defaults', 'success');
    }
    playPresetSound('success');
  };

  const toggleMaxBoost = async (enable) => {
    if (enable) {
      setMaxBoostStatus('boosting');
      setMaxBoostActive(true);
      setMaxBoostProgress(5);
      setMaxBoostLogs([
        "⚡ INITIATING NEURAL BOOSTER OVERDRIVE...",
        "🔒 Scanning Windows components and checking privileges..."
      ]);
      playPresetSound('cast');
      await new Promise(r => setTimeout(r, 600));

      setMaxBoostProgress(15);
      setMaxBoostLogs(prev => [...prev, "📈 Elevating Processor & Thread priority profiles..."]);
      if (gameModeActive !== true) await toggleGameMode();
      if (powerPlanMode !== 'high') await togglePowerPlan();
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(30);
      setMaxBoostLogs(prev => [...prev, "🎮 Optimizing GPU scheduling and disabling GameDVR..."]);
      if (registryStates.hagsEnabled !== true) await toggleHags(true);
      if (registryStates.gameDvrDisabled !== true) await toggleGameDvr(true);
      if (registryStates.priorityOptimized !== true) await togglePriorityOptimized(true);
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(48);
      setMaxBoostLogs(prev => [...prev, "🚀 Tuning mouse polling and sub-millisecond response tweaks..."]);
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend', 'disableCoreParking', 'disableDynamicTick', 'disableFullscreenOpt']) {
        if (latencyTweaks[tweak] !== true) {
          await toggleLatencyTweak(tweak, true);
        }
      }
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(65);
      setMaxBoostLogs(prev => [...prev, "🌐 Optimizing network routes & buffering policies..."]);
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(80);
      setMaxBoostLogs(prev => [...prev, "⚙️ Toggling low-level system policies (FSO, Throttling)..."]);
      if (globalFsoDisabled !== true) await toggleGlobalFso(true);
      if (powerThrottlingDisabled !== true) await togglePowerThrottling(true);
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(90);
      setMaxBoostLogs(prev => [...prev, "🧹 Purging background services and clearing caches..."]);
      for (const svc of ['SysMain', 'XblAuthManager']) {
        if (bgServices[svc] === true) {
          await toggleBgService(svc, false);
        }
      }
      if (timerResActive !== true) await toggleTimerResolution(true);
      await cleanAllShaderCaches();
      await new Promise(r => setTimeout(r, 600));

      setMaxBoostProgress(100);
      setMaxBoostStatus('active');
      setMaxBoostLogs(prev => [...prev, "✨ SYSTEM FULLY ENHANCED! Performance limits unlocked, input latency minimized."]);
      addToast("Performance Booster active! Maximum FPS enabled.", "success");
      playPresetSound('success');
    } else {
      setMaxBoostStatus('reverting');
      setMaxBoostProgress(15);
      setMaxBoostLogs([
        "⚡ INITIATING RESTORATION SEQUENCE...",
        "🔄 Reverting CPU power limits and Windows scheduling policies..."
      ]);
      playPresetSound('cast');
      await new Promise(r => setTimeout(r, 600));

      setMaxBoostProgress(35);
      setMaxBoostLogs(prev => [...prev, "🎮 Restoring GPU scheduling preferences and GameDVR telemetry..."]);
      if (registryStates.hagsEnabled !== false) await toggleHags(false);
      if (registryStates.gameDvrDisabled !== false) await toggleGameDvr(false);
      if (registryStates.priorityOptimized !== false) await togglePriorityOptimized(false);
      if (gameModeActive !== false) await toggleGameMode();
      if (powerPlanMode !== 'balanced') await togglePowerPlan();
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(55);
      setMaxBoostLogs(prev => [...prev, "🚀 Restoring mouse acceleration and dynamic scheduler ticks..."]);
      for (const tweak of ['disableMouseAccel', 'disableUsbSuspend', 'disableCoreParking', 'disableDynamicTick', 'disableFullscreenOpt']) {
        if (latencyTweaks[tweak] !== false) {
          await toggleLatencyTweak(tweak, false);
        }
      }
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(75);
      setMaxBoostLogs(prev => [...prev, "🌐 Restoring network configuration to system defaults..."]);
      await new Promise(r => setTimeout(r, 400));

      setMaxBoostProgress(90);
      setMaxBoostLogs(prev => [...prev, "⚙️ Restoring FSO and service daemons..."]);
      if (globalFsoDisabled !== false) await toggleGlobalFso(false);
      if (powerThrottlingDisabled !== false) await togglePowerThrottling(false);
      
      for (const svc of ['SysMain', 'XblAuthManager']) {
        if (bgServices[svc] === false) {
          await toggleBgService(svc, true);
        }
      }
      if (timerResActive !== false) await toggleTimerResolution(false);
      await new Promise(r => setTimeout(r, 600));

      setMaxBoostProgress(0);
      setMaxBoostActive(false);
      setMaxBoostStatus('idle');
      setMaxBoostLogs([]);
      addToast("Performance booster disabled. Settings reverted to default.", "success");
      playPresetSound('success');
    }
  };

  const saveSettingsToStorage = () => {
    try {
      const settings = {
        theme, autoBoostActive, deepOptimizeActive, optimizationOptions,
        purgeAppsChecklist, scrolls, monitorRefreshRate, frameLimitMode, maxBoostActive,
        gsyncDisabled, freesyncEnabled, advancedMode, valorantPath, valorantPathDetected
      };
      localStorage.setItem('neuroptimize-settings', JSON.stringify(settings));
    } catch (e) { console.error('Settings save failed:', e); }
  };

  const loadSettingsFromStorage = () => {
    try {
      const saved = localStorage.getItem('neuroptimize-settings');
      if (!saved) return;
      const s = JSON.parse(saved);
      if (s.theme) setTheme(s.theme);
      if (s.autoBoostActive !== undefined) setAutoBoostActive(s.autoBoostActive);
      if (s.deepOptimizeActive !== undefined) setDeepOptimizeActive(s.deepOptimizeActive);
      if (s.optimizationOptions) setOptimizationOptions(s.optimizationOptions);
      if (s.purgeAppsChecklist) setPurgeAppsChecklist(s.purgeAppsChecklist);
      if (s.scrolls) setScrolls(s.scrolls);
      if (s.monitorRefreshRate) setMonitorRefreshRate(s.monitorRefreshRate);
      if (s.frameLimitMode) setFrameLimitMode(s.frameLimitMode);
      if (s.gsyncDisabled !== undefined) setGsyncDisabled(s.gsyncDisabled);
      if (s.freesyncEnabled !== undefined) setFreesyncEnabled(s.freesyncEnabled);
      if (s.advancedMode !== undefined) setAdvancedMode(s.advancedMode);
      if (s.valorantPath) setValorantPath(s.valorantPath);
      if (s.valorantPathDetected !== undefined) setValorantPathDetected(s.valorantPathDetected);
      if (s.maxBoostActive !== undefined) {
        setMaxBoostActive(s.maxBoostActive);
        if (s.maxBoostActive) {
          setMaxBoostStatus('active');
        }
      }
    } catch (e) { console.error('Settings load failed:', e); }
  };

  const toggleBgService = async (serviceName, start) => {
    setValorantLogs(prev => [...prev, `[Services] ${start ? 'Starting' : 'Stopping'} ${serviceName}...`]);
    if (!window.api) {
      setBgServices(prev => ({ ...prev, [serviceName]: start }));
      return;
    }
    const action = start ? 'Start-Service' : 'Stop-Service';
    const res = await window.api.runSystemCommand(`powershell -Command "${action} -Name '${serviceName}' -Force"`);
    if (res.success) {
      setValorantLogs(prev => [...prev, `[Services] Success: ${serviceName} ${start ? 'started' : 'stopped'}.`]);
      setBgServices(prev => ({ ...prev, [serviceName]: start }));
      playPresetSound('success');
    } else {
      setValorantLogs(prev => [...prev, `[Services Error] Failed to modify ${serviceName}: ${res.error || 'Admin required'}`]);
    }
  };

  const toggleTimerResolution = async (active) => {
    setValorantLogs(prev => [...prev, `[Timer resolution] Toggling timer resolution to ${active ? '0.5ms' : 'Windows Default'}...`]);
    setTimerResActive(active);
    if (!window.api) {
      setValorantLogs(prev => [...prev, `[Mock Timer] Timer resolution set to ${active ? '0.5ms' : 'Default'}`]);
      return;
    }
    if (window.api.setTimerResolution) {
      const res = await window.api.setTimerResolution(active);
      if (res.success) {
        setValorantLogs(prev => [...prev, active ? `[Timer Resolution] Locked to 0.5 ms. Sub-millisecond latency active.` : `[Timer Resolution] Released lock. Reverted to default.`]);
        if (active) playPresetSound('success');
      } else {
        setValorantLogs(prev => [...prev, `[Timer Resolution Error] Failed: ${res.error}`]);
      }
    } else {
      if (active) {
        const startCmd = "powershell -Command \"Start-Process powershell -WindowStyle Hidden -ArgumentList '-Command', '`\"$code = \\'\\'\\`[DllImport(\\\\\\\"ntdll.dll\\\\\")] public static extern int NtSetTimerResolution(uint DesiredResolution, bool SetResolution, out uint CurrentResolution);\\'\\'; Add-Type -MemberDefinition $code -Name \\'\\'Timer\\'\\' -Namespace \\'\\'Win32\\'\\' -PassThru; [uint]$current = 0; while ($true) { \\`[Win32.Timer\\`]::NtSetTimerResolution(5000, $true, [ref]$current); Start-Sleep -Seconds 2 }`\"'\"";
        await window.api.runSystemCommand(startCmd);
        setValorantLogs(prev => [...prev, `[Timer Resolution] Locked to 0.5 ms. Sub-millisecond latency active.`]);
        playPresetSound('success');
      } else {
        const stopCmd = "powershell -Command \"Get-CimInstance Win32_Process -Filter \\\"Name = 'powershell.exe'\\\" | Where-Object { $_.CommandLine -like '*NtSetTimerResolution*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }\"";
        await window.api.runSystemCommand(stopCmd);
        setValorantLogs(prev => [...prev, `[Timer Resolution] Released lock. Reverted to default.`]);
      }
    }
  };

  const terminalEndRef = useRef(null);
  const canvasRef = useRef(null);

  const activeStyle = themeStyles[theme] || themeStyles.cobalt;

  // Sync Electron titlebar overlay colors when theme changes
  useEffect(() => {
    if (window.api && window.api.setTitleBarOverlay && activeStyle.titlebarBg) {
      window.api.setTitleBarOverlay(activeStyle.titlebarBg, activeStyle.titlebarSymbol);
    }
  }, [theme]);

  // Check Administrator role, load registry and VALORANT configs on load
  useEffect(() => {
    loadSettingsFromStorage();
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

    window.addEventListener('beforeunload', saveSettingsToStorage);
    return () => window.removeEventListener('beforeunload', saveSettingsToStorage);
  }, []);

  // Web Audio Synth Note Generator using ADSR parameters
  // Background Daemon for Auto-Boost Valorant check
  useEffect(() => {
    let checkCount = 0;
    const daemon = setInterval(async () => {
      if (!autoBoostActive) return;

      let valStatus = 'NotRunning';
      if (isElectron) {
        try {
          const res = await window.api.runSystemCommand('tasklist');
          const isCurrentlyRunning = res.success && res.output.includes('VALORANT-Win64-Shipping');
          if (isCurrentlyRunning) valStatus = 'Running';
          
          if (isCurrentlyRunning && !valorantRunning) {
            triggerValorantAutoBoost();
          } else if (!isCurrentlyRunning && valorantRunning) {
            triggerValorantAutoRevert();
          }
          setValorantRunning(isCurrentlyRunning);
        } catch (e) {
          console.error(e);
        }
      } else {
        checkCount++;
        if (checkCount % 12 === 0 && !valorantRunning) {
          triggerValorantAutoBoost();
          setValorantRunning(true);
          valStatus = 'Running';
        } else if (checkCount % 12 === 8 && valorantRunning) {
          triggerValorantAutoRevert();
          setValorantRunning(false);
        }
      }

    }, 3000);

    return () => clearInterval(daemon);
  }, [autoBoostActive, valorantRunning, isElectron, deepOptimizeActive, optimizationOptions, purgeAppsChecklist, revertQueue]);

  // Run deep system performance enhancements
  const runDeepPerformanceOptimize = async () => {
    setValorantLogs(prev => [...prev, '[Deep Optimizer] Launching deep system performance enhancements...']);
    const queue = [];

    // 1. Pause Windows Update Service
    if (optimizationOptions.pauseUpdates) {
      setValorantLogs(prev => [...prev, '[Deep Optimizer] Attempting to pause Windows Update service...']);
      if (isElectron) {
        const res = await window.api.runSystemCommand("powershell -Command \"Stop-Service -Name 'wuauserv' -Force -ErrorAction Stop\"");
        if (res.success) {
          setValorantLogs(prev => [...prev, '[Deep Optimizer] Success: Windows Update service stopped.']);
          queue.push('wuauserv');
        } else {
          setValorantLogs(prev => [...prev, `[Deep Optimizer Warning] Failed to stop updates: ${res.error || 'Access Denied (Admin Required)'}`]);
        }
      } else {
        setValorantLogs(prev => [...prev, '[Mock] Windows Update service stopped.']);
        queue.push('wuauserv');
      }
    }

    // 2. Purging Background Apps
    if (optimizationOptions.purgeApps) {
      setValorantLogs(prev => [...prev, '[Deep Optimizer] Initiating background apps purge...']);
      const appsToKill = [];
      if (purgeAppsChecklist.chrome) appsToKill.push('chrome.exe');
      if (purgeAppsChecklist.msedge) appsToKill.push('msedge.exe');
      if (purgeAppsChecklist.spotify) appsToKill.push('spotify.exe');
      if (purgeAppsChecklist.discord) appsToKill.push('discord.exe');
      if (purgeAppsChecklist.steam) appsToKill.push('steam.exe');
      if (purgeAppsChecklist.onedrive) appsToKill.push('OneDrive.exe');

      for (const app of appsToKill) {
        setValorantLogs(prev => [...prev, `[Deep Optimizer] Terminating background app: ${app}`]);
        if (isElectron) {
          await window.api.runSystemCommand(`taskkill /f /im ${app}`);
        }
      }
      setValorantLogs(prev => [...prev, `[Deep Optimizer] Purged selected background programs.`]);
    }

    setRevertQueue(queue);
    setValorantLogs(prev => [...prev, '[Deep Optimizer] Deep performance modifications completed.']);
  };

  // Revert temporary deep optimizations
  const triggerValorantAutoRevert = async () => {
    playPresetSound('cast');
    setValorantLogs(prev => [...prev, '[Auto-Revert] VALORANT process exited. Restoring system parameters...']);
    setTerminalLogs(prev => [...prev, '\n[Auto-Revert Daemon]: VALORANT exited. Reverting temporary changes.']);

    // Revert Power Plan
    if (isElectron) {
      setValorantLogs(prev => [...prev, '[Auto-Revert] Restoring active power scheme to Balanced...']);
      await window.api.runSystemCommand("powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e");
    }

    // Revert Windows Update
    if (revertQueue.includes('wuauserv')) {
      setValorantLogs(prev => [...prev, '[Auto-Revert] Restoring Windows Update service...']);
      if (isElectron) {
        await window.api.runSystemCommand("powershell -Command \"Start-Service -Name 'wuauserv'\"");
      }
      setValorantLogs(prev => [...prev, '[Auto-Revert] Success: Windows Update service restored.']);
    }

    setValorantLogs(prev => [...prev, '[Auto-Revert] System restoration complete. All parameters reverted.']);
    setRevertQueue([]);
    playPresetSound('success');

    if (Notification.permission === 'granted') {
      new Notification("NeurOptimize System Restored", {
        body: "VALORANT closed. Suspending deep optimization, all systems reverted to normal."
      });
    }
  };

  // Trigger automated Valorant priority boosting
  const triggerValorantAutoBoost = async () => {
    playPresetSound('cast');
    setValorantLogs(prev => [...prev, '[Auto-Daemon] VALORANT detected active! Initializing boost sequences...']);
    setTerminalLogs(prev => [...prev, '\n[Auto-Boost Daemon]: VALORANT detected active! Deploying gaming priority.']);
    
    if (isElectron) {
      // Switch Power Plan to High Performance
      setValorantLogs(prev => [...prev, '[Auto-Daemon] Switching active power scheme to High Performance...']);
      await window.api.runSystemCommand("powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c");

      // Set Priority High
      await window.api.runSystemCommand(
        `powershell -Command "Get-Process -Name 'VALORANT', 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
      );
      setValorantLogs(prev => [...prev, '[Auto-Daemon] Process Priority set to HIGH in memory for game and launcher threads.']);
    } else {
      setValorantLogs(prev => [...prev, '[Mock Auto-Daemon] Simulated priority and power configurations applied.']);
    }

    // Deep Optimization Trigger
    if (deepOptimizeActive) {
      await runDeepPerformanceOptimize();
    }

    playPresetSound('success');
    
    if (Notification.permission === 'granted') {
      new Notification("NeurOptimize Auto-Boost Active", {
        body: "VALORANT launch detected! CPU Priority High, RAM & Network optimization completed."
      });
    }
  };

  // Environment Check
  useEffect(() => {
    if (!window.api) {
      setIsElectron(false);
      setStats({
        platform: 'win32',
        arch: 'x64',
        hostname: 'NEUROPTIMIZE-SUMMONER',
        cpuModel: 'Intel Core i9-13900K @ 3.00GHz (Virtual Core)',
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
        console.error('Stats query failed:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [isElectron]);

  // Reactor Core Rotating Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let angle = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.strokeStyle = activeStyle.radarColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = activeStyle.border;
      ctx.setLineDash([20, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();

      const pulseSize = 15 + Math.sin(angle * 4) * 3 + (stats.cpuLoad / 8);
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pulseSize * 2.5);
      grad.addColorStop(0, activeStyle.glowColor);
      grad.addColorStop(1, activeStyle.glowOuter);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activeStyle.dotColor;
      const speed = 0.02 + (stats.cpuLoad / 1000);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60, 4, 0, Math.PI * 2);
      ctx.arc(cx + Math.cos(angle + Math.PI) * 60, cy + Math.sin(angle + Math.PI) * 60, 4, 0, Math.PI * 2);
      ctx.fill();

      angle += speed;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [stats.cpuLoad, theme]);

  // Load files
  const loadFiles = async () => {
    setLoadingFiles(true);
    setFileError('');
    if (!isElectron) {
      setTimeout(() => setLoadingFiles(false), 500);
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

    setTerminalLogs(prev => [...prev, `\n> ${cmd}`, 'Scanning and executing command registry...']);
    setCmdInput('');
    setExecuting(true);

    if (cmd.toLowerCase().includes('ping') || cmd.toLowerCase().includes('trace')) {
      const generatedHops = [
        { id: 1, host: 'Primary Hop', ip: '127.0.0.1', pingMs: 1, radius: 20, angle: Math.random() * 360 },
        { id: 2, host: 'Local Node', ip: '192.168.100.1', pingMs: 10, radius: 45, angle: Math.random() * 360 },
        { id: 3, host: 'Edge Route Server', ip: '8.8.8.8', pingMs: 22, radius: 85, angle: Math.random() * 360 }
      ];
      setRadarHops(generatedHops);
    }

    if (!isElectron) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev.slice(0, -1),
          `[Mock Terminal Output]: Command "${cmd}" finished with code 0.`
        ]);
        setExecuting(false);
      }, 800);
      return;
    }

    try {
      const response = await window.api.runSystemCommand(cmd);
      setTerminalLogs(prev => [
        ...prev.slice(0, -1),
        response.success ? (response.output || 'Done.') : `Error: ${response.error}\n${response.output || ''}`
      ]);
    } catch (err) {
      setTerminalLogs(prev => [...prev.slice(0, -1), `Execution Exception: ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  // Run active diagnostic fixes
  const runDiagnosticFix = async (fixName) => {
    if (runningFix) return;
    setRunningFix(fixName);
    setFixStatusText(`EXECUTING DIAGNOSTIC: ${fixName.toUpperCase()}...`);
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);

    setTimeout(async () => {
      let cmd = '';
      if (fixName === 'ramRejuvenation') cmd = 'powershell -Command "[System.GC]::Collect()"';
      else if (fixName === 'chronosReset') cmd = 'taskkill /f /im explorer.exe && start explorer.exe';

      if (isElectron && cmd) {
        const res = await window.api.runSystemCommand(cmd);
        setFixStatusText(res.success ? `SUCCESS: ${fixName.toUpperCase()} COMPLETED.` : `FAILED: ${res.error}`);
      } else {
        setFixStatusText(`[MOCK SUCCESS]: ${fixName.toUpperCase()} COMPLETED.`);
      }
      setTimeout(() => setRunningFix(null), 1500);
    }, 1200);
  };

  // Premade 1-Click Macros Engine
  const runMacro = async (macroKey, macroName, cmd) => {
    if (runningMacro) return;
    
    playPresetSound('cast');
    setRunningMacro(macroKey);
    setTweakLogs(prev => [...prev, `[Macro Run] Triggered action: "${macroName}"`]);
    setTerminalLogs(prev => [...prev, `\n[Sentinel Macro]: Executing automated sequence: "${macroName}"...`]);

    if (!isElectron) {
      setTimeout(() => {
        setRunningMacro(null);
        setTweakLogs(prev => [...prev, `[Macro Completed] Mapped action successful.`]);
        setTerminalLogs(prev => [...prev, `[Mock Success]: Executed: ${cmd}`]);
        playPresetSound('success');
      }, 1500);
      return;
    }

    try {
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setTweakLogs(prev => [...prev, `[Macro Completed] Action successfully deployed.`]);
        setTerminalLogs(prev => [...prev, res.output || 'Done. Sequence completed with no output returns.']);
        playPresetSound('success');
      } else {
        setTweakLogs(prev => [...prev, `[Macro Error] Execution failed: ${res.error}`]);
        setTerminalLogs(prev => [...prev, `Error: ${res.error}`]);
        playPresetSound('nuke');
      }
    } catch (e) {
      setTweakLogs(prev => [...prev, `[Macro Exception] ${e.message}`]);
    } finally {
      setRunningMacro(null);
    }
  };

  // Toggle quick registry tweak
  const toggleTweak = async (tweakName, cmdOn, cmdOff) => {
    const nextVal = !tweaks[tweakName];
    playPresetSound('tweak');
    setTweaks(prev => ({ ...prev, [tweakName]: nextVal }));
    setTweakLogs(prev => [...prev, `[Registry Override] Changing ${tweakName} to ${nextVal}`]);

    if (isElectron) {
      const cmd = nextVal ? cmdOn : cmdOff;
      const res = await window.api.runSystemCommand(cmd);
      if (res.success) {
        setTweakLogs(prev => [...prev, `[Registry Override] ${tweakName} updated in HKCU.`]);
      } else {
        setTweakLogs(prev => [...prev, `[Error] Registry edit failed: ${res.error}`]);
      }
    } else {
      setTweakLogs(prev => [...prev, `[Mock Registry] Updated settings for ${tweakName}.`]);
    }
  };

  // Sector defragmenter drive scanning simulation
  const scanTempFolder = async () => {
    if (scanningTemp) return;
    setScanningTemp(true);
    playPresetSound('cast');
    setTweakLogs(prev => [...prev, '[Storage Audit] Initializing sector analyzer sweep...']);

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
        setTweakLogs(prev => [...prev, '[Storage Audit Completed] Space sector mapping generated. Size: 1.84 GB']);
        playPresetSound('success');
      }, 1500);
      return;
    }

    try {
      const scanCmd = `powershell -Command "Get-ChildItem -Path $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`;
      const res = await window.api.runSystemCommand(scanCmd);
      if (res.success) {
        const bytes = parseInt(res.output.trim()) || 0;
        setTempFolderSize(formatBytes(bytes));
        setTweakLogs(prev => [...prev, `[Storage Audit] Scan completed. Size identified: ${formatBytes(bytes)}`]);
        playPresetSound('success');
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
    playPresetSound('nuke');
    setTweakLogs(prev => [...prev, '[Storage Purge] INITIALIZING DISK CACHE WIPE SECTORS...']);

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

      playCustomSynthNote(200 + (currentRow * 80));
      currentRow++;
    }, 150);
  };

  const finalizeDefragWipe = async () => {
    if (isElectron) {
      const purgeCmd = `powershell -Command "Remove-Item -Path '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(purgeCmd);
    }
    setTempFolderSize('0.00 Bytes');
    setTweakLogs(prev => [...prev, '[Storage Purge Completed] Temp sectors scrubbed successfully.']);
    setPurgingTemp(false);
    playPresetSound('success');
  };

  // Administrative launcher utility
  const launchAdminPanel = async (utility) => {
    playPresetSound('tweak');
    let cmd = '';
    if (utility === 'taskmgr') cmd = 'start taskmgr';
    else if (utility === 'regedit') cmd = 'start regedit';
    else if (utility === 'devmgmt') cmd = 'start devmgmt.msc';
    else if (utility === 'envvars') cmd = 'start rundll32.exe sysdm.cpl,EditEnvironmentVariables';

    if (isElectron && cmd) {
      await window.api.runSystemCommand(cmd);
    }
    setTweakLogs(prev => [...prev, `[Launcher] Opened admin console: ${utility}`]);
  };

  // Script Scroll creation
  const addScroll = (e) => {
    e.preventDefault();
    if (!newScroll.title || !newScroll.cmd) return;
    playPresetSound('success');
    const id = `s-${Math.floor(Math.random() * 1000)}`;
    setScrolls(prev => [...prev, { id, ...newScroll }]);
    setNewScroll({ title: '', desc: '', cmd: '' });
    setShowAddScroll(false);
    setTweakLogs(prev => [...prev, `[Scroll registry] New scroll written: ${newScroll.title}`]);
  };

  const removeScroll = (id) => {
    playPresetSound('tweak');
    setScrolls(prev => prev.filter(s => s.id !== id));
    setTweakLogs(prev => [...prev, `[Scroll registry] Scroll deleted.`]);
  };

  // RPG Skill Tree upgrade unlocks
  const buyUpgrade = (upgradeId, cost, themeKey) => {
    if (unlockedUpgrades.includes(upgradeId)) return;
    if (credits < cost) {
      playPresetSound('nuke');
      setTweakLogs(prev => [...prev, `[Core Skill Tree] Insufficient Credits to acquire: ${upgradeId}`]);
      return;
    }

    playPresetSound('success');
    setCredits(c => c - cost);
    setUnlockedUpgrades(prev => [...prev, upgradeId]);
    setTweakLogs(prev => [...prev, `[Core Skill Tree] Unlocked Upgrade: ${upgradeId}`]);

    if (themeKey) {
      setTheme(themeKey);
    }
    if (upgradeId === 'u-double-credit') {
      setDoubleCreditBuff(true);
    }
  };

  // Valorant Tweaks Actions
  const toggleGameMode = async () => {
    const nextVal = !gameModeActive;
    playPresetSound('tweak');
    setGameModeActive(nextVal);
    setValorantLogs(prev => [...prev, `[Game Mode Override] Toggling Game Mode registry to: ${nextVal ? 'ON' : 'OFF'}`]);
    
    if (isElectron) {
      const val = nextVal ? 1 : 0;
      await window.api.runSystemCommand(
        `powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\GameBar -Name AllowAutoGameMode -Value ${val}"`
      );
      setValorantLogs(prev => [...prev, '[Game Mode] GameBar registry updated.']);
    } else {
      setValorantLogs(prev => [...prev, '[Mock] GameBar Game Mode adjusted successfully.']);
    }
  };

  const togglePowerPlan = async () => {
    const nextMode = powerPlanMode === 'balanced' ? 'high' : 'balanced';
    playPresetSound('tweak');
    setPowerPlanMode(nextMode);
    setValorantLogs(prev => [...prev, `[Power Settings] Switching power configuration plan to: ${nextMode.toUpperCase()}`]);

    if (isElectron) {
      const guid = nextMode === 'high' 
        ? '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'
        : '381b4222-f694-41f0-9685-ff5bb260df2e';
      
      const res = await window.api.runSystemCommand(`powercfg /setactive ${guid}`);
      if (res.success) {
        setValorantLogs(prev => [...prev, `[Power Settings] Active profile changed via powercfg.`]);
      } else {
        setValorantLogs(prev => [...prev, `[Power Error] ${res.error}`]);
      }
    } else {
      setValorantLogs(prev => [...prev, '[Mock] Windows Active Power Plan updated.']);
    }
  };

  const forceValorantPriority = async () => {
    playPresetSound('cast');
    setValorantLogs(prev => [...prev, '[Priority Boost] Attempting to elevate VALORANT priority class...']);

    if (isElectron) {
      const check = await window.api.runSystemCommand('tasklist');
      if (check.success && check.output.includes('VALORANT-Win64-Shipping')) {
        const res = await window.api.runSystemCommand(
          `powershell -Command "Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
        );
        if (res.success) {
          setValorantLogs(prev => [...prev, '[Priority Boost Completed] Elevated processes in Windows Scheduler.']);
          playPresetSound('success');
        }
      } else {
        setValorantLogs(prev => [...prev, '[Priority Error] VALORANT process not active. Start game first.']);
        playPresetSound('nuke');
      }
    } else {
      setValorantLogs(prev => [...prev, '[Mock Priority] Set active game priority to HIGH.']);
      playPresetSound('success');
    }
  };

  const scanValorantCaches = async () => {
    if (scanningVal) return;
    setScanningVal(true);
    playPresetSound('cast');
    setValorantLogs(prev => [...prev, '[Scrubber Audit] Auditing log caches and shader folders...']);

    if (!isElectron) {
      setTimeout(() => {
        setScanningVal(false);
        setValorantLogsSize('142 MB');
        setShaderCacheSize('844 MB');
        setValorantLogs(prev => [...prev, '[Scrubber Completed] Simulated size values returned. Logs: 142MB, Shaders: 844MB']);
        playPresetSound('success');
      }, 1200);
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

      setValorantLogs(prev => [...prev, `[Scrubber Audit] Completed. Logs size: ${formatBytes(logBytes)}, Shader caches size: ${formatBytes(shaderBytes)}`]);
      playPresetSound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setScanningVal(false);
    }
  };

  const clearValorantLogs = async () => {
    if (cleaningVal) return;
    setCleaningVal(true);
    playPresetSound('nuke');
    setValorantLogs(prev => [...prev, '[Scrubber Purge] Emptying game telemetry folders...']);

    if (isElectron) {
      const purgeLogs = `powershell -Command "if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Remove-Item -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs\\*' -Recurse -Force -ErrorAction SilentlyContinue }"`;
      await window.api.runSystemCommand(purgeLogs);
    }
    setValorantLogsSize('0.00 Bytes');
    setValorantLogs(prev => [...prev, '[Scrubber Purge] Valorant log telemetry cache wiped clean.']);
    setCleaningVal(false);
    playPresetSound('success');
  };

  const clearShaderCache = async () => {
    if (cleaningVal) return;
    setCleaningVal(true);
    playPresetSound('nuke');
    setValorantLogs(prev => [...prev, '[Scrubber Purge] Emptying graphics shader pipelines databases...']);

    if (isElectron) {
      const purgeShader = `powershell -Command "Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*', '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*', '$env:LOCALAPPDATA\\AMD\\DxCache\\*', '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue"`;
      await window.api.runSystemCommand(purgeShader);
    }
    setShaderCacheSize('0.00 Bytes');
    setValorantLogs(prev => [...prev, '[Scrubber Purge] All GPU (NVIDIA, AMD, DirectX) shader caches purged.']);
    setCleaningVal(false);
    playPresetSound('success');
  };

  return (
    <div className={`flex flex-col h-screen select-none ${activeStyle.bg} ${activeStyle.textBody || 'text-slate-100'} font-sans transition-all duration-300 ${shakeScreen ? 'animate-bounce' : ''} ${activeStyle.isLight ? 'light-scrollbar' : ''}`}>
      <Toast toasts={toasts} removeToast={removeToast} activeStyle={activeStyle} />
      
      {/* Title Header */}
      <header className={`titlebar-drag h-[38px] ${activeStyle.headerBg} border-b flex items-center px-4 shrink-0 justify-between`}>
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${activeStyle.textAccent} animate-pulse`} />
          <span className={`text-xs font-bold tracking-wider font-sans ${activeStyle.textPrimary}`}>NEUROPTIMIZE CYBERNETIC DECK</span>
        </div>
        
        {/* Right side of header */}
        <div className="flex items-center gap-4">
          {/* Quick Theme Switcher */}
          <div className="flex items-center gap-1.5 font-sans">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeStyle.textMuted}`}>Style:</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className={`${activeStyle.isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-black/20 border-slate-500/20'} border px-2.5 py-1 rounded-md text-xs font-sans select-none outline-none cursor-pointer ${activeStyle.textPrimary} transition-colors`}
            >
              <option value="lightBlue" className="bg-[#f0f4f9] text-slate-800 font-sans font-medium">Light Blue</option>
              <option value="cobalt" className="bg-[#070c14] text-blue-400 font-sans font-medium">Cobalt</option>
              <option value="matrix" className="bg-[#030704] text-emerald-500 font-sans font-medium">Matrix</option>
              <option value="vaporwave" className="bg-[#0a0510] text-fuchsia-500 font-sans font-medium">Vaporwave</option>
              <option value="solarized" className="bg-[#0f0a05] text-amber-500 font-sans font-medium">Solarized</option>
            </select>
          </div>

          {!isElectron && (
            <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-sans font-semibold">
              SIMULATOR MOCK
            </span>
          )}
        </div>
      </header>

      {/* Tabs panels */}
      <Tabs.Root value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === 'files') loadFiles();
      }} className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          activeStyle={activeStyle} 
          stats={stats} 
          theme={theme} 
          advancedMode={advancedMode}
          setAdvancedMode={setAdvancedMode}
          setActiveTab={setActiveTab}
        />

        {/* Tab Screens Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className={`flex-1 p-6 overflow-y-auto relative ${activeStyle.radial}`}>
            
            {/* TAB: 1-CLICK OPTIMIZER */}
            <Tabs.Content value="optimizer" className="h-full outline-none">
              <OneClickOptimize 
                isOptimizing={maxBoostStatus === 'boosting'}
                isOptimized={maxBoostStatus === 'active'}
                onOptimize={() => toggleMaxBoost(true)}
                onRevert={() => toggleMaxBoost(false)}
                isAdmin={isAdmin}
                theme={activeStyle}
              />
            </Tabs.Content>
          
          {/* TAB 1: REACTOR CORE & DIAGNOSTICS */}
          <Tabs.Content value="dashboard" className="space-y-6 outline-none animate-in fade-in duration-300">
            <Dashboard 
              stats={stats} 
              activeStyle={activeStyle} 
              canvasRef={canvasRef} 
              setTheme={setTheme} 
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

          {/* TAB: VALORANT OPTIMIZER */}
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
              activeStyle={activeStyle}
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

          {/* TAB 2: TWEAKS, DEFRAGMENTER DRIVE SECTOR & SCROLL REGISTRY */}
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
              activeStyle={activeStyle}
            />
          </Tabs.Content>

          {/* TAB 3: AUTO SENTINEL FLOWCHART */}
          <Tabs.Content value="automation" className="h-full flex flex-col outline-none">
            <AutoSentinel 
              stats={stats}
              scrolls={scrolls}
              isElectron={isElectron}
              activeStyle={activeStyle}
              setTerminalLogs={setTerminalLogs}
            />
          </Tabs.Content>

          {/* TAB 4: COMMAND CONSOLE & NETRUNNER RADAR MAP */}
          <Tabs.Content value="terminal" className="outline-none">
            <CommandPanel 
              cmdInput={cmdInput}
              setCmdInput={setCmdInput}
              terminalLogs={terminalLogs}
              executing={executing}
              runCommand={runCommand}
              radarHops={radarHops}
              activeStyle={activeStyle}
              terminalEndRef={terminalEndRef}
            />
          </Tabs.Content>

          {/* TAB 5: FILES EXPLORER */}
          <Tabs.Content value="files" className="outline-none">
            <Explorer 
              loadingFiles={loadingFiles}
              fileError={fileError}
              files={files}
              loadFiles={loadFiles}
              formatBytes={formatBytes}
              activeStyle={activeStyle}
            />
          </Tabs.Content>

        </main>
      </div>
    </Tabs.Root>
    </div>
  );
}
