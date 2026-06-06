const fs = require('fs');
const path = require('path');

const dir = 'c:/system/neuropersonal/src/components';
const files = ['ValorantOptimizer.jsx', 'ConfirmModal.jsx', 'Toast.jsx', 'Spinner.jsx', 'ErrorBoundary.jsx'];

const replacements = [
  [/bg-paper-muted/g, 'bg-[#141414]'],
  [/bg-paper-bg/g, 'bg-[#0a0a0a]'],
  [/text-pencil-black\/([0-9]+)/g, (match, p1) => {
    const opacity = parseInt(p1, 10);
    if (opacity > 70) return 'text-gray-300';
    if (opacity > 40) return 'text-gray-400';
    return 'text-gray-500';
  }],
  [/text-pencil-black/g, 'text-gray-200'],
  [/border-pencil-black\/([0-9]+)/g, 'border-[#3f3f46]'],
  [/border-pencil-black/g, 'border-[#262626]'],
  [/border-\[3px\] border-\[#262626\]/g, 'border border-[#262626]'],
  [/border-2 border-\[#262626\]/g, 'border border-[#262626]'],
  [/border-\[3px\]/g, 'border'],
  [/border-2/g, 'border'],
  [/wobbly-md/g, 'rounded-lg'],
  [/wobbly-sm/g, 'rounded-md'],
  [/wobbly/g, 'rounded-lg'],
  [/bg-\[#fff9c4\]/g, 'bg-[#262626]'],
  [/bg-\[#fff7b1\]/g, 'bg-[#3f3f46]'],
  [/font-kalam/g, 'font-outfit'],
  [/font-patrick/g, 'font-inter'],
  [/hand-shadow-sm/g, 'shadow-sm'],
  [/hand-shadow-lg/g, 'shadow-lg'],
  [/hand-shadow/g, 'shadow-md'],
  [/paper-texture/g, ''],
  [/text-accent-blue/g, 'text-[#3b82f6]'],
  [/bg-accent-blue/g, 'bg-[#3b82f6]'],
  [/border-accent-blue/g, 'border-[#3b82f6]'],
  [/text-accent-red/g, 'text-[#ff4655]'],
  [/bg-accent-red/g, 'bg-[#ff4655]'],
  [/border-accent-red/g, 'border-[#ff4655]'],
  [/hover:text-white hover:rotate-12 active:scale-95/g, 'hover:text-white transition-all'],
  [/hover:-rotate-6 active:scale-95/g, 'transition-all'],
  [/hover:rotate-6 active:scale-95/g, 'transition-all'],
  [/\btranslate-x-\[2px\] translate-y-\[2px\]\b/g, 'scale-95'],
  [/\bactive:translate-x-\[2px\] active:translate-y-\[2px\] active:shadow-none\b/g, 'active:scale-95'],
  [/\bactive:translate-x-\[4px\] active:translate-y-\[4px\] active:shadow-none\b/g, 'active:scale-95'],
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  // Custom class cleanups
  content = content.replace(/className="(.*?)"/g, (match, classes) => {
    // Remove extra spaces
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
