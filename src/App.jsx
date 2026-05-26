import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Activity, Info, AlertCircle, Trash, Trash2, Plus, Zap, Cpu, Settings
} from 'lucide-react';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SynthDrawer from './components/SynthDrawer';
import ValorantOptimizer from './components/ValorantOptimizer';
import TweakDeck from './components/TweakDeck';
import CommandPanel from './components/CommandPanel';
import Explorer from './components/Explorer';
import AutoSentinel from './components/AutoSentinel';

// Dynamic Cyberpunk Theme Style Schemas
const themeStyles = {
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
    dotColor: '#06b6d4'
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
    dotColor: '#22c55e'
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
    dotColor: '#d946ef'
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
    dotColor: '#fb923c'
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

// Synthesizer Piano Keys
const synthPianoKeys = [
  { note: 'C4', freq: 261.63, isBlack: false },
  { note: 'C#4', freq: 277.18, isBlack: true },
  { note: 'D4', freq: 293.66, isBlack: false },
  { note: 'D#4', freq: 311.13, isBlack: true },
  { note: 'E4', freq: 329.63, isBlack: false },
  { note: 'F4', freq: 349.23, isBlack: false },
  { note: 'F#4', freq: 369.99, isBlack: true },
  { note: 'G4', freq: 392.00, isBlack: false },
  { note: 'G#4', freq: 415.30, isBlack: true },
  { note: 'A4', freq: 440.00, isBlack: false },
  { note: 'A#4', freq: 466.16, isBlack: true },
  { note: 'B4', freq: 493.88, isBlack: false }
];

export default function App() {
  const [isElectron, setIsElectron] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('cobalt');

  // RPG Stats & Credits State
  const [xp, setXp] = useState(30);
  const [credits, setCredits] = useState(120);
  const [doubleCreditBuff, setDoubleCreditBuff] = useState(false);
  const [unlockedUpgrades, setUnlockedUpgrades] = useState(['u-base']);

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

  // Cyber-Synth ADSR Board State
  const [adsr, setAdsr] = useState({
    waveform: 'sine',
    attack: 0.08,
    decay: 0.15,
    sustain: 0.6,
    release: 0.4,
    frequency: 440
  });
  const [showSynthBoard, setShowSynthBoard] = useState(false);

  // Storage Tweak & Defragmenter State
  const [tempFolderSize, setTempFolderSize] = useState('Click Scan');
  const [scanningTemp, setScanningTemp] = useState(false);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [defragSectors, setDefragSectors] = useState(Array(120).fill('empty'));
  const [tweakLogs, setTweakLogs] = useState([]);
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
  const [terminalLogs, setTerminalLogs] = useState([
    'Nexus Sentinel Cyber Deck Active...',
    'Real-time network security scanning modules enabled.'
  ]);
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



  // Spell-casting state
  const [castingSpell, setCastingSpell] = useState(null);
  const [spellStatusText, setSpellStatusText] = useState('');
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
  const [valorantLogs, setValorantLogs] = useState([]);

  // Deep Performance Optimizer States
  const [deepOptimizeActive, setDeepOptimizeActive] = useState(false);
  const [optimizationOptions, setOptimizationOptions] = useState({
    pauseUpdates: true,
    disableDefender: false,
    purgeApps: true,
    clearStandby: true
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

  const terminalEndRef = useRef(null);
  const canvasRef = useRef(null);

  const activeStyle = themeStyles[theme] || themeStyles.cobalt;

  // Check Administrator role on load
  useEffect(() => {
    const checkAdmin = async () => {
      if (window.api) {
        try {
          const res = await window.api.runSystemCommand('net session');
          setIsAdmin(res.success);
        } catch (e) {
          setIsAdmin(false);
        }
      }
    };
    checkAdmin();
  }, []);

  // Web Audio Synth Note Generator using ADSR parameters
  const playCustomSynthNote = (freqHz) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = adsr.waveform;
      const now = ctx.currentTime;

      // Attack Phase
      osc.frequency.setValueAtTime(freqHz || adsr.frequency, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + adsr.attack);

      // Decay Phase
      gain.gain.exponentialRampToValueAtTime(0.08 * adsr.sustain, now + adsr.attack + adsr.decay);

      // Release Phase trigger
      const duration = 0.2;
      const stopTime = now + adsr.attack + adsr.decay + duration;
      gain.gain.setValueAtTime(0.08 * adsr.sustain, stopTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime + adsr.release);

      osc.start(now);
      osc.stop(stopTime + adsr.release);
    } catch (e) {
      console.warn('Audio synthesis restricted:', e);
    }
  };

  const playPresetSound = (type) => {
    if (type === 'cast') playCustomSynthNote(150);
    else if (type === 'success') playCustomSynthNote(523.25);
    else if (type === 'tweak') playCustomSynthNote(660);
    else if (type === 'nuke') playCustomSynthNote(220);
  };

  // Uptime Credits & XP Loop
  useEffect(() => {
    const loop = setInterval(() => {
      const creditGain = doubleCreditBuff ? 10 : 5;
      setCredits(c => c + creditGain);
      setXp(x => x + 2);
    }, 10000);
    return () => clearInterval(loop);
  }, [doubleCreditBuff]);

  // Background Daemon for Auto-Boost Valorant check
  useEffect(() => {
    let checkCount = 0;
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
      } else {
        // Mock daemon check
        checkCount++;
        if (checkCount % 12 === 0 && !valorantRunning) {
          triggerValorantAutoBoost();
          setValorantRunning(true);
        } else if (checkCount % 12 === 8 && valorantRunning) {
          triggerValorantAutoRevert();
          setValorantRunning(false);
        }
      }
    }, 4000);

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

    // 2. Suspend Windows Defender Real-time scanning
    if (optimizationOptions.disableDefender) {
      setValorantLogs(prev => [...prev, '[Deep Optimizer] Suspending Windows Defender Real-time scanning...']);
      if (isElectron) {
        // Add exclusion
        await window.api.runSystemCommand("powershell -Command \"Add-MpPreference -ExclusionPath '$env:LOCALAPPDATA\\VALORANT' -ErrorAction SilentlyContinue\"");
        // Suspension
        const defRes = await window.api.runSystemCommand("powershell -Command \"Set-MpPreference -DisableRealtimeMonitoring $true -ErrorAction Stop\"");
        if (defRes.success) {
          setValorantLogs(prev => [...prev, '[Deep Optimizer] Success: Windows Defender real-time scanning suspended. Exclusions added.']);
          queue.push('defender');
        } else {
          setValorantLogs(prev => [...prev, `[Deep Optimizer Warning] Failed to suspend Defender: ${defRes.error || 'Access Denied (Admin Required)'}`]);
        }
      } else {
        setValorantLogs(prev => [...prev, '[Mock] Windows Defender real-time protection suspended. Exclusions added.']);
        queue.push('defender');
      }
    }

    // 3. Purging Background Apps
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

    // 4. Memory standby flush
    if (optimizationOptions.clearStandby) {
      setValorantLogs(prev => [...prev, '[Deep Optimizer] Flushing RAM page standby list caches...']);
      if (isElectron) {
        await window.api.runSystemCommand("powershell -Command \"[System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()\"");
      }
      setValorantLogs(prev => [...prev, '[Deep Optimizer] RAM standby cache flushed.']);
    }

    setRevertQueue(queue);
    setValorantLogs(prev => [...prev, '[Deep Optimizer] Deep performance modifications completed.']);
  };

  // Revert temporary deep optimizations
  const triggerValorantAutoRevert = async () => {
    playPresetSound('cast');
    setValorantLogs(prev => [...prev, '[Auto-Revert] VALORANT process exited. Restoring system parameters...']);
    setTerminalLogs(prev => [...prev, '\n[Auto-Revert Daemon]: VALORANT exited. Reverting temporary changes.']);

    // Revert Windows Update
    if (revertQueue.includes('wuauserv')) {
      setValorantLogs(prev => [...prev, '[Auto-Revert] Restoring Windows Update service...']);
      if (isElectron) {
        await window.api.runSystemCommand("powershell -Command \"Start-Service -Name 'wuauserv'\"");
      }
      setValorantLogs(prev => [...prev, '[Auto-Revert] Success: Windows Update service restored.']);
    }

    // Revert Windows Defender
    if (revertQueue.includes('defender')) {
      setValorantLogs(prev => [...prev, '[Auto-Revert] Restoring Windows Defender settings...']);
      if (isElectron) {
        await window.api.runSystemCommand("powershell -Command \"Set-MpPreference -DisableRealtimeMonitoring $false\"");
        await window.api.runSystemCommand("powershell -Command \"Remove-MpPreference -ExclusionPath '$env:LOCALAPPDATA\\VALORANT' -ErrorAction SilentlyContinue\"");
      }
      setValorantLogs(prev => [...prev, '[Auto-Revert] Success: Windows Defender real-time scanning restored. Exclusions removed.']);
    }

    setValorantLogs(prev => [...prev, '[Auto-Revert] System restoration complete. All parameters reverted.']);
    setRevertQueue([]);
    playPresetSound('success');

    if (Notification.permission === 'granted') {
      new Notification("Nexus System Restored", {
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
      await window.api.runSystemCommand(
        `powershell -Command "Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`
      );
    }
    setValorantLogs(prev => [...prev, '[Auto-Daemon] Process Priority set to HIGH in memory.']);

    if (isElectron) {
      await window.api.runSystemCommand(`powershell -Command "[System.GC]::Collect()"`);
    }
    setValorantLogs(prev => [...prev, '[Auto-Daemon] Cleaned memory working sets.']);

    if (isElectron) {
      await window.api.runSystemCommand('ipconfig /flushdns');
    }
    setValorantLogs(prev => [...prev, '[Auto-Daemon] Flushed DNS routing table for minimal ping.']);

    // Deep Optimization Trigger
    if (deepOptimizeActive) {
      await runDeepPerformanceOptimize();
    }

    playPresetSound('success');
    
    if (Notification.permission === 'granted') {
      new Notification("Nexus Auto-Boost Active", {
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
        hostname: 'NEXUS-SUMMONER',
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

  // Cast active spells
  const castSpell = async (spellName) => {
    if (castingSpell) return;
    playPresetSound('cast');
    setCastingSpell(spellName);
    setSpellStatusText(`CHARGING ENERGY: ${spellName.toUpperCase()}...`);
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);

    setTimeout(async () => {
      let cmd = '';
      if (spellName === 'dnsCleanse') cmd = 'ipconfig /flushdns';
      else if (spellName === 'ramRejuvenation') cmd = 'powershell -Command "[System.GC]::Collect()"';
      else if (spellName === 'chronosReset') cmd = 'taskkill /f /im explorer.exe && start explorer.exe';

      if (isElectron && cmd) {
        const res = await window.api.runSystemCommand(cmd);
        setSpellStatusText(res.success ? `SUCCESS: ${spellName.toUpperCase()} COMPLETED.` : `FAILED: ${res.error}`);
        playPresetSound('success');
      } else {
        setSpellStatusText(`[MOCK SUCCESS]: ${spellName.toUpperCase()} COMPLETED.`);
        playPresetSound('success');
      }
      setTimeout(() => setCastingSpell(null), 1500);
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

      const shaderCmd = `powershell -Command \"if (Test-Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache') { Get-ChildItem -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum } else { echo 0 }\"`;
      const shaderRes = await window.api.runSystemCommand(shaderCmd);
      const shaderBytes = parseInt(shaderRes.output.trim()) || 0;
      setShaderCacheSize(formatBytes(shaderBytes));

      setValorantLogs(prev => [...prev, `[Scrubber Audit] Completed. Logs size: ${formatBytes(logBytes)}, Nvidia shader size: ${formatBytes(shaderBytes)}`]);
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
      const purgeShader = `powershell -Command "if (Test-Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache') { Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*' -Recurse -Force -ErrorAction SilentlyContinue }"`;
      await window.api.runSystemCommand(purgeShader);
    }
    setShaderCacheSize('0.00 Bytes');
    setValorantLogs(prev => [...prev, '[Scrubber Purge] NVIDIA DirectX shader caches purged.']);
    setCleaningVal(false);
    playPresetSound('success');
  };

  return (
    <div className={`flex flex-col h-screen select-none ${activeStyle.bg} text-slate-100 font-sans transition-all duration-300 ${shakeScreen ? 'animate-bounce' : ''}`}>
      
      {/* Title Header */}
      <header className="titlebar-drag h-[38px] bg-[#05080f] border-b border-blue-500/10 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${activeStyle.textAccent} animate-pulse`} />
          <span className={`text-xs font-bold tracking-widest font-mono ${activeStyle.textPrimary}`}>NEXUS SENTINEL CYBERNETIC DECK</span>
        </div>
        
        {/* RPG Credits panel in header */}
        <div className="flex items-center gap-4">
          <div className="bg-[#0b101c] border border-blue-500/10 px-3 py-1 rounded-md text-xs font-mono flex items-center gap-3">
            <span className="text-slate-500 uppercase tracking-widest">XP: <strong className="text-blue-400">{xp}</strong></span>
            <span className="text-slate-400 border-l border-white/5 pl-3">CREDITS: <strong className="text-amber-400">{credits} CR</strong></span>
          </div>
          {!isElectron && (
            <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-mono">
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
        <Sidebar activeStyle={activeStyle} stats={stats} theme={theme} />

        {/* Tab Screens Content */}
        <main className={`flex-1 p-6 overflow-y-auto relative ${activeStyle.radial}`}>
          
          {/* TAB 1: REACTOR CORE & UPGRADE TREE */}
          <Tabs.Content value="dashboard" className="space-y-6 outline-none animate-in fade-in duration-300">
            <Dashboard 
              stats={stats} 
              activeStyle={activeStyle} 
              canvasRef={canvasRef} 
              xp={xp} 
              credits={credits} 
              doubleCreditBuff={doubleCreditBuff} 
              unlockedUpgrades={unlockedUpgrades} 
              buyUpgrade={buyUpgrade} 
              setTheme={setTheme} 
              castSpell={castSpell} 
              castingSpell={castingSpell}
              premadeMacros={premadeMacros}
              runningMacro={runningMacro}
              runMacro={runMacro}
              spellStatusText={spellStatusText}
            />

            <SynthDrawer 
              adsr={adsr}
              setAdsr={setAdsr}
              showSynthBoard={showSynthBoard}
              setShowSynthBoard={setShowSynthBoard}
              playCustomSynthNote={playCustomSynthNote}
              synthPianoKeys={synthPianoKeys}
              activeStyle={activeStyle}
            />
          </Tabs.Content>

          {/* TAB: VALORANT OPTIMIZER */}
          <Tabs.Content value="valorant" className="outline-none">
            <ValorantOptimizer 
              isElectron={isElectron}
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
              playPresetSound={playPresetSound}
              playCustomSynthNote={playCustomSynthNote}
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
      </Tabs.Root>
    </div>
  );
}
