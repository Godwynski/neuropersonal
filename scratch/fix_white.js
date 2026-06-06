const fs = require('fs');
const path = require('path');

const dir = 'c:/system/neuropersonal/src/components';
const files = fs.readdirSync(dir);

const replacements = [
  [/\bbg-white\b/g, 'bg-[#0a0a0a]'],
  [/\bbg-gray-50\b/g, 'bg-[#141414]'],
  [/\bbg-gray-100\b/g, 'bg-[#262626]'],
  [/\bbg-green-50\b/g, 'bg-[#3b82f6]/10'],
  [/\bbg-red-50\b/g, 'bg-[#ff4655]/10'],
  [/\bborder-gray-200\b/g, 'border-[#262626]'],
  [/\bborder-gray-300\b/g, 'border-[#3f3f46]'],
  [/\btext-gray-600\b/g, 'text-gray-400'],
  [/\btext-gray-700\b/g, 'text-gray-300'],
  [/\btext-gray-800\b/g, 'text-gray-200'],
  [/\btext-gray-900\b/g, 'text-white'],
];

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(([regex, replacement]) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
