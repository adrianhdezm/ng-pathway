const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'templates');
const destDir = path.join(__dirname, '..', 'lib', 'templates');
const filePattern = '*.hbs';

// Check if the destination directory exists, and create it if it doesn't
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (process.platform === 'win32') {
  // Windows
  const command = `copy "${srcDir}\\${filePattern}" "${destDir}"`;
  require('child_process').execSync(command);
} else {
  // Unix-based systems
  const command = `cp ${srcDir}/${filePattern} ${destDir}`;
  require('child_process').execSync(command);
}
