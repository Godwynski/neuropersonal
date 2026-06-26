const { runPs } = require('../system/powershell');

async function setValorantAffinity(maskHex) {
  const script = `
    $process = Get-Process -Name "VALORANT-Win64-Shipping" -ErrorAction SilentlyContinue
    if ($process) {
      try {
        $process.ProcessorAffinity = ${maskHex || '0x5555'}
        Write-Output '{"success": true, "message": "Affinity applied successfully"}'
      } catch {
        Write-Output '{"success": false, "message": "Failed to set affinity. Requires Admin."}'
      }
    } else {
      Write-Output '{"success": false, "message": "Valorant is not running"}'
    }
  `;
  const result = await runPs(script);
  try {
    return JSON.parse(result);
  } catch (e) {
    return { success: false, message: result };
  }
}

module.exports = { setValorantAffinity };
