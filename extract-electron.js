const extract = require('extract-zip');
const path = require('path');
const fs = require('fs');

const zip = 'C:\\Users\\kuyag\\AppData\\Local\\electron\\Cache\\c7598f1e2f35689bbd0768f4316ec382c1041e515bcf47cd5e0c98fb13698835\\electron-v42.2.0-win32-x64.zip';
const dist = path.join(process.cwd(), 'node_modules', 'electron', 'dist');

console.log('Verifying zip exists:', fs.existsSync(zip));
console.log('Extracting to:', dist);

extract(zip, { dir: dist })
  .then(() => {
    console.log('Extraction success!');
    fs.writeFileSync(path.join(process.cwd(), 'node_modules', 'electron', 'path.txt'), 'electron.exe');
    console.log('Wrote path.txt');
  })
  .catch((err) => {
    console.error('Extraction failed:', err);
  });
