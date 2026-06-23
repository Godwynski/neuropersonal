const os = require('os');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let lastCpuInfo = null;

module.exports = function registerHandlers(ipcMain, deps) {
  const {
    app, getMainWindow, globalState, allowedServiceNames,
    execAsync, spawnAsync, psEncode, runPsJson, runPs,
    sanitizeRegistryKey, sanitizeRegistryValueName,
    getBackupsFilePath, backupRegistryValueBeforeChange,
    setRegistryValue, removeRegistryValue, setRegistryPathValue, removeRegistryPathValue,
    getActiveGpuDevicePath, getCachedGpuName, getCachedGpuVendor, setCachedGpu
  } = deps;

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Fetch System Stats
// ─────────────────────────────────────────────────────────────────────────────



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
    cpuLoad = cpus.length > 0 ? (100 - Math.round((totalIdle / totalTick) * 100)) : 0;
  }
  
  lastCpuInfo = { totalTick, totalIdle };

  // #9: Detect VALORANT asynchronously — no longer blocks main thread
  let valorantRunning = false;
  try {
    const output = await spawnAsync('tasklist.exe', ['/FI', 'IMAGENAME eq VALORANT-Win64-Shipping.exe', '/NH']);
    valorantRunning = output.toLowerCase().includes('valorant-win64-shipping');
  } catch (e) { console.error('Silent error caught:', e.message); }

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
    isAdmin: globalState.cachedIsAdmin,
    valorantRunning
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Fetch all dashboard tweak statuses
// Refactored (#6): 20 individual blocking execSync calls → 4 parallel async PowerShell batches
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('get-dashboard-tweaks-status', async (event, gamePath) => {
  const status = {};
  try {
    const safeGp = (typeof gamePath === 'string') ? gamePath.replace(/'/g, "''") : '';
    const exeName = safeGp ? path.basename(safeGp) : '';

    const batchA = `
$s = @{}
$s.hagsEnabled           = ((Get-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers' -Name HwSchMode -EA SilentlyContinue).HwSchMode -eq 2)
$s.gameDvrDisabled        = ((Get-ItemProperty 'HKCU:\\System\\GameConfigStore' -Name GameDVR_Enabled -EA SilentlyContinue).GameDVR_Enabled -eq 0)
$s.priorityOptimized      = ((Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile' -Name SystemResponsiveness -EA SilentlyContinue).SystemResponsiveness -eq 0)
$s.disableMouseAccel      = ((Get-ItemProperty 'HKCU:\\Control Panel\\Mouse' -Name MouseSpeed -EA SilentlyContinue).MouseSpeed -eq '0')
$s.prioritySeparation     = ((Get-ItemProperty 'HKLM:\System\CurrentControlSet\Control\PriorityControl' -Name Win32PrioritySeparation -EA SilentlyContinue).Win32PrioritySeparation -eq 24)
$s.gsyncDisabled          = ((Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\nvlddmkm\Global\NVTweak' -Name NvCplGlobalVRREnablement -EA SilentlyContinue).NvCplGlobalVRREnablement -eq 0)
$s.powerThrottlingDisabled= ((Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling' -Name PowerThrottlingOff -EA SilentlyContinue).PowerThrottlingOff -eq 1)
$s.globalFsoDisabled      = ((Get-ItemProperty 'HKCU:\System\GameConfigStore' -Name GameDVR_FSEBehaviorMode -EA SilentlyContinue).GameDVR_FSEBehaviorMode -eq 2)
$s.gameModeActive         = ((Get-ItemProperty 'HKCU:\Software\Microsoft\GameBar' -Name AllowAutoGameMode -EA SilentlyContinue).AllowAutoGameMode -eq 1)
$gp = '${safeGp}'
if ($gp) {
  $layerVal = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers' -Name $gp -EA SilentlyContinue).$gp
  $s.disableFullscreenOpt = ($layerVal -like '*DISABLEDXMAXIMIZEDWINDOWEDMODE*')
} else { $s.disableFullscreenOpt = $false }
$ex = '${exeName}'
if ($ex) {
  $prioVal = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\$ex\PerfOptions" -Name CpuPriorityClass -EA SilentlyContinue).CpuPriorityClass
  $s.persistentPriorityEnabled = ($prioVal -eq 3)
} else { $s.persistentPriorityEnabled = $false }
$s.symmetricPriorityActive = ((Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\VALORANT-Win64-Shipping.exe\PerfOptions' -Name CpuPriorityClass -EA SilentlyContinue).CpuPriorityClass -eq 2)
$s.electronIgpuIsolated = ((Get-ItemProperty 'HKCU:\SOFTWARE\Microsoft\DirectX\UserGpuPreferences' -Name Discord.exe -EA SilentlyContinue).'Discord.exe' -match 'GpuPreference=1;')
$s.intelGmmAllocated = ((Get-ItemProperty 'HKLM:\SOFTWARE\Intel\GMM' -Name DedicatedSegmentSize -EA SilentlyContinue).DedicatedSegmentSize -eq 1024)
$s | ConvertTo-Json -Compress`;

    const batchB = `
$s = @{}
$usbVal = $null
try {
  $usbRaw = (Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\2a737441-1930-4402-8d77-b2bebba308a3\\48e6b7a6-50f5-4782-a5d4-53bb8f07e226\\DefaultPowerSchemeValues' -EA SilentlyContinue)
  if ($usbRaw) {
    $acKey = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\PowerCfg\\PowerSchemes' -EA SilentlyContinue)
  }
  $activePlan = (powercfg /getactivescheme 2>$null) -replace '.*GUID: ([a-f0-9-]+).*','$1'
  $usbOut = powercfg /q "$activePlan" 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 2>$null
  if ($usbOut -match 'Current AC Power Setting Index:\s*0x0+\s') { $usbVal = 0 }
  elseif ($usbOut -match '0x00000000') { $usbVal = 0 }
  else { $usbVal = 1 }
} catch { $usbVal = 1 }
$s.disableUsbSuspend = ($usbVal -eq 0)
$park = powercfg /q SCHEME_CURRENT sub_processor CPMinCores 2>$null
$s.disableCoreParking = ($park -match '0x00000064')
$plan = powercfg /getactivescheme 2>$null
$s.powerPlanMode = if ($plan -match '8c5e7fda') { 'high' } elseif ($plan -match 'e9a42b02') { 'ultimate' } else { 'balanced' }
$bcd = bcdedit /enum '{current}' 2>$null
$s.disableDynamicTick = ($bcd -match 'disabledynamictick' -and $bcd -match 'Yes')
$s | ConvertTo-Json -Compress`;

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
    $fs = (Get-ItemProperty $amdKey.PSPath -Name EnableFreeSync -EA SilentlyContinue).EnableFreeSync
    if ($null -eq $fs) { $fs = (Get-ItemProperty $amdKey.PSPath -Name KMD_EnableFreeSync -EA SilentlyContinue).KMD_EnableFreeSync }
    $s.freesyncEnabled = ($fs -eq 1)
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

    const [a, b, c, d] = await Promise.all([
      runPsJson(batchA).catch(() => ({})),
      runPsJson(batchB).catch(() => ({})),
      runPsJson(batchC).catch(() => ({})),
      runPsJson(batchD).catch(() => ({})),
    ]);

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
    status.symmetricPriorityActive = a.symmetricPriorityActive ?? false;
    status.electronIgpuIsolated = a.electronIgpuIsolated ?? false;
    status.intelGmmAllocated = a.intelGmmAllocated ?? false;

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


// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Apply a single dashboard tweak (fully async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('set-dashboard-tweak', async (event, { tweakName, active, extraArgs }) => {
  try {
    if (tweakName === 'hags') {
      const val = active ? 2 : 1;
      await setRegistryValue('HKLM:\\System\\CurrentControlSet\\Control\\GraphicsDrivers', 'HwSchMode', val, 'DWord');
    }
    else if (tweakName === 'gameDvr') {
      const val = active ? 0 : 1;
      await setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_Enabled', val, 'DWord');
      await setRegistryValue('HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR', 'AppCaptureEnabled', val, 'DWord');
    }
    else if (tweakName === 'priorityOptimized') {
      if (active) {
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'SystemResponsiveness', 0, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'NetworkThrottlingIndex', 4294967295, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'GPU Priority', 8, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Priority', 6, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Scheduling Category', '"High"', 'String');
      } else {
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'SystemResponsiveness', 20, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'NetworkThrottlingIndex', 10, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'GPU Priority', 8, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Priority', 2, 'DWord');
        await setRegistryValue('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games', 'Scheduling Category', '"Medium"', 'String');
      }
    }
    else if (tweakName === 'disableMouseAccel') {
      const speed = active ? '0' : '1';
      const t1 = active ? '0' : '6';
      const t2 = active ? '0' : '10';
      await setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseSpeed', `'${speed}'`, 'String');
      await setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseThreshold1', `'${t1}'`, 'String');
      await setRegistryValue('HKCU:\\Control Panel\\Mouse', 'MouseThreshold2', `'${t2}'`, 'String');
    }
    else if (tweakName === 'disableUsbSuspend') {
      const val = active ? '0' : '1';
      await spawnAsync('powercfg.exe', ['/SETACVALUEINDEX', 'SCHEME_CURRENT', '2a737441-1930-4402-8d77-b2bebba308a3', '48e6b7a6-50f5-4782-a5d4-53bb8f07e226', val]);
      await spawnAsync('powercfg.exe', ['/SETDCVALUEINDEX', 'SCHEME_CURRENT', '2a737441-1930-4402-8d77-b2bebba308a3', '48e6b7a6-50f5-4782-a5d4-53bb8f07e226', val]);
      await spawnAsync('powercfg.exe', ['/setactive', 'SCHEME_CURRENT']);
    }
    else if (tweakName === 'disableCoreParking') {
      await spawnAsync('powercfg.exe', ['-attributes', '54533251-82be-4824-96c1-47b60b740d00', '0cc5b647-c1df-4637-891a-dec35c318583', '-ATTRIB_HIDE']);
      const val = active ? '100' : '5';
      await spawnAsync('powercfg.exe', ['-setacvalueindex', 'scheme_current', 'sub_processor', 'CPMinCores', val]);
      await spawnAsync('powercfg.exe', ['-setdcvalueindex', 'scheme_current', 'sub_processor', 'CPMinCores', val]);
      await spawnAsync('powercfg.exe', ['/setactive', 'SCHEME_CURRENT']);
    }
    else if (tweakName === 'disableDynamicTick') {
      if (active) {
        await spawnAsync('bcdedit.exe', ['/set', 'disabledynamictick', 'yes']);
      } else {
        try { await spawnAsync('bcdedit.exe', ['/deletevalue', 'disabledynamictick']); } catch (e) { console.error('Silent error caught:', e.message); }
      }
    }
    else if (tweakName === 'disableFullscreenOpt') {
      // #6: Use path-aware sanitizer + encoded command for file paths
      const gamePath = extraArgs && extraArgs.gamePath;
      if (gamePath) {
        if (active) {
          await setRegistryPathValue('HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers', gamePath, '"~ DISABLEDXMAXIMIZEDWINDOWEDMODE"', 'String');
        } else {
          await removeRegistryPathValue('HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers', gamePath);
        }
      }
    }
    else if (tweakName === 'prioritySeparation') {
      const val = active ? 24 : 26;
      await setRegistryValue('HKLM:\\System\\CurrentControlSet\\Control\\PriorityControl', 'Win32PrioritySeparation', val, 'DWord');
    }
    else if (tweakName === 'gsyncDisabled') {
      const val = active ? 0 : 1;
      await setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak', 'NvCplGlobalVRREnablement', val, 'DWord');
    }
    else if (tweakName === 'freesyncEnabled') {
      const val = active ? 1 : 0;
      const gpuName = (await getCachedGpuName()).toLowerCase();
      if (gpuName.includes('amd') || gpuName.includes('radeon')) {
        const activePath = await getActiveGpuDevicePath();
        // Write to EnableFreeSync (primary) and KMD_EnableFreeSync (fallback key used by some driver versions)
        await setRegistryValue(activePath, 'EnableFreeSync', val, 'DWord');
        await setRegistryValue(activePath, 'KMD_EnableFreeSync', val, 'DWord').catch(() => {});
        // Also set AllowFreeSyncInWindowing for windowed FreeSync support
        await setRegistryValue(activePath, 'AllowFreeSyncInWindowing', val, 'DWord').catch(() => {});
      } else if (gpuName.includes('nvidia')) {
        await setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak', 'EnableAdaptiveSync', val, 'DWord');
      }
    }
    else if (tweakName === 'nicPowerSavingDisabled') {
      const val = active ? 'Disabled' : 'Enabled';
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Get-NetAdapterAdvancedProperty -DisplayName '*Energy*', '*Power Saving*', '*Green*', '*EEE*' -ErrorAction SilentlyContinue | ForEach-Object { Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName $_.DisplayName -DisplayValue '${val}' -ErrorAction SilentlyContinue }`]);
    }
    else if (tweakName === 'powerThrottlingDisabled') {
      const val = active ? 1 : 0;
      await setRegistryValue('HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerThrottling', 'PowerThrottlingOff', val, 'DWord');
    }
    else if (tweakName === 'globalFsoDisabled') {
      if (active) {
        await setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_FSEBehaviorMode', 2, 'DWord');
        await setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_HonorUserFSEBehaviorMode', 1, 'DWord');
      } else {
        await setRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_FSEBehaviorMode', 0, 'DWord');
        await removeRegistryValue('HKCU:\\System\\GameConfigStore', 'GameDVR_HonorUserFSEBehaviorMode');
      }
    }
    else if (tweakName === 'persistentPriorityEnabled') {
      const gamePath = extraArgs && extraArgs.gamePath;
      if (gamePath) {
        const exeName = path.basename(gamePath);
        if (active) {
          await setRegistryValue(`HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exeName}\\PerfOptions`, 'CpuPriorityClass', 3, 'DWord');
        } else {
          try {
            await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exeName}\\PerfOptions' -Force -ErrorAction SilentlyContinue`]);
          } catch (e) { console.error('Silent error caught:', e.message); }
        }
      }
    }
    else if (tweakName === 'msiEnabled') {
      const val = active ? 1 : 0;
      const priority = active ? 3 : 0;
      const gpuPnpCmd = `powershell -NoProfile -Command "$gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; if ($gpu -and $gpu.PNPDeviceID -match 'PCI\\\\\\\\(?<device>.+)') { echo $Matches['device'] }"`;
      const pnpDevice = await execAsync(gpuPnpCmd);
      if (pnpDevice) {
        const msiPath = `HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\${pnpDevice}\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties`;
        await setRegistryValue(msiPath, 'MSISupported', val, 'DWord');
        if (active) {
            await setRegistryValue(msiPath, 'MessageNumberLimit', 1, 'DWord');
            await setRegistryValue(`HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\${pnpDevice}\\Device Parameters\\Interrupt Management\\Affinity Policy`, 'DevicePriority', priority, 'DWord');
        } else {
            await removeRegistryValue(msiPath, 'MessageNumberLimit');
            await removeRegistryValue(`HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\${pnpDevice}\\Device Parameters\\Interrupt Management\\Affinity Policy`, 'DevicePriority');
        }
      }
    }
    else if (tweakName === 'symmetricPriority') {
      const valDiscord = active ? 2 : null; // Normal
      const valVgc = active ? 1 : null;     // Idle
      
      const setOrDel = async (exe, val) => {
        const path = `HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exe}\\PerfOptions`;
        if (val !== null) {
          await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path '${path}')) { New-Item -Path '${path}' -Force | Out-Null }`]);
          await setRegistryValue(path, 'CpuPriorityClass', val, 'DWord');
        }
        else {
          try { await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -Path '${path}' -Force -ErrorAction SilentlyContinue`]); } catch(e){}
        }
      };
      
      await setOrDel('VALORANT-Win64-Shipping.exe', valDiscord);
      await setOrDel('Discord.exe', valDiscord);
      await setOrDel('Spotify.exe', valDiscord);
      await setOrDel('vgc.exe', valVgc);
    }
    else if (tweakName === 'electronIgpu') {
      const val = active ? "GpuPreference=1;" : null;
      const path = 'HKCU:\\SOFTWARE\\Microsoft\\DirectX\\UserGpuPreferences';
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path '${path}')) { New-Item -Path '${path}' -Force | Out-Null }`]);
      if (val) {
        await setRegistryValue(path, 'Discord.exe', val, 'String');
        await setRegistryValue(path, 'Spotify.exe', val, 'String');
        await setRegistryValue(path, 'obs64.exe', val, 'String');
      } else {
        await removeRegistryValue(path, 'Discord.exe');
        await removeRegistryValue(path, 'Spotify.exe');
        await removeRegistryValue(path, 'obs64.exe');
      }
    }
    else if (tweakName === 'intelGmm') {
      const path = 'HKLM:\\SOFTWARE\\Intel\\GMM';
      if (active) {
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path '${path}')) { New-Item -Path '${path}' -Force | Out-Null }`]);
        await setRegistryValue(path, 'DedicatedSegmentSize', 1024, 'DWord');
      } else {
        await removeRegistryValue(path, 'DedicatedSegmentSize');
      }
    }
    else if (tweakName === 'gameMode') {
      const val = active ? 1 : 0;
      await setRegistryValue('HKCU:\\Software\\Microsoft\\GameBar', 'AllowAutoGameMode', val, 'DWord');
    }
    else if (tweakName === 'powerPlan') {
      const guid = active === 'high' ? '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c' : '381b4222-f694-41f0-9685-ff5bb260df2e';
      await spawnAsync('powercfg.exe', ['/setactive', guid]);
    }
    else if (tweakName === 'forcePriority') {
      const gameName = extraArgs && extraArgs.gameName;
      // #3: Allowlist gameName to prevent arbitrary process name injection
      const allowedGameNames = ['VALORANT-Win64-Shipping'];
      if (gameName && allowedGameNames.includes(gameName)) {
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Get-Process -Name '${gameName}' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = 'High' }`]);
      }
    }
    else if (tweakName === 'bgService') {
      const serviceName = extraArgs && extraArgs.serviceName;
      // #2: Validate service name against allowlist — prevents command injection
      if (serviceName && allowedServiceNames.has(serviceName)) {
        const action = active ? 'Start' : 'Stop';
        const startType = active ? 'Automatic' : 'Disabled';
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Set-Service -Name '${serviceName}' -StartupType ${startType} -ErrorAction SilentlyContinue; ${action}-Service -Name '${serviceName}' -ErrorAction SilentlyContinue`]);
      } else {
        return { success: false, error: 'Service name not in allowlist' };
      }
    }
    return { success: true };
  } catch (err) {
    console.error('Error applying dashboard tweak:', err);
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Run native macros (async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('run-macro', async (event, macroKey) => {
  try {
    if (macroKey === 'm-dns') {
      await execAsync('ipconfig /flushdns');
    }
    else if (macroKey === 'm-ram') {
      // Real standby list purge via NtSetSystemInformation (what ISLC/Razer Cortex do)
      await execAsync('powershell -NoProfile -Command "Add-Type @\\"\nusing System; using System.Runtime.InteropServices;\npublic class MemPurge {\n    [DllImport(\\\"ntdll.dll\\\")] public static extern int NtSetSystemInformation(int InfoClass, ref int Info, int Length);\n    public static void ClearStandbyList() { int cmd = 4; NtSetSystemInformation(80, ref cmd, sizeof(int)); }\n}\n\\"@; [MemPurge]::ClearStandbyList(); [System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()"');
    }
    else if (macroKey === 'm-explorer') {
      await execAsync('taskkill /f /im explorer.exe & start explorer.exe');
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Cache scanner/cleaner (async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('run-cache-cleaner', async (event, type) => {
  try {
    if (type === 'scan') {
      const [tempOut, valLogsOut, shaderOut] = await Promise.all([
        spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "if (Test-Path $env:TEMP) { (Get-ChildItem -Path $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum } else { 0 }"]).catch(() => '0'),
        spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { (Get-ChildItem -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum } else { 0 }"]).catch(() => '0'),
        spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "(Get-ChildItem -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache', '$env:LOCALAPPDATA\\NVIDIA\\GLCache', '$env:LOCALAPPDATA\\AMD\\DxCache', '$env:LOCALAPPDATA\\D3DSCache' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"]).catch(() => '0'),
      ]);

      return {
        success: true,
        tempBytes: parseInt(tempOut) || 0,
        valLogsBytes: parseInt(valLogsOut) || 0,
        shaderBytes: parseInt(shaderOut) || 0
      };
    }
    else if (type === 'purgeTemp') {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "Remove-Item -Path '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue"]);
    }
    else if (type === 'purgeValLogs') {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "if (Test-Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs') { Remove-Item -Path '$env:LOCALAPPDATA\\VALORANT\\Saved\\Logs\\*' -Recurse -Force -ErrorAction SilentlyContinue }"]);
    }
    else if (type === 'purgeShader') {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "Remove-Item -Path '$env:LOCALAPPDATA\\NVIDIA\\DXCache\\*', '$env:LOCALAPPDATA\\NVIDIA\\GLCache\\*', '$env:LOCALAPPDATA\\AMD\\DxCache\\*', '$env:LOCALAPPDATA\\D3DSCache\\*' -Recurse -Force -ErrorAction SilentlyContinue"]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Optimize Electron Shortcuts
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('optimize-electron-shortcuts', async () => {
  try {
    const script = `
$targets = @("Discord.lnk", "Spotify.lnk")
$dirs = @("$env:USERPROFILE\\Desktop", "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs")
$flags = "--disable-renderer-backgrounding --disable-accelerated-layers --disable-accelerated-fixed-root-background --no-sandbox --js-flags=\`"--max-old-space-size=4096\`""

$wshShell = New-Object -ComObject WScript.Shell
$optimizedCount = 0

foreach ($dir in $dirs) {
  if (Test-Path $dir) {
    $shortcuts = Get-ChildItem -Path $dir -Filter "*.lnk" -Recurse -ErrorAction SilentlyContinue
    foreach ($shortcut in $shortcuts) {
      if ($targets -contains $shortcut.Name) {
        $link = $wshShell.CreateShortcut($shortcut.FullName)
        if (-not ($link.Arguments -like "*--disable-renderer-backgrounding*")) {
          $link.Arguments = "$($link.Arguments) $flags"
          $link.Save()
          $optimizedCount++
        }
      }
    }
  }
}
$optimizedCount
    `;
    const count = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', script]);
    return { success: true, count: parseInt(count.trim()) || 0 };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handlers: Virtual Memory and Standby List Automations
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-pagefile-status', async () => {
  try {
    const script = `
$mem = Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize
$totalRamMB = [math]::Round($mem.TotalVisibleMemorySize / 1024)
$targetMB = [math]::Round($totalRamMB * 1.5)
$pf = Get-CimInstance Win32_PageFileSetting -ErrorAction SilentlyContinue
if (-not $pf) { return @{ optimized = $false } | ConvertTo-Json -Compress }
$isOptimized = ($pf.InitialSize -eq $targetMB -and $pf.MaximumSize -eq $targetMB)
@{ optimized = $isOptimized; initial = $pf.InitialSize; max = $pf.MaximumSize; target = $targetMB } | ConvertTo-Json -Compress
    `;
    const res = await runPsJson(script);
    return { success: true, optimized: res.optimized || false, details: res };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('set-pagefile', async (event, enable) => {
  try {
    if (enable) {
      const script = `
$mem = Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize
$totalRamMB = [math]::Round($mem.TotalVisibleMemorySize / 1024)
$targetMB = [math]::Round($totalRamMB * 1.5)
$sys = Get-CimInstance Win32_ComputerSystem
if ($sys.AutomaticManagedPagefile) {
  Set-CimInstance -Query "Select * from Win32_ComputerSystem" -Property @{AutomaticManagedPagefile=$False}
}
$pf = Get-CimInstance Win32_PageFileSetting
if (-not $pf) {
  Set-WmiInstance -Class Win32_PageFileSetting -Arguments @{Name="C:\\pagefile.sys"; InitialSize=$targetMB; MaximumSize=$targetMB} -ErrorAction SilentlyContinue | Out-Null
} else {
  $pf | Set-CimInstance -Property @{InitialSize=$targetMB; MaximumSize=$targetMB}
}
      `;
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', script]);
    } else {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', 'Set-CimInstance -Query "Select * from Win32_ComputerSystem" -Property @{AutomaticManagedPagefile=$True}']);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

let standbyInterval = null;
ipcMain.handle('start-standby-cleaner', () => {
  if (standbyInterval) return { success: true, alreadyRunning: true };
  standbyInterval = setInterval(async () => {
    try {
      await execAsync('powershell -NoProfile -Command "Add-Type @\\"\\nusing System; using System.Runtime.InteropServices;\\npublic class MemPurge {\\n    [DllImport(\\"ntdll.dll\\")] public static extern int NtSetSystemInformation(int InfoClass, ref int Info, int Length);\\n    public static void ClearStandbyList() { int cmd = 4; NtSetSystemInformation(80, ref cmd, sizeof(int)); }\\n}\\n\\"@; [MemPurge]::ClearStandbyList(); [System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()"');
    } catch (e) {
      console.error('Standby cleaner error:', e);
    }
  }, 5 * 60 * 1000); // 5 minutes
  return { success: true };
});

ipcMain.handle('stop-standby-cleaner', () => {
  if (standbyInterval) {
    clearInterval(standbyInterval);
    standbyInterval = null;
  }
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Launch admin utilities (#36: Use spawn instead of shell exec)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('launch-admin-utility', async (event, utility) => {
  const allowlist = ['taskmgr', 'perfmon', 'gpedit', 'msconfig', 'services', 'regedit'];
  if (!allowlist.includes(utility)) {
    return { success: false, error: 'Forbidden utility' };
  }
  try {
    const target = (utility === 'gpedit') ? 'gpedit.msc'
                 : (utility === 'services') ? 'services.msc'
                 : `${utility}.exe`;
    const child = spawn('cmd', ['/c', 'start', '', target], {
      detached: true, stdio: 'ignore', shell: false
    });
    child.unref();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Kill allowlisted process (#3: case-insensitive allowlist)
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_PROCESSES = new Set([
  'chrome.exe', 'msedge.exe', 'spotify.exe',
  'discord.exe', 'steam.exe', 'onedrive.exe',
  'epicgameslauncher.exe', 'battle.net.exe',
  'slack.exe', 'telegram.exe', 'whatsapp.exe', 'overwolf.exe', 'obs64.exe'
]);

ipcMain.handle('get-running-apps', async () => {
  try {
    const output = await execAsync('tasklist /NH /FO CSV');
    const running = {};
    for (const app of ALLOWED_PROCESSES) {
      running[app.replace('.exe', '')] = output.toLowerCase().includes(`"${app}"`);
    }
    return { success: true, runningApps: running };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('kill-process', async (event, processName) => {
  if (typeof processName !== 'string') {
    return { success: false, error: 'Invalid process name' };
  }
  if (!ALLOWED_PROCESSES.has(processName.toLowerCase())) {
    return { success: false, error: 'Forbidden process' };
  }
  try {
    // Use the exact allowlisted name to prevent injection
    const canonical = [...ALLOWED_PROCESSES].find(n => n === processName.toLowerCase());
    await execAsync(`taskkill /f /im "${canonical}"`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Registry backup management
// #4: Sanitize backup data during restore
// #5: Per-item error handling in restore-all
// #14: Use stored type field instead of isNaN
// #19: Validate backupIndex is integer
// ─────────────────────────────────────────────────────────────────────────────

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
    // #19: Validate backupIndex is a non-negative integer
    if (!Number.isInteger(backupIndex) || backupIndex < 0) {
      return { success: false, error: 'Invalid backup index' };
    }
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const backups = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (backupIndex < backups.length) {
        const backup = backups[backupIndex];
        // #4: Sanitize backup data before using in shell commands
        const safeKey = sanitizeRegistryKey(backup.keyPath);
        const safeVal = sanitizeRegistryValueName(backup.valueName);
        if (!safeKey || !safeVal) {
          return { success: false, error: 'Backup contains unsafe registry path or value name' };
        }

        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path '${safeKey}')) { New-Item -Path '${safeKey}' -Force | Out-Null }`]).catch(() => {});
        
        // #14: Use stored type field if available, otherwise infer carefully
        let typeParam = backup.type || (isNaN(Number(backup.value)) || backup.value === '' ? 'String' : 'DWord');
        let valParam = backup.value;
        if (typeParam === 'String') {
          valParam = `"${backup.value}"`;
        }
        
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Set-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Value ${valParam} -Type ${typeParam} -Force`]);
        
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
    if (!Number.isInteger(backupIndex) || backupIndex < 0) {
      return { success: false, error: 'Invalid backup index' };
    }
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

// #5: Per-item error handling so partial failures don't lose unprocessed backups
ipcMain.handle('restore-all-registry-backups', async () => {
  try {
    const p = getBackupsFilePath();
    if (fs.existsSync(p)) {
      const backups = JSON.parse(fs.readFileSync(p, 'utf8'));
      const errors = [];
      const remaining = [];

      for (const backup of backups) {
        const safeKey = sanitizeRegistryKey(backup.keyPath);
        const safeVal = sanitizeRegistryValueName(backup.valueName);
        if (!safeKey || !safeVal) {
          errors.push(`Skipped unsafe: ${backup.keyPath}\\${backup.valueName}`);
          continue; // don't keep in remaining — it's corrupt
        }
        try {
          await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path '${safeKey}')) { New-Item -Path '${safeKey}' -Force | Out-Null }`]).catch(() => {});

          let typeParam = backup.type || (isNaN(Number(backup.value)) || backup.value === '' ? 'String' : 'DWord');
          let valParam = backup.value;
          if (typeParam === 'String') {
            valParam = `"${backup.value}"`;
          }

          await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Set-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Value ${valParam} -Type ${typeParam} -Force`]);
          // Restored successfully — don't add to remaining
        } catch (e) {
          errors.push(`Failed: ${backup.valueName} — ${e.message}`);
          remaining.push(backup); // Keep unrestored items
        }
      }

      // Write back only the items that failed to restore
      fs.writeFileSync(p, JSON.stringify(remaining, null, 2), 'utf8');
      if (errors.length > 0) {
        return { success: true, warnings: errors };
      }
      return { success: true };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// GameUserSettings.ini helpers (unchanged — pure file I/O, no shell commands)
// ─────────────────────────────────────────────────────────────────────────────

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
  } catch (e) { console.error('Silent error caught:', e.message); }
  return results;
}

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
    fs.chmodSync(normalizedPath, 0o666);
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
    if (updatedLines.at(i).trim() === '[ScalabilityGroups]') scalabilityIdx = i;
    else if (updatedLines.at(i).trim() === '[/Script/Engine.GameUserSettings]') gameSettingsIdx = i;
    else if (updatedLines.at(i).trim() === '[/Script/Engine.InputSettings]') inputSettingsIdx = i;
  }

  if (scalabilityIdx !== -1) {
    const keysToInsert = [];
    const scaleKeys = [
      ['sg.ResolutionQuality', 'resolutionQuality', true],
      ['sg.TextureQuality', 'textureQuality', false],
      ['sg.ShadowQuality', 'shadowQuality', false],
      ['sg.EffectsQuality', 'effectsQuality', false],
      ['sg.AntiAliasingQuality', 'antiAliasingQuality', false],
      ['sg.PostProcessQuality', 'postProcessQuality', false],
      ['sg.ViewDistanceQuality', 'viewDistanceQuality', false],
      ['sg.ShadingQuality', 'shadingQuality', false],
      ['sg.TexturePoolSizeLimit', 'texturePoolSizeLimit', false],
    ];
    for (const [sgKey, prop, isFloat] of scaleKeys) {
      if (!updatedKeys.has(sgKey) && newSettings[prop] !== undefined) {
        keysToInsert.push(`${sgKey}=${isFloat ? parseFloat(newSettings[prop]).toFixed(6) : parseInt(newSettings[prop], 10)}`);
      }
    }
    if (keysToInsert.length > 0) {
      updatedLines.splice(scalabilityIdx + 1, 0, ...keysToInsert);
      const shift = keysToInsert.length;
      if (gameSettingsIdx > scalabilityIdx) gameSettingsIdx += shift;
      if (inputSettingsIdx > scalabilityIdx) inputSettingsIdx += shift;
    }
  } else {
    const keysToInsert = ['[ScalabilityGroups]'];
    if (newSettings.resolutionQuality !== undefined) keysToInsert.push(`sg.ResolutionQuality=${parseFloat(newSettings.resolutionQuality).toFixed(6)}`);
    if (newSettings.textureQuality !== undefined) keysToInsert.push(`sg.TextureQuality=${parseInt(newSettings.textureQuality, 10)}`);
    if (newSettings.shadowQuality !== undefined) keysToInsert.push(`sg.ShadowQuality=${parseInt(newSettings.shadowQuality, 10)}`);
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
      if (inputSettingsIdx > gameSettingsIdx) inputSettingsIdx += extraKeys.length;
    }
  } else {
    const keysToInsert = ['[/Script/Engine.GameUserSettings]'];
    if (newSettings.vsync !== undefined) keysToInsert.push(`bUseVSync=${newSettings.vsync ? 'True' : 'False'}`);
    if (newSettings.frameRateLimit !== undefined) keysToInsert.push(`FrameRateLimit=${parseFloat(newSettings.frameRateLimit).toFixed(6)}`);
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
    fs.chmodSync(normalizedPath, 0o444);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handlers: VALORANT configs
// ─────────────────────────────────────────────────────────────────────────────

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

ipcMain.handle('save-valorant-config', async (event, { filePath, settings }) => {
  try {
    saveGameUserSettings(filePath, settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

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

ipcMain.handle('launch-valorant', async (event, gamePath) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal('riotclient://launch-product=valorant&patchline=live');
    return { success: true };
  } catch (err) {
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

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Timer Resolution (#38: Use process.kill instead of SIGTERM)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('set-timer-resolution', async (event, active) => {
  if (active) {
    if (globalState.timerResolutionProcess) return { success: true };
    try {
      const userDataPath = app.getPath('userData');
      const scriptPath = path.join(userDataPath, 'timer_resolution.ps1');
      globalState.timerResolutionProcess = spawn('powershell', [
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
      globalState.timerResolutionProcess.unref();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    if (globalState.timerResolutionProcess && globalState.timerResolutionProcess.pid) {
      try { process.kill(globalState.timerResolutionProcess.pid); } catch (e) { console.error('Silent error caught:', e.message); }
      globalState.timerResolutionProcess = null;
    }
    try {
      await execAsync('taskkill /F /FI "WINDOWTITLE eq timer_resolution*" /IM powershell.exe').catch(() => {});
    } catch (err) {}
    return { success: true };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: GPU Detection (#23: Also updates cached GPU info)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('detect-gpu', async () => {
  return new Promise((resolve) => {
    exec('nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw --format=csv,noheader,nounits', { maxBuffer: 8 * 1024 * 1024 }, (error, stdout) => {
      if (!error && stdout) {
        const parts = stdout.trim().split(', ');
        if (parts.length >= 6) {
          setCachedGpu(parts[0], 'nvidia');
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

      const psCommand = "powershell -NoProfile -Command \"$gpu = Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, CurrentRefreshRate | Select-Object -First 1; $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.DriverDesc -eq $gpu.Name } | Select-Object -First 1; if (-not $reg) { $reg = Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' -ErrorAction SilentlyContinue | Where-Object { $_.'HardwareInformation.qwMemorySize' -gt 0 } | Select-Object -First 1 }; $vram = 0; if ($reg -and $reg.'HardwareInformation.qwMemorySize') { $vram = $reg.'HardwareInformation.qwMemorySize' } else { $vram = $gpu.AdapterRAM }; $util = 0; try { $samples = (Get-Counter '\\GPU Engine(*engtype_3D)\\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($samples) { $util = ($samples.CookedValue | Measure-Object -Sum).Sum; if ($util -gt 100) { $util = 100 } } else { $samples = (Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($samples) { $util = ($samples.CookedValue | Measure-Object -Maximum).Maximum } } } catch {}; $temp = 0; try { $tZone = (Get-Counter '\\Thermal Zone Information(*)\\Temperature' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue; if ($tZone) { $temp = ($tZone[0].CookedValue - 273.15) } } catch {}; [PSCustomObject]@{ Name = $gpu.Name; DriverVersion = $gpu.DriverVersion; CurrentRefreshRate = $gpu.CurrentRefreshRate; qwMemorySize = $vram; Utilization = [Math]::Round($util); Temperature = [Math]::Round($temp) } | ConvertTo-Json\"";
      exec(psCommand, { maxBuffer: 8 * 1024 * 1024 }, (err, wmiOut) => {
        if (err) return resolve({ success: false, error: err.message });
        try {
          let data = JSON.parse(wmiOut);
          if (Array.isArray(data)) data = data[0];
          const name = data.Name || 'Unknown GPU';
          let vendor = 'unknown';
          if (name.toLowerCase().includes('nvidia')) vendor = 'nvidia';
          else if (name.toLowerCase().includes('amd') || name.toLowerCase().includes('radeon')) vendor = 'amd';
          else if (name.toLowerCase().includes('intel')) vendor = 'intel';

          setCachedGpu(name, vendor);

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

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handler: Lightweight GPU Stats (temp + utilization only)
// Avoids re-running full GPU detection; safe to poll every 10s
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('get-gpu-stats', async () => {
  const gpuName = await getCachedGpuName().catch(() => 'Unknown');
  const vendor = await getCachedGpuVendor().catch(() => 'unknown');

  // Fast path: NVIDIA with nvidia-smi
  if (vendor === 'nvidia') {
    try {
      const out = await spawnAsync('nvidia-smi.exe', [
        '--query-gpu=temperature.gpu,utilization.gpu',
        '--format=csv,noheader,nounits'
      ]);
      const parts = out.trim().split(', ');
      return {
        success: true,
        temperature: parseInt(parts[0], 10) || 0,
        utilization: parseInt(parts[1], 10) || 0
      };
    } catch (e) { /* fall through to generic */ }
  }

  // Generic path: Windows performance counters (works for AMD/Intel too)
  try {
    const script = `
$util = 0; $temp = 0
try {
  $samples = (Get-Counter '\\GPU Engine(*engtype_3D)\\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue
  if ($samples) { $util = ($samples.CookedValue | Measure-Object -Sum).Sum; if ($util -gt 100) { $util = 100 } }
} catch {}
try {
  $tZone = (Get-Counter '\\Thermal Zone Information(*)\\Temperature' -ErrorAction SilentlyContinue).CounterSamples | Where-Object CookedValue
  if ($tZone) { $temp = ($tZone[0].CookedValue - 273.15) }
} catch {}
@{ temperature = [Math]::Round($temp); utilization = [Math]::Round($util) } | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return {
      success: true,
      temperature: res.temperature || 0,
      utilization: res.utilization || 0
    };
  } catch (err) {
    return { success: false, temperature: 0, utilization: 0 };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handlers: Settings persistence
// ─────────────────────────────────────────────────────────────────────────────

function getAppSettingsFilePath() {
  const userDataPath = path.normalize(app.getPath('userData'));
  const filePath = path.normalize(path.join(userDataPath, 'neuroptimize-settings.json'));
  if (!filePath.startsWith(userDataPath)) {
    throw new Error('Path traversal detected');
  }
  return filePath;
}

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

ipcMain.handle('backup-registry', async (event, { keyPath, valueName }) => {
  try {
    await backupRegistryValueBeforeChange(keyPath, valueName);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('select-valorant-path', async () => {
  try {
    const { dialog } = require('electron');
    const res = await dialog.showOpenDialog(getMainWindow(), {
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

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1: VBS & Core Isolation (all async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-vbs-status', async () => {
  try {
    const vbsRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard' -Name 'EnableVirtualizationBasedSecurity' -ErrorAction SilentlyContinue).EnableVirtualizationBasedSecurity"]).catch(() => '');
    const miRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Name 'Enabled' -ErrorAction SilentlyContinue).Enabled"]).catch(() => '');
    
    let vmPlatform = 'unknown';
    let hypervisorPlatform = 'unknown';
    if (globalState.cachedIsAdmin) {
      try {
        const vmRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue).State"]);
        vmPlatform = vmRes.toLowerCase() === 'enabled' ? 'enabled' : 'disabled';
      } catch (e) { console.error('Silent error caught:', e.message); }
      try {
        const hvRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -ErrorAction SilentlyContinue).State"]);
        hypervisorPlatform = hvRes.toLowerCase() === 'enabled' ? 'enabled' : 'disabled';
      } catch (e) { console.error('Silent error caught:', e.message); }
    }

    return {
      success: true,
      vbsEnabled: vbsRes === '1',
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
    await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard' -Name 'EnableVirtualizationBasedSecurity' -Value ${val} -Type DWord -Force -ErrorAction Stop`]);
    await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `if (-not (Test-Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity')) { New-Item -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Force | Out-Null }; Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity' -Name 'Enabled' -Value ${val} -Type DWord -Force`]);

    if (enable) {
      try { await spawnAsync('dism.exe', ['/online', '/Enable-Feature', '/FeatureName:VirtualMachinePlatform', '/NoRestart', '/Quiet']); } catch (e) { console.error('Silent error caught:', e.message); }
      try { await spawnAsync('dism.exe', ['/online', '/Enable-Feature', '/FeatureName:HypervisorPlatform', '/NoRestart', '/Quiet']); } catch (e) { console.error('Silent error caught:', e.message); }
    } else {
      try { await spawnAsync('dism.exe', ['/online', '/Disable-Feature', '/FeatureName:VirtualMachinePlatform', '/NoRestart', '/Quiet']); } catch (e) { console.error('Silent error caught:', e.message); }
      try { await spawnAsync('dism.exe', ['/online', '/Disable-Feature', '/FeatureName:HypervisorPlatform', '/NoRestart', '/Quiet']); } catch (e) { console.error('Silent error caught:', e.message); }
    }

    return { success: true, rebootRequired: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2: HPET Override (all async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-hpet-status', async () => {
  try {
    const res = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "bcdedit /enum {current} | Select-String -Pattern 'useplatformclock'"]);
    const hpetDisabled = res.toLowerCase().includes('no') || res.toLowerCase().includes('false');
    return { success: true, hpetDisabled };
  } catch (err) {
    return { success: true, hpetDisabled: false };
  }
});

ipcMain.handle('toggle-hpet', async (event, disable) => {
  try {
    if (disable) {
      await spawnAsync('bcdedit.exe', ['/set', 'useplatformclock', 'false']);
    } else {
      try { await spawnAsync('bcdedit.exe', ['/deletevalue', 'useplatformclock']); } catch (e) { console.error('Silent error caught:', e.message); }
    }
    return { success: true, rebootRequired: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3: AMD-Specific DXNavi & MPO Registry Fixes (all async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-amd-optimizations', async () => {
  try {
    let mpoDisabled = false;
    try {
      const mpoRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -ErrorAction SilentlyContinue).OverlayTestMode"]);
      mpoDisabled = mpoRes === '5';
    } catch (e) { console.error('Silent error caught:', e.message); }

    let legacyDxPath = false;
    try {
      const dxRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'UserModeDriverName' -ErrorAction SilentlyContinue).UserModeDriverName; if ($val -and $val -like '*atidxx64*') { echo 'legacy'; break } }"]);
      legacyDxPath = dxRes.includes('legacy');
    } catch (e) { console.error('Silent error caught:', e.message); }

    let shaderCacheAlwaysOn = false;
    try {
      const scRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'ShaderCache' -ErrorAction SilentlyContinue).ShaderCache; if ($val) { $hex = ($val | ForEach-Object { '{0:X2}' -f $_ }) -join ' '; if ($hex -like '*32 00*') { echo 'alwayson' }; break } }"]);
      shaderCacheAlwaysOn = scRes.includes('alwayson');
    } catch (e) { console.error('Silent error caught:', e.message); }

    return { success: true, mpoDisabled, legacyDxPath, shaderCacheAlwaysOn };
  } catch (err) {
    return { success: false, error: err.message, mpoDisabled: false, legacyDxPath: false, shaderCacheAlwaysOn: false };
  }
});

ipcMain.handle('toggle-amd-mpo', async (event, disable) => {
  try {
    if (disable) {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -Value 5 -Type DWord -Force"]);
    } else {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm' -Name 'OverlayTestMode' -Force -ErrorAction SilentlyContinue"]);
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
    const encoded = psEncode(script);
    await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
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
    const encoded = psEncode(script);
    await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 4: GPU Driver Profile Injector (all async — #1, #39 uses cached GPU)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-gpu-driver-profile', async () => {
  try {
    const vendor = (await getCachedGpuVendor()) || 'unknown';
    const result = { success: true, vendor };

    if (vendor === 'nvidia') {
      const tweakPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\NVTweak';
      try {
        const pmRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `(Get-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerEnable' -ErrorAction SilentlyContinue).PowerMizerEnable`]);
        const pmLevel = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `(Get-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerLevel' -ErrorAction SilentlyContinue).PowerMizerLevel`]);
        result.powerMaxPerformance = pmRes === '1' && pmLevel === '1';
      } catch (e) { result.powerMaxPerformance = false; }

      try {
        const llRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `(Get-ItemProperty -Path '${tweakPath}' -Name 'LowLatencyMode' -ErrorAction SilentlyContinue).LowLatencyMode`]);
        result.lowLatencyUltra = llRes === '3';
      } catch (e) { result.lowLatencyUltra = false; }

      try {
        const toRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `(Get-ItemProperty -Path '${tweakPath}' -Name 'ThreadedOptimization' -ErrorAction SilentlyContinue).ThreadedOptimization`]);
        result.threadedOptimization = toRes === '1';
      } catch (e) { result.threadedOptimization = false; }
    } else if (vendor === 'amd') {
      const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
      const amdFilter = `Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' } | Select-Object -First 1`;

      try {
        const alRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableAntiLag' -ErrorAction SilentlyContinue).KMD_EnableAntiLag } else { '' }`]);
        result.antiLagEnabled = alRes === '1';
      } catch (e) { result.antiLagEnabled = false; }

      try {
        const tfRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'TextureFilterQuality' -ErrorAction SilentlyContinue).TextureFilterQuality } else { '' }`]);
        result.textureFilterPerformance = tfRes === '0';
      } catch (e) { result.textureFilterPerformance = false; }

      try {
        const chillRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableRadeonChill' -ErrorAction SilentlyContinue).KMD_EnableRadeonChill } else { '1' }`]);
        result.radeonChillDisabled = chillRes === '0';
      } catch (e) { result.radeonChillDisabled = false; }

      try {
        const boostRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `$k = ${amdFilter}; if ($k) { (Get-ItemProperty $k.PSPath -Name 'KMD_EnableRadeonBoost' -ErrorAction SilentlyContinue).KMD_EnableRadeonBoost } else { '1' }`]);
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
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `${ensurePath} Set-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerEnable' -Value 1 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerLevel' -Value 1 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'LowLatencyMode' -Value 3 -Type DWord -Force; Set-ItemProperty -Path '${tweakPath}' -Name 'ThreadedOptimization' -Value 1 -Type DWord -Force`]);
      } else {
        await spawnAsync('powershell.exe', ['-NoProfile', '-Command', `${ensurePath} Remove-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerEnable' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'PowerMizerLevel' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'LowLatencyMode' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${tweakPath}' -Name 'ThreadedOptimization' -Force -ErrorAction SilentlyContinue`]);
      }
    } else if (vendor === 'amd') {
      const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
      const amdFilter = `$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' };`;

      if (profile === 'performance') {
        const script = `${amdFilter} foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableAntiLag' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'TextureFilterQuality' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonChill' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonBoost' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue }`;
        const encoded = psEncode(script);
        await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
      } else {
        const script = `${amdFilter} foreach ($k in $keys) { Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableAntiLag' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'TextureFilterQuality' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonChill' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableRadeonBoost' -Force -ErrorAction SilentlyContinue }`;
        const encoded = psEncode(script);
        await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5: Hardware Bottleneck & BIOS Checker (all async — #1)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-hardware-bottlenecks', async () => {
  try {
    let ramModules = [];
    try {
      const ramRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "Get-CimInstance Win32_PhysicalMemory | Select-Object Speed, ConfiguredClockSpeed, Capacity, Manufacturer | ConvertTo-Json"]);
      let parsed = JSON.parse(ramRes);
      if (!Array.isArray(parsed)) parsed = [parsed];
      ramModules = parsed.map(m => ({
        speed: m.Speed || 0,
        configuredSpeed: m.ConfiguredClockSpeed || 0,
        capacityGB: m.Capacity ? Math.round(Number(m.Capacity) / (1024 * 1024 * 1024)) : 0,
        manufacturer: (m.Manufacturer || 'Unknown').trim()
      }));
    } catch (e) { console.error('Silent error caught:', e.message); }

    const xmpEnabled = ramModules.length > 0 && ramModules[0].configuredSpeed > 2133;

    let rebarEnabled = false;
    try {
      const rebarRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'KMD_ReBarEnable' -ErrorAction SilentlyContinue).KMD_ReBarEnable; if ($val -eq 1) { echo 'enabled'; break } }"]);
      if (!rebarRes.includes('enabled')) {
        const above4g = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000' -Name 'KMD_EnableReBarSupport' -ErrorAction SilentlyContinue).KMD_EnableReBarSupport"]).catch(() => '');
        rebarEnabled = above4g === '1';
      } else {
        rebarEnabled = true;
      }
    } catch (e) { console.error('Silent error caught:', e.message); }

    let isLegacyAmdGpu = false;
    try {
      const gpuName = await getCachedGpuName();
      const legacyPatterns = ['RX 580', 'RX 570', 'RX 560', 'RX 550', 'RX 480', 'RX 470', 'RX 460', 'R9 ', 'R7 ', 'R5 '];
      isLegacyAmdGpu = legacyPatterns.some(p => gpuName.includes(p));
    } catch (e) { console.error('Silent error caught:', e.message); }

    let legacyRebarForced = false;
    if (isLegacyAmdGpu) {
      try {
        const lrRes = await spawnAsync('powershell.exe', ['-NoProfile', '-Command', "$keys = Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}' -ErrorAction SilentlyContinue; foreach ($k in $keys) { $val = (Get-ItemProperty $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -ErrorAction SilentlyContinue).KMD_EnableReBarForLegacyASIC; if ($val -eq 1) { echo 'forced'; break } }"]);
        legacyRebarForced = lrRes.includes('forced');
      } catch (e) { console.error('Silent error caught:', e.message); }
    }

    return { success: true, ramModules, xmpEnabled, rebarEnabled, isLegacyAmdGpu, legacyRebarForced };
  } catch (err) {
    return { success: false, error: err.message, ramModules: [], xmpEnabled: false, rebarEnabled: false, isLegacyAmdGpu: false, legacyRebarForced: false };
  }
});

ipcMain.handle('toggle-legacy-rebar', async (event, enable) => {
  try {
    const amdClassPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
    const script = enable
      ? `$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Set-ItemProperty -Path $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue; Set-ItemProperty -Path $k.PSPath -Name 'KMD_RebarControlMode' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue }`
      : `$keys = Get-ChildItem '${amdClassPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*AMD*' -or (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -like '*Radeon*' }; foreach ($k in $keys) { Remove-ItemProperty -Path $k.PSPath -Name 'KMD_EnableReBarForLegacyASIC' -Force -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $k.PSPath -Name 'KMD_RebarControlMode' -Force -ErrorAction SilentlyContinue }`;
    const encoded = psEncode(script);
    await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 6: TCP/Nagle Optimization + Network Adapter Buffer Tuning
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-network-latency-status', async () => {
  try {
    const script = `
$s = @{}
$adapters = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up'
$nagleDisabled = $true
$interruptModOff = $true
foreach ($a in $adapters) {
  $guid = $a.InterfaceGuid
  $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$guid"
  $ack = (Get-ItemProperty -Path $regPath -Name 'TcpAckFrequency' -ErrorAction SilentlyContinue).TcpAckFrequency
  $noDelay = (Get-ItemProperty -Path $regPath -Name 'TCPNoDelay' -ErrorAction SilentlyContinue).TCPNoDelay
  if ($ack -ne 1 -or $noDelay -ne 1) { $nagleDisabled = $false }
  $intMod = Get-NetAdapterAdvancedProperty -Name $a.Name -DisplayName '*Interrupt Moderation*' -ErrorAction SilentlyContinue
  if ($intMod -and $intMod.DisplayValue -ne 'Disabled') { $interruptModOff = $false }
}
$s.nagleDisabled = $nagleDisabled
$s.interruptModOff = $interruptModOff
$s.adapterCount = @($adapters).Count
$s | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: err.message, nagleDisabled: false, interruptModOff: false };
  }
});

ipcMain.handle('toggle-network-latency', async (event, enable) => {
  try {
    if (enable) {
      const script = `
$adapters = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up'
foreach ($a in $adapters) {
  $guid = $a.InterfaceGuid
  $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$guid"
  Set-ItemProperty -Path $regPath -Name 'TcpAckFrequency' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
  Set-ItemProperty -Path $regPath -Name 'TCPNoDelay' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
}`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    } else {
      const script = `
$adapters = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up'
foreach ($a in $adapters) {
  $guid = $a.InterfaceGuid
  $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$guid"
  Remove-ItemProperty -Path $regPath -Name 'TcpAckFrequency' -Force -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $regPath -Name 'TCPNoDelay' -Force -ErrorAction SilentlyContinue
}`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 7: NIC Interrupt Moderation Disable
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-nic-interrupt-mod', async () => {
  try {
    const script = `
$adapters = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up'
$allDisabled = $true
foreach ($a in $adapters) {
  $intMod = Get-NetAdapterAdvancedProperty -Name $a.Name -DisplayName '*Interrupt Moderation*' -ErrorAction SilentlyContinue
  if ($intMod -and $intMod.DisplayValue -ne 'Disabled') { $allDisabled = $false; break }
}
@{ disabled = $allDisabled } | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({ disabled: false }));
    return { success: true, disabled: res.disabled || false };
  } catch (err) {
    return { success: false, error: err.message, disabled: false };
  }
});

ipcMain.handle('toggle-nic-interrupt-mod', async (event, disable) => {
  try {
    const val = disable ? 'Disabled' : 'Enabled';
    await spawnAsync('powershell.exe', ['-NoProfile', '-Command',
      `Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up' | ForEach-Object { Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName '*Interrupt Moderation*' -DisplayValue '${val}' -ErrorAction SilentlyContinue; Set-NetAdapterAdvancedProperty -Name $_.Name -DisplayName '*Interrupt Moderation Rate*' -DisplayValue '${disable ? 'Off' : 'Adaptive'}' -ErrorAction SilentlyContinue }`
    ]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 8: CPU Affinity Manager (Intel Hybrid P-core / E-core)
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-cpu-topology', async () => {
  try {
    const script = `
$s = @{}
$proc = Get-CimInstance Win32_Processor | Select-Object -First 1
$s.cpuName = $proc.Name
$s.totalCores = $proc.NumberOfCores
$s.totalLogical = $proc.NumberOfLogicalProcessors
$s.isHybrid = $false
$s.pCoreCount = 0
$s.eCoreCount = 0
# Detect Intel hybrid (12th gen+) via EfficiencyClass in Win32_Processor or core topology
# On hybrid CPUs, efficiency cores have a different EfficiencyClass
try {
  $coreInfo = Get-CimInstance -Namespace 'root\\cimv2' -ClassName 'Win32_Processor' -Property 'Name' | Select-Object -First 1
  if ($coreInfo.Name -match 'Core.*i[3579].*1[2-5]|Core.*Ultra|i[3579]-1[2-9]') {
    $s.isHybrid = $true
    # P-cores typically have HT (2 threads), E-cores have 1 thread per core
    # Heuristic: if logicalProcessors > 2*cores, there are E-cores
    # Standard: P-cores = (logical - cores) for HT count, remaining = E-cores
    # Better: use Get-Counter or registry for actual topology
    $effCores = 0
    try {
      $keys = Get-ChildItem 'HKLM:\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor' -ErrorAction SilentlyContinue
      foreach ($k in $keys) {
        $effClass = (Get-ItemProperty $k.PSPath -Name 'EfficiencyClass' -ErrorAction SilentlyContinue).EfficiencyClass
        if ($effClass -and $effClass -gt 0) { $effCores++ }
      }
    } catch {}
    if ($effCores -gt 0) {
      $s.eCoreCount = $effCores
      $s.pCoreCount = $s.totalLogical - $effCores
    } else {
      $s.isHybrid = $false
    }
  }
} catch {}
# Check if VALORANT affinity is currently set
$valProc = Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | Select-Object -First 1
$s.valorantRunning = ($null -ne $valProc)
if ($valProc) {
  $s.currentAffinity = [long]$valProc.ProcessorAffinity
} else {
  $s.currentAffinity = -1
}
$s | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('set-cpu-affinity', async (event, { mode }) => {
  try {
    if (mode === 'performance') {
      // Pin VALORANT to P-cores, move system processes to E-cores
      const script = `
$keys = Get-ChildItem 'HKLM:\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor' -ErrorAction SilentlyContinue
$pCoreMask = [long]0
$eCoreMask = [long]0
$idx = 0
foreach ($k in $keys | Sort-Object { [int]$_.PSChildName }) {
  $effClass = (Get-ItemProperty $k.PSPath -Name 'EfficiencyClass' -ErrorAction SilentlyContinue).EfficiencyClass
  if ($effClass -and $effClass -gt 0) {
    $eCoreMask = $eCoreMask -bor ([long]1 -shl $idx)
  } else {
    $pCoreMask = $pCoreMask -bor ([long]1 -shl $idx)
  }
  $idx++
}
if ($pCoreMask -eq 0) { $pCoreMask = [long]([Math]::Pow(2, $idx) - 1) }
if ($eCoreMask -eq 0) { $eCoreMask = [long]([Math]::Pow(2, $idx) - 1) }
# Pin VALORANT to P-cores
Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { try { $_.ProcessorAffinity = [IntPtr]$pCoreMask } catch {} }
# Move system overhead to E-cores (best effort)
foreach ($name in @('dwm','audiodg','SearchIndexer','MsMpEng')) {
  Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object { try { $_.ProcessorAffinity = [IntPtr]$eCoreMask } catch {} }
}`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    } else {
      // Reset all affinities to use all cores
      const script = `
$totalLogical = (Get-CimInstance Win32_Processor | Select-Object -First 1).NumberOfLogicalProcessors
$allMask = [long]([Math]::Pow(2, $totalLogical) - 1)
Get-Process -Name 'VALORANT-Win64-Shipping' -ErrorAction SilentlyContinue | ForEach-Object { try { $_.ProcessorAffinity = [IntPtr]$allMask } catch {} }
foreach ($name in @('dwm','audiodg','SearchIndexer','MsMpEng')) {
  Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object { try { $_.ProcessorAffinity = [IntPtr]$allMask } catch {} }
}`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 9: Windows Visual Effects Stripping
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-visual-effects', async () => {
  try {
    const script = `
$s = @{}
$vfx = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' -Name 'VisualFXSetting' -ErrorAction SilentlyContinue).VisualFXSetting
$s.stripped = ($vfx -eq 2)
# Also check if animations are disabled
$dwm = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name 'EnableAeroPeek' -ErrorAction SilentlyContinue).EnableAeroPeek
$s.aeroPeekOff = ($dwm -eq 0)
$s | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, stripped: res.stripped || false, aeroPeekOff: res.aeroPeekOff || false };
  } catch (err) {
    return { success: false, error: err.message, stripped: false };
  }
});

ipcMain.handle('toggle-visual-effects', async (event, strip) => {
  try {
    if (strip) {
      const script = `
# Set to Custom mode with performance-only options
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' -Name 'VisualFXSetting' -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue
# Disable specific visual effects
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name 'DragFullWindows' -Value '0' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name 'FontSmoothing' -Value '2' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop\\WindowMetrics' -Name 'MinAnimate' -Value '0' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'TaskbarAnimations' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'ListviewAlphaSelect' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name 'EnableAeroPeek' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name 'AlwaysHibernateThumbnails' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
# Disable transparency
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'EnableTransparency' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    } else {
      const script = `
# Restore to "Let Windows choose best"
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' -Name 'VisualFXSetting' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name 'DragFullWindows' -Value '1' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop\\WindowMetrics' -Name 'MinAnimate' -Value '1' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'TaskbarAnimations' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced' -Name 'ListviewAlphaSelect' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name 'EnableAeroPeek' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name 'AlwaysHibernateThumbnails' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'EnableTransparency' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 10: Windows Defender Exclusions for VALORANT
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-defender-exclusion', async () => {
  try {
    const script = `
$s = @{}
$exclusions = (Get-MpPreference -ErrorAction SilentlyContinue).ExclusionPath
$riotPath = 'C:\\Riot Games'
$valLocal = "$env:LOCALAPPDATA\\VALORANT"
$s.riotExcluded = ($exclusions -contains $riotPath -or ($exclusions | Where-Object { $_ -like '*Riot Games*' }).Count -gt 0)
$s.valLocalExcluded = ($exclusions -contains $valLocal -or ($exclusions | Where-Object { $_ -like '*VALORANT*' }).Count -gt 0)
$s.isExcluded = ($s.riotExcluded -and $s.valLocalExcluded)
$s | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, isExcluded: res.isExcluded || false };
  } catch (err) {
    return { success: false, error: err.message, isExcluded: false };
  }
});

ipcMain.handle('toggle-defender-exclusion', async (event, add) => {
  try {
    if (add) {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command',
        `Add-MpPreference -ExclusionPath 'C:\\Riot Games' -Force -ErrorAction SilentlyContinue; Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\\VALORANT" -Force -ErrorAction SilentlyContinue`
      ]);
    } else {
      await spawnAsync('powershell.exe', ['-NoProfile', '-Command',
        `Remove-MpPreference -ExclusionPath 'C:\\Riot Games' -Force -ErrorAction SilentlyContinue; Remove-MpPreference -ExclusionPath "$env:LOCALAPPDATA\\VALORANT" -Force -ErrorAction SilentlyContinue`
      ]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 11: Focus Assist / Notification Suppression
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('check-focus-assist', async () => {
  try {
    const script = `
$s = @{}
$toasts = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -ErrorAction SilentlyContinue).NOC_GLOBAL_SETTING_TOASTS_ENABLED
$s.notificationsDisabled = ($toasts -eq 0)
$focusAssist = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\DefaultAccount\\Current\\default$windows.data.notifications.quiethourssettings\\windows.data.notifications.quiethourssettings' -Name 'Data' -ErrorAction SilentlyContinue)
$s.focusAssistActive = ($null -ne $focusAssist)
$s | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, notificationsDisabled: res.notificationsDisabled || false };
  } catch (err) {
    return { success: false, error: err.message, notificationsDisabled: false };
  }
});

ipcMain.handle('toggle-focus-assist', async (event, enable) => {
  try {
    if (enable) {
      const script = `
# Disable toast notifications
if (-not (Test-Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings')) { New-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Force | Out-Null }
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -Value 0 -Type DWord -Force
# Disable notification sounds
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_ALLOW_NOTIFICATION_SOUND' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
# Disable lock screen notifications
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    } else {
      const script = `
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_ALLOW_NOTIFICATION_SOUND' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue`;
      const encoded = psEncode(script);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 12: Scheduled Task Cleanup (Disable CPU-heavy telemetry tasks)
// ─────────────────────────────────────────────────────────────────────────────

const GAMING_DISABLE_TASKS = [
  '\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser',
  '\\Microsoft\\Windows\\Application Experience\\ProgramDataUpdater',
  '\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator',
  '\\Microsoft\\Windows\\Customer Experience Improvement Program\\UsbCeip',
  '\\Microsoft\\Windows\\DiskDiagnostic\\Microsoft-Windows-DiskDiagnosticDataCollector',
  '\\Microsoft\\Windows\\Windows Error Reporting\\QueueReporting',
  '\\Microsoft\\Windows\\Autochk\\Proxy',
  '\\Microsoft\\Windows\\Power Efficiency Diagnostics\\AnalyzeSystem'
];

ipcMain.handle('check-scheduled-tasks', async () => {
  try {
    const taskNames = GAMING_DISABLE_TASKS.map(t => `'${t}'`).join(',');
    const script = `
$tasks = @(${taskNames})
$disabled = 0
$total = 0
foreach ($t in $tasks) {
  try {
    $task = Get-ScheduledTask -TaskPath ($t -replace '\\\\[^\\\\]+$','\\') -TaskName ($t -replace '.*\\\\','') -ErrorAction SilentlyContinue
    if ($task) {
      $total++
      if ($task.State -eq 'Disabled') { $disabled++ }
    }
  } catch {}
}
@{ disabled = $disabled; total = $total; allDisabled = ($disabled -eq $total -and $total -gt 0) } | ConvertTo-Json -Compress`;
    const res = await runPsJson(script).catch(() => ({}));
    return { success: true, allDisabled: res.allDisabled || false, disabled: res.disabled || 0, total: res.total || 0 };
  } catch (err) {
    return { success: false, error: err.message, allDisabled: false };
  }
});

ipcMain.handle('toggle-scheduled-tasks', async (event, disable) => {
  try {
    const action = disable ? 'Disable' : 'Enable';
    const taskNames = GAMING_DISABLE_TASKS.map(t => `'${t}'`).join(',');
    const script = `
$tasks = @(${taskNames})
foreach ($t in $tasks) {
  try {
    $taskPath = $t -replace '\\\\[^\\\\]+$','\\'
    $taskName = $t -replace '.*\\\\',''
    ${action}-ScheduledTask -TaskPath $taskPath -TaskName $taskName -ErrorAction SilentlyContinue | Out-Null
  } catch {}
}`;
    const encoded = psEncode(script);
    await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 13: Ultimate Performance Power Plan
// ─────────────────────────────────────────────────────────────────────────────

ipcMain.handle('activate-ultimate-performance', async () => {
  try {
    let ultimateGuid = 'e9a42b02-d5df-448d-aa00-03f14749eb61';
    let targetGuid = null;
    let planAvailable = false;

    // Check if it already exists in the plan list
    const listOut = await execAsync('powercfg /list').catch(() => '');
    if (listOut.toLowerCase().includes(ultimateGuid)) {
      targetGuid = ultimateGuid;
      planAvailable = true;
    } else {
      // Parse powercfg /list to check for any existing Ultimate Performance scheme
      const lines = listOut.split(/\r?\n/);
      for (const line of lines) {
        if (line.toLowerCase().includes('ultimate performance')) {
          const match = line.match(/GUID:\s+([a-fA-F0-9-]+)/i);
          if (match) {
            targetGuid = match[1];
            planAvailable = true;
            break;
          }
        }
      }
    }

    // If not found in powercfg /list, check the registry for powrprof.dll,-19 (localized systems)
    if (!planAvailable) {
      try {
        const findScript = `
          try {
            $schemes = Get-ItemProperty HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\User\\PowerSchemes\\* -ErrorAction SilentlyContinue
            $match = $schemes | Where-Object { $_.FriendlyName -like '*powrprof.dll,-19*' -or $_.FriendlyName -like '*Ultimate Performance*' } | Select-Object -First 1
            if ($match) { $match.PSChildName } else { "" }
          } catch {
            ""
          }
        `;
        const foundGuid = (await runPs(findScript)).trim();
        if (foundGuid) {
          targetGuid = foundGuid;
          planAvailable = true;
        }
      } catch (regErr) {
        console.error('Silent error caught while searching registry for Ultimate Performance:', regErr.message);
      }
    }

    // If still not available, duplicate it
    if (!planAvailable) {
      try {
        const dupOut = await execAsync(`powercfg -duplicatescheme ${ultimateGuid}`);
        if (dupOut && !dupOut.toLowerCase().includes('error')) {
          const match = dupOut.match(/GUID:\s+([a-fA-F0-9-]+)/i);
          if (match) {
            targetGuid = match[1];
            planAvailable = true;
          }
        }
      } catch (dupErr) {
        console.error('Silent error caught: Ultimate Performance duplicate failed:', dupErr.message);
      }
    }

    if (!planAvailable) {
      // Fallback: activate High Performance plan instead and apply aggressive settings
      await spawnAsync('powercfg.exe', ['/setactive', '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c']);
      // Apply additional aggressive settings on top of High Performance
      const aggScript = `
powercfg /setacvalueindex SCHEME_CURRENT sub_processor PROCTHROTTLEMAX 100
powercfg /setacvalueindex SCHEME_CURRENT sub_processor PROCTHROTTLEMIN 100
powercfg /setacvalueindex SCHEME_CURRENT sub_processor CPMinCores 100
powercfg /setacvalueindex SCHEME_CURRENT sub_processor DISTRIBUTEUTIL 0
powercfg /setactive SCHEME_CURRENT`;
      const encoded = psEncode(aggScript);
      await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]).catch(() => {});
      return { success: true, fallback: true };
    }

    // Activate the found/duplicated Ultimate Performance plan
    await spawnAsync('powercfg.exe', ['/setactive', targetGuid]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('check-ultimate-performance', async () => {
  try {
    const plan = await execAsync('powercfg /getactivescheme');
    const match = plan.match(/GUID:\s+([a-fA-F0-9-]+)\s+\((.*)\)/i);
    if (!match) return { success: true, isUltimate: false };

    const activeGuid = match[1].toLowerCase();
    const activeName = match[2].toLowerCase();

    if (activeGuid === 'e9a42b02-d5df-448d-aa00-03f14749eb61' || activeName.includes('ultimate performance')) {
      return { success: true, isUltimate: true };
    }

    // Check registry for powrprof.dll,-19 (localized systems)
    try {
      const regOut = await spawnAsync('powershell.exe', [
        '-NoProfile',
        '-Command',
        `(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\User\\PowerSchemes\\${activeGuid}' -Name 'FriendlyName' -ErrorAction SilentlyContinue).FriendlyName`
      ]);
      if (regOut && regOut.toLowerCase().includes('powrprof.dll,-19')) {
        return { success: true, isUltimate: true };
      }
    } catch (e) {
      console.error('Silent error caught while checking registry for Ultimate Performance:', e.message);
    }

    return { success: true, isUltimate: false };
  } catch (err) {
    return { success: false, error: err.message, isUltimate: false };
  }
});

// Feature 16: Explorer.exe Termination (Razer Cortex Style)
ipcMain.handle('check-explorer-status', async () => {
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq explorer.exe" /FO CSV /NH');
    return { success: true, isRunning: stdout.toLowerCase().includes('explorer.exe') };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('terminate-explorer', async () => {
  try {
    // Forcefully kill explorer.exe
    await execAsync('taskkill /f /im explorer.exe').catch(() => {});
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('restart-explorer', async () => {
  try {
    // Start explorer using cmd to detach it properly
    await execAsync('cmd.exe /c start explorer.exe');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

};
