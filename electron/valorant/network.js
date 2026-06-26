const { runPs } = require('../system/powershell');

async function optimizeNetwork() {
  const script = `
    try {
      $adapters = Get-NetAdapter -Physical | Where-Object { $_.Status -eq "Up" }
      foreach ($adapter in $adapters) {
        Disable-NetAdapterPowerManagement -Name $adapter.Name -ErrorAction SilentlyContinue
        Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Energy-Efficient Ethernet" -DisplayValue "Disabled" -ErrorAction SilentlyContinue
        Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Green Ethernet" -DisplayValue "Disabled" -ErrorAction SilentlyContinue
        Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName "Interrupt Moderation" -DisplayValue "Disabled" -ErrorAction SilentlyContinue
      }
      
      $tcpKey = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces"
      $interfaces = Get-ChildItem $tcpKey -ErrorAction SilentlyContinue
      foreach ($iface in $interfaces) {
        Set-ItemProperty -Path $iface.PSPath -Name "TcpAckFrequency" -Value 1 -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $iface.PSPath -Name "TCPNoDelay" -Value 1 -ErrorAction SilentlyContinue
      }

      Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 0xFFFFFFFF -ErrorAction SilentlyContinue

      Write-Output '{"success": true, "message": "Network optimization applied"}'
    } catch {
      Write-Output '{"success": false, "message": "Network optimization failed"}'
    }
  `;
  const result = await runPs(script);
  try {
    return JSON.parse(result);
  } catch (e) {
    return { success: false, message: result };
  }
}

module.exports = { optimizeNetwork };
