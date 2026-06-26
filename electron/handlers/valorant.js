const { setValorantAffinity } = require('../valorant/affinity');
const { optimizeNetwork } = require('../valorant/network');
const { purgeStandbyList, startStandbyMonitor, stopStandbyMonitor } = require('../valorant/memory');
const LCUClient = require('../valorant/lcu');
const { createOverlayWindow, closeOverlay, getOverlayWindow } = require('../valorant/overlay');

let lcuClient = null;

module.exports = function registerValorantHandlers(ipcMain) {
  ipcMain.handle('valorant-set-affinity', async (event, maskHex) => {
    return await setValorantAffinity(maskHex);
  });

  ipcMain.handle('valorant-optimize-network', async () => {
    return await optimizeNetwork();
  });

  ipcMain.handle('valorant-purge-memory', async () => {
    return await purgeStandbyList();
  });

  ipcMain.handle('valorant-start-memory-monitor', async () => {
    startStandbyMonitor();
    return { success: true };
  });

  ipcMain.handle('valorant-stop-memory-monitor', async () => {
    stopStandbyMonitor();
    return { success: true };
  });

  ipcMain.handle('valorant-connect-lcu', async (event) => {
    if (lcuClient) lcuClient.disconnect();
    
    lcuClient = new LCUClient((data) => {
      // Send telemetry data to both main window and overlay
      const overlay = getOverlayWindow();
      if (overlay && !overlay.isDestroyed()) {
        overlay.webContents.send('valorant-lcu-event', data);
      }
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('valorant-lcu-event', data);
      }
    });

    const success = lcuClient.connect();
    return { success };
  });

  ipcMain.handle('valorant-disconnect-lcu', async () => {
    if (lcuClient) {
      lcuClient.disconnect();
      lcuClient = null;
    }
    return { success: true };
  });

  ipcMain.handle('valorant-toggle-overlay', async (event, enable) => {
    if (enable) {
      createOverlayWindow();
    } else {
      closeOverlay();
    }
    return { success: true };
  });
};
