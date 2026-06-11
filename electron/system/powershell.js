const { spawn } = require('child_process');

/** Promisified spawn — resolves with trimmed stdout, rejects on non-zero exit. */
function spawnAsync(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { shell: false, ...opts });
    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(`Command failed with exit code ${code}\nStderr: ${stderr.trim()}`);
        err.code = code;
        err.stderr = stderr.trim();
        reject(err);
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Encodes a PowerShell script string as UTF-16LE Base64.
 * Uses Buffer.from with 'utf16le' encoding to correctly handle surrogate pairs.
 */
function psEncode(script) {
  return Buffer.from(script, 'utf16le').toString('base64');
}

/** Run an encoded PowerShell script and parse its JSON output. */
async function runPsJson(script) {
  const encoded = psEncode(script);
  // Using spawn prevents command injection via shell metacharacters
  const out = await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
  if (!out) return {};
  try {
    return JSON.parse(out);
  } catch (err) {
    throw new Error(`Failed to parse PowerShell JSON output. Raw output: ${out}`);
  }
}

/** Run an encoded PowerShell script and return raw text output. */
async function runPs(script) {
  const encoded = psEncode(script);
  return await spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded]);
}

let cachedGpuName = null;
let cachedGpuVendor = null;

/** Resolve and cache the primary GPU name + vendor */
async function getCachedGpuName() {
  if (cachedGpuName) return cachedGpuName;
  try {
    cachedGpuName = await spawnAsync('powershell.exe', [
      '-NoProfile', 
      '-NonInteractive', 
      '-Command', 
      '(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name'
    ]);
    const lower = cachedGpuName.toLowerCase();
    if (lower.includes('nvidia')) cachedGpuVendor = 'nvidia';
    else if (lower.includes('amd') || lower.includes('radeon')) cachedGpuVendor = 'amd';
    else if (lower.includes('intel')) cachedGpuVendor = 'intel';
    else cachedGpuVendor = 'unknown';
  } catch (e) {
    console.error('Failed to get GPU info:', e.message);
    cachedGpuName = 'Unknown GPU';
    cachedGpuVendor = 'unknown';
  }
  return cachedGpuName;
}

async function getCachedGpuVendor() {
  if (!cachedGpuVendor) {
    await getCachedGpuName();
  }
  return cachedGpuVendor;
}

function setCachedGpu(name, vendor) {
  cachedGpuName = name;
  cachedGpuVendor = vendor;
}

module.exports = {
  spawnAsync,
  psEncode,
  runPsJson,
  runPs,
  getCachedGpuName,
  getCachedGpuVendor,
  setCachedGpu
};
