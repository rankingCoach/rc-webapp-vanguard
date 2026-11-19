#!/usr/bin/env node
/**
 * WordPress output integrity: every `import("./x.mjs")` in dist-wordpress/index.js (and in the chunks it reaches)
 * must name a file that exists after scripts/cleanup-wordpress-assets.js ran. A missing target means a lazy route the
 * WordPress plugin can never load (found 2026-11-19: lazy MUI fallback chunks were deleted by the cleanup).
 *
 * Usage: node scripts/check-wordpress-dynamic-imports.mjs [dir]   (default dist-wordpress)
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'dist-wordpress');
const seen = new Set();
const missing = [];
const visit = (file) => {
  if (seen.has(file)) return;
  seen.add(file);
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const m of src.matchAll(/import\(\s*["']\.\/([^"']+)["']\s*\)/g)) {
    const target = m[1];
    if (!fs.existsSync(path.join(dir, target))) missing.push(`${file} → ${target}`);
    else if (/\.m?js$/.test(target)) visit(target);
  }
  for (const m of src.matchAll(/(?:^|[;\n])\s*import[^'"()]*["']\.\/([^"']+\.m?js)["']/g)) {
    if (!fs.existsSync(path.join(dir, m[1]))) missing.push(`${file} → ${m[1]} (static)`);
    else visit(m[1]);
  }
};
visit('index.js');
console.log(`wordpress dynamic imports: ${seen.size} files reached, ${missing.length} missing targets`);
for (const m of missing.slice(0, 20)) console.log(`  MISSING ${m}`);
process.exit(missing.length ? 1 : 0);
