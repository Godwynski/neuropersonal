const fs = require('fs');
const path = require('path');

const mainPath = path.join('c:', 'system', 'neuropersonal', 'electron', 'main.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

// The lines we want to replace with imports are from line 32 to 362, but let's be safer and use regex or markers.
// We know the "Async helpers" starts around line 28.
// The "IPC Handler: Fetch System Stats" starts around line 364.

const startMarker = '// ─────────────────────────────────────────────────────────────────────────────\n// Async helpers\n// ─────────────────────────────────────────────────────────────────────────────';
const endMarker = '// ─────────────────────────────────────────────────────────────────────────────\n// IPC Handler: Fetch System Stats\n// ─────────────────────────────────────────────────────────────────────────────';

const startIndex = mainContent.indexOf(startMarker);
const endIndex = mainContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const imports = `// ─────────────────────────────────────────────────────────────────────────────
// System Modules
// ─────────────────────────────────────────────────────────────────────────────
const { spawnAsync, psEncode, runPsJson, runPs, getCachedGpuName, getCachedGpuVendor } = require('./system/powershell');
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

// Keep execAsync for backward compatibility in handlers before they are fully refactored
const { exec } = require('child_process');
function execAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 8 * 1024 * 1024, ...opts }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.toString().trim());
    });
  });
}

`;

const newMainContent = mainContent.slice(0, startIndex) + imports + mainContent.slice(endIndex);

fs.writeFileSync(mainPath, newMainContent, 'utf8');
console.log("Successfully replaced helper functions with module imports in main.js.");
