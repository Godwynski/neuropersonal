const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('c:/system/neuropersonal/src/components/ValorantOptimizer.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log("No syntax errors found by Babel.");
} catch (e) {
  console.error("Syntax Error:", e.message);
}
