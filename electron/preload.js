const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  listWorkspaceFiles: () => ipcRenderer.invoke('list-workspace-files'),
  getValorantConfigs: () => ipcRenderer.invoke('get-valorant-configs'),
  saveValorantConfig: (filePath, settings) => ipcRenderer.invoke('save-valorant-config', { filePath, settings }),
  detectValorantPath: () => ipcRenderer.invoke('detect-valorant-path'),
  launchValorant: (gamePath) => ipcRenderer.invoke('launch-valorant', gamePath),
  detectGpu: () => ipcRenderer.invoke('detect-gpu'),
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
  getRegistryBackups: () => ipcRenderer.invoke('get-registry-backups'),
  restoreRegistryBackup: (backupIndex) => ipcRenderer.invoke('restore-registry-backup', backupIndex),
  deleteRegistryBackup: (backupIndex) => ipcRenderer.invoke('delete-registry-backup', backupIndex),
  clearAllRegistryBackups: () => ipcRenderer.invoke('clear-all-registry-backups'),
  restoreAllRegistryBackups: () => ipcRenderer.invoke('restore-all-registry-backups')
});

