const fs = require('fs');
const { execSync } = require('child_process');

// Get total commit count
const commitCount = execSync('git rev-list --count HEAD').toString().trim();
const version = `v0.0.${commitCount}`;

// Read index.html
const indexPath = './index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Replace version
html = html.replace(
  /<div id="version-indicator">v\d+\.\d+\.\d+<\/div>/,
  `<div id="version-indicator">${version}</div>`
);

// Write back
fs.writeFileSync(indexPath, html, 'utf8');

console.log(`✓ Version updated to ${version}`);
