const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 35
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    backgroundColor: '#0f172a'
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

let lastCpuInfo = null;

// IPC Handler: Fetch System Stats
ipcMain.handle('get-system-stats', async () => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  let totalIdle = 0, totalTick = 0;
  cpus.forEach(core => {
    for (let type in core.times) {
      totalTick += core.times[type];
    }
    totalIdle += core.times.idle;
  });

  let cpuLoad = 0;
  if (lastCpuInfo) {
    const idleDifference = totalIdle - lastCpuInfo.totalIdle;
    const totalDifference = totalTick - lastCpuInfo.totalTick;
    if (totalDifference > 0) {
      cpuLoad = 100 - Math.round((idleDifference / totalDifference) * 100);
    }
  } else {
    // Fallback for first measurement
    cpuLoad = cpus.length > 0 ? (100 - Math.round((totalIdle / totalTick) * 100)) : 0;
  }
  
  // Store the current ticks for the next delta calculation
  lastCpuInfo = { totalTick, totalIdle };

  return {
    platform: process.platform,
    arch: os.arch(),
    hostname: os.hostname(),
    cpuModel: cpus[0] ? cpus[0].model : 'Unknown Processor',
    cpuCores: cpus.length,
    cpuLoad: Math.max(0, Math.min(100, cpuLoad)),
    totalMemGB: (totalMem / (1024 * 1024 * 1024)).toFixed(2),
    freeMemGB: (freeMem / (1024 * 1024 * 1024)).toFixed(2),
    usedMemGB: ((totalMem - freeMem) / (1024 * 1024 * 1024)).toFixed(2),
    memUsagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100)
  };
});

// IPC Handler: Run native Shell / PowerShell commands safely
ipcMain.handle('run-system-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, output: stderr });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
});

// IPC Handler: Get current workspace files
ipcMain.handle('list-workspace-files', async () => {
  try {
    const dirPath = path.join(__dirname, '..');
    const files = await fs.promises.readdir(dirPath);
    const fileDetails = [];

    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);
      fileDetails.push({
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime
      });
    }
    return { success: true, files: fileDetails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
