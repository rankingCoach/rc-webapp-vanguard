import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Writes the built chunk graph to `.vg-build/module-graph.<outDir>.json` (dist / dist-wordpress) (gitignored, not packed): per output file its
 * module ids (absolute source paths, node_modules included), static imports and dynamic imports. With
 * `preserveModules` the `index-[name].js` file names lose the source path, so gates that must attribute code to a
 * package (e.g. "no @mui/* in the eager graph of any export", plan §36.2 B.3) read this instead of guessing.
 */
export const moduleGraph = (): Plugin => ({
  name: 'vanguard-module-graph',
  apply: 'build',
  generateBundle(options, bundle) {
    const name = path.basename(options.dir ?? 'dist');
    const files: Record<
      string,
      { modules: Record<string, number>; imports: string[]; dynamicImports: string[]; isEntry: boolean }
    > = {};
    for (const [fileName, out] of Object.entries(bundle)) {
      if (out.type !== 'chunk') continue;
      files[fileName] = {
        // module id → rendered bytes in this chunk
        modules: Object.fromEntries(Object.entries(out.modules).map(([id, m]) => [id, m.renderedLength])),
        imports: out.imports,
        dynamicImports: out.dynamicImports,
        isEntry: out.isEntry,
      };
    }
    const dir = path.resolve(__dirname, '..', '.vg-build');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `module-graph.${name}.json`), `${JSON.stringify(files)}\n`);
  },
});
