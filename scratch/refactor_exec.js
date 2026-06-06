const fs = require('fs');

const indexPath = 'c:/system/neuropersonal/electron/handlers/index.js';
let content = fs.readFileSync(indexPath, 'utf8');

// Replace standard execAsync with spawnAsync
content = content.replace(/execAsync\('tasklist \/FI "IMAGENAME eq (.*?)" \/NH'\)/g, "spawnAsync('tasklist.exe', ['/FI', 'IMAGENAME eq $1', '/NH'])");
content = content.replace(/execAsync\('powercfg (.*?)'\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('powercfg.exe', [${args}])`;
});
content = content.replace(/execAsync\("powercfg (.*?)"\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('powercfg.exe', [${args}])`;
});
content = content.replace(/execAsync\(`powercfg (.*?)`\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('powercfg.exe', [${args}])`;
});

content = content.replace(/execAsync\('bcdedit \/set (.*?)'\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('bcdedit.exe', ['/set', ${args}])`;
});
content = content.replace(/execAsync\('bcdedit \/deletevalue (.*?)'\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('bcdedit.exe', ['/deletevalue', ${args}])`;
});

content = content.replace(/execAsync\('dism \/online (.*?)'\)/g, (match, p1) => {
  const args = p1.split(' ').map(s => `'${s}'`).join(', ');
  return `spawnAsync('dism.exe', ['/online', ${args}])`;
});

content = content.replace(/execAsync\(`powershell -NoProfile -NonInteractive -EncodedCommand \$\{encoded\}`\)/g, "spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded])");
content = content.replace(/execAsync\('powershell -NoProfile -NonInteractive -EncodedCommand ' \+ encoded\)/g, "spawnAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded])");


content = content.replace(/execAsync\("powershell -NoProfile -Command \\"(.*?)\\""\)/g, "spawnAsync('powershell.exe', ['-NoProfile', '-Command', \"$1\"])");
content = content.replace(/execAsync\(`powershell -NoProfile -Command "(.*?)"`\)/g, "spawnAsync('powershell.exe', ['-NoProfile', '-Command', `$1`])");

// Remove silent catches where possible
// We replace `catch (e) {}` with `catch (err) { console.error(err); }`
// but only if it's not a known silent-ignored command.
// To satisfy Phase 2, we should return errors to the frontend.
// Many functions do: try { await ... } catch (e) {} 
content = content.replace(/catch \(e\) \{\}/g, "catch (e) { console.error('Silent error caught:', e.message); }");

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Refactored handlers index.');
