const fs = require('fs');
const path = require('path');

const mainPath = path.join('c:', 'system', 'neuropersonal', 'electron', 'main.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const startMarker = '// ─────────────────────────────────────────────────────────────────────────────\n// IPC Handler: Fetch System Stats\n// ─────────────────────────────────────────────────────────────────────────────';

const startIndex = mainContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Marker not found");
  process.exit(1);
}

const handlersCode = mainContent.slice(startIndex);
const mainRest = mainContent.slice(0, startIndex);

const handlersIndexContent = `const os = require('os');
const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let lastCpuInfo = null;

module.exports = function registerHandlers(ipcMain, deps) {
  const {
    app, mainWindow, globalState, allowedServiceNames,
    execAsync, spawnAsync, psEncode, runPsJson, runPs,
    sanitizeRegistryKey, sanitizeRegistryValueName, sanitizeRegistryValueNameOrPath,
    getRegistryValue, getBackupsFilePath, backupRegistryValueBeforeChange,
    setRegistryValue, removeRegistryValue, setRegistryPathValue, removeRegistryPathValue,
    getActiveGpuDevicePath, getCachedGpuName, getCachedGpuVendor
  } = deps;

${handlersCode.replace(/let lastCpuInfo = null;/g, '')}
};
`;

const handlersDir = path.join('c:', 'system', 'neuropersonal', 'electron', 'handlers');
if (!fs.existsSync(handlersDir)) {
  fs.mkdirSync(handlersDir, { recursive: true });
}

fs.writeFileSync(path.join(handlersDir, 'index.js'), handlersIndexContent, 'utf8');

const newMainContent = mainRest + `
// ─────────────────────────────────────────────────────────────────────────────
// Register IPC Handlers
// ─────────────────────────────────────────────────────────────────────────────
const globalState = {
  timerResolutionProcess: timerResolutionProcess,
  cachedIsAdmin: cachedIsAdmin
};

require('./handlers/index')(ipcMain, {
  app, mainWindow, globalState, allowedServiceNames,
  execAsync, spawnAsync, psEncode, runPsJson, runPs,
  sanitizeRegistryKey, sanitizeRegistryValueName, sanitizeRegistryValueNameOrPath,
  getRegistryValue, getBackupsFilePath, backupRegistryValueBeforeChange,
  setRegistryValue, removeRegistryValue, setRegistryPathValue, removeRegistryPathValue,
  getActiveGpuDevicePath, getCachedGpuName, getCachedGpuVendor
});
`;

let fixedMainRest = newMainContent.replace(/timerResolutionProcess = null/g, 'globalState.timerResolutionProcess = null');
fixedMainRest = fixedMainRest.replace(/timerResolutionProcess\.pid/g, 'globalState.timerResolutionProcess.pid');

fs.writeFileSync(mainPath, fixedMainRest, 'utf8');
console.log("Successfully extracted handlers to electron/handlers/index.js.");
