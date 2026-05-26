const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  runSystemCommand: (command) => ipcRenderer.invoke('run-system-command', command),
  listWorkspaceFiles: () => ipcRenderer.invoke('list-workspace-files')
});
