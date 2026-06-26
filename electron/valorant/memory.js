const { runPs } = require('../system/powershell');

async function purgeStandbyList() {
  const script = `
    $code = @"
    using System;
    using System.Runtime.InteropServices;
    public class MemSys {
        [DllImport("ntdll.dll")]
        public static extern int NtSetSystemInformation(int SystemInformationClass, IntPtr SystemInformation, int SystemInformationLength);
    }
"@
    try {
        Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
    } catch {}

    $os = Get-CimInstance Win32_OperatingSystem
    $freeMB = [math]::Round($os.FreePhysicalMemory / 1024)
    if ($freeMB -lt 2048) {
        try {
            $size = [System.Runtime.InteropServices.Marshal]::SizeOf([int])
            $ptr = [System.Runtime.InteropServices.Marshal]::AllocHGlobal($size)
            [System.Runtime.InteropServices.Marshal]::WriteInt32($ptr, 4)
            [MemSys]::NtSetSystemInformation(80, $ptr, $size) | Out-Null
            [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)
            Write-Output '{"success": true, "message": "Purged Standby List. Free RAM was low."}'
        } catch {
            Write-Output '{"success": false, "message": "Failed to purge standby list."}'
        }
    } else {
        Write-Output '{"success": true, "message": "RAM OK, purge skipped."}'
    }
  `;
  const result = await runPs(script);
  try {
    return JSON.parse(result);
  } catch (e) {
    return { success: false, message: result };
  }
}

let standbyInterval = null;

function startStandbyMonitor(intervalMs = 30000) {
  if (standbyInterval) clearInterval(standbyInterval);
  standbyInterval = setInterval(() => {
    purgeStandbyList().catch(console.error);
  }, intervalMs);
}

function stopStandbyMonitor() {
  if (standbyInterval) {
    clearInterval(standbyInterval);
    standbyInterval = null;
  }
}

module.exports = { purgeStandbyList, startStandbyMonitor, stopStandbyMonitor };
