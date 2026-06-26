const path = require('path');
const { app } = require('electron');
const fs = require('fs');
const { runPs, getCachedGpuName } = require('./powershell');

function sanitizeRegistryKey(keyPath) {
  if (typeof keyPath !== 'string') return null;
  if (!/^(HKLM|HKCU|HKCR|HKU|HKCC):\\/i.test(keyPath)) return null;
  if (/[`"$[\];|&<>]/.test(keyPath)) return null;
  return keyPath;
}

function sanitizeRegistryValueName(valueName) {
  if (typeof valueName !== 'string') return null;
  if (!/^[\w\s.\-]+$/.test(valueName)) return null;
  return valueName;
}

function sanitizeRegistryValueNameOrPath(valueName) {
  if (typeof valueName !== 'string') return null;
  if (!/^[\w\s.\-\\/:()]+$/.test(valueName)) return null;
  if (/[`"${}[\];|&<>]/.test(valueName)) return null;
  return valueName;
}

async function getRegistryValue(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) return '';
  try {
    const script = `(Get-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -ErrorAction SilentlyContinue).${safeVal}`;
    return await runPs(script);
  } catch (err) {
    return '';
  }
}

async function getRegistryValueAndType(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) return null;
  try {
    const script = `
$val = (Get-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -ErrorAction SilentlyContinue).${safeVal}
if ($null -ne $val) {
  $type = (Get-Item -Path '${safeKey}').GetValueKind('${safeVal}')
  @{ value = $val; type = $type.ToString() } | ConvertTo-Json -Compress
} else {
  ""
}`;
    const out = await runPs(script);
    if (out) {
      try {
        return JSON.parse(out);
      } catch (e) {}
    }
    return null;
  } catch (err) {
    return null;
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

async function backupRegistryValueBeforeChange(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) return;
  try {
    const original = await getRegistryValueAndType(safeKey, safeVal);
    if (!original) return;

    const p = getBackupsFilePath();
    let backups = [];
    if (fs.existsSync(p)) {
      try { backups = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) {}
    }

    const exists = backups.some(b => b.keyPath.toLowerCase() === safeKey.toLowerCase() && b.valueName.toLowerCase() === safeVal.toLowerCase());
    if (!exists) {
      backups.push({
        keyPath: safeKey,
        valueName: safeVal,
        value: original.value,
        type: original.type,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(p, JSON.stringify(backups, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Backup failed:', err.message);
  }
}

async function setRegistryValue(keyPath, valueName, value, type = 'DWord') {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) throw new Error(`Unsafe registry path or value name rejected: ${keyPath} / ${valueName}`);
  await backupRegistryValueBeforeChange(safeKey, safeVal);
  const script = `if (-not (Test-Path '${safeKey}')) { New-Item -Path '${safeKey}' -Force | Out-Null }; Set-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Value ${value} -Type ${type} -Force -ErrorAction Stop`;
  await runPs(script);
}

async function removeRegistryValue(keyPath, valueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safeVal = sanitizeRegistryValueName(valueName);
  if (!safeKey || !safeVal) throw new Error(`Unsafe registry path or value name rejected: ${keyPath} / ${valueName}`);
  await backupRegistryValueBeforeChange(safeKey, safeVal);
  const script = `Remove-ItemProperty -Path '${safeKey}' -Name '${safeVal}' -Force -ErrorAction SilentlyContinue`;
  await runPs(script);
}

async function setRegistryPathValue(keyPath, pathValueName, value, type = 'String') {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safePath = sanitizeRegistryValueNameOrPath(pathValueName);
  if (!safeKey || !safePath) throw new Error(`Unsafe registry path or value name rejected: ${keyPath} / ${pathValueName}`);
  const script = `if (-not (Test-Path '${safeKey}')) { New-Item -Path '${safeKey}' -Force | Out-Null }; Set-ItemProperty -Path '${safeKey}' -Name '${safePath}' -Value ${value} -Type ${type} -Force -ErrorAction Stop`;
  await runPs(script);
}

async function removeRegistryPathValue(keyPath, pathValueName) {
  const safeKey = sanitizeRegistryKey(keyPath);
  const safePath = sanitizeRegistryValueNameOrPath(pathValueName);
  if (!safeKey || !safePath) throw new Error(`Unsafe registry path rejected`);
  const script = `Remove-ItemProperty -Path '${safeKey}' -Name '${safePath}' -Force -ErrorAction SilentlyContinue`;
  await runPs(script);
}

async function getActiveGpuDevicePath() {
  try {
    const gpuName = await getCachedGpuName();
    const classPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';
    const script = `Get-ChildItem '${classPath}' -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DriverDesc -eq '${gpuName.replace(/'/g, "''")}' } | Select-Object -ExpandProperty PSChildName`;
    const childName = await runPs(script);
    if (childName) {
      return `${classPath}\\${childName}`;
    }
  } catch (e) {
    console.error('Error resolving GPU registry path:', e.message);
  }
  return 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000';
}

module.exports = {
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
};
