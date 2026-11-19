import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Watchdog D10: `"sideEffects": false` also marks the stylesheet side-effect-free, so a bundler other than Vite may
 * drop `import '@rankingcoach/vanguard/style.css'`. CSS stays side-effectful, JS stays tree-shakable. Matching follows
 * webpack: a pattern without a slash matches the basename, otherwise the package-relative path.
 */
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { sideEffects: unknown };

const hasSideEffects = (file: string) => {
  const se = pkg.sideEffects;
  if (se === false) return false;
  if (!Array.isArray(se)) return true;
  return se.some((pattern: string) =>
    pattern.includes('/') ? path.matchesGlob(file, pattern) : path.matchesGlob(path.basename(file), pattern),
  );
};

describe('package.json sideEffects', () => {
  it('keeps every shipped stylesheet side-effectful', () => {
    for (const css of ['dist/vanguard.css', 'dist-wordpress/vanguard.css', 'dist/assets/x.css'])
      expect({ css, side: hasSideEffects(css) }).toEqual({ css, side: true });
  });

  it('keeps JS entries tree-shakable', () => {
    for (const js of ['dist/index.js', 'dist-wordpress/index.js', 'dist/chunks/Button-abc.js'])
      expect({ js, side: hasSideEffects(js) }).toEqual({ js, side: false });
  });
});
