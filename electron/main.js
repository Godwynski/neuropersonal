const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { exec, execSync } = require('child_process');
const fs = require('fs');

let mainWindow;
let tray = null;
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'test';

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock && process.env.NODE_ENV !== 'test') {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});



// #7: Cache admin status at startup — avoids spawning `net session` every 2 seconds
let cachedIsAdmin = false;
try {
  execSync('net session', { stdio: 'ignore' });
  cachedIsAdmin = true;
} catch (e) {}

// #2: Security — allowlisted service names for bgService handler
const allowedServiceNames = new Set([
  'wuauserv', 'SysMain', 'XblAuthManager', 'XblGameSave',
  'XboxGipSvc', 'XboxNetApiSvc', 'DiagTrack'
]);

// ─────────────────────────────────────────────────────────────────────────────
// System Modules
// ─────────────────────────────────────────────────────────────────────────────
const { spawnAsync, psEncode, runPsJson, runPs, getCachedGpuName, getCachedGpuVendor, setCachedGpu } = require('./system/powershell');
const {
  sanitizeRegistryKey,
  sanitizeRegistryValueName,
  sanitizeRegistryValueNameOrPath,
  getRegistryValue,
  getBackupsFilePath,
  backupRegistryValueBeforeChange,
  setRegistryValue,
  removeRegistryValue,
  setRegistryPathValue,
  removeRegistryPathValue,
  getActiveGpuDevicePath
} = require('./system/registry');

// Keep execAsync for backward compatibility
function execAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 8 * 1024 * 1024, ...opts }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.toString().trim());
    });
  });
}

// Global state — defined before lifecycle handlers that reference it
const globalState = {
  timerResolutionProcess: null,
  cachedIsAdmin: cachedIsAdmin,
  isValorantRunning: false
};

// ─────────────────────────────────────────────────────────────────────────────
// PowerShell helper scripts
// ─────────────────────────────────────────────────────────────────────────────

function writePowerShellHelpers() {
  try {
    const userDataPath = path.normalize(app.getPath('userData'));
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    // Write timer resolution script
    const timerResContent = `param (
    [int]$ParentPid
)
$code = @"
using System;
using System.Runtime.InteropServices;
public class Timer {
    [DllImport("ntdll.dll")]
    public static extern int NtSetTimerResolution(uint DesiredResolution, bool SetResolution, out uint CurrentResolution);
}
"@
try {
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
} catch {}

[uint]$current = 0;
[Timer]::NtSetTimerResolution(5000, $true, [ref]$current) | Out-Null

if ($ParentPid) {
    try {
        $parentProcess = Get-Process -Id $ParentPid -ErrorAction SilentlyContinue;
        if ($parentProcess) {
            $parentProcess.WaitForExit();
        }
    } catch {}
}
`;
    const scriptPath = path.normalize(path.join(userDataPath, 'timer_resolution.ps1'));
    if (!scriptPath.startsWith(userDataPath)) {
      throw new Error('Path traversal detected');
    }
    fs.writeFileSync(scriptPath, timerResContent, 'utf8');
  } catch (err) {
    console.error('Failed to write PowerShell helpers:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Window creation
// ─────────────────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 400,
    icon: isDev ? path.join(__dirname, '../public/logo.png') : path.join(__dirname, '../dist/logo.png'),
    minHeight: 500,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    backgroundColor: '#0a0a0a'
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
    // #4: Only open DevTools when --devtools flag is explicitly passed
    if (process.argv.includes('--devtools')) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Intercept close event to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!app.isQuiting && process.env.NODE_ENV !== 'test') {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Window IPC Handlers
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('set-titlebar-overlay', async (event, { color, symbolColor }) => {
  try {
    if (mainWindow && mainWindow.setTitleBarOverlay) {
      mainWindow.setTitleBarOverlay({ color, symbolColor, height: 35 });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
  return { success: true };
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  return { success: true };
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  writePowerShellHelpers();
  createWindow();

  // Set up System Tray
  const iconPath = isDev ? path.join(__dirname, '../public/logo.png') : path.join(__dirname, '../dist/logo.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => { 
        app.isQuiting = true; 
        if (tray) tray.destroy();
        app.quit(); 
      } 
    }
  ]);
  tray.setToolTip('Neuroptimize');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());

  // Auto-Boost: Polling for VALORANT
  globalState.isValorantRunning = false;
  setInterval(() => {
    exec('tasklist /FI "IMAGENAME eq VALORANT-Win64-Shipping.exe" /FO CSV /NH', (err, stdout) => {
      const running = stdout && stdout.includes('VALORANT-Win64-Shipping.exe');
      if (running !== globalState.isValorantRunning) {
        globalState.isValorantRunning = running;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('valorant-status-change', running);
        }
      }
    });
  }, 5000);

  // System Automation IPC Handlers
  ipcMain.handle('get-login-item', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('set-login-item', (event, enable) => {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: false
    });
    return { success: true };
  });

  ipcMain.handle('restart-pc', () => {
    exec('shutdown /r /t 0', (err) => {
      if (err) console.error('Restart failed:', err);
    });
    return { success: true };
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (tray) tray.destroy();
  // #8: Improved cleanup — use taskkill instead of slow WMI query
  try {
    if (globalState.timerResolutionProcess && globalState.timerResolutionProcess.pid) {
      try { process.kill(globalState.timerResolutionProcess.pid); } catch (e) {}
      globalState.timerResolutionProcess = null;
    }
    // Fast cleanup of orphaned timer scripts
    try {
      execSync('taskkill /F /FI "WINDOWTITLE eq timer_resolution*" /IM powershell.exe', {
        stdio: 'ignore', timeout: 3000
      });
    } catch (e) { /* no matching processes is fine */ }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
});

// Input sanitization moved to system/registry.js

// Registry helpers moved to system/registry.js


require('./handlers/index')(ipcMain, {
  app, getMainWindow: () => mainWindow, globalState, allowedServiceNames,
  execAsync, spawnAsync, psEncode, runPsJson, runPs,
  sanitizeRegistryKey, sanitizeRegistryValueName, sanitizeRegistryValueNameOrPath,
  getRegistryValue, getBackupsFilePath, backupRegistryValueBeforeChange,
  setRegistryValue, removeRegistryValue, setRegistryPathValue, removeRegistryPathValue,
  getActiveGpuDevicePath, getCachedGpuName, getCachedGpuVendor, setCachedGpu
});

require('./handlers/valorant')(ipcMain);

