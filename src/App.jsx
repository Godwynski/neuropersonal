import React, { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Cpu, Terminal, FolderOpen, RefreshCw, Play, Monitor, AlertCircle, ChevronRight } from 'lucide-react';

export default function App() {
  // Navigation & state
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

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState('');
  
  const [cmdInput, setCmdInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    'Microsoft Windows [Version 10.0]',
    'Nexus React Shell ready. Type command and execute.'
  ]);
  const [executing, setExecuting] = useState(false);

  const [isElectron, setIsElectron] = useState(true);
  const terminalEndRef = useRef(null);

  // Check if we are running in Electron
  useEffect(() => {
    if (!window.api) {
      setIsElectron(false);
      console.warn('Running outside Electron shell. Native commands will be mocked.');
      // Populate mock data
      setStats({
        platform: 'win32',
        arch: 'x64',
        hostname: 'MOCK-DESKTOP',
        cpuModel: 'Intel Core i9-12900K @ 3.20GHz',
        cpuCores: 16,
        cpuLoad: 12,
        totalMemGB: '32.00',
        freeMemGB: '21.50',
        usedMemGB: '10.50',
        memUsagePercent: 32
      });
      setFiles([
        { name: 'electron', isDirectory: true, size: 0, modified: new Date() },
        { name: 'src', isDirectory: true, size: 0, modified: new Date() },
        { name: 'package.json', isDirectory: false, size: 480, modified: new Date() },
        { name: 'vite.config.js', isDirectory: false, size: 250, modified: new Date() }
      ]);
    }
  }, []);

  // Periodic polling for CPU/RAM Stats
  useEffect(() => {
    if (!isElectron) {
      // Mock stats update
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          cpuLoad: Math.max(2, Math.min(98, Math.round(prev.cpuLoad + (Math.random() * 10 - 5)))),
          memUsagePercent: Math.max(10, Math.min(90, Math.round(prev.memUsagePercent + (Math.random() * 2 - 1)))),
          usedMemGB: (32 * (Math.max(10, Math.min(90, prev.memUsagePercent)) / 100)).toFixed(2)
        }));
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

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Load Files
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

  // Run shell commands
  const runCommand = async () => {
    const cmd = cmdInput.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, `\n> ${cmd}`, 'Executing command...']);
    setCmdInput('');
    setExecuting(true);

    if (!isElectron) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev.slice(0, -1),
          `Mock Output: Command "${cmd}" completed successfully.`,
          'Note: Local shell executions require the Electron shell wrapper.'
        ]);
        setExecuting(false);
      }, 800);
      return;
    }

    try {
      const response = await window.api.runSystemCommand(cmd);
      setTerminalLogs(prev => [
        ...prev.slice(0, -1),
        response.success 
          ? (response.output || 'Command completed with no output.')
          : `Error: ${response.error}\n${response.output || ''}`
      ]);
    } catch (err) {
      setTerminalLogs(prev => [...prev.slice(0, -1), `Critical Error: ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-screen select-none bg-[#090d16] text-slate-100 font-sans">
      
      {/* Frameless Windows Draggable Titlebar Header */}
      <header className="titlebar-drag h-[35px] bg-[#0f172a] border-b border-white/5 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-slate-400">NEXUS COMMANDER</span>
        </div>
        {!isElectron && (
          <div className="titlebar-no-drag flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] text-amber-400">
            <AlertCircle className="w-3 h-3" />
            <span>Browser Preview Mode</span>
          </div>
        )}
      </header>

      {/* Main Framework Content Panel via Radix Tabs */}
      <Tabs.Root defaultValue="dashboard" className="flex flex-1 overflow-hidden" onValueChange={(val) => {
        if (val === 'files') loadFiles();
      }}>
        
        {/* Left Sidebar Navigation */}
        <aside className="w-[250px] bg-[#0f172a] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
          <Tabs.List className="flex flex-col gap-1">
            <Tabs.Trigger 
              value="dashboard" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent text-slate-300 hover:bg-white/3 hover:text-white data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Monitor className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="terminal" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent text-slate-300 hover:bg-white/3 hover:text-white data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Command Console</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger 
              value="files" 
              className="titlebar-no-drag nav-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent text-slate-300 hover:bg-white/3 hover:text-white data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-500/20"
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span>Workspace Files</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Sidebar Status Footer */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[11px] font-semibold text-slate-400 font-mono select-text">
              {stats.platform.toUpperCase()} ({stats.arch})
            </span>
          </div>
        </aside>

        {/* Content Screens */}
        <main className="flex-1 bg-[#090d16] p-8 overflow-y-auto relative bg-[radial-gradient(circle_at_80%_10%,_rgba(99,102,241,0.06),_transparent_60%)]">
          
          {/* DASHBOARD TAB SCREEN */}
          <Tabs.Content value="dashboard" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight select-text">System Overview</h1>
              <p className="text-sm text-slate-400 select-text">Host: {stats.hostname}</p>
            </header>

            {/* Performance Gauges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CPU load card */}
              <div className="bg-slate-800/25 border border-white/5 backdrop-blur-xl rounded-xl p-6 transition-all hover:border-indigo-500/25 hover:shadow-[0_0_24px_rgba(99,102,241,0.08)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-300">CPU Load</h3>
                  <div className="w-8 h-8 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-indigo-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  <div className="relative w-[140px] h-[140px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="#6366f1" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${stats.cpuLoad}, 100`} 
                        className="transition-all duration-500 drop-shadow-[0_0_4px_rgba(99,102,241,0.6)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono tracking-tighter">
                      {stats.cpuLoad}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <p className="text-xs text-slate-500 truncate select-text">{stats.cpuModel}</p>
                </div>
              </div>

              {/* RAM load card */}
              <div className="bg-slate-800/25 border border-white/5 backdrop-blur-xl rounded-xl p-6 transition-all hover:border-cyan-500/25 hover:shadow-[0_0_24px_rgba(6,182,212,0.08)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-300">System RAM</h3>
                  <div className="w-8 h-8 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-cyan-400">
                    <Monitor className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  <div className="relative w-[140px] h-[140px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                      <circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="#06b6d4" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${stats.memUsagePercent}, 100`} 
                        className="transition-all duration-500 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono tracking-tighter">
                      {stats.memUsagePercent}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <p className="text-xs text-slate-500 font-mono select-text">
                    Used: {stats.usedMemGB} GB / Total: {stats.totalMemGB} GB
                  </p>
                </div>
              </div>
            </div>

            {/* Local Metadata list */}
            <div className="bg-slate-800/25 border border-white/5 backdrop-blur-xl rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 border-l-2 border-indigo-500 pl-3 mb-6">
                Hardware Architecture Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Device Host</span>
                  <p className="text-sm font-semibold text-slate-300 font-mono select-text">{stats.hostname}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CPU Cores</span>
                  <p className="text-sm font-semibold text-slate-300 font-mono select-text">{stats.cpuCores} Threads</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instruction Set</span>
                  <p className="text-sm font-semibold text-slate-300 font-mono select-text">{stats.arch}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating Kernel</span>
                  <p className="text-sm font-semibold text-slate-300 font-mono select-text">{stats.platform}</p>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* COMMAND TERMINAL TAB SCREEN */}
          <Tabs.Content value="terminal" className="space-y-6 h-full flex flex-col outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="space-y-1 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight select-text">Command Console</h1>
              <p className="text-sm text-slate-400 select-text">Run native administrative commands (e.g. dir, ping, etc.) directly on host OS.</p>
            </header>

            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
              
              {/* Window dots header bar */}
              <div className="h-10 bg-slate-900/60 border-b border-white/5 px-4 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">PowerShell Shell Console</span>
              </div>

              {/* Console log outputs */}
              <div className="flex-1 p-6 overflow-y-auto font-mono text-[13px] text-cyan-400 space-y-1 select-text">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal inputs */}
              <div className="h-14 bg-slate-900/60 border-t border-white/5 px-4 flex items-center gap-3 shrink-0">
                <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                <input 
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !executing) runCommand();
                  }}
                  disabled={executing}
                  placeholder={executing ? "Executing operations..." : "Type OS shell script..."}
                  className="flex-1 bg-transparent outline-none font-mono text-[13px] text-slate-100 placeholder-slate-600 disabled:opacity-50"
                />
                <button 
                  onClick={runCommand}
                  disabled={executing || !cmdInput.trim()}
                  className="bg-indigo-600 text-white rounded-md px-4 py-1.5 text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executing ? "Wait..." : "Run"}
                </button>
              </div>

            </div>
          </Tabs.Content>

          {/* FILES EXPLORER TAB SCREEN */}
          <Tabs.Content value="files" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight select-text">Workspace Explorer</h1>
                <p className="text-sm text-slate-400 select-text">Reading workspace directories directly on physical disk.</p>
              </div>
              <button 
                onClick={loadFiles}
                disabled={loadingFiles}
                className="bg-white/3 border border-white/5 text-slate-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-indigo-500/10 hover:border-indigo-500/25 hover:text-indigo-400 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>
            </header>

            {/* Error notifications */}
            {fileError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex gap-3 text-sm text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{fileError}</p>
              </div>
            )}

            {/* Repository Files table */}
            <div className="bg-slate-800/25 border border-white/5 backdrop-blur-xl rounded-xl overflow-hidden shadow-xl select-text">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2 font-mono text-[13px] text-slate-300">
                  {loadingFiles ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Scanning project folders...
                      </td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No files detected.
                      </td>
                    </tr>
                  ) : (
                    files.map((file, idx) => (
                      <tr key={idx} className="hover:bg-white/1 transition-colors">
                        <td className={`px-6 py-4 font-semibold ${file.isDirectory ? 'text-cyan-400' : 'text-slate-200'}`}>
                          {file.isDirectory ? '📁 ' : '📄 '}
                          {file.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {file.isDirectory ? 'Directory' : 'File'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {file.isDirectory ? '-' : formatBytes(file.size)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
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
