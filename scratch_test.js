const path = require('path');
const fs = require('fs');
const os = require('os');

function saveGameUserSettings(filePath, newSettings) {
  const normalizedPath = path.normalize(filePath);
  const localAppData = path.normalize(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'));
  
  // To avoid case sensitivity issues on windows, do case insensitive startsWith check
  if (!normalizedPath.toLowerCase().startsWith(localAppData.toLowerCase())) {
    throw new Error(`Unsafe file path rejected: ${normalizedPath} vs ${localAppData}`);
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
  console.log("SUCCESS!");
}

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const testFile = path.join(localAppData, 'VALORANT', 'Saved', 'Config', '12345', 'Windows', 'GameUserSettings.ini');
fs.mkdirSync(path.dirname(testFile), { recursive: true });
fs.writeFileSync(testFile, `[/Script/Engine.GameUserSettings]
bUseVSync=True
[ScalabilityGroups]
sg.TextureQuality=1
`, 'utf8');

saveGameUserSettings(testFile, { vsync: false, textureQuality: 0 });
console.log(fs.readFileSync(testFile, 'utf8'));
