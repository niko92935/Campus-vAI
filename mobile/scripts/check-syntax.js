const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const roots = [path.join(__dirname, '..', 'App.js'), path.join(__dirname, '..', 'index.js')];
const srcDir = path.join(__dirname, '..', 'src');

function collect(dir, output) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, output);
    else if (entry.name.endsWith('.js')) output.push(full);
  }
}

collect(srcDir, roots);

let failed = false;
for (const file of roots) {
  try {
    parser.parse(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      plugins: ['jsx'],
    });
    console.log(`OK   ${path.relative(path.join(__dirname, '..'), file)}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${path.relative(path.join(__dirname, '..'), file)}`);
    console.error(`     ${error.message}`);
  }
}

if (failed) process.exit(1);
