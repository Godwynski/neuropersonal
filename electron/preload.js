const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  runSystemCommand: (command) => ipcRenderer.invoke('run-system-command', command),
  listWorkspaceFiles: () => ipcRenderer.invoke('list-workspace-files'),
  getValorantConfigs: () => ipcRenderer.invoke('get-valorant-configs'),
  saveValorantConfig: (filePath, settings) => ipcRenderer.invoke('save-valorant-config', { filePath, settings }),
  detectValorantPath: () => ipcRenderer.invoke('detect-valorant-path'),
  detectGpu: () => ipcRenderer.invoke('detect-gpu'),
  saveAppSettings: (settings) => ipcRenderer.invoke('save-app-settings', settings),
  loadAppSettings: () => ipcRenderer.invoke('load-app-settings'),
  backupRegistry: (keyPath, valueName) => ipcRenderer.invoke('backup-registry', { keyPath, valueName }),
  setTitleBarOverlay: (color, symbolColor) => ipcRenderer.invoke('set-titlebar-overlay', { color, symbolColor }),
  setTimerResolution: (active) => ipcRenderer.invoke('set-timer-resolution', active),
  purgeStandbyMemory: () => ipcRenderer.invoke('purge-standby-memory'),
  selectValorantPath: () => ipcRenderer.invoke('select-valorant-path')
});
