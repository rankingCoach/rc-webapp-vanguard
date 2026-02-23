const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '../src/index.ts');
const META_DIR = path.join(__dirname, '../src/exports-meta');

function parseExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const exports = new Set();

  // Regex to match "export { A, B, C } from ..." or "export { A } from ..."
  const namedExportRegex = /export\s+\{\s*([^}]+)\s*\}\s+from/g;
  // Regex to match "export const x = ..." or "export function x() ..." or "export class x ..."
  const inlineExportRegex = /export\s+(const|function|class|let|var)\s+([a-zA-Z0-9_$]+)/g;

  lines.forEach((line) => {
    // Skip type exports
    if (line.trim().startsWith('export type')) return;
    if (line.trim().startsWith('export interface')) return;

    // Handle named exports: export { A, B } from '...'
    let match;
    while ((match = namedExportRegex.exec(line)) !== null) {
      const items = match[1].split(',').map((i) => i.trim().split(/\s+as\s+/)[0]);
      items.forEach((item) => {
        if (item && item !== 'type') {
          exports.add(item);
        }
      });
    }
    namedExportRegex.lastIndex = 0; // Reset for next line

    // Handle inline exports: export const X = ...
    while ((match = inlineExportRegex.exec(line)) !== null) {
      exports.add(match[2]);
    }
    inlineExportRegex.lastIndex = 0;
  });

  return Array.from(exports);
}

function isConstantOrEnum(name) {
  // Heuristic: Constants and Enums are often ALL_CAPS or PascalCase plural/descriptors
  // But many components are also PascalCase.
  // Known exclusions from common patterns:
  const exclusions = [
    'FontWeights',
    'TextTypes',
    'ButtonSizes',
    'ButtonTypes',
    'IconNames',
    'IconSize',
    'AIOrbSize',
    'AIOrbStatus',
    'AvatarIconMap',
    'AvatarSize',
    'CreditCardType',
    'ContentType',
    'GALLERY_PHOTO_SCOPE',
    'POST_VIDEO_VALIDATION_REQUIREMENTS',
    'HeaderTypes',
    'TagType',
  ];

  if (exclusions.includes(name)) return true;

  // If it's ALL_CAPS, it's likely a constant
  if (name === name.toUpperCase() && name !== name.toLowerCase() && name.length > 1) return true;

  return false;
}

function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`Error: ${INDEX_PATH} not found.`);
    process.exit(1);
  }

  const allExports = parseExports(INDEX_PATH);
  const filteredExports = allExports.filter((name) => !isConstantOrEnum(name));

  const metaFiles = new Set(
    fs.existsSync(META_DIR) ? fs.readdirSync(META_DIR).map((f) => path.basename(f, '.json')) : [],
  );

  const missing = [];
  const covered = [];

  filteredExports.forEach((name) => {
    if (metaFiles.has(name)) {
      covered.push(name);
    } else {
      missing.push(name);
    }
  });

  const total = filteredExports.length;
  const coveredCount = covered.length;
  const coveragePercent = total > 0 ? ((coveredCount / total) * 100).toFixed(2) : 0;

  console.log('--- Vanguard Meta Coverage Report ---');
  console.log(`Total items identified: ${total}`);
  console.log(`Items with meta files:  ${coveredCount}`);
  console.log(`Coverage:               ${coveragePercent}%`);
  console.log('------------------------------------');

  if (missing.length > 0) {
    console.log('\nMissing Meta Files:');
    missing.sort().forEach((name) => console.log(`- ${name}`));
  } else {
    console.log('\nAll identified items have meta files!');
  }
}

main();
