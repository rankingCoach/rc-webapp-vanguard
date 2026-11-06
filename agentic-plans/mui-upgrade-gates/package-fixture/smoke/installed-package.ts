/**
 * Facts about the INSTALLED package, read from node_modules (no source aliases). Used to prove the smoke ran
 * against the packed tarball and the expected bundle.
 * Note: `@rankingcoach/vanguard/package.json` is NOT in the exports map, so resolve the entry and walk up.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const findRoot = (file: string): string => {
  let dir = path.dirname(file);
  while (!fs.existsSync(path.join(dir, 'package.json'))) dir = path.dirname(dir);
  return dir;
};

export const entryFile = require.resolve('@rankingcoach/vanguard');
export const packageRoot = findRoot(entryFile);
export const isFromNodeModules = packageRoot.split(path.sep).includes('node_modules');
/** The WP bundle is a single dist/index.js; the default build has one file per module (dist/index-Button.js ...). */
export const installedBundle = fs.existsSync(path.join(packageRoot, 'dist', 'index-Button.js')) ? 'default' : 'wordpress';
