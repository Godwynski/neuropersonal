import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Cpu, Terminal, FolderOpen, RefreshCw, Play, Monitor, AlertCircle, ChevronRight, 
  Sparkles, ShieldAlert, Wrench, Zap, PlayCircle, Settings, ToggleLeft, 
  Plus, Trash, Link, Volume2, Trash2, Activity, Info, LogOut
} from 'lucide-react';

// Web Audio API Sci-Fi Synthesizer Sound Engine
const playSynthSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'cast') {
      // Sci-fi power sweep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'success') {
      // Harmonic synth chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'tweak') {
      // Cyber click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'nuke') {
      // High alert ping
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.linearRampToValueAtTime(220.00, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn('Audio Context failed to start (browser permissions):', e);
  }
};

export default function App() {
  const [isElectron, setIsElectron] = useState(true);
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

  // Files Tab State
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState('');

  // Terminal Logs State
  const [cmdInput, setCmdInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    'Nexus Commander OS Shell Ready...',
    'System monitoring active. Cybernetic defense shields operational.'
  ]);
  const [executing, setExecuting] = useState(false);

  // Spell Casting Visual Effects
  const [castingSpell, setCastingSpell] = useState(null);
  const [spellStatusText, setSpellStatusText] = useState('');
  const [shakeScreen, setShakeScreen] = useState(false);

  // Tweak Board State
  const [tweaks, setTweaks] = useState({
    darkMode: true,
    hiddenFiles: false,
    taskbarAutohide: false
  });
  const [scanningTemp, setScanningTemp] = useState(false);
  const [tempFolderSize, setTempFolderSize] = useState(null);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [tweakLogs, setTweakLogs] = useState([]);

  // Automation Flowchart Canvas State
  const [nodes, setNodes] = useState([
    { id: 'n-trig-cpu', type: 'trigger', subType: 'cpu', title: 'CPU Trigger', x: 50, y: 100, threshold: 40, active: false },
    { id: 'n-trig-ram', type: 'trigger', subType: 'ram', title: 'RAM Trigger', x: 50, y: 280, threshold: 75, active: false },
    { id: 'n-act-beep', type: 'action', subType: 'beep', title: 'Sonic Pulse Alarm', x: 480, y: 100, active: false },
    { id: 'n-act-notify', type: 'action', subType: 'notify', title: 'OS HUD Alert', x: 480, y: 280, active: false }
  ]);
  const [connections, setConnections] = useState([
    { from: 'n-trig-cpu', to: 'n-act-notify' }
  ]);

  // Connection Drag-Wires State
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNodeSelector, setShowNodeSelector] = useState(false);

  const terminalEndRef = useRef(null);
  const canvasRef = useRef(null);
  const flowchartWorkspaceRef = useRef(null);

  // Check Environment
  useEffect(() => {
    if (!window.api) {
      setIsElectron(false);
      console.warn('Running outside Electron shell. Native commands will be mocked.');
      setStats({
        platform: 'win32',
        arch: 'x64',
        hostname: 'NEXUS-SUMMONER',
        cpuModel: 'Intel Core i9-13900K @ 3.00GHz (Virtual Node)',
        cpuCores: 24,
        cpuLoad: 18,
        totalMemGB: '32.00',
        freeMemGB: '22.40',
        usedMemGB: '9.60',
        memUsagePercent: 30
      });
      setFiles([
        { name: 'electron', isDirectory: true, size: 0, modified: new Date() },
        { name: 'src', isDirectory: true, size: 0, modified: new Date() },
        { name: 'package.json', isDirectory: false, size: 779, modified: new Date() },
        { name: 'vite.config.js', isDirectory: false, size: 405, modified: new Date() }
      ]);
    }
  }, []);

  // Periodic polling for CPU/RAM Stats
  useEffect(() => {
    if (!isElectron) {
      const interval = setInterval(() => {
        setStats(prev => {
          const mockCpu = Math.max(5, Math.min(95, Math.round(prev.cpuLoad + (Math.random() * 12 - 6))));
          const mockMemPercent = Math.max(20, Math.min(90, Math.round(prev.memUsagePercent + (Math.random() * 4 - 2))));
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
        console.error('Failed to query statistics:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [isElectron]);

  // Canvas Rotating Core Animation (Reactor Core)
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

      // Draw gridlines in background
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Outer Rotating Neon Ring
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 15]);
      ctx.lineDashOffset = -angle * 25;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Middle Cyber Ring (cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([30, 8, 4, 8]);
      ctx.lineDashOffset = angle * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Core Reactor Pulsing Glow
      const pulseSpeed = 4 + (stats.cpuLoad / 12);
      const pulseSize = 14 + Math.sin(angle * pulseSpeed) * 3 + (stats.cpuLoad / 10);
      
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pulseSize * 2);
      
      // Dynamic shift to red on higher CPU load
      let coreColor = 'rgba(99, 102, 241, 0.75)'; // Indigo
      let outerGlow = 'rgba(99, 102, 241, 0)';
      if (stats.cpuLoad > 75) {
        coreColor = 'rgba(239, 68, 68, 0.85)'; // Red
      } else if (stats.cpuLoad > 45) {
        coreColor = 'rgba(168, 85, 247, 0.8)'; // Purple
      }

      grad.addColorStop(0, coreColor);
      grad.addColorStop(1, outerGlow);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Particle orbits
      const particles = 3;
      for (let i = 0; i < particles; i++) {
        const pAngle = angle + (i * Math.PI * 2 / particles);
        const px = cx + Math.cos(pAngle) * 55;
        const py = cy + Math.sin(pAngle) * 55;
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Angular coordinates display (aesthetic detailing)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '7px monospace';
      ctx.fillText(`ROT: ${(angle % (Math.PI * 2)).toFixed(2)} RAD`, cx - 35, cy - 85);
      ctx.fillText(`FREQ: ${(0.02 + stats.cpuLoad / 1000).toFixed(4)}Hz`, cx - 35, cy + 92);

      angle += 0.015 + (stats.cpuLoad / 1200);
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [stats.cpuLoad]);

  // Scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Load files
  const loadFiles = async () => {
    setLoadingFiles(true);
    setFileError('');
    if (!isElectron) {
      setTimeout(() => {
        setLoadingFiles(false);
      }, 500);
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

  // Run shell commands manually
  const runCommand = async () => {
    const cmd = cmdInput.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, `\n> ${cmd}`, 'Running system command...']);
    setCmdInput('');
    setExecuting(true);

    if (!isElectron) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev.slice(0, -1),
          `[Mock Output]: Execution of "${cmd}" was successful.`,
          'Note: Install & run Nexus Commander via Electron for real system execution.'
        ]);
        setExecuting(false);
      }, 700);
      return;
    }

    try {
      const response = await window.api.runSystemCommand(cmd);
      setTerminalLogs(prev => [
        ...prev.slice(0, -1),
        response.success 
          ? (response.output || 'Command finished successfully (no output returned).')
          : `Error: ${response.error}\n${response.output || ''}`
      ]);
    } catch (err) {
      setTerminalLogs(prev => [...prev.slice(0, -1), `Critical Exception: ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  // Spell Casting Engine (RPG Dashboard Actions)
  const castSpell = async (spellName) => {
    if (castingSpell) return;
    
    playSynthSound('cast');
    setCastingSpell(spellName);
    setSpellStatusText(`CHARGING ${spellName.toUpperCase()} ENERGY...`);
    setShakeScreen(true);
    
    setTimeout(() => setShakeScreen(false), 500);

    if (spellName === 'auraCleanse') {
      // Flush DNS Cache
      setTimeout(async () => {
        setSpellStatusText(`CASTING AURA CLEANSE: PURGING DNS REGISTRY...`);
        if (isElectron) {
          const res = await window.api.runSystemCommand('ipconfig /flushdns');
          if (res.success) {
            setSpellStatusText(`SUCCESS: DNS CACHE HAS BEEN PURIFIED.`);
            playSynthSound('success');
          } else {
            setSpellStatusText(`FAILED: CANNOT CLEANSE DNS. ${res.error}`);
          }
        } else {
          setSpellStatusText(`[MOCK] SUCCESS: DNS CACHE FLUSHED.`);
          playSynthSound('success');
        }
        setTimeout(() => setCastingSpell(null), 2000);
      }, 1000);

    } else if (spellName === 'manaRejuvenation') {
      // Trim working memory sets (RAM optimization simulation / garbage collection)
      setTimeout(async () => {
        setSpellStatusText(`CASTING MANA REJUVENATION: COMPRESSING WORKING SETS...`);
        if (isElectron) {
          // Trims unused memory by forcing cleanups (combining GC + explorer trims if possible)
          const res = await window.api.runSystemCommand(
            `powershell -Command "[System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()"`
          );
          if (res.success) {
            setSpellStatusText(`SUCCESS: SYSTEM MANA REPLENISHED.`);
            playSynthSound('success');
          } else {
            setSpellStatusText(`FAILED: SPELL DISRUPTED. ${res.error}`);
          }
        } else {
          setSpellStatusText(`[MOCK] SUCCESS: RAM RECLAIMED.`);
          playSynthSound('success');
        }
        setTimeout(() => setCastingSpell(null), 2000);
      }, 1000);

    } else if (spellName === 'chronosReset') {
      // Restart Explorer.exe
      setTimeout(async () => {
        setSpellStatusText(`CASTING CHRONOS RESET: WARPING TIME GRAPHICS...`);
        if (isElectron) {
          const res = await window.api.runSystemCommand('taskkill /f /im explorer.exe && start explorer.exe');
          if (res.success) {
            setSpellStatusText(`SUCCESS: SHELL DIMENSION RESTRUCTURED.`);
            playSynthSound('success');
          } else {
            setSpellStatusText(`FAILED: SHELL WARP UNSTABLE. ${res.error}`);
          }
        } else {
          setSpellStatusText(`[MOCK] SUCCESS: RESTARTED EXPLORER.EXE.`);
          playSynthSound('success');
        }
        setTimeout(() => setCastingSpell(null), 2000);
      }, 1000);
    }
  };

  // Windows Tweaks Engine
  const toggleTweak = async (tweakName, cmdOn, cmdOff) => {
    const isCurrentlyOn = tweaks[tweakName];
    const targetVal = !isCurrentlyOn;
    playSynthSound('tweak');
    setTweaks(prev => ({ ...prev, [tweakName]: targetVal }));

    const targetCmd = targetVal ? cmdOn : cmdOff;
    setTweakLogs(prev => [...prev, `[Tweak] Adjusting ${tweakName} -> ${targetVal ? 'ON' : 'OFF'}`]);

    if (isElectron) {
      const res = await window.api.runSystemCommand(targetCmd);
      if (res.success) {
        setTweakLogs(prev => [...prev, `[Tweak] successfully modified settings for ${tweakName}.`]);
      } else {
        setTweakLogs(prev => [...prev, `[Tweak Error] ${res.error}`]);
      }
    } else {
      setTweakLogs(prev => [...prev, `[Mock] Toggle ${tweakName} successful.`]);
    }
  };

  // Scan Temp Folder Size
  const scanTempFolder = async () => {
    if (scanningTemp) return;
    setScanningTemp(true);
    playSynthSound('cast');
    setTweakLogs(prev => [...prev, '[Storage] Scanning temporary systems folder...']);

    if (!isElectron) {
      setTimeout(() => {
        setScanningTemp(false);
        setTempFolderSize('1.42 GB');
        setTweakLogs(prev => [...prev, '[Storage Scan Completed] Mock temp size calculated: 1.42 GB']);
        playSynthSound('success');
      }, 1500);
      return;
    }

    try {
      const scanCmd = `powershell -Command "Get-ChildItem -Path $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`;
      const res = await window.api.runSystemCommand(scanCmd);
      if (res.success) {
        const bytes = parseInt(res.output.trim()) || 0;
        const formatted = formatBytes(bytes);
        setTempFolderSize(formatted);
        setTweakLogs(prev => [...prev, `[Storage Scan Completed] Temp files size: ${formatted}`]);
        playSynthSound('success');
      } else {
        setTweakLogs(prev => [...prev, `[Scan Error] ${res.error}`]);
      }
    } catch (err) {
      setTweakLogs(prev => [...prev, `[Scan Exception] ${err.message}`]);
    } finally {
      setScanningTemp(false);
    }
  };

  // Purge Temp Folder
  const purgeTempFolder = async () => {
    if (purgingTemp) return;
    setPurgingTemp(true);
    playSynthSound('nuke');
    setTweakLogs(prev => [...prev, '[Storage] PURGING TEMPORARY FILES...']);

    if (!isElectron) {
      setTimeout(() => {
        setPurgingTemp(false);
        setTempFolderSize('0.00 Bytes');
        setTweakLogs(prev => [...prev, '[Purge Completed] Mock storage purged successfully.']);
        playSynthSound('success');
      }, 2000);
      return;
    }

    try {
      const purgeCmd = `powershell -Command "Remove-Item -Path '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue"`;
      const res = await window.api.runSystemCommand(purgeCmd);
      if (res.success) {
        setTweakLogs(prev => [...prev, '[Purge Completed] Cache removed from system disk.']);
        // Scan again
        await scanTempFolder();
      } else {
        setTweakLogs(prev => [...prev, `[Purge Warning] Partial removal complete. Some locked files skipped.`]);
        // Scan again to get residual size
        await scanTempFolder();
      }
    } catch (err) {
      setTweakLogs(prev => [...prev, `[Purge Exception] ${err.message}`]);
    } finally {
      setPurgingTemp(false);
    }
  };

  // Launch Windows utility shortcuts
  const launchAdminPanel = async (utility) => {
    playSynthSound('tweak');
    setTweakLogs(prev => [...prev, `[Launcher] Deploying utility panel: ${utility}`]);
    if (!isElectron) {
      setTweakLogs(prev => [...prev, `[Mock Launcher] Opened panel ${utility}`]);
      return;
    }

    let command = '';
    switch (utility) {
      case 'registry': command = 'start regedit'; break;
      case 'taskmgr': command = 'start taskmgr'; break;
      case 'devmgmt': command = 'start devmgmt.msc'; break;
      case 'services': command = 'start services.msc'; break;
      case 'envvars': command = 'start rundll32.exe sysdm.cpl,EditEnvironmentVariables'; break;
    }

    if (command) {
      const res = await window.api.runSystemCommand(command);
      if (!res.success) {
        setTweakLogs(prev => [...prev, `[Launch Error] Could not open utility: ${res.error}`]);
      }
    }
  };

  // Node Drag and Drop Math
  const startDragNode = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    // Calculate offset of the mouse click point relative to node's current coordinate
    const clientX = e.clientX - bounds.left;
    const clientY = e.clientY - bounds.top;

    setDraggedNodeId(nodeId);
    setDragOffset({
      x: clientX - node.x,
      y: clientY - node.y
    });
  };

  const handleWorkspaceMouseMove = (e) => {
    if (!draggedNodeId) return;

    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const clientX = e.clientX - bounds.left;
    const clientY = e.clientY - bounds.top;

    let targetX = clientX - dragOffset.x;
    let targetY = clientY - dragOffset.y;

    // Boundaries check
    targetX = Math.max(10, Math.min(bounds.width - 250, targetX));
    targetY = Math.max(10, Math.min(bounds.height - 130, targetY));

    setNodes(prev => prev.map(n => {
      if (n.id === draggedNodeId) {
        return { ...n, x: targetX, y: targetY };
      }
      return n;
    }));
  };

  const stopDragNode = () => {
    setDraggedNodeId(null);
  };

  // Connect Nodes logic
  const handlePinClick = (e, nodeId, type) => {
    e.stopPropagation();
    playSynthSound('tweak');
    if (type === 'output') {
      setConnectingFromId(nodeId);
    } else if (type === 'input' && connectingFromId) {
      // Don't connect same node
      if (connectingFromId === nodeId) {
        setConnectingFromId(null);
        return;
      }
      // Check if duplicate connection
      const duplicateExists = connections.some(c => c.from === connectingFromId && c.to === nodeId);
      if (!duplicateExists) {
        setConnections(prev => [...prev, { from: connectingFromId, to: nodeId }]);
        playSynthSound('success');
      }
      setConnectingFromId(null);
    }
  };

  // Flowchart Node Action Engine (Background Evaluation)
  useEffect(() => {
    const checkAutomations = async () => {
      const triggeredTrigIds = new Set();

      nodes.forEach(node => {
        if (node.type === 'trigger') {
          if (node.subType === 'cpu') {
            if (stats.cpuLoad >= (node.threshold || 50)) {
              triggeredTrigIds.add(node.id);
            }
          } else if (node.subType === 'ram') {
            if (stats.memUsagePercent >= (node.threshold || 80)) {
              triggeredTrigIds.add(node.id);
            }
          }
        }
      });

      // Find targets connected to these triggers
      connections.forEach(conn => {
        if (triggeredTrigIds.has(conn.from)) {
          executeAction(conn.to, conn.from);
        }
      });
    };

    const interval = setInterval(checkAutomations, 3000);
    return () => clearInterval(interval);
  }, [nodes, connections, stats]);

  // Execute Action from connected Triggers
  const executeAction = async (actionNodeId, triggerNodeId) => {
    const nodeIndex = nodes.findIndex(n => n.id === actionNodeId);
    if (nodeIndex === -1) return;
    
    const node = nodes[nodeIndex];
    
    // Cooldown check (don't execute same action within 5 seconds)
    const now = Date.now();
    if (node.lastExecuted && now - node.lastExecuted < 5000) return;
    
    // Mutate reference safely
    node.lastExecuted = now;

    // Visual notification glow
    setNodes(prev => prev.map(n => {
      if (n.id === actionNodeId || n.id === triggerNodeId) {
        return { ...n, active: true };
      }
      return n;
    }));

    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === actionNodeId || n.id === triggerNodeId) {
          return { ...n, active: false };
        }
        return n;
      }));
    }, 1500);

    // Play visual pulse beep sound
    playSynthSound('tweak');

    if (node.subType === 'beep') {
      playSynthSound('nuke');
      if (isElectron) {
        window.api.runSystemCommand('powershell -Command "[console]::beep(800, 300)"');
      }
      setTerminalLogs(prev => [...prev, `[Sentinel Flow] Automation triggered: Audio Alarm beep dispatched.`]);
    } else if (node.subType === 'notify') {
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification("Nexus Sentinel Alert", {
          body: `Rule triggered by core activity monitor.`
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification("Nexus Sentinel Alert", {
              body: `Rule triggered by core activity monitor.`
            });
          }
        });
      }
      setTerminalLogs(prev => [...prev, `[Sentinel Flow] Automation triggered: HUD alert dispatched.`]);
    } else if (node.subType === 'dns') {
      setTerminalLogs(prev => [...prev, `[Sentinel Flow] Triggered auto DNS cleanse.`]);
      if (isElectron) {
        await window.api.runSystemCommand('ipconfig /flushdns');
      }
    } else if (node.subType === 'cmd') {
      const userCmd = node.customCommand || 'echo "System Ok"';
      setTerminalLogs(prev => [...prev, `[Sentinel Flow] Running automation command: ${userCmd}`]);
      if (isElectron) {
        window.api.runSystemCommand(userCmd);
      }
    }
  };

  // Flowchart Builder Helpers
  const addNode = (subType) => {
    playSynthSound('tweak');
    const randomId = `node-${subType}-${Math.floor(Math.random() * 1000)}`;
    const bounds = flowchartWorkspaceRef.current.getBoundingClientRect();
    const x = bounds.width / 2 - 100;
    const y = bounds.height / 2 - 50;

    let newNode = {
      id: randomId,
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 40 - 20),
      active: false
    };

    if (subType === 'cpu') {
      newNode = { ...newNode, type: 'trigger', subType: 'cpu', title: 'CPU Trigger', threshold: 50 };
    } else if (subType === 'ram') {
      newNode = { ...newNode, type: 'trigger', subType: 'ram', title: 'RAM Trigger', threshold: 80 };
    } else if (subType === 'beep') {
      newNode = { ...newNode, type: 'action', subType: 'beep', title: 'Sonic Pulse Alarm' };
    } else if (subType === 'notify') {
      newNode = { ...newNode, type: 'action', subType: 'notify', title: 'OS HUD Alert' };
    } else if (subType === 'dns') {
      newNode = { ...newNode, type: 'action', subType: 'dns', title: 'Aura Cleanse (DNS)' };
    } else if (subType === 'cmd') {
      newNode = { ...newNode, type: 'action', subType: 'cmd', title: 'Custom Shell Exec', customCommand: 'dir' };
    }

    setNodes(prev => [...prev, newNode]);
    setShowNodeSelector(false);
  };

  const removeNode = (nodeId) => {
    playSynthSound('tweak');
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (connectingFromId === nodeId) setConnectingFromId(null);
  };

  const removeConnection = (index) => {
    playSynthSound('tweak');
    setConnections(prev => prev.filter((_, idx) => idx !== index));
  };

  // Format Helper
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Math coordinates calculator for drawing wires
  const getNodePins = (node) => {
    // Width = 230, Height = 95 approx
    const outputX = node.x + 230;
    const outputY = node.y + 48;
    const inputX = node.x;
    const inputY = node.y + 48;
    return { inputX, inputY, outputX, outputY };
  };

  const getBezierPath = (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // Command library helpers for Console tab
  const cmdPresets = [
    { label: 'Check Ping', cmd: 'ping google.com -n 4' },
    { label: 'System Details', cmd: 'systeminfo' },
    { label: 'Network Config', cmd: 'ipconfig /all' },
    { label: 'Heavy Processes', cmd: 'powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -First 8 | Format-Table Id, ProcessName, CPU"' },
    { label: 'Port Connections', cmd: 'netstat -ano | Select-String LISTENING' }
  ];

  return (
    <div className={`flex flex-col h-screen select-none bg-[#090d16] text-slate-100 font-sans transition-transform duration-300 ${shakeScreen ? 'animate-bounce' : ''}`}>
      
      {/* Titlebar Header */}
      <header className="titlebar-drag h-[38px] bg-[#0c1222] border-b border-indigo-500/10 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-indigo-300 font-mono">NEXUS SENTINEL v1.2</span>
        </div>
        
        {/* Connection status overlay */}
        <div className="flex items-center gap-4">
          {!isElectron && (
            <div className="titlebar-no-drag flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] text-amber-400 font-mono">
              <AlertCircle className="w-3 h-3" />
              <span>SIMULATION PREVIEW</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">{stats.hostname}</span>
          </div>
        </div>
      </header>

      {/* Main Framework Content Panel via Radix Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        playSynthSound('tweak');
        if (val === 'files') loadFiles();
      }} className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-[230px] bg-[#0c1222] border-r border-indigo-500/10 flex flex-col justify-between p-4 shrink-0">
          <Tabs.List className="flex flex-col gap-1.5">
            <Tabs.Trigger 
              value="dashboard" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent text-slate-400 hover:bg-white/3 hover:text-indigo-300 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>REACTOR CORE</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="tweaks" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent text-slate-400 hover:bg-white/3 hover:text-indigo-300 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>TWEAK DECK</span>
            </Tabs.Trigger>

            <Tabs.Trigger 
              value="automation" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent text-slate-400 hover:bg-white/3 hover:text-indigo-300 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>AUTO SENTINEL</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="terminal" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent text-slate-400 hover:bg-white/3 hover:text-indigo-300 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>COMMAND PANEL</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="files" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all duration-200 cursor-pointer border border-transparent text-slate-400 hover:bg-white/3 hover:text-indigo-300 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span>EXPLORER</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Sidebar Footer */}
          <div className="flex flex-col gap-2 border-t border-indigo-500/10 pt-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>SYSTEM DEFENSE</span>
              <span className="text-emerald-500 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-2 bg-[#090d16] p-2.5 rounded-lg border border-indigo-500/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-indigo-300 font-mono truncate select-text uppercase">
                {stats.platform} ({stats.arch})
              </span>
            </div>
          </div>
        </aside>

        {/* Content Screens */}
        <main className="flex-1 bg-[#070b13] p-6 overflow-y-auto relative bg-[radial-gradient(circle_at_80%_10%,_rgba(99,102,241,0.05),_transparent_75%)]">
          
          {/* TAB 1: CYBERPUNK RPG CORE */}
          <Tabs.Content value="dashboard" className="space-y-6 outline-none animate-in fade-in duration-300">
            
            {/* Holographic Cast Banner */}
            {castingSpell && (
              <div className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                  <span className="font-mono text-xs tracking-widest text-indigo-300">{spellStatusText}</span>
                </div>
                <div className="w-24 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-indigo-500/20">
                  <div className="bg-indigo-500 h-full w-[60%] animate-ping" />
                </div>
              </div>
            )}

            <header className="flex justify-between items-center border-b border-indigo-500/10 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">SENTINEL REACTOR STATUS</h1>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">CPU Mage Core & Resource Synthesizer</p>
              </div>
              <div className="bg-[#0e172a] border border-indigo-500/10 px-4 py-2 rounded-lg font-mono text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Summoner Rank</span>
                <span className="text-sm text-indigo-300 font-bold tracking-widest">LEVEL {stats.cpuCores + 1}</span>
              </div>
            </header>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Avatar & Core Reactor */}
              <div className="bg-[#0c1222]/85 border border-indigo-500/10 backdrop-blur-xl rounded-xl p-6 flex flex-col items-center justify-center relative hover:border-indigo-500/25 transition duration-300 group">
                <div className="absolute top-3 left-4 flex items-center gap-1.5 text-indigo-500">
                  <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-[8px] font-mono font-bold tracking-widest uppercase">Reactor Spin Core</span>
                </div>
                
                <canvas 
                  ref={canvasRef} 
                  width={200} 
                  height={200}
                  className="rounded-full drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                />

                <div className="mt-4 text-center">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block">CORE MATRIX CLASS</span>
                  <span className="text-sm font-semibold text-cyan-400 font-mono tracking-wider truncate max-w-[220px] block select-text">
                    {stats.cpuModel.includes('Intel') ? 'Intel Core Mage' : 'AMD Core Berserker'}
                  </span>
                </div>
              </div>

              {/* Middle Column: RPG Performance Gauges */}
              <div className="lg:col-span-2 bg-[#0c1222]/85 border border-indigo-500/10 backdrop-blur-xl rounded-xl p-6 flex flex-col justify-between hover:border-cyan-500/20 transition duration-300">
                <div className="space-y-5">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase border-b border-indigo-500/10 pb-2">
                    Mana & Core Attributes
                  </h3>

                  {/* HP Bar (RAM usage representation) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-emerald-400 font-bold tracking-wider">🟢 HP [SYSTEM RAM]</span>
                      <span className="text-slate-400 font-medium">
                        {stats.usedMemGB} GB / {stats.totalMemGB} GB ({stats.memUsagePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-4.5 rounded-md p-[2px] border border-emerald-500/20 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-sm transition-all duration-500 flex items-center justify-end pr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        style={{ width: `${stats.memUsagePercent}%` }}
                      >
                        <span className="text-[8px] font-bold text-slate-950 select-none">READY</span>
                      </div>
                    </div>
                  </div>

                  {/* MP Bar (CPU Load representation: MP represents capacity remaining) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-purple-400 font-bold tracking-wider">🟣 MP [REACTOR CAPACITY]</span>
                      <span className="text-slate-400 font-medium">
                        {(100 - stats.cpuLoad)}% Available (Load: {stats.cpuLoad}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-4.5 rounded-md p-[2px] border border-purple-500/20 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-sm transition-all duration-500 flex items-center justify-end pr-1.5 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        style={{ width: `${100 - stats.cpuLoad}%` }}
                      >
                        <span className="text-[8px] font-bold text-slate-950 select-none">ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* EXP Bar (System Uptime representation) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-amber-400 font-bold tracking-wider">🟡 EXP [CLOCK EFFICIENCY]</span>
                      <span className="text-slate-400 font-medium">Cores: {stats.cpuCores} Threads</span>
                    </div>
                    <div className="w-full bg-slate-950 h-4.5 rounded-md p-[2px] border border-amber-500/20 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-sm transition-all duration-500 flex items-center justify-end pr-1.5 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        style={{ width: `${Math.min(100, (stats.cpuCores * 4))}%` }}
                      >
                        <span className="text-[8px] font-bold text-slate-950 select-none">BOOSTED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-indigo-500/10 pt-4 text-center font-mono">
                  <div className="bg-slate-950/45 p-2.5 rounded-lg border border-indigo-500/5">
                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">Architecture</span>
                    <span className="text-[11px] text-slate-300 font-bold">{stats.arch}</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-lg border border-indigo-500/5">
                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">OS Kernel</span>
                    <span className="text-[11px] text-slate-300 font-bold truncate block">{stats.platform}</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-lg border border-indigo-500/5">
                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">Hardware Pool</span>
                    <span className="text-[11px] text-slate-300 font-bold">{stats.cpuCores} Cores</span>
                  </div>
                  <div className="bg-slate-950/45 p-2.5 rounded-lg border border-indigo-500/5">
                    <span className="text-[8px] text-slate-500 uppercase block font-semibold">Memory Pool</span>
                    <span className="text-[11px] text-slate-300 font-bold">{stats.totalMemGB} GB</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Spellcasting Skill Panel */}
            <div className="bg-[#0c1222]/85 border border-indigo-500/10 backdrop-blur-xl rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                  Reactor Spells & Optimizers (Active Skills)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Spell 1 */}
                <button 
                  onClick={() => castSpell('auraCleanse')}
                  disabled={castingSpell !== null}
                  className="bg-slate-950/40 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/35 rounded-lg p-4 text-left transition-all duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest">CD: Instant</span>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Aura Cleanse (DNS Flush)</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Purges the system DNS cache to purify connection routing pathways.</p>
                </button>

                {/* Spell 2 */}
                <button 
                  onClick={() => castSpell('manaRejuvenation')}
                  disabled={castingSpell !== null}
                  className="bg-slate-950/40 hover:bg-emerald-500/10 border border-indigo-500/10 hover:border-emerald-500/35 rounded-lg p-4 text-left transition-all duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">CD: 3s</span>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Mana Rejuvenation (RAM Clean)</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Frees unused system memory by invoking Node/PowerShell garbage collections.</p>
                </button>

                {/* Spell 3 */}
                <button 
                  onClick={() => castSpell('chronosReset')}
                  disabled={castingSpell !== null}
                  className="bg-slate-950/40 hover:bg-rose-500/10 border border-indigo-500/10 hover:border-rose-500/35 rounded-lg p-4 text-left transition-all duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:text-rose-300 transition-colors">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest">CD: 5s</span>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 group-hover:text-rose-400 transition-colors">Chronos Reset (Restart Explorer)</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Restructures the graphical UI layer of the host operating system instantly.</p>
                </button>

              </div>
            </div>

          </Tabs.Content>

          {/* TAB 2: TWEAK BOARD / CONTROL CENTER */}
          <Tabs.Content value="tweaks" className="space-y-6 outline-none animate-in fade-in duration-300">
            <header className="border-b border-indigo-500/10 pb-4">
              <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">OS TWEAK DECK & STORAGE CONTROL</h1>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">Control Registry variables & purge temporary disk cache safely</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Tweaks Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Registry Tweaks Panel */}
                <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase border-b border-indigo-500/10 pb-2">
                    Registry Tweak Decoders (HKCU Keys)
                  </h3>

                  <div className="divide-y divide-indigo-500/5">
                    
                    {/* Tweak 1: Dark Mode */}
                    <div className="flex items-center justify-between py-3.5">
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-mono font-bold text-slate-200 block">Dark Mode Force</span>
                        <span className="text-[10px] text-slate-400 font-mono">HKCU Themes\\Personalize - Toggle AppsUseLightTheme</span>
                      </div>
                      <button 
                        onClick={() => toggleTweak(
                          'darkMode', 
                          'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 0; Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name SystemUsesLightTheme -Value 0"',
                          'powershell -Command "Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value 1; Set-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name SystemUsesLightTheme -Value 1"'
                        )}
                        className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      >
                        {tweaks.darkMode ? (
                          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded font-mono text-[10px] font-bold">
                            <span>DARK</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-3 py-1 rounded font-mono text-[10px] font-bold text-slate-500">
                            <span>LIGHT</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Tweak 2: Hidden Files */}
                    <div className="flex items-center justify-between py-3.5">
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-mono font-bold text-slate-200 block">Reveal Hidden Files</span>
                        <span className="text-[10px] text-slate-400 font-mono">HKCU Explorer\\Advanced - Set Hidden (1=Show, 2=Hide)</span>
                      </div>
                      <button 
                        onClick={() => toggleTweak(
                          'hiddenFiles', 
                          'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 1"',
                          'powershell -Command "Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced -Name Hidden -Value 2"'
                        )}
                        className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      >
                        {tweaks.hiddenFiles ? (
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded font-mono text-[10px] font-bold text-emerald-400">
                            <span>SHOWING</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-3 py-1 rounded font-mono text-[10px] font-bold text-slate-500">
                            <span>HIDDEN</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Tweak 3: Taskbar Autohide */}
                    <div className="flex items-center justify-between py-3.5">
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-mono font-bold text-slate-200 block">Taskbar Autohide Overlay</span>
                        <span className="text-[10px] text-slate-400 font-mono">HKCU Explorer\\StuckRects3 - Toggle binary toggle registry bits</span>
                      </div>
                      <button 
                        onClick={() => toggleTweak(
                          'taskbarAutohide', 
                          'powershell -Command "$p = Get-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3; $p.Settings[8] = 3; Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3 -Name Settings -Value $p.Settings"',
                          'powershell -Command "$p = Get-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3; $p.Settings[8] = 2; Set-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3 -Name Settings -Value $p.Settings"'
                        )}
                        className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      >
                        {tweaks.taskbarAutohide ? (
                          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded font-mono text-[10px] font-bold text-cyan-400">
                            <span>AUTOHIDE ON</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-3 py-1 rounded font-mono text-[10px] font-bold text-slate-500">
                            <span>DEFAULT</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          </div>
                        )}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Storage Clean Panel */}
                <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
                      Temporary Space Vacuum & Cleaner
                    </h3>
                    {tempFolderSize && (
                      <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                        TEMP SIZE: {tempFolderSize}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-mono max-w-lg">
                      Analyze and delete temporary storage files located in the `%TEMP%` partition. This recovers active SSD blocks and limits OS system weight.
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={scanTempFolder}
                        disabled={scanningTemp || purgingTemp}
                        className="bg-slate-950 hover:bg-slate-900 border border-indigo-500/25 text-indigo-400 px-4 py-2 rounded-lg font-mono text-xs hover:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                      >
                        {scanningTemp ? 'Scanning...' : 'Scan Directory'}
                      </button>
                      <button 
                        onClick={purgeTempFolder}
                        disabled={purgingTemp || scanningTemp || tempFolderSize === '0.00 Bytes'}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 px-4 py-2 rounded-lg font-mono text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {purgingTemp ? 'Vacuuming...' : 'Purge Cache'}
                      </button>
                    </div>
                  </div>

                  {/* Scanning Radar animation wrapper */}
                  {(scanningTemp || purgingTemp) && (
                    <div className="h-12 bg-slate-950/50 border border-indigo-500/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-[30%] -translate-x-[100%] animate-[shimmer_1.5s_infinite]" />
                      <span className="text-[10px] font-mono text-indigo-300 animate-pulse tracking-wider">
                        {scanningTemp ? '📡 SCANNING TEMP SECTORS...' : '☣️ PURGING CACHE REGIONS...'}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Sidebar Column: Admin shortcuts & log feeds */}
              <div className="space-y-6">
                
                {/* Admin shortcuts panel */}
                <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase border-b border-indigo-500/10 pb-2">
                    OS Admin Consoles
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                    <button 
                      onClick={() => launchAdminPanel('taskmgr')}
                      className="w-full text-left bg-slate-950/30 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/35 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer group"
                    >
                      <span>Task Manager</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                    </button>
                    <button 
                      onClick={() => launchAdminPanel('registry')}
                      className="w-full text-left bg-slate-950/30 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/35 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer group"
                    >
                      <span>Registry Editor</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                    </button>
                    <button 
                      onClick={() => launchAdminPanel('devmgmt')}
                      className="w-full text-left bg-slate-950/30 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/35 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer group"
                    >
                      <span>Device Manager</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                    </button>
                    <button 
                      onClick={() => launchAdminPanel('services')}
                      className="w-full text-left bg-slate-950/30 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/35 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer group"
                    >
                      <span>System Services</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                    </button>
                    <button 
                      onClick={() => launchAdminPanel('envvars')}
                      className="w-full text-left bg-slate-950/30 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/35 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer group"
                    >
                      <span>Environment Variables</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                    </button>
                  </div>
                </div>

                {/* Live Action log feed */}
                <div className="bg-[#0b101d] border border-indigo-500/10 rounded-xl p-5 flex flex-col h-[230px]">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase border-b border-indigo-500/10 pb-1.5 mb-2 block">
                    Mod Deck Log Console
                  </span>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] text-indigo-400/90 space-y-1.5 select-text pr-1">
                    {tweakLogs.length === 0 ? (
                      <div className="text-slate-600 italic">Logs empty. Adjust a setting above to display reports.</div>
                    ) : (
                      tweakLogs.map((log, idx) => (
                        <div key={idx} className="leading-4 border-l-2 border-indigo-500/20 pl-2">{log}</div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </Tabs.Content>

          {/* TAB 3: ACTION FLOWCHART AUTOMATION BUILDER */}
          <Tabs.Content value="automation" className="h-full flex flex-col space-y-4 outline-none animate-in fade-in duration-300">
            <header className="flex justify-between items-center border-b border-indigo-500/10 pb-4 shrink-0">
              <div>
                <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">AUTO SENTINEL PIPELINE</h1>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">Link Triggers (hardware thresholds) to auto-executed system scripts</p>
              </div>

              {/* Node selector triggers */}
              <div className="relative">
                <button 
                  onClick={() => setShowNodeSelector(!showNodeSelector)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4.5 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD FLOW NODE</span>
                </button>
                {showNodeSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0c1222] border border-indigo-500/20 rounded-lg shadow-2xl z-50 p-2 font-mono text-xs space-y-1">
                    <span className="text-[9px] text-slate-500 px-2 py-1 block uppercase font-bold tracking-wider">TRIGGERS</span>
                    <button onClick={() => addNode('cpu')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚡ CPU Core Load</button>
                    <button onClick={() => addNode('ram')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚡ RAM Overflow</button>
                    
                    <span className="text-[9px] text-slate-500 px-2 py-1 block uppercase font-bold tracking-wider mt-2 border-t border-indigo-500/10 pt-1.5">ACTIONS</span>
                    <button onClick={() => addNode('beep')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚙️ Sonic Pulse Beep</button>
                    <button onClick={() => addNode('notify')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚙️ HUD Notification</button>
                    <button onClick={() => addNode('dns')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚙️ Auto DNS Cleanse</button>
                    <button onClick={() => addNode('cmd')} className="w-full text-left hover:bg-indigo-500/15 text-slate-300 hover:text-white px-3 py-1.5 rounded transition">⚙️ Custom Command</button>
                  </div>
                )}
              </div>
            </header>

            {/* Instruction tooltip */}
            <div className="bg-[#0c1222]/40 border border-indigo-500/15 rounded-lg p-3 flex items-center gap-3 font-mono text-[10px] text-indigo-300/90 shrink-0">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>TUTORIAL:</strong> Drag the header of any node to reposition it. Click the green <strong>OUT</strong> dot on a Trigger and click the blue <strong>IN</strong> dot on an Action to connect them. Click red connection links below to delete wires.
              </span>
            </div>

            {/* Main Interactive Flowchart Canvas Grid */}
            <div 
              ref={flowchartWorkspaceRef}
              onMouseMove={handleWorkspaceMouseMove}
              onMouseUp={stopDragNode}
              className="flex-1 min-h-[450px] bg-[#05080e] border border-indigo-500/10 rounded-xl relative overflow-hidden cursor-default"
              style={{
                backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.1) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }}
            >
              {/* SVG Canvas drawing connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  {/* Glowing neon drop shadows for wires */}
                  <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const fromPins = getNodePins(fromNode);
                  const toPins = getNodePins(toNode);

                  const pathStr = getBezierPath(fromPins.outputX, fromPins.outputY, toPins.inputX, toPins.inputY);
                  const isLinePulse = fromNode.active || toNode.active;

                  return (
                    <g key={idx}>
                      {/* Outer shadow glow wire */}
                      <path 
                        d={pathStr} 
                        fill="none" 
                        stroke={isLinePulse ? 'rgba(168, 85, 247, 0.7)' : 'rgba(99, 102, 241, 0.3)'} 
                        strokeWidth="3.5"
                        filter="url(#glow-violet)"
                        className="transition-colors duration-300"
                      />
                      {/* Inner wire path */}
                      <path 
                        d={pathStr} 
                        fill="none" 
                        stroke={isLinePulse ? '#a855f7' : '#6366f1'} 
                        strokeWidth="1.5"
                        className={isLinePulse ? 'animate-dash stroke-[2px]' : ''}
                        style={isLinePulse ? { strokeDasharray: '8, 5', animation: 'dash 0.8s linear infinite' } : {}}
                      />
                    </g>
                  );
                })}

                {/* Floating active wire drawing indicator */}
                {connectingFromId && (() => {
                  const node = nodes.find(n => n.id === connectingFromId);
                  if (!node) return null;
                  const pins = getNodePins(node);
                  return (
                    <path 
                      d={getBezierPath(pins.outputX, pins.outputY, pins.outputX + 80, pins.outputY)}
                      fill="none" 
                      stroke="rgba(16, 185, 129, 0.5)" 
                      strokeWidth="2" 
                      strokeDasharray="4, 4"
                    />
                  );
                })()}
              </svg>

              {/* Render Node Cards on canvas */}
              {nodes.map(node => {
                const isTrigger = node.type === 'trigger';
                
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    className={`absolute w-[230px] bg-[#0c1222]/90 border backdrop-blur-md rounded-lg shadow-2xl z-10 transition-all ${
                      node.active 
                        ? 'border-indigo-400 ring-2 ring-indigo-500/20 shadow-[0_0_18px_rgba(99,102,241,0.25)]' 
                        : 'border-indigo-500/10 hover:border-indigo-500/25'
                    }`}
                  >
                    {/* Node Drag Handle Header */}
                    <div 
                      onMouseDown={(e) => startDragNode(e, node.id)}
                      className={`px-3 py-2 border-b font-mono font-bold text-[10px] tracking-wider flex items-center justify-between cursor-move select-none rounded-t-lg ${
                        isTrigger 
                          ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' 
                          : 'bg-indigo-500/10 border-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{node.title.toUpperCase()}</span>
                      </div>
                      <button 
                        onClick={() => removeNode(node.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Node Details Body */}
                    <div className="p-3 font-mono space-y-2.5 text-[10px]">
                      
                      {/* CPU trigger inputs */}
                      {node.subType === 'cpu' && (
                        <div className="space-y-1">
                          <label className="text-slate-400 block">Threshold: {node.threshold}% Load</label>
                          <input 
                            type="range"
                            min="10" max="90" step="5"
                            value={node.threshold || 50}
                            onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, threshold: parseInt(e.target.value) } : n))}
                            className="w-full accent-emerald-500 cursor-pointer h-1 rounded"
                          />
                        </div>
                      )}

                      {/* RAM trigger inputs */}
                      {node.subType === 'ram' && (
                        <div className="space-y-1">
                          <label className="text-slate-400 block">Threshold: {node.threshold}% Used</label>
                          <input 
                            type="range"
                            min="20" max="95" step="5"
                            value={node.threshold || 80}
                            onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, threshold: parseInt(e.target.value) } : n))}
                            className="w-full accent-emerald-500 cursor-pointer h-1 rounded"
                          />
                        </div>
                      )}

                      {/* Command action inputs */}
                      {node.subType === 'cmd' && (
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-bold">PowerShell Command:</label>
                          <input 
                            type="text"
                            value={node.customCommand || 'echo "Ok"'}
                            onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, customCommand: e.target.value } : n))}
                            className="w-full bg-slate-950 border border-indigo-500/10 focus:border-indigo-500/30 outline-none text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-mono"
                          />
                        </div>
                      )}

                      {/* Sonic Alarm sound indicator */}
                      {node.subType === 'beep' && (
                        <span className="text-slate-400 italic block">Dispatches continuous audio siren when core trigger active.</span>
                      )}
                      
                      {/* OS notification indicator */}
                      {node.subType === 'notify' && (
                        <span className="text-slate-400 italic block">Pushes high-priority HUD warnings directly on desktop.</span>
                      )}

                      {/* DNS flush indicator */}
                      {node.subType === 'dns' && (
                        <span className="text-slate-400 italic block">Washes networking caches automatically to resolve issues.</span>
                      )}

                    </div>

                    {/* Inputs and Outputs Connectors */}
                    <div className="px-3 pb-2.5 flex justify-between relative text-[9px] font-mono text-slate-500 z-20">
                      
                      {/* Input Pin (Actions only) */}
                      {!isTrigger ? (
                        <div 
                          onClick={(e) => handlePinClick(e, node.id, 'input')}
                          className="flex items-center gap-1 hover:text-indigo-400 transition cursor-pointer"
                        >
                          <div className={`w-3 h-3 rounded-full border border-indigo-500/30 flex items-center justify-center ${connectingFromId ? 'bg-indigo-500/35 border-indigo-400 animate-pulse' : 'bg-slate-950'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          </div>
                          <span>IN</span>
                        </div>
                      ) : <div />}

                      {/* Output Pin (Triggers only) */}
                      {isTrigger ? (
                        <div 
                          onClick={(e) => handlePinClick(e, node.id, 'output')}
                          className="flex items-center gap-1 hover:text-emerald-400 transition cursor-pointer ml-auto"
                        >
                          <span>OUT</span>
                          <div className={`w-3 h-3 rounded-full border border-emerald-500/30 flex items-center justify-center ${connectingFromId === node.id ? 'bg-emerald-500/40 border-emerald-400' : 'bg-slate-950'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      ) : <div />}

                    </div>

                  </div>
                );
              })}
            </div>

            {/* List Active Wires (delete controls) */}
            <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl p-4 shrink-0 font-mono text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">ACTIVE AUTOLINKS ({connections.length})</span>
              {connections.length === 0 ? (
                <div className="text-slate-600 italic">No node connections detected. Wire nodes together on canvas.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {connections.map((conn, index) => {
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    return (
                      <div 
                        key={index}
                        className="bg-slate-950 border border-indigo-500/10 hover:border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 group transition"
                      >
                        <span className="text-emerald-400 font-bold">{fromNode?.title || 'Unknown'}</span>
                        <span className="text-slate-600">&rarr;</span>
                        <span className="text-indigo-400 font-bold">{toNode?.title || 'Unknown'}</span>
                        <button 
                          onClick={() => removeConnection(index)}
                          className="text-slate-600 hover:text-rose-400 transition cursor-pointer ml-1 pl-1 border-l border-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </Tabs.Content>

          {/* TAB 4: COMMAND CONSOLE TERMINAL */}
          <Tabs.Content value="terminal" className="space-y-6 h-full flex flex-col outline-none animate-in fade-in duration-300">
            <header className="space-y-1 shrink-0">
              <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">CYBER DECK COMMAND CONSOLE</h1>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">Deploy terminal command streams into the host PowerShell shell.</p>
            </header>

            {/* Quick Command presets library */}
            <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl p-4 shrink-0 font-mono">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest mb-2.5">Preset Command Libraries</span>
              <div className="flex flex-wrap gap-2">
                {cmdPresets.map((preset, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setCmdInput(preset.cmd);
                      playSynthSound('tweak');
                    }}
                    className="bg-slate-950/40 hover:bg-indigo-500/15 border border-indigo-500/5 hover:border-indigo-500/25 text-[10px] text-indigo-300 font-medium px-3 py-2 rounded-lg cursor-pointer transition duration-200"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Screen panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80 border border-indigo-500/10 rounded-xl overflow-hidden shadow-2xl relative">
              
              {/* Custom CRT Scanline Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/30 via-transparent to-[#090d16]/30 pointer-events-none z-10" />

              {/* Dots Header */}
              <div className="h-10 bg-[#0c1222] border-b border-indigo-500/10 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">PowerShell Interactive Terminal</span>
              </div>

              {/* Console log outputs */}
              <div className="flex-1 p-6 overflow-y-auto font-mono text-[12px] text-cyan-400/90 space-y-1.5 select-text">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap leading-5">{log}</div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal inputs */}
              <div className="h-14 bg-[#0c1222] border-t border-indigo-500/10 px-4 flex items-center gap-3 shrink-0">
                <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                <input 
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !executing) runCommand();
                  }}
                  disabled={executing}
                  placeholder={executing ? "Deploying execution sequences..." : "Deploy host commands..."}
                  className="flex-1 bg-transparent outline-none font-mono text-[12px] text-slate-100 placeholder-slate-600 disabled:opacity-50"
                />
                <button 
                  onClick={runCommand}
                  disabled={executing || !cmdInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-md px-4 py-1.5 text-xs font-mono font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executing ? "DEPLOYS..." : "EXEC"}
                </button>
              </div>

            </div>
          </Tabs.Content>

          {/* TAB 5: FILES EXPLORER */}
          <Tabs.Content value="files" className="space-y-6 outline-none animate-in fade-in duration-300">
            <header className="flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-widest font-mono text-slate-200">WORKSPACE DECK</h1>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">Scans active directory trees on physical disk sectors.</p>
              </div>
              <button 
                onClick={loadFiles}
                disabled={loadingFiles}
                className="bg-slate-950 hover:bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 rounded-lg px-4 py-2 text-xs font-mono font-semibold hover:border-indigo-500/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                <span>REFRESH SECTORS</span>
              </button>
            </header>

            {/* Error notifications */}
            {fileError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex gap-3 text-xs font-mono text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{fileError}</p>
              </div>
            )}

            {/* Files Table */}
            <div className="bg-[#0c1222]/85 border border-indigo-500/10 rounded-xl overflow-hidden shadow-2xl select-text">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-indigo-500/10 bg-indigo-500/5">
                    <th className="px-6 py-4.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sectors (Files)</th>
                    <th className="px-6 py-4.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                    <th className="px-6 py-4.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mod Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5 text-[11px] text-slate-300">
                  {loadingFiles ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        Scanning workspace sectors...
                      </td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        No sectors detected.
                      </td>
                    </tr>
                  ) : (
                    files.map((file, idx) => (
                      <tr key={idx} className="hover:bg-indigo-500/5 transition-colors">
                        <td className={`px-6 py-3.5 font-semibold flex items-center gap-2 ${file.isDirectory ? 'text-cyan-400' : 'text-slate-200'}`}>
                          <span>{file.isDirectory ? '📁' : '📄'}</span>
                          <span>{file.name}</span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">
                          {file.isDirectory ? 'Directory' : 'File'}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">
                          {file.isDirectory ? '-' : formatBytes(file.size)}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">
                          {new Date(file.modified).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Tabs.Content>

        </main>
      </Tabs.Root>
    </div>
  );
}
