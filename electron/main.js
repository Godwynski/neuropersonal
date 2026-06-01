const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const fs = require('fs');

let mainWindow;
const isDev = !app.isPackaged;
let timerResolutionProcess = null;

// #7: Cache admin status at startup — avoids spawning `net session` every 2 seconds
let cachedIsAdmin = false;
try {
  require('child_process').execSync('net session', { stdio: 'ignore' });
  cachedIsAdmin = true;
} catch (e) {}

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    icon: path.join(__dirname, '../public/logo.png'),
    minHeight: 600,
    titleBarStyle: 'hidden',
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

// IPC Handlers: Window custom controls
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
    totalTick += Object.values(core.times).reduce((sum, val) => sum + val, 0);
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

  // Detect if VALORANT-Win64-Shipping.exe is running
  let valorantRunning = false;
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq VALORANT-Win64-Shipping.exe" /NH', { encoding: 'utf8' });
    valorantRunning = output.toLowerCase().includes('valorant-win64-shipping');
  } catch (e) {}

  // #7: Use cached admin value — never spawn net session on every poll
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
    memUsagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
    isAdmin: cachedIsAdmin,
    valorantRunning
  };
});

// IPC Handler: Run native Shell / PowerShell commands safely
// Secure Registry Helpers: Safe get, set and backup
// #1: Input sanitization helpers — prevents command injection via registry key/value interpolation
function sanitizeRegistryKey(keyPath) {
  if (typeof keyPath !== 'string') return null;
  // Must start with a valid hive prefix
  if (!/^(HKLM|HKCU|HKCR|HKU|HKCC):\\/i.test(keyPath)) return null;
  // Reject shell metacharacters that can break out of PowerShell string context
  if (/[`"${}\[\];|&<>]/.test(keyPath)) return null;
  return keyPath;
}

function sanitizeRegistryValueName(valueName) {
  if (typeof valueName !== 'string') return null;
  // Allow alphanumeric, spaces, dots, underscores, hyphens — reject anything else
  if (!/^[\w\s.\-]+$/.test(valueName)) return null;
  return valueName;
}

function getRegistryValue(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) return '';
  try {
    const cmd = `powershell -Command "(Get-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -ErrorAction SilentlyContinue).${safeVal}"`;
    return execSync(cmd).toString().trim();
  } catch (err) {
    return '';
  }
}

function getBackupsFilePath() {
  const userDataPath = path.normalize(app.getPath('userData'));
  const filePath = path.normalize(path.join(userDataPath, 'registry-backups.json'));
  if (!filePath.startsWith(userDataPath)) {
    throw new Error('Path traversal detected');
  }
  return filePath;
}

function backupRegistryValueBeforeChange(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) return;
  try {
    const val = getRegistryValue(safeKey, safeVal);
    const p = getBackupsFilePath();
    let backups = [];
    if (fs.existsSync(p)) {
      try { backups = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) {}
    }

    const exists = backups.some(b => b.keyPath.toLowerCase() === safeKey.toLowerCase() && b.valueName.toLowerCase() === safeVal.toLowerCase());
    if (!exists && val !== '') {
      backups.push({
        keyPath: safeKey,
        valueName: safeVal,
        value: val,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(p, JSON.stringify(backups, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

function setRegistryValue(keyPath, valueName, value, type = 'DWord') {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) throw new Error(`Unsafe registry path or value name rejected: ${keyPath} / ${valueName}`);
  backupRegistryValueBeforeChange(safeKey, safeVal);
  const ensurePathCmd = `powershell -Command "if (-not (Test-Path '${safeKey}')) { New-Item -Path '${safeKey}' -Force | Out-Null }"`;
  try { execSync(ensurePathCmd); } catch(e) {}

  const setCmd = `powershell -Command "Set-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Value ${value} -Type ${type} -Force -ErrorAction Stop"`;
  execSync(setCmd);
}

function removeRegistryValue(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) throw new Error(`Unsafe registry path or value name rejected: ${keyPath} / ${valueName}`);
  backupRegistryValueBeforeChange(safeKey, safeVal);
  const delCmd = `powershell -Command "Remove-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Force -ErrorAction SilentlyContinue"`;
  execSync(delCmd);
}

function getActiveGpuDevicePath() {
  try {
    const gpuName = execSync("powershell -Command \"(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name\"").toString().trim();
    const classPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
    const findCmd = `powershell -Command "Get-ChildItem '${classPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -eq '${gpuName}' } | Select-Object -ExpandProperty PSChildName"`;
    const childName = execSync(findCmd).toString().trim();
    if (childName) {
      return `${classPath}\\${childName}`;
    }
  } catch (e) {
    console.error('Error resolving GPU registry path:', e);
  }
  return 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000';
}

// ─────────────────────────────────────────────────────────────────────────────
// Async helpers (used only by the status-poll handler so the main process
// is never blocked during the 2-second UI polling cycle)
// ─────────────────────────────────────────────────────────────────────────────

/** Promisified exec — resolves with trimmed stdout, rejects on non-zero exit. */
function execAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 8 * 1024 * 1024, ...opts }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.toString().trim());
    });
  });
}

/**
 * Encodes a PowerShell script string as UTF-16LE Base64 so it can be passed
 * via `powershell -EncodedCommand`. This completely eliminates shell-quoting
 * issues regardless of how many single/double quotes the script contains.
 */
function psEncode(script) {
  const buf = Buffer.allocUnsafe(script.length * 2);
  for (let i = 0; i < script.length; i++) {
    buf.writeUInt16LE(script.charCodeAt(i), i * 2);
  }
  return buf.toString('base64');
}

/** Run an encoded PowerShell script and parse its JSON output. */
async function runPsJson(script) {
  const encoded = psEncode(script);
  const out = await execAsync(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`);
  return JSON.parse(out || '{}');
}

// IPC Handler: Fetch all dashboard tweak statuses
// Refactored (#6): 20 individual blocking execSync calls → 4 parallel async PowerShell batches
ipcMain.handle('get-dashboard-tweaks-status', async (event, gamePath) => {
  const status = {};
  try {
    // Sanitize gamePath before embedding in PowerShell (single-quote escape)
    const safeGp = (typeof gamePath === 'string') ? gamePath.replace(/'/g, "''") : '';
    const exeName = safeGp ? path.basename(safeGp) : '';

    // ── BATCH A: All simple registry reads ────────────────────────────────────
    const batchA = `
$s = @{}
$s.hagsEnabled           = ((Get-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name HwSchMode -EA SilentlyContinue).HwSchMode -eq 2)
$s.gameDvrDisabled        = ((Get-ItemProperty 'HKCU:\\System\\GameConfigStore' -Name GameDVR_Enabled -EA SilentlyContinue).GameDVR_Enabled -eq 0)
$s.priorityOptimized      = ((Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name SystemResponsiveness -EA SilentlyContinue).SystemResponsiveness -eq 0)
$s.disableMouseAccel      = ((Get-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseSpeed -EA SilentlyContinue).MouseSpeed -eq '0')
$s.prioritySeparation     = ((Get-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\PriorityControl' -Name Win32PrioritySeparation -EA SilentlyContinue).Win32PrioritySeparation -eq 38)
$s.gsyncDisabled          = ((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name NvCplGlobalVRREnablement -EA SilentlyContinue).NvCplGlobalVRREnablement -eq 0)
$s.powerThrottlingDisabled= ((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerThrottling' -Name PowerThrottlingOff -EA SilentlyContinue).PowerThrottlingOff -eq 1)
$s.globalFsoDisabled      = ((Get-ItemProperty 'HKCU:\\System\\GameConfigStore' -Name GameDVR_FSEBehaviorMode -EA SilentlyContinue).GameDVR_FSEBehaviorMode -eq 2)
$s.gameModeActive         = ((Get-ItemProperty 'HKCU:\\Software\\Microsoft\\GameBar' -Name AllowAutoGameMode -EA SilentlyContinue).AllowAutoGameMode -eq 1)
$gp = '${safeGp}'
if ($gp) {
  $layerVal = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers' -Name $gp -EA SilentlyContinue).$gp
  $s.disableFullscreenOpt = ($layerVal -like '*DISABLEDXMAXIMIZEDWINDOWEDMODE*')
} else { $s.disableFullscreenOpt = $false }
$ex = '${exeName}'
if ($ex) {
  $prioVal = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$ex\\PerfOptions" -Name CpuPriorityClass -EA SilentlyContinue).CpuPriorityClass
  $s.persistentPriorityEnabled = ($prioVal -eq 3)
} else { $s.persistentPriorityEnabled = $false }
$s | ConvertTo-Json -Compress`;

    // ── BATCH B: powercfg + bcdedit (system-level, cannot be done via registry) ──
    const batchB = `
$s = @{}
$usb = powercfg /q SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 2>$null
$s.disableUsbSuspend  = ($usb -match '0x00000000')
$park = powercfg /q SCHEME_CURRENT sub_processor CPMinCores 2>$null
$s.disableCoreParking = ($park -match '0x00000064')
$plan = powercfg /getactivescheme 2>$null
$s.powerPlanMode      = if ($plan -match '8c5e7fda') { 'high' } else { 'balanced' }
$bcd = bcdedit /enum '{current}' 2>$null
$s.disableDynamicTick = ($bcd -match 'disabledynamictick' -and $bcd -match 'Yes')
$s | ConvertTo-Json -Compress`;

    // ── BATCH C: Services + Vanguard health ───────────────────────────────────
    const batchC = `
$s = @{}
$s.sysMain = ((Get-Service -Name 'SysMain' -EA SilentlyContinue).Status -eq 'Running')
$s.xblAuth = ((Get-Service -Name 'XblAuthManager' -EA SilentlyContinue).Status -eq 'Running')
$sb = 'disabled'
try { if (Confirm-SecureBootUEFI -EA SilentlyContinue) { $sb = 'enabled' } } catch {}
$s.secureBoot = $sb
$s.tpm2 = if ((Get-Tpm -EA SilentlyContinue).TpmPresent) { 'active' } else { 'inactive' }
$adapters = (Get-NetAdapter -EA SilentlyContinue | Where-Object Status -eq 'Up').InterfaceDescription -join ' '
$s.vpnActive = ($adapters -match 'tap|tun|vpn|wireguard|openvpn')
$s | ConvertTo-Json -Compress`;

    // ── BATCH D: GPU-specific checks (MSI, FreeSync, NIC power) ──────────────
    const batchD = `
$s = @{}
$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
$gpuName = $gpu.Name
$s.gpuName = $gpuName
$pnp = $gpu.PNPDeviceID
if ($pnp -match 'PCI\\\\(?<dev>.+)') {
  $msiPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\$($Matches['dev'])\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties"
  $s.msiEnabled = ((Get-ItemProperty $msiPath -Name MSISupported -EA SilentlyContinue).MSISupported -eq 1)
} else { $s.msiEnabled = $false }
$classPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}'
if ($gpuName -match 'AMD|Radeon') {
  $amdKey = Get-ChildItem $classPath -EA SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -EA SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -EA SilentlyContinue).DriverDesc -like '*Radeon*' } | Select-Object -First 1
  if ($amdKey) {
    $s.freesyncEnabled = ((Get-ItemProperty $amdKey.PSPath -Name KMD_EnableInternalLargePage -EA SilentlyContinue).KMD_EnableInternalLargePage -eq 1)
  } else { $s.freesyncEnabled = $false }
} elseif ($gpuName -match 'NVIDIA') {
  $s.freesyncEnabled = ((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name EnableAdaptiveSync -EA SilentlyContinue).EnableAdaptiveSync -eq 1)
} else { $s.freesyncEnabled = $false }
$nicProps = Get-NetAdapterAdvancedProperty -DisplayName '*Energy*','*Power Saving*','*Green*','*EEE*' -EA SilentlyContinue
if ($nicProps) {
  $enabled = $nicProps | Where-Object { $_.DisplayValue -like '*Enable*' -or $_.RegistryValue -eq 1 }
  $s.nicPowerSavingDisabled = ($null -eq $enabled -or $enabled.Count -eq 0)
} else { $s.nicPowerSavingDisabled = $true }
$s | ConvertTo-Json -Compress`;

    // ── Run all 4 batches in parallel ─────────────────────────────────────────
    const [a, b, c, d] = await Promise.all([
      runPsJson(batchA).catch(() => ({})),
      runPsJson(batchB).catch(() => ({})),
      runPsJson(batchC).catch(() => ({})),
      runPsJson(batchD).catch(() => ({})),
    ]);

    // ── Assemble final status from all batch results ───────────────────────────
    status.hagsEnabled            = a.hagsEnabled            ?? false;
    status.gameDvrDisabled        = a.gameDvrDisabled         ?? false;
    status.priorityOptimized      = a.priorityOptimized       ?? false;
    status.disableMouseAccel      = a.disableMouseAccel       ?? false;
    status.prioritySeparation     = a.prioritySeparation      ?? false;
    status.gsyncDisabled          = a.gsyncDisabled           ?? false;
    status.powerThrottlingDisabled= a.powerThrottlingDisabled ?? false;
    status.globalFsoDisabled      = a.globalFsoDisabled       ?? false;
    status.gameModeActive         = a.gameModeActive          ?? false;
    status.disableFullscreenOpt   = a.disableFullscreenOpt    ?? false;
    status.persistentPriorityEnabled = a.persistentPriorityEnabled ?? false;

    status.disableUsbSuspend  = b.disableUsbSuspend  ?? false;
    status.disableCoreParking = b.disableCoreParking  ?? false;
    status.powerPlanMode      = b.powerPlanMode       ?? 'balanced';
    status.disableDynamicTick = b.disableDynamicTick  ?? false;

    status.bgServices = {
      SysMain:        c.sysMain ?? false,
      XblAuthManager: c.xblAuth ?? false,
    };
    status.vanguardHealth = {
      secureBoot: c.secureBoot ?? 'disabled',
      tpm2:       c.tpm2       ?? 'inactive',
      vpnActive:  c.vpnActive  ?? false,
      csmDisabled: (c.secureBoot === 'enabled') ? 'disabled' : 'unknown',
    };

    status.msiEnabled            = d.msiEnabled            ?? false;
    status.freesyncEnabled       = d.freesyncEnabled        ?? false;
    status.nicPowerSavingDisabled= d.nicPowerSavingDisabled ?? false;

  } catch (err) {
    console.error('Error fetching system status:', err);
  }
  return { success: true, status };
});


ipcMain.handle('set-dashboard-tweak', async (event, { tweakName, active, extraArgs }) => {
  try {
    if (tweakName === 'hags') {
      const val = active ? 2 : 1;
      setRegistryValue('HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers', 'HwSchMode', val, 'DWord');
    }
    else if (tweakName === 'gameDvr') {
      const val = active ? 0 : 1;
      setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_Enabled', val, 'DWord');
      setRegistryValue('HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR', 'AppCaptureEnabled', val, 'DWord');
    }
    else if (tweakName === 'priorityOptimized') {
      if (active) {
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'SystemResponsiveness', 0, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'NetworkThrottlingIndex', 4294967295, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'GPU Priority', 8, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Priority', 6, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Scheduling Category', '"High"', 'String');
      } else {
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'SystemResponsiveness', 20, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'NetworkThrottlingIndex', 10, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'GPU Priority', 8, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Priority', 2, 'DWord');
        setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Scheduling Category', '"Medium"', 'String');
      }
    }
    else if (tweakName === 'disableMouseAccel') {
      const speed = active ? '0' : '1';
      const t1 = active ? '0' : '6';
      const t2 = active ? '0' : '10';
      setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseSpeed', `'${speed}'`, 'String');
      setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseThreshold1', `'${t1}'`, 'String');
      setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseThreshold2', `'${t2}'`, 'String');
    }
    else if (tweakName === 'disableUsbSuspend') {
      const val = active ? '0' : '1';
      execSync(`powercfg /SETACVALUEINDEX SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 ${val}`);
      execSync(`powercfg /SETDCVALUEINDEX SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 ${val}`);
      execSync('powercfg /setactive SCHEME_CURRENT');
    }
    else if (tweakName === 'disableCoreParking') {
      execSync("powercfg -attributes 54533251-82be-4824-96c1-47b60b740d00 0cc5b647-c1df-4637-891a-dec35c318583 -ATTRIB_HIDE");
      const val = active ? '100' : '5';
      execSync(`powercfg -setacvalueindex scheme_current sub_processor CPMinCores ${val}`);
      execSync(`powercfg -setdcvalueindex scheme_current sub_processor CPMinCores ${val}`);
      execSync('powercfg /setactive SCHEME_CURRENT');
    }
    else if (tweakName === 'disableDynamicTick') {
      if (active) {
        execSync('bcdedit /set disabledynamictick yes');
      } else {
        try { execSync('bcdedit /deletevalue disabledynamictick'); } catch (e) {}
      }
    }
    else if (tweakName === 'disableFullscreenOpt') {
      const gamePath = extraArgs && extraArgs.gamePath;
      if (gamePath) {
        if (active) {
          setRegistryValue('HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers', gamePath, '"~ DISABLEDXMAXIMIZEDWINDOWEDMODE"', 'String');
        } else {
          removeRegistryValue('HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers', gamePath);
        }
      }
    }
    else if (tweakName === 'prioritySeparation') {
      const val = active ? 38 : 26;
      setRegistryValue('HKLM:\\System\\CurrentControlSet\\Control\\PriorityControl', 'Win32PrioritySeparation', val, 'DWord');
    }
    else if (tweakName === 'gsyncDisabled') {
      const val = active ? 0 : 1;
      setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak', 'NvCplGlobalVRREnablement', val, 'DWord');
    }
    else if (tweakName === 'freesyncEnabled') {
      const val = active ? 1 : 0;
      const gpuName = execSync("powershell -Command \"(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name\"").toString().trim().toLowerCase();
      if (gpuName.includes('amd') || gpuName.includes('radeon')) {
        const activePath = getActiveGpuDevicePath();
        setRegistryValue(activePath, 'KMD_EnableInternalLargePage', val, 'DWord');
      } else if (gpuName.includes('nvidia')) {
        setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak', 'EnableAdaptiveSync', val, 'DWord');
      }
    }
    else if (tweakName === 'nicPowerSavingDisabled') {
      const val = active ? 'Disabled' : 'Enabled';
      execSync(`powershell -Command "Get-NetAdapterAdvancedProperty -DisplayName '*Energy*', '*Power Saving*', '*Green*', '*EEE*' -ErrorAction SilentlyContinue | ForEach-Object { Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName $_.DisplayName -DisplayValue '${val}' -ErrorAction SilentlyContinue }"`);
    }
    else if (tweakName === 'powerThrottlingDisabled') {
      const val = active ? 1 : 0;
      setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerThrottling', 'PowerThrottlingOff', val, 'DWord');
    }
    else if (tweakName === 'globalFsoDisabled') {
      if (active) {
        setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_FSEBehaviorMode', 2, 'DWord');
        setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_HonorUserFSEBehaviorMode', 1, 'DWord');
      } else {
        setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_FSEBehaviorMode', 0, 'DWord');
        removeRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_HonorUserFSEBehaviorMode');
      }
    }
    else if (tweakName === 'persistentPriorityEnabled') {
      const gamePath = extraArgs && extraArgs.gamePath;
      if (gamePath) {
        const exeName = path.basename(gamePath);
        if (active) {
          setRegistryValue(`HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exeName}\\PerfOptions`, 'CpuPriorityClass', 3, 'DWord');
        } else {
          try {
            execSync(`powershell -Command "Remove-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exeName}\\PerfOptions' -Force -ErrorAction SilentlyContinue"`);
          } catch (e) {}
        }
      }
    }
    else if (tweakName === 'msiEnabled') {
      const val = active ? 1 : 0;
      const gpuPnpCmd = `powershell -Command "$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\\\\\(?<device>.+)') { echo $Matches['device'] }"`;
      const pnpDevice = execSync(gpuPnpCmd).toString().trim();
      if (pnpDevice) {
        const msiPath = `HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\${pnpDevice}\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties`;
        setRegistryValue(msiPath, 'MSISupported', val, 'DWord');
      }
    }
    else if (tweakName === 'gameMode') {
      const val = active ? 1 : 0;
      setRegistryValue('HKCU:\\Software\\Microsoft\\GameBar', 'AllowAutoGameMode', val, 'DWord');
    }
    else if (tweakName === 'powerPlan') {
      const guid = active === 'high' ? '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c' : '381b4222-f694-41f0-9685-ff5bb260df2e';
      execSync(`powercfg /setactive ${guid}`);
    }
    else if (tweakName === 'forcePriority') {
      const gameName = extraArgs && extraArgs.gameName;
      // #3: Allowlist gameName to prevent arbitrary process name injection
      const allowedGameNames = ['VALORANT-Win64-Shipping'];
      if (gameName && allowedGameNames.includes(gameName)) {
        execSync(`powershell -Command "Get-Process -Name '${gameName}' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }"`);
      }
    }
    else if (tweakName === 'bgService') {
      const serviceName = extraArgs && extraArgs.serviceName;
      if (serviceName) {
        const action = active ? 'Start' : 'Stop';
        const startType = active ? 'Automatic' : 'Disabled';
        execSync(`powershell -Command "Set-Service -Name '${serviceName}' -StartupType ${startType} -ErrorAction SilentlyContinue; ${action}-Service -Name '${serviceName}' -ErrorAction SilentlyContinue"`);
      }
    }
    return { success: true };
  } catch (err) {
    console.error('Error applying dashboard tweak:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('run-macro', async (event, macroKey) => {
  try {
    if (macroKey === 'm-dns') {
      execSync('ipconfig /flushdns');
    }
    else if (macroKey === 'm-ram') {
      execSync('powershell -Command "[System.GC]::Collect()"');
    }
    else if (macroKey === 'm-explorer') {
      execSync('taskkill /f /im explorer.exe & start explorer.exe');
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('run-cache-cleaner', async (event, type) => {
  try {
    if (type === 'scan') {
      const tempCmd = `powershell -Command "if (Test-Path $env:TEMP) { Get-ChildItem -Path $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum } else { echo 0 }"`;
      const valLogsCmd = `powershell -Command "if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Get-ChildItem -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum } else { echo 0 }"`;
      const shaderCmd = `powershell -Command "(Get-ChildItem -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache', '$env:LOCALAPPDATA\\NVIDIA\\GLCache', '$env:LOCALAPPDATA\\AMD\\DxCache', '$env:LOCALAPPDATA\\D3DSCache' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"`;
      
      const tempBytes = parseInt(execSync(tempCmd).toString().trim()) || 0;
      const valLogsBytes = parseInt(execSync(valLogsCmd).toString().trim()) || 0;
      const shaderBytes = parseInt(execSync(shaderCmd).toString().trim()) || 0;
      
      return { success: true, tempBytes, valLogsBytes, shaderBytes };
    }
    else if (type === 'purgeTemp') {
      execSync("powershell -Command \"Remove-Item -Path '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
    }
    else if (type === 'purgeValLogs') {
      execSync("powershell -Command \"if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Remove-Item -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs\\*' -Recurse -Force -ErrorAction SilentlyContinue }\"");
    }
    else if (type === 'purgeShader') {
      execSync("powershell -Command \"Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*', '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*', '$env:LOCALAPPDATA\\AMD\\DxCache\\*', '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue\"");
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('launch-admin-utility', async (event, utility) => {
  const allowlist = ['taskmgr', 'perfmon', 'gpedit', 'msconfig', 'services', 'regedit'];
  if (!allowlist.includes(utility)) {
    return { success: false, error: 'Forbidden utility' };
  }
  try {
    if (utility === 'gpedit') {
      exec('start gpedit.msc');
    } else if (utility === 'services') {
      exec('start services.msc');
    } else {
      exec(`start ${utility}`);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-registry-backups', async () => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf8');
      return { success: true, backups: JSON.parse(data) };
    }
    return { success: true, backups: [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('restore-registry-backup', async (event, backupIndex) => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const backups = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (backupIndex >= 0 && backupIndex < backups.length) {
        const backup = backups.at(backupIndex);
        const ensurePathCmd = `powershell -Command "if (-not (Test-Path '${backup.keyPath}')) { New-Item -Path '${backup.keyPath}' -Force | Out-Null }"`;
        try { execSync(ensurePathCmd); } catch(e) {}
        
        let typeParam = 'DWord';
        let valParam = backup.value;
        if (isNaN(backup.value)) {
          typeParam = 'String';
          valParam = `"${backup.value}"`;
        }
        
        const setCmd = `powershell -Command "Set-ItemProperty -Path '${backup.keyPath}' -Name '${backup.valueName}' -Value ${valParam} -Type ${typeParam} -Force"`;
        execSync(setCmd);
        
        backups.splice(backupIndex, 1);
        fs.writeFileSync(p, JSON.stringify(backups, null, 2), 'utf8');
        return { success: true };
      }
    }
    return { success: false, error: 'Backup not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-registry-backup', async (event, backupIndex) => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const backups = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (backupIndex >= 0 && backupIndex < backups.length) {
        backups.splice(backupIndex, 1);
        fs.writeFileSync(p, JSON.stringify(backups, null, 2), 'utf8');
        return { success: true };
      }
    }
    return { success: false, error: 'Backup not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('clear-all-registry-backups', async () => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify([], null, 2), 'utf8');
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('restore-all-registry-backups', async () => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const backups = JSON.parse(fs.readFileSync(p, 'utf8'));
      for (const backup of backups) {
        const ensurePathCmd = `powershell -Command "if (-not (Test-Path '${backup.keyPath}')) { New-Item -Path '${backup.keyPath}' -Force | Out-Null }"`;
        try { execSync(ensurePathCmd); } catch(e) {}
        
        let typeParam = 'DWord';
        let valParam = backup.value;
        if (isNaN(backup.value)) {
          typeParam = 'String';
          valParam = `"${backup.value}"`;
        }
        
        const setCmd = `powershell -Command "Set-ItemProperty -Path '${backup.keyPath}' -Name '${backup.valueName}' -Value ${valParam} -Type ${typeParam} -Force"`;
        execSync(setCmd);
      }
      fs.writeFileSync(p, JSON.stringify([], null, 2), 'utf8');
      return { success: true };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('kill-process', async (event, processName) => {
  const allowlist = ['chrome.exe', 'msedge.exe', 'spotify.exe', 'discord.exe', 'steam.exe', 'OneDrive.exe'];
  if (!allowlist.includes(processName)) {
    return { success: false, error: 'Forbidden process' };
  }
  try {
    execSync(`taskkill /f /im ${processName}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});



// Helper: Recursively search for GameUserSettings.ini
function findGameUserSettingsFiles(dir, depth = 0) {
  if (depth > 3) return [];
  const normalizedDir = path.normalize(dir);
  let results = [];
  try {
    if (!fs.existsSync(normalizedDir)) return [];
    const list = fs.readdirSync(normalizedDir);
    for (const file of list) {
      const filePath = path.normalize(path.join(normalizedDir, file));
      if (!filePath.startsWith(normalizedDir)) continue;
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
  const normalizedPath = path.normalize(filePath);
  const localAppData = path.normalize(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'));
  if (!normalizedPath.startsWith(localAppData)) {
    throw new Error('Unsafe file path rejected');
  }
  const content = fs.readFileSync(normalizedPath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  let accountId = path.basename(path.dirname(path.dirname(normalizedPath)));
  if (accountId === 'Config' || !accountId) {
    accountId = 'DefaultAccount';
  }

  const settings = {
    filePath: normalizedPath,
    accountId,
    resolutionQuality: 100,
    textureQuality: 3,
    shadowQuality: 3,
    effectsQuality: 3,
    antiAliasingQuality: 3,
    postProcessQuality: 3,
    viewDistanceQuality: 3,
    shadingQuality: 3,
    vsync: true,
    texturePoolSizeLimit: 0,
    rawInputBuffer: true
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
    const key = parts.at(0).trim();
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
      if (key === 'sg.TexturePoolSizeLimit') settings.texturePoolSizeLimit = parseInt(value, 10) || 0;
    } else if (currentSection === '/Script/Engine.GameUserSettings') {
      if (key === 'bUseVSync') settings.vsync = value.toLowerCase() === 'true';
      if (key === 'FrameRateLimit') settings.frameRateLimit = parseFloat(value) || 0;
    } else if (currentSection === '/Script/Engine.InputSettings') {
      if (key === 'bUseRawInputBuffer') settings.rawInputBuffer = value.toLowerCase() === 'true';
    }
  }
  return settings;
}

// Helper: Modify VALORANT GameUserSettings.ini file content in-place
function saveGameUserSettings(filePath, newSettings) {
  const normalizedPath = path.normalize(filePath);
  const localAppData = path.normalize(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'));
  if (!normalizedPath.startsWith(localAppData)) {
    throw new Error('Unsafe file path rejected');
  }
  if (!fs.existsSync(normalizedPath)) {
    throw new Error('Config file does not exist: ' + normalizedPath);
  }
  const stats = fs.statSync(normalizedPath);
  const isReadOnly = (stats.mode & 0o222) === 0;
  if (isReadOnly) {
    fs.chmodSync(normalizedPath, 0o666); // make writeable
  }
  const content = fs.readFileSync(normalizedPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const updatedLines = [];
  let currentSection = '';
  
  const updatedKeys = new Set();

  for (let i = 0; i < lines.length; i++) {
    let line = lines.at(i);
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
    const key = parts.at(0).trim();

    if (currentSection === 'ScalabilityGroups') {
      if (key === 'sg.ResolutionQuality' && newSettings.resolutionQuality !== undefined) {
        line = `sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.TextureQuality' && newSettings.textureQuality !== undefined) {
        line = `sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.ShadowQuality' && newSettings.shadowQuality !== undefined) {
        line = `sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.EffectsQuality' && newSettings.effectsQuality !== undefined) {
        line = `sg.EffectsQuality=${parseInt(newSettings.effectsQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.AntiAliasingQuality' && newSettings.antiAliasingQuality !== undefined) {
        line = `sg.AntiAliasingQuality=${parseInt(newSettings.antiAliasingQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.PostProcessQuality' && newSettings.postProcessQuality !== undefined) {
        line = `sg.PostProcessQuality=${parseInt(newSettings.postProcessQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.ViewDistanceQuality' && newSettings.viewDistanceQuality !== undefined) {
        line = `sg.ViewDistanceQuality=${parseInt(newSettings.viewDistanceQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.ShadingQuality' && newSettings.shadingQuality !== undefined) {
        line = `sg.ShadingQuality=${parseInt(newSettings.shadingQuality, 10)}`;
        updatedKeys.add(key);
      } else if (key === 'sg.TexturePoolSizeLimit' && newSettings.texturePoolSizeLimit !== undefined) {
        line = `sg.TexturePoolSizeLimit=${parseInt(newSettings.texturePoolSizeLimit, 10)}`;
        updatedKeys.add(key);
      }
    } else if (currentSection === '/Script/Engine.GameUserSettings') {
      if (key === 'bUseVSync' && newSettings.vsync !== undefined) {
        line = `bUseVSync=${newSettings.vsync ? 'True' : 'False'}`;
        updatedKeys.add('bUseVSync');
      } else if (key === 'FrameRateLimit' && newSettings.frameRateLimit !== undefined) {
        line = `FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`;
        updatedKeys.add('FrameRateLimit');
      }
    } else if (currentSection === '/Script/Engine.InputSettings') {
      if (key === 'bUseRawInputBuffer' && newSettings.rawInputBuffer !== undefined) {
        line = `bUseRawInputBuffer=${newSettings.rawInputBuffer ? 'True' : 'False'}`;
        updatedKeys.add('bUseRawInputBuffer');
      }
    }
    
    updatedLines.push(line);
  }

  let scalabilityIdx = -1;
  let gameSettingsIdx = -1;
  let inputSettingsIdx = -1;
  for (let i = 0; i < updatedLines.length; i++) {
    if (updatedLines.at(i).trim() === '[ScalabilityGroups]') {
      scalabilityIdx = i;
    } else if (updatedLines.at(i).trim() === '[/Script/Engine.GameUserSettings]') {
      gameSettingsIdx = i;
    } else if (updatedLines.at(i).trim() === '[/Script/Engine.InputSettings]') {
      inputSettingsIdx = i;
    }
  }

  if (scalabilityIdx !== -1) {
    const keysToInsert = [];
    if (!updatedKeys.has('sg.ResolutionQuality') && newSettings.resolutionQuality !== undefined) {
      keysToInsert.push(`sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`);
    }
    if (!updatedKeys.has('sg.TextureQuality') && newSettings.textureQuality !== undefined) {
      keysToInsert.push(`sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.ShadowQuality') && newSettings.shadowQuality !== undefined) {
      keysToInsert.push(`sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.EffectsQuality') && newSettings.effectsQuality !== undefined) {
      keysToInsert.push(`sg.EffectsQuality=${parseInt(newSettings.effectsQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.AntiAliasingQuality') && newSettings.antiAliasingQuality !== undefined) {
      keysToInsert.push(`sg.AntiAliasingQuality=${parseInt(newSettings.antiAliasingQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.PostProcessQuality') && newSettings.postProcessQuality !== undefined) {
      keysToInsert.push(`sg.PostProcessQuality=${parseInt(newSettings.postProcessQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.ViewDistanceQuality') && newSettings.viewDistanceQuality !== undefined) {
      keysToInsert.push(`sg.ViewDistanceQuality=${parseInt(newSettings.viewDistanceQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.ShadingQuality') && newSettings.shadingQuality !== undefined) {
      keysToInsert.push(`sg.ShadingQuality=${parseInt(newSettings.shadingQuality, 10)}`);
    }
    if (!updatedKeys.has('sg.TexturePoolSizeLimit') && newSettings.texturePoolSizeLimit !== undefined) {
      keysToInsert.push(`sg.TexturePoolSizeLimit=${parseInt(newSettings.texturePoolSizeLimit, 10)}`);
    }
    if (keysToInsert.length > 0) {
      updatedLines.splice(scalabilityIdx + 1, 0, ...keysToInsert);
      const shift = keysToInsert.length;
      if (gameSettingsIdx > scalabilityIdx) {
        gameSettingsIdx += shift;
      }
      if (inputSettingsIdx > scalabilityIdx) {
        inputSettingsIdx += shift;
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
    if (newSettings.texturePoolSizeLimit !== undefined) keysToInsert.push(`sg.TexturePoolSizeLimit=${parseInt(newSettings.texturePoolSizeLimit, 10)}`);
    updatedLines.push(...keysToInsert);
  }

  if (gameSettingsIdx !== -1) {
    const extraKeys = [];
    if (!updatedKeys.has('bUseVSync') && newSettings.vsync !== undefined) {
      extraKeys.push(`bUseVSync=${newSettings.vsync ? 'True' : 'False'}`);
    }
    if (!updatedKeys.has('FrameRateLimit') && newSettings.frameRateLimit !== undefined) {
      extraKeys.push(`FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`);
    }
    if (extraKeys.length > 0) {
      updatedLines.splice(gameSettingsIdx + 1, 0, ...extraKeys);
      const shift = extraKeys.length;
      if (inputSettingsIdx > gameSettingsIdx) {
        inputSettingsIdx += shift;
      }
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

  if (inputSettingsIdx !== -1) {
    if (!updatedKeys.has('bUseRawInputBuffer') && newSettings.rawInputBuffer !== undefined) {
      updatedLines.splice(inputSettingsIdx + 1, 0, `bUseRawInputBuffer=${newSettings.rawInputBuffer ? 'True' : 'False'}`);
    }
  } else if (newSettings.rawInputBuffer !== undefined) {
    updatedLines.push('[/Script/Engine.InputSettings]');
    updatedLines.push(`bUseRawInputBuffer=${newSettings.rawInputBuffer ? 'True' : 'False'}`);
  }

  fs.writeFileSync(normalizedPath, updatedLines.join('\r\n'), 'utf8');
  if (isReadOnly) {
    fs.chmodSync(normalizedPath, 0o444); // restore read-only attribute
  }
}

// IPC Handler: Fetch all VALORANT account graphics configs on the system
ipcMain.handle('get-valorant-configs', async () => {
  try {
    const localAppData = path.normalize(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'));
    const configDir = path.normalize(path.join(localAppData, 'VALORANT', 'Saved', 'Config'));
    if (!configDir.startsWith(localAppData)) {
      throw new Error('Path traversal detected');
    }
    
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
    const programData = path.normalize(process.env.ProgramData || 'C:\\ProgramData');
    const metadataPath = path.normalize(path.join(programData, 'Riot Games', 'Metadata', 'valorant.live', 'valorant.live.installs.json'));
    if (!metadataPath.startsWith(programData)) {
      throw new Error('Path traversal detected');
    }
    
    let detectedPath = defaultPath;
    let exists = false;
    
    if (fs.existsSync(metadataPath)) {
      try {
        const content = fs.readFileSync(metadataPath, 'utf8');
        const data = JSON.parse(content);
        if (data && data.product_install_full_path) {
          const gameDir = data.product_install_full_path.replace(/\//g, '\\');
          const cleanGameDir = path.normalize(gameDir);
          const exePath = path.normalize(path.join(cleanGameDir, 'ShooterGame', 'Binaries', 'Win64', 'VALORANT-Win64-Shipping.exe'));
          if (exePath.startsWith(cleanGameDir) && fs.existsSync(exePath)) {
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

// IPC Handler: Launch VALORANT
ipcMain.handle('launch-valorant', async (event, gamePath) => {
  try {
    // 1. Try launching using the riotclient custom protocol first (highly reliable on standard installations)
    const { shell } = require('electron');
    await shell.openExternal('riotclient://launch-product=valorant&patchline=live');
    return { success: true };
  } catch (err) {
    // 2. Fallback to finding Riot Client path from installs json
    try {
      let rcPath = 'C:\\Riot Games\\Riot Client\\RiotClientServices.exe';
      const installsPath = 'C:\\ProgramData\\Riot Games\\RiotClientInstalls.json';
      if (fs.existsSync(installsPath)) {
        const content = fs.readFileSync(installsPath, 'utf8');
        const data = JSON.parse(content);
        if (data && data.rc_live) {
          rcPath = data.rc_live;
        }
      }
      if (fs.existsSync(rcPath)) {
        const { spawn } = require('child_process');
        const child = spawn(rcPath, ['--launch-product=valorant', '--launch-patchline=live'], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return { success: true };
      }
    } catch (innerErr) {
      console.error('Riot Client fallback failed:', innerErr);
    }
    return { success: false, error: err.message };
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
      const psCommand = "powershell -Command \"$gpu = Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, CurrentRefreshRate | Select-Object -First 1; $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.DriverDesc -eq $gpu.Name } | Select-Object -First 1; if (-not $reg) { $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.'HardwareInformation.qwMemorySize' -gt 0 } | Select-Object -First 1 }; $vram = 0; if ($reg -and $reg.'HardwareInformation.qwMemorySize') { $vram = $reg.'HardwareInformation.qwMemorySize' } else { $vram = $gpu.AdapterRAM }; $util = 0; try { $samples = (Get-Counter '\\GPU Engine(*engtype_3D)\\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($samples) { $util = ($samples.CookedValue | Measure-Object -Sum).Sum; if ($util -gt 100) { $util = 100 } } else { $samples = (Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($samples) { $util = ($samples.CookedValue | Measure-Object -Maximum).Maximum } } } catch {}; $temp = 0; try { $tZone = (Get-Counter '\\Thermal Zone Information(*)\\Temperature' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($tZone) { $temp = ($tZone[0].CookedValue - 273.15) } } catch {}; [PSCustomObject]@{ Name = $gpu.Name; DriverVersion = $gpu.DriverVersion; CurrentRefreshRate = $gpu.CurrentRefreshRate; qwMemorySize = $vram; Utilization = [Math]::Round($util); Temperature = [Math]::Round($temp) } | ConvertTo-Json\"";
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
              temperature: data.Temperature > 0 ? data.Temperature : 0,
              utilization: data.Utilization || 0,
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

function getAppSettingsFilePath() {
  const userDataPath = path.normalize(app.getPath('userData'));
  const filePath = path.normalize(path.join(userDataPath, 'neuroptimize-settings.json'));
  if (!filePath.startsWith(userDataPath)) {
    throw new Error('Path traversal detected');
  }
  return filePath;
}

// IPC Handler: Settings Persistence
ipcMain.handle('save-app-settings', async (event, settings) => {
  try {
    const p = getAppSettingsFilePath();
    fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-app-settings', async () => {
  try {
    const p = getAppSettingsFilePath();
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf8');
      return { success: true, settings: JSON.parse(data) };
    }
    return { success: true, settings: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// #2: Removed duplicate backupRegistryValue (had no deduplication, appended blindly).
// The backup-registry IPC now delegates to backupRegistryValueBeforeChange which deduplicates.
ipcMain.handle('backup-registry', async (event, { keyPath, valueName }) => {
  try {
    backupRegistryValueBeforeChange(keyPath, valueName);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
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

// ============================================================
// FEATURE 1: VBS & Core Isolation Disabler
// ============================================================

ipcMain.handle('check-vbs-status', async () => {
  try {
    const vbsRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard' -Name 'EnableVirtualizationBasedSecurity' -ErrorAction SilentlyContinue).EnableVirtualizationBasedSecurity\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const miRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Name 'Enabled' -ErrorAction SilentlyContinue).Enabled\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    
    let vmPlatform = 'unknown';
    let hypervisorPlatform = 'unknown';
    try {
      const vmRes = execSync("powershell -Command \"(Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue).State\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      vmPlatform = vmRes.toLowerCase() === 'enabled' ? 'enabled' : 'disabled';
    } catch (e) { /* feature may not exist */ }
    try {
      const hvRes = execSync("powershell -Command \"(Get-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -ErrorAction SilentlyContinue).State\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      hypervisorPlatform = hvRes.toLowerCase() === 'enabled' ? 'enabled' : 'disabled';
    } catch (e) { /* feature may not exist */ }

    return {
      success: true,
      vbsEnabled: vbsRes === '1' || vbsRes === '' ? (vbsRes === '1') : false,
      memoryIntegrity: miRes === '1',
      vmPlatform,
      hypervisorPlatform
    };
  } catch (err) {
    return { success: false, error: err.message, vbsEnabled: false, memoryIntegrity: false, vmPlatform: 'unknown', hypervisorPlatform: 'unknown' };
  }
});

ipcMain.handle('toggle-vbs', async (event, enable) => {
  try {
    const val = enable ? 1 : 0;
    execSync(`powershell -Command "Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard' -Name 'EnableVirtualizationBasedSecurity' -Value ${val} -Type DWord -Force -ErrorAction Stop"`);
    
    // Memory Integrity
    execSync(`powershell -Command "if (-not (Test-Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity')) { New-Item -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Name 'Enabled' -Value ${val} -Type DWord -Force"`);

    // Optional features
    if (enable) {
      try { execSync('dism /online /Enable-Feature /FeatureName:VirtualMachinePlatform /NoRestart /Quiet'); } catch (e) { /* may not exist */ }
      try { execSync('dism /online /Enable-Feature /FeatureName:HypervisorPlatform /NoRestart /Quiet'); } catch (e) { /* may not exist */ }
    } else {
      try { execSync('dism /online /Disable-Feature /FeatureName:VirtualMachinePlatform /NoRestart /Quiet'); } catch (e) { /* may not exist */ }
      try { execSync('dism /online /Disable-Feature /FeatureName:HypervisorPlatform /NoRestart /Quiet'); } catch (e) { /* may not exist */ }
    }

    return { success: true, rebootRequired: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ============================================================
// FEATURE 2: HPET Override
// ============================================================

ipcMain.handle('check-hpet-status', async () => {
  try {
    const res = execSync("powershell -Command \"bcdedit /enum {current} | Select-String -Pattern 'useplatformclock'\"", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const hpetDisabled = res.toLowerCase().includes('no') || res.toLowerCase().includes('false');
    return { success: true, hpetDisabled };
  } catch (err) {
    // If useplatformclock is not set at all, HPET is at default (enabled)
    return { success: true, hpetDisabled: false };
  }
});

ipcMain.handle('toggle-hpet', async (event, disable) => {
  try {
    if (disable) {
      execSync('bcdedit /set useplatformclock false');
    } else {
      execSync('bcdedit /deletevalue useplatformclock');
    }
    return { success: true, rebootRequired: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ============================================================
// FEATURE 3: AMD-Specific DXNavi & MPO Registry Fixes
// ============================================================

ipcMain.handle('check-amd-optimizations', async () => {
  try {
    // MPO check
    let mpoDisabled = false;
    try {
      const mpoRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -ErrorAction SilentlyContinue).OverlayTestMode\"").toString().trim();
      mpoDisabled = mpoRes === '5';
    } catch (e) { /* key doesn't exist = MPO enabled */ }

    // Legacy DX path check — look for atidxx64 in UserModeDriverName
    let legacyDxPath = false;
    try {
      const dxRes = execSync("powershell -Command \"$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'UserModeDriverName' -ErrorAction SilentlyContinue).UserModeDriverName; if ($val -and $val -like '*atidxx64*') { echo 'legacy'; break } }\"").toString().trim();
      legacyDxPath = dxRes.includes('legacy');
    } catch (e) { /* not AMD or key missing */ }

    // Shader cache check
    let shaderCacheAlwaysOn = false;
    try {
      const scRes = execSync("powershell -Command \"$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'ShaderCache' -ErrorAction SilentlyContinue).ShaderCache; if ($val) { $hex = ($val | ForEach-Object { '{0:X2}' -f $_ }) -join ' '; if ($hex -like '*32 00*') { echo 'alwayson' }; break } }\"").toString().trim();
      shaderCacheAlwaysOn = scRes.includes('alwayson');
    } catch (e) { /* default */ }

    return { success: true, mpoDisabled, legacyDxPath, shaderCacheAlwaysOn };
  } catch (err) {
    return { success: false, error: err.message, mpoDisabled: false, legacyDxPath: false, shaderCacheAlwaysOn: false };
  }
});

ipcMain.handle('toggle-amd-mpo', async (event, disable) => {
  try {
    if (disable) {
      execSync("powershell -Command \"Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -Value 5 -Type DWord -Force\"");
    } else {
      execSync("powershell -Command \"Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -Force -ErrorAction SilentlyContinue\"");
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('toggle-amd-legacy-dx', async (event, enableLegacy) => {
  try {
    const script = enableLegacy
      ? "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'UserModeDriverName' -ErrorAction SilentlyContinue).UserModeDriverName; if ($val) { $newVal = $val -replace 'amdxx64\\.dll', 'atidxx64.dll'; Set-ItemProperty -Path $k.PSPath -Name 'UserModeDriverName' -Value $newVal -Force -ErrorAction SilentlyContinue } }"
      : "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'UserModeDriverName' -ErrorAction SilentlyContinue).UserModeDriverName; if ($val) { $newVal = $val -replace 'atidxx64\\.dll', 'amdxx64.dll'; Set-ItemProperty -Path $k.PSPath -Name 'UserModeDriverName' -Value $newVal -Force -ErrorAction SilentlyContinue } }";
    execSync(`powershell -Command "${script}"`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('toggle-amd-shader-cache', async (event, alwaysOn) => {
  try {
    const script = alwaysOn
      ? "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'ShaderCache' -Value ([byte[]](0x32, 0x00)) -Type Binary -Force -ErrorAction SilentlyContinue }"
      : "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Remove-ItemProperty -Path $k.PSPath -Name 'ShaderCache' -Force -ErrorAction SilentlyContinue }";
    execSync(`powershell -Command "${script}"`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ============================================================
// FEATURE 4: GPU Driver Profile Injector (NVIDIA & AMD)
// ============================================================

ipcMain.handle('check-gpu-driver-profile', async () => {
  try {
    // Detect vendor first
    let vendor = 'unknown';
    try {
      const gpuName = execSync("powershell -Command \"(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name\"").toString().trim().toLowerCase();
      if (gpuName.includes('nvidia')) vendor = 'nvidia';
      else if (gpuName.includes('amd') || gpuName.includes('radeon')) vendor = 'amd';
      else if (gpuName.includes('intel')) vendor = 'intel';
    } catch (e) { /* fallback */ }

    const result = { success: true, vendor };

    if (vendor === 'nvidia') {
      // Power management mode
      try {
        const pmRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name 'PowerMizerEnable' -ErrorAction SilentlyContinue).PowerMizerEnable\"").toString().trim();
        const pmLevel = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name 'PowerMizerLevel' -ErrorAction SilentlyContinue).PowerMizerLevel\"").toString().trim();
        result.powerMaxPerformance = pmRes === '1' && pmLevel === '1';
      } catch (e) { result.powerMaxPerformance = false; }

      // Low latency mode
      try {
        const llRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name 'LowLatencyMode' -ErrorAction SilentlyContinue).LowLatencyMode\"").toString().trim();
        result.lowLatencyUltra = llRes === '3';
      } catch (e) { result.lowLatencyUltra = false; }

      // Threaded optimization
      try {
        const toRes = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak' -Name 'ThreadedOptimization' -ErrorAction SilentlyContinue).ThreadedOptimization\"").toString().trim();
        result.threadedOptimization = toRes === '1';
      } catch (e) { result.threadedOptimization = false; }
    } else if (vendor === 'amd') {
      const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
      const amdFilter = `Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' } | Select-Object -First 1`;

      try {
        const alRes = execSync(`powershell -Command "$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableAntiLag' -ErrorAction SilentlyContinue).KMD_EnableAntiLag } else { '' }"`).toString().trim();
        result.antiLagEnabled = alRes === '1';
      } catch (e) { result.antiLagEnabled = false; }

      try {
        const tfRes = execSync(`powershell -Command "$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'TextureFilterQuality' -ErrorAction SilentlyContinue).TextureFilterQuality } else { '' }"`).toString().trim();
        result.textureFilterPerformance = tfRes === '0';
      } catch (e) { result.textureFilterPerformance = false; }

      try {
        const chillRes = execSync(`powershell -Command "$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableRadeonChill' -ErrorAction SilentlyContinue).KMD_EnableRadeonChill } else { '1' }"`).toString().trim();
        result.radeonChillDisabled = chillRes === '0';
      } catch (e) { result.radeonChillDisabled = false; }

      try {
        const boostRes = execSync(`powershell -Command "$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableRadeonBoost' -ErrorAction SilentlyContinue).KMD_EnableRadeonBoost } else { '1' }"`).toString().trim();
        result.radeonBoostDisabled = boostRes === '0';
      } catch (e) { result.radeonBoostDisabled = false; }
    }

    return result;
  } catch (err) {
    return { success: false, error: err.message, vendor: 'unknown' };
  }
});

ipcMain.handle('apply-gpu-driver-profile', async (event, { vendor, profile }) => {
  try {
    if (vendor === 'nvidia') {
      const tweakPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak';
      const ensurePath = `if (-not (Test-Path '${tweakPath}')) { New-Item -Path '${tweakPath}' -Force | Out-Null };`;

      if (profile === 'performance') {
        execSync(`powershell -Command "${ensurePath} Set-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerEnable' -Value 1 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerLevel' -Value 1 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'LowLatencyMode' -Value 3 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'ThreadedOptimization' -Value 1 -Type DWord -Force"`);
      } else {
        execSync(`powershell -Command "${ensurePath} Remove-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerEnable' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerLevel' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'LowLatencyMode' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'ThreadedOptimization' -Force -ErrorAction SilentlyContinue"`);
      }
    } else if (vendor === 'amd') {
      const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
      const amdFilter = `$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' };`;

      if (profile === 'performance') {
        execSync(`powershell -Command "${amdFilter} foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableAntiLag' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'TextureFilterQuality' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonChill' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonBoost' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue }"`);
      } else {
        execSync(`powershell -Command "${amdFilter} foreach ($k in $keys) { Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableAntiLag' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'TextureFilterQuality' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonChill' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonBoost' -Force -ErrorAction SilentlyContinue }"`);
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ============================================================
// FEATURE 5: Hardware Bottleneck & BIOS Checker (XMP/DOCP + ReBAR)
// ============================================================

ipcMain.handle('check-hardware-bottlenecks', async () => {
  try {
    // RAM modules
    let ramModules = [];
    try {
      const ramRes = execSync("powershell -Command \"Get-CimInstance Win32_PhysicalMemory | Select-Object Speed, ConfiguredClockSpeed, Capacity, Manufacturer | ConvertTo-Json\"").toString().trim();
      let parsed = JSON.parse(ramRes);
      if (!Array.isArray(parsed)) parsed = [parsed];
      ramModules = parsed.map(m => ({
        speed: m.Speed || 0,
        configuredSpeed: m.ConfiguredClockSpeed || 0,
        capacityGB: m.Capacity ? Math.round(Number(m.Capacity) / (1024 * 1024 * 1024)) : 0,
        manufacturer: (m.Manufacturer || 'Unknown').trim()
      }));
    } catch (e) { /* WMI may fail */ }

    // XMP detection: if configured speed <= 2133 for DDR4, likely no XMP
    const xmpEnabled = ramModules.length > 0 && ramModules[0].configuredSpeed > 2133;

    // ReBAR check
    let rebarEnabled = false;
    try {
      const rebarRes = execSync("powershell -Command \"$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'KMD_ReBarEnable' -ErrorAction SilentlyContinue).KMD_ReBarEnable; if ($val -eq 1) { echo 'enabled'; break } }\"").toString().trim();
      if (!rebarRes.includes('enabled')) {
        // Fallback: check if Above4GDecoding is set in bcdedit or registry
        const above4g = execSync("powershell -Command \"(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000' -Name 'KMD_EnableReBarSupport' -ErrorAction SilentlyContinue).KMD_EnableReBarSupport\"").toString().trim();
        rebarEnabled = above4g === '1';
      } else {
        rebarEnabled = true;
      }
    } catch (e) { /* not supported */ }

    // Legacy AMD GPU detection (RX 580, 570, 480, etc.)
    let isLegacyAmdGpu = false;
    try {
      const gpuName = execSync("powershell -Command \"(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name\"").toString().trim();
      const legacyPatterns = ['RX 580', 'RX 570', 'RX 560', 'RX 550', 'RX 480', 'RX 470', 'RX 460', 'R9 ', 'R7 ', 'R5 '];
      isLegacyAmdGpu = legacyPatterns.some(p => gpuName.includes(p));
    } catch (e) { /* */ }

    // Check if legacy ReBAR is force-enabled
    let legacyRebarForced = false;
    if (isLegacyAmdGpu) {
      try {
        const lrRes = execSync("powershell -Command \"$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -ErrorAction SilentlyContinue).KMD_EnableReBarForLegacyASIC; if ($val -eq 1) { echo 'forced'; break } }\"").toString().trim();
        legacyRebarForced = lrRes.includes('forced');
      } catch (e) { /* */ }
    }

    return { success: true, ramModules, xmpEnabled, rebarEnabled, isLegacyAmdGpu, legacyRebarForced };
  } catch (err) {
    return { success: false, error: err.message, ramModules: [], xmpEnabled: false, rebarEnabled: false, isLegacyAmdGpu: false, legacyRebarForced: false };
  }
});

ipcMain.handle('toggle-legacy-rebar', async (event, enable) => {
  try {
    const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
    if (enable) {
      execSync(`powershell -Command "$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_RebarControlMode' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue }"`);
    } else {
      execSync(`powershell -Command "$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_RebarControlMode' -Force -ErrorAction SilentlyContinue }"`);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
