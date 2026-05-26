const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const fs = require('fs');

let mainWindow;
const isDev = !app.isPackaged;
let timerResolutionProcess = null;

function writePowerShellHelpers() {
  try {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    // Write memory cleaner script
    const memoryCleanerContent = `$code = @"
using System;
using System.Runtime.InteropServices;
public class MemoryCleaner {
    [DllImport("ntdll.dll")]
    public static extern int NtSetSystemInformation(int classId, IntPtr info, int length);
    [DllImport("psapi.dll")]
    public static extern bool EmptyWorkingSet(IntPtr hProcess);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool OpenProcessToken(IntPtr ProcessHandle, uint DesiredAccess, out IntPtr TokenHandle);
    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern bool LookupPrivilegeValue(string lpSystemName, string lpName, out long lpLuid);
    [DllImport("advapi32.dll", SetLastError = true)]
    public static extern bool AdjustTokenPrivileges(IntPtr TokenHandle, bool DisableAll, ref TOKEN_PRIVILEGES NewState, int BufferLength, IntPtr PrevState, IntPtr ReturnLength);
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct TOKEN_PRIVILEGES {
        public int PrivilegeCount;
        public long Luid;
        public int Attributes;
    }
    private static bool EnablePrivilege(string privilege) {
        IntPtr hToken;
        long luid;
        if (!OpenProcessToken(System.Diagnostics.Process.GetCurrentProcess().Handle, 0x0020 | 0x0008, out hToken)) return false;
        if (!LookupPrivilegeValue(null, privilege, out luid)) return false;
        TOKEN_PRIVILEGES tp = new TOKEN_PRIVILEGES();
        tp.PrivilegeCount = 1;
        tp.Luid = luid;
        tp.Attributes = 0x00000002;
        return AdjustTokenPrivileges(hToken, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero);
    }
    public static bool FlushStandby() {
        EnablePrivilege("SeProfileSingleProcessPrivilege");
        IntPtr pCmd = Marshal.AllocHGlobal(sizeof(int));
        Marshal.WriteInt32(pCmd, 4); // Command 4 = Purge standby list
        int res = NtSetSystemInformation(80, pCmd, sizeof(int));
        Marshal.FreeHGlobal(pCmd);
        return res == 0;
    }
}
"@
try {
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
} catch {}

Get-Process | Where-Object { $_.Id -gt 4 -and $_.ProcessName -notlike "System" -and $_.ProcessName -notlike "Idle" } | ForEach-Object {
    try {
        $handle = $_.Handle
        if ($handle -ne 0) {
            [MemoryCleaner]::EmptyWorkingSet($handle) | Out-Null
        }
    } catch {}
}

$res = [MemoryCleaner]::FlushStandby()
echo "Standby Flush Success: $res"
`;
    fs.writeFileSync(path.join(userDataPath, 'purge_standby.ps1'), memoryCleanerContent, 'utf8');

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
$parentProcess = Get-Process -Id $ParentPid -ErrorAction SilentlyContinue;
while ($parentProcess) {
    [Timer]::NtSetTimerResolution(5000, $true, [ref]$current) | Out-Null
    Start-Sleep -Seconds 2
    $parentProcess = Get-Process -Id $ParentPid -ErrorAction SilentlyContinue
}
`;
    fs.writeFileSync(path.join(userDataPath, 'timer_resolution.ps1'), timerResContent, 'utf8');
  } catch (err) {
    console.error('Failed to write PowerShell helpers:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    icon: path.join(__dirname, '../public/logo.png'),
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
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// IPC Handler: Update titlebar overlay colors when theme changes
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

app.whenReady().then(() => {
  writePowerShellHelpers();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  try {
    if (timerResolutionProcess) {
      timerResolutionProcess.kill('SIGTERM');
      timerResolutionProcess = null;
    }
    console.log('Cleaning up orphaned powershell timer resolution processes...');
    execSync('powershell -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'powershell.exe\'\\" | Where-Object { $_.CommandLine -like \'*NtSetTimerResolution*\' -or $_.CommandLine -like \'*timer_resolution.ps1*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"');
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
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

// Helper: Recursively search for GameUserSettings.ini
function findGameUserSettingsFiles(dir, depth = 0) {
  if (depth > 3) return [];
  let results = [];
  try {
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findGameUserSettingsFiles(filePath, depth + 1));
      } else if (file.toLowerCase() === 'gameusersettings.ini') {
        results.push(filePath);
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return results;
}

// Helper: Parse VALORANT GameUserSettings.ini parameters
function parseGameUserSettings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  let accountId = path.basename(path.dirname(path.dirname(filePath)));
  if (accountId === 'Config' || !accountId) {
    accountId = 'DefaultAccount';
  }

  const settings = {
    filePath,
    accountId,
    resolutionQuality: 100,
    textureQuality: 3,
    shadowQuality: 3,
    effectsQuality: 3,
    antiAliasingQuality: 3,
    postProcessQuality: 3,
    viewDistanceQuality: 3,
    shadingQuality: 3,
    vsync: true
  };

  let currentSection = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      continue;
    }
    if (!trimmed || trimmed.startsWith(';')) continue;
    const parts = trimmed.split('=');
    if (parts.length < 2) continue;
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();

    if (currentSection === 'ScalabilityGroups') {
      if (key === 'sg.ResolutionQuality') settings.resolutionQuality = parseFloat(value) || 100;
      if (key === 'sg.TextureQuality') settings.textureQuality = parseInt(value, 10) || 0;
      if (key === 'sg.ShadowQuality') settings.shadowQuality = parseInt(value, 10) || 0;
      if (key === 'sg.EffectsQuality') settings.effectsQuality = parseInt(value, 10) || 0;
      if (key === 'sg.AntiAliasingQuality') settings.antiAliasingQuality = parseInt(value, 10) || 0;
      if (key === 'sg.PostProcessQuality') settings.postProcessQuality = parseInt(value, 10) || 0;
      if (key === 'sg.ViewDistanceQuality') settings.viewDistanceQuality = parseInt(value, 10) || 0;
      if (key === 'sg.ShadingQuality') settings.shadingQuality = parseInt(value, 10) || 0;
    } else if (currentSection === '/Script/Engine.GameUserSettings') {
      if (key === 'bUseVSync') settings.vsync = value.toLowerCase() === 'true';
      if (key === 'FrameRateLimit') settings.frameRateLimit = parseFloat(value) || 0;
    }
  }
  return settings;
}

// Helper: Modify VALORANT GameUserSettings.ini file content in-place
function saveGameUserSettings(filePath, newSettings) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Config file does not exist: ' + filePath);
  }
  const stats = fs.statSync(filePath);
  const isReadOnly = (stats.mode & 0o222) === 0;
  if (isReadOnly) {
    fs.chmodSync(filePath, 0o666); // make writeable
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const updatedLines = [];
  let currentSection = '';
  
  const updatedKeys = {
    'sg.ResolutionQuality': false,
    'sg.TextureQuality': false,
    'sg.ShadowQuality': false,
    'sg.EffectsQuality': false,
    'sg.AntiAliasingQuality': false,
    'sg.PostProcessQuality': false,
    'sg.ViewDistanceQuality': false,
    'sg.ShadingQuality': false,
    'bUseVSync': false,
    'FrameRateLimit': false
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      updatedLines.push(line);
      continue;
    }
    
    if (!trimmed || trimmed.startsWith(';')) {
      updatedLines.push(line);
      continue;
    }

    const parts = trimmed.split('=');
    const key = parts[0].trim();

    if (currentSection === 'ScalabilityGroups') {
      if (key === 'sg.ResolutionQuality' && newSettings.resolutionQuality !== undefined) {
        line = `sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.TextureQuality' && newSettings.textureQuality !== undefined) {
        line = `sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.ShadowQuality' && newSettings.shadowQuality !== undefined) {
        line = `sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.EffectsQuality' && newSettings.effectsQuality !== undefined) {
        line = `sg.EffectsQuality=${parseInt(newSettings.effectsQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.AntiAliasingQuality' && newSettings.antiAliasingQuality !== undefined) {
        line = `sg.AntiAliasingQuality=${parseInt(newSettings.antiAliasingQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.PostProcessQuality' && newSettings.postProcessQuality !== undefined) {
        line = `sg.PostProcessQuality=${parseInt(newSettings.postProcessQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.ViewDistanceQuality' && newSettings.viewDistanceQuality !== undefined) {
        line = `sg.ViewDistanceQuality=${parseInt(newSettings.viewDistanceQuality, 10)}`;
        updatedKeys[key] = true;
      } else if (key === 'sg.ShadingQuality' && newSettings.shadingQuality !== undefined) {
        line = `sg.ShadingQuality=${parseInt(newSettings.shadingQuality, 10)}`;
        updatedKeys[key] = true;
      }
    } else if (currentSection === '/Script/Engine.GameUserSettings') {
      if (key === 'bUseVSync' && newSettings.vsync !== undefined) {
        line = `bUseVSync=${newSettings.vsync ? 'True' : 'False'}`;
        updatedKeys['bUseVSync'] = true;
      } else if (key === 'FrameRateLimit' && newSettings.frameRateLimit !== undefined) {
        line = `FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`;
        updatedKeys['FrameRateLimit'] = true;
      }
    }
    
    updatedLines.push(line);
  }

  let scalabilityIdx = -1;
  let gameSettingsIdx = -1;
  for (let i = 0; i < updatedLines.length; i++) {
    if (updatedLines[i].trim() === '[ScalabilityGroups]') {
      scalabilityIdx = i;
    } else if (updatedLines[i].trim() === '[/Script/Engine.GameUserSettings]') {
      gameSettingsIdx = i;
    }
  }

  if (scalabilityIdx !== -1) {
    const keysToInsert = [];
    if (!updatedKeys['sg.ResolutionQuality'] && newSettings.resolutionQuality !== undefined) {
      keysToInsert.push(`sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`);
    }
    if (!updatedKeys['sg.TextureQuality'] && newSettings.textureQuality !== undefined) {
      keysToInsert.push(`sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`);
    }
    if (!updatedKeys['sg.ShadowQuality'] && newSettings.shadowQuality !== undefined) {
      keysToInsert.push(`sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`);
    }
    if (!updatedKeys['sg.EffectsQuality'] && newSettings.effectsQuality !== undefined) {
      keysToInsert.push(`sg.EffectsQuality=${parseInt(newSettings.effectsQuality, 10)}`);
    }
    if (!updatedKeys['sg.AntiAliasingQuality'] && newSettings.antiAliasingQuality !== undefined) {
      keysToInsert.push(`sg.AntiAliasingQuality=${parseInt(newSettings.antiAliasingQuality, 10)}`);
    }
    if (!updatedKeys['sg.PostProcessQuality'] && newSettings.postProcessQuality !== undefined) {
      keysToInsert.push(`sg.PostProcessQuality=${parseInt(newSettings.postProcessQuality, 10)}`);
    }
    if (!updatedKeys['sg.ViewDistanceQuality'] && newSettings.viewDistanceQuality !== undefined) {
      keysToInsert.push(`sg.ViewDistanceQuality=${parseInt(newSettings.viewDistanceQuality, 10)}`);
    }
    if (!updatedKeys['sg.ShadingQuality'] && newSettings.shadingQuality !== undefined) {
      keysToInsert.push(`sg.ShadingQuality=${parseInt(newSettings.shadingQuality, 10)}`);
    }
    if (keysToInsert.length > 0) {
      updatedLines.splice(scalabilityIdx + 1, 0, ...keysToInsert);
      if (gameSettingsIdx > scalabilityIdx) {
        gameSettingsIdx += keysToInsert.length;
      }
    }
  } else {
    const keysToInsert = ['[ScalabilityGroups]'];
    if (newSettings.resolutionQuality !== undefined) keysToInsert.push(`sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`);
    if (newSettings.textureQuality !== undefined) keysToInsert.push(`sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`);
    if (newSettings.shadowQuality !== undefined) keysToInsert.push(`sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`);
    if (newSettings.effectsQuality !== undefined) keysToInsert.push(`sg.EffectsQuality=${parseInt(newSettings.effectsQuality, 10)}`);
    if (newSettings.antiAliasingQuality !== undefined) keysToInsert.push(`sg.AntiAliasingQuality=${parseInt(newSettings.antiAliasingQuality, 10)}`);
    if (newSettings.postProcessQuality !== undefined) keysToInsert.push(`sg.PostProcessQuality=${parseInt(newSettings.postProcessQuality, 10)}`);
    if (newSettings.viewDistanceQuality !== undefined) keysToInsert.push(`sg.ViewDistanceQuality=${parseInt(newSettings.viewDistanceQuality, 10)}`);
    if (newSettings.shadingQuality !== undefined) keysToInsert.push(`sg.ShadingQuality=${parseInt(newSettings.shadingQuality, 10)}`);
    updatedLines.push(...keysToInsert);
  }

  if (gameSettingsIdx !== -1) {
    const extraKeys = [];
    if (!updatedKeys['bUseVSync'] && newSettings.vsync !== undefined) {
      extraKeys.push(`bUseVSync=${newSettings.vsync ? 'True' : 'False'}`);
    }
    if (!updatedKeys['FrameRateLimit'] && newSettings.frameRateLimit !== undefined) {
      extraKeys.push(`FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`);
    }
    if (extraKeys.length > 0) {
      updatedLines.splice(gameSettingsIdx + 1, 0, ...extraKeys);
    }
  } else {
    const keysToInsert = ['[/Script/Engine.GameUserSettings]'];
    if (newSettings.vsync !== undefined) {
      keysToInsert.push(`bUseVSync=${newSettings.vsync ? 'True' : 'False'}`);
    }
    if (newSettings.frameRateLimit !== undefined) {
      keysToInsert.push(`FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`);
    }
    updatedLines.push(...keysToInsert);
  }

  fs.writeFileSync(filePath, updatedLines.join('\r\n'), 'utf8');
  if (isReadOnly) {
    fs.chmodSync(filePath, 0o444); // restore read-only attribute
  }
}

// IPC Handler: Fetch all VALORANT account graphics configs on the system
ipcMain.handle('get-valorant-configs', async () => {
  try {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const configDir = path.join(localAppData, 'VALORANT', 'Saved', 'Config');
    
    const filePaths = findGameUserSettingsFiles(configDir);
    const configs = filePaths.map(filePath => {
      try {
        return parseGameUserSettings(filePath);
      } catch (err) {
        console.error('Error parsing config at', filePath, err);
        return null;
      }
    }).filter(Boolean);

    return { success: true, configs };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler: Apply graphic tweaks to specific VALORANT account
ipcMain.handle('save-valorant-config', async (event, { filePath, settings }) => {
  try {
    saveGameUserSettings(filePath, settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler: Check if VALORANT executable exists at detected or default paths
ipcMain.handle('detect-valorant-path', async () => {
  const defaultPath = 'C:\\Riot Games\\VALORANT\\live\\ShooterGame\\Binaries\\Win64\\VALORANT-Win64-Shipping.exe';
  try {
    const programData = process.env.ProgramData || 'C:\\ProgramData';
    const metadataPath = path.join(programData, 'Riot Games', 'Metadata', 'valorant.live', 'valorant.live.installs.json');
    
    let detectedPath = defaultPath;
    let exists = false;
    
    if (fs.existsSync(metadataPath)) {
      try {
        const content = fs.readFileSync(metadataPath, 'utf8');
        const data = JSON.parse(content);
        if (data && data.product_install_full_path) {
          const gameDir = data.product_install_full_path.replace(/\//g, '\\');
          const exePath = path.join(gameDir, 'ShooterGame', 'Binaries', 'Win64', 'VALORANT-Win64-Shipping.exe');
          if (fs.existsSync(exePath)) {
            detectedPath = exePath;
            exists = true;
          }
        }
      } catch (err) {
        console.error('Error parsing Valorant installs metadata:', err);
      }
    }
    
    if (!exists && fs.existsSync(defaultPath)) {
      exists = true;
    }
    
    return { success: true, exists, path: detectedPath };
  } catch (err) {
    return { success: false, exists: false, error: err.message };
  }
});

// IPC Handler: Set Sub-millisecond Timer Resolution
ipcMain.handle('set-timer-resolution', async (event, active) => {
  if (active) {
    if (timerResolutionProcess) return { success: true };
    try {
      const userDataPath = app.getPath('userData');
      const scriptPath = path.join(userDataPath, 'timer_resolution.ps1');
      const { spawn } = require('child_process');
      timerResolutionProcess = spawn('powershell', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        '-ParentPid', process.pid
      ], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      timerResolutionProcess.unref();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    if (timerResolutionProcess) {
      try {
        timerResolutionProcess.kill('SIGTERM');
      } catch (e) {}
      timerResolutionProcess = null;
    }
    try {
      execSync('powershell -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'powershell.exe\'\\" | Where-Object { $_.CommandLine -like \'*timer_resolution.ps1*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"');
    } catch (err) {}
    return { success: true };
  }
});

// IPC Handler: Standby memory and working set purge
ipcMain.handle('purge-standby-memory', async () => {
  return new Promise((resolve) => {
    try {
      const userDataPath = app.getPath('userData');
      const scriptPath = path.join(userDataPath, 'purge_standby.ps1');
      exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, output: stderr });
        } else {
          resolve({ success: true, output: stdout.trim() });
        }
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
});

// IPC Handler: GPU Detection
ipcMain.handle('detect-gpu', async () => {
  return new Promise((resolve) => {
    // Try nvidia-smi first
    exec('nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw --format=csv,noheader,nounits', (error, stdout) => {
      if (!error && stdout) {
        const parts = stdout.trim().split(', ');
        if (parts.length >= 6) {
          return resolve({
            success: true,
            gpu: {
              vendor: 'nvidia',
              name: parts[0],
              driverVersion: parts[1],
              temperature: parseInt(parts[2], 10) || 0,
              utilization: parseInt(parts[3], 10) || 0,
              vramMB: parseInt(parts[5], 10) || 0,
              refreshRate: 0
            }
          });
        }
      }

      // Fallback to powershell wmi + registry if nvidia-smi fails or AMD/Intel
      const psCommand = "powershell -Command \"$gpu = Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, CurrentRefreshRate | Select-Object -First 1; $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.DriverDesc -eq $gpu.Name } | Select-Object -First 1; if (-not $reg) { $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.'HardwareInformation.qwMemorySize' -gt 0 } | Select-Object -First 1 }; $vram = 0; if ($reg -and $reg.'HardwareInformation.qwMemorySize') { $vram = $reg.'HardwareInformation.qwMemorySize' } else { $vram = $gpu.AdapterRAM }; [PSCustomObject]@{ Name = $gpu.Name; DriverVersion = $gpu.DriverVersion; CurrentRefreshRate = $gpu.CurrentRefreshRate; qwMemorySize = $vram } | ConvertTo-Json\"";
      exec(psCommand, (err, wmiOut) => {
        if (err) return resolve({ success: false, error: err.message });
        try {
          let data = JSON.parse(wmiOut);
          if (Array.isArray(data)) data = data[0]; // Take primary GPU if multiple
          const name = data.Name || 'Unknown GPU';
          let vendor = 'unknown';
          if (name.toLowerCase().includes('nvidia')) vendor = 'nvidia';
          else if (name.toLowerCase().includes('amd') || name.toLowerCase().includes('radeon')) vendor = 'amd';
          else if (name.toLowerCase().includes('intel')) vendor = 'intel';

          resolve({
            success: true,
            gpu: {
              vendor,
              name,
              driverVersion: data.DriverVersion || '',
              vramMB: data.qwMemorySize ? Math.round(Number(data.qwMemorySize) / (1024 * 1024)) : 0,
              temperature: 0,
              utilization: 0,
              refreshRate: data.CurrentRefreshRate || 0
            }
          });
        } catch (parseErr) {
          resolve({ success: false, error: parseErr.message });
        }
      });
    });
  });
});

// IPC Handler: Settings Persistence
ipcMain.handle('save-app-settings', async (event, settings) => {
  try {
    const p = path.join(app.getPath('userData'), 'neuroptimize-settings.json');
    fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-app-settings', async () => {
  try {
    const p = path.join(app.getPath('userData'), 'neuroptimize-settings.json');
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf8');
      return { success: true, settings: JSON.parse(data) };
    }
    return { success: true, settings: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Helper: Registry Backup
function backupRegistryValue(keyPath, valueName) {
  try {
    const cmd = `powershell -Command "(Get-ItemProperty -Path '${keyPath}' -Name '${valueName}' -ErrorAction SilentlyContinue).${valueName}"`;
    const val = execSync(cmd).toString().trim();
    if (val) {
      const p = path.join(app.getPath('userData'), 'registry-backups.json');
      let backups = [];
      if (fs.existsSync(p)) {
        try { backups = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) {}
      }
      backups.push({ keyPath, valueName, value: val, timestamp: new Date().toISOString() });
      fs.writeFileSync(p, JSON.stringify(backups, null, 2), 'utf8');
      return { success: true, value: val };
    }
    return { success: false, error: 'Value not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

ipcMain.handle('backup-registry', async (event, { keyPath, valueName }) => {
  return backupRegistryValue(keyPath, valueName);
});

// IPC Handler: Show file open dialog for VALORANT.exe
ipcMain.handle('select-valorant-path', async () => {
  try {
    const { dialog } = require('electron');
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Select VALORANT Executable',
      properties: ['openFile'],
      filters: [
        { name: 'Executables', extensions: ['exe'] }
      ]
    });
    if (!res.canceled && res.filePaths.length > 0) {
      return { success: true, path: res.filePaths[0] };
    }
    return { success: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
