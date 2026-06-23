const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),

  getValorantConfigs: () => ipcRenderer.invoke('get-valorant-configs'),
  saveValorantConfig: (filePath, settings) => ipcRenderer.invoke('save-valorant-config', { filePath, settings }),
  detectValorantPath: () => ipcRenderer.invoke('detect-valorant-path'),
  launchValorant: (gamePath) => ipcRenderer.invoke('launch-valorant', gamePath),
  detectGpu: () => ipcRenderer.invoke('detect-gpu'),
  getGpuStats: () => ipcRenderer.invoke('get-gpu-stats'),
  saveAppSettings: (settings) => ipcRenderer.invoke('save-app-settings', settings),
  loadAppSettings: () => ipcRenderer.invoke('load-app-settings'),
  backupRegistry: (keyPath, valueName) => ipcRenderer.invoke('backup-registry', { keyPath, valueName }),
  setTitleBarOverlay: (color, symbolColor) => ipcRenderer.invoke('set-titlebar-overlay', { color, symbolColor }),
  setTimerResolution: (active) => ipcRenderer.invoke('set-timer-resolution', active),
  selectValorantPath: () => ipcRenderer.invoke('select-valorant-path'),
  // Feature 1: VBS & Core Isolation
  checkVbsStatus: () => ipcRenderer.invoke('check-vbs-status'),
  toggleVbs: (enable) => ipcRenderer.invoke('toggle-vbs', enable),
  // Feature 2: HPET Override
  checkHpetStatus: () => ipcRenderer.invoke('check-hpet-status'),
  toggleHpet: (disable) => ipcRenderer.invoke('toggle-hpet', disable),
  // Feature 3: AMD DXNavi & MPO
  checkAmdOptimizations: () => ipcRenderer.invoke('check-amd-optimizations'),
  toggleAmdMpo: (disable) => ipcRenderer.invoke('toggle-amd-mpo', disable),
  toggleAmdLegacyDx: (enableLegacy) => ipcRenderer.invoke('toggle-amd-legacy-dx', enableLegacy),
  toggleAmdShaderCache: (alwaysOn) => ipcRenderer.invoke('toggle-amd-shader-cache', alwaysOn),
  // Feature 4: GPU Driver Profile
  checkGpuDriverProfile: () => ipcRenderer.invoke('check-gpu-driver-profile'),
  applyGpuDriverProfile: (config) => ipcRenderer.invoke('apply-gpu-driver-profile', config),
  // Feature 5: Hardware Bottleneck & BIOS
  checkHardwareBottlenecks: () => ipcRenderer.invoke('check-hardware-bottlenecks'),
  toggleLegacyRebar: (enable) => ipcRenderer.invoke('toggle-legacy-rebar', enable),
  
  // SECURE NEW API CHANNELS
  getDashboardTweaksStatus: (gamePath) => ipcRenderer.invoke('get-dashboard-tweaks-status', gamePath),
  setDashboardTweak: (tweakName, active, extraArgs) => ipcRenderer.invoke('set-dashboard-tweak', { tweakName, active, extraArgs }),
  runMacro: (macroKey) => ipcRenderer.invoke('run-macro', macroKey),
  runCacheCleaner: (type) => ipcRenderer.invoke('run-cache-cleaner', type),
  launchAdminUtility: (utility) => ipcRenderer.invoke('launch-admin-utility', utility),
  killProcess: (processName) => ipcRenderer.invoke('kill-process', processName),
  getRunningApps: () => ipcRenderer.invoke('get-running-apps'),
  optimizeElectronShortcuts: () => ipcRenderer.invoke('optimize-electron-shortcuts'),
  getRegistryBackups: () => ipcRenderer.invoke('get-registry-backups'),
  restoreRegistryBackup: (backupIndex) => ipcRenderer.invoke('restore-registry-backup', backupIndex),
  deleteRegistryBackup: (backupIndex) => ipcRenderer.invoke('delete-registry-backup', backupIndex),
  clearAllRegistryBackups: () => ipcRenderer.invoke('clear-all-registry-backups'),
  restoreAllRegistryBackups: () => ipcRenderer.invoke('restore-all-registry-backups'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // System Automation API
  getLoginItem: () => ipcRenderer.invoke('get-login-item'),
  setLoginItem: (enable) => ipcRenderer.invoke('set-login-item', enable),
  restartPc: () => ipcRenderer.invoke('restart-pc'),

  // Feature 6: TCP/Nagle Network Latency
  checkNetworkLatency: () => ipcRenderer.invoke('check-network-latency-status'),
  toggleNetworkLatency: (enable) => ipcRenderer.invoke('toggle-network-latency', enable),
  // Feature 7: NIC Interrupt Moderation
  checkNicInterruptMod: () => ipcRenderer.invoke('check-nic-interrupt-mod'),
  toggleNicInterruptMod: (disable) => ipcRenderer.invoke('toggle-nic-interrupt-mod', disable),
  // Feature 8: CPU Affinity Manager
  checkCpuTopology: () => ipcRenderer.invoke('check-cpu-topology'),
  setCpuAffinity: (config) => ipcRenderer.invoke('set-cpu-affinity', config),
  // Feature 9: Visual Effects Stripping
  checkVisualEffects: () => ipcRenderer.invoke('check-visual-effects'),
  toggleVisualEffects: (strip) => ipcRenderer.invoke('toggle-visual-effects', strip),
  // Feature 10: Defender Exclusions
  checkDefenderExclusion: () => ipcRenderer.invoke('check-defender-exclusion'),
  toggleDefenderExclusion: (add) => ipcRenderer.invoke('toggle-defender-exclusion', add),
  // Feature 11: Focus Assist
  checkFocusAssist: () => ipcRenderer.invoke('check-focus-assist'),
  toggleFocusAssist: (enable) => ipcRenderer.invoke('toggle-focus-assist', enable),
  // Feature 12: Scheduled Tasks
  checkScheduledTasks: () => ipcRenderer.invoke('check-scheduled-tasks'),
  toggleScheduledTasks: (disable) => ipcRenderer.invoke('toggle-scheduled-tasks', disable),
  // Feature 13: Ultimate Performance Plan
  checkUltimatePerformance: () => ipcRenderer.invoke('check-ultimate-performance'),
  // Feature 14: Virtual Memory Pagefile
  checkPagefileStatus: () => ipcRenderer.invoke('check-pagefile-status'),
  setPagefile: (enable) => ipcRenderer.invoke('set-pagefile', enable),
  // Feature 15: Standby Cache Automation
  startStandbyCleaner: () => ipcRenderer.invoke('start-standby-cleaner'),
  stopStandbyCleaner: () => ipcRenderer.invoke('stop-standby-cleaner'),

  activateUltimatePerformance: () => ipcRenderer.invoke('activate-ultimate-performance'),

  // Feature 16: Explorer Termination
  checkExplorerStatus: () => ipcRenderer.invoke('check-explorer-status'),
  terminateExplorer: () => ipcRenderer.invoke('terminate-explorer'),
  restartExplorer: () => ipcRenderer.invoke('restart-explorer'),

  onValorantStatusChange: (callback) => {
    ipcRenderer.on('valorant-status-change', (event, isRunning) => callback(isRunning));
  }
});
