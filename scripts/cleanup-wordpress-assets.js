const fs = require('fs');
const path = require('path');

// Load additional keep patterns from config
let additionalKeepPatterns = [];
try {
  const configPath = path.resolve(__dirname, '../wordpress-cleanup-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    additionalKeepPatterns = config.additionalKeepPatterns || [];
  }
} catch (error) {
  console.warn('Warning: Could not load wordpress-cleanup-config.json:', error.message);
}

// Clean dist-wordpress to keep only essential files for WordPress build
const keepPatterns = ['index.js', 'THIRD_PARTY_NOTICES.txt']; // licence notices of the bundled packages (MIT)
const keepDirPatterns = ['types'];

function shouldKeep(filePath) {
  const relativePath = path.relative('dist-wordpress', filePath);
  const fileName = path.basename(filePath);

  if (keepPatterns.includes(fileName)) return true;
  if (keepDirPatterns.includes(fileName) && fs.statSync(filePath).isDirectory()) return true;
  if (/^(icon-|QuoteMarks-).*\.mjs$/i.test(fileName) || /^loading-[^-]+\.mjs$/i.test(fileName) || /^vanguard.*\.css$/i.test(fileName)) return true;

  // Check additional patterns from config
  for (const pattern of additionalKeepPatterns) {
    if (new RegExp(pattern.replace(/\*/g, '.*'), 'i').test(fileName)) {
      return true;
    }
  }

  // Keep everything inside types directory
  if (relativePath.startsWith('types/')) return true;
  return false;
}

function cleanupWordPressDist(dir) {
  let removedCount = 0;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Recursively clean subdirectories
      removedCount += cleanupWordPressDist(fullPath);
      // If directory becomes empty and not kept, remove it
      try {
        const remaining = fs.readdirSync(fullPath);
        if (remaining.length === 0 && !shouldKeep(fullPath)) {
          fs.rmdirSync(fullPath);
          console.log('Removed empty directory:', fullPath);
        }
      } catch (e) {
        // Directory not empty or error, keep it
      }
    } else {
      if (!shouldKeep(fullPath)) {
        fs.unlinkSync(fullPath);
        removedCount++;
        console.log('Removed file:', fullPath);
      }
    }
  }
  return removedCount;
}

const removedCount = cleanupWordPressDist('dist-wordpress');
console.log(`Removed ${removedCount} files from dist-wordpress, keeping only essential files`);
