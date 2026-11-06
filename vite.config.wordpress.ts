import { withBundledUseClientFilter } from './config/rollup-onwarn';
import { resolve, dirname } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import fs from 'fs';

import { BaseViteConfig } from './vite.config.lib';

// helper: collect imported files recursively from entry
function collectImports(entryFile, collected = new Set()) {
  if (!fs.existsSync(entryFile) || collected.has(entryFile)) return collected;
  collected.add(entryFile);

  const content = fs.readFileSync(entryFile, 'utf-8');
  const importRegex = /from ["'](\..+?)["']/g;
  let match;

  while ((match = importRegex.exec(content))) {
    const resolved = resolve(dirname(entryFile), `${match[1]}.ts`);
    const resolvedTsx = resolve(dirname(entryFile), `${match[1]}.tsx`);
    const resolvedIndex = resolve(dirname(entryFile), `${match[1]}/index.ts`);
    const resolvedIndexTsx = resolve(dirname(entryFile), `${match[1]}/index.tsx`);

    if (fs.existsSync(resolved)) collectImports(resolved, collected);
    else if (fs.existsSync(resolvedTsx)) collectImports(resolvedTsx, collected);
    else if (fs.existsSync(resolvedIndex)) collectImports(resolvedIndex, collected);
    else if (fs.existsSync(resolvedIndexTsx)) collectImports(resolvedIndexTsx, collected);
  }

  return collected;
}

const ENTRY = resolve(__dirname, 'src/index-wordpress.ts');
const includedFiles = Array.from(collectImports(ENTRY));

export default defineConfig(
  mergeConfig(BaseViteConfig, {
    publicDir: false,  // Exclude assets for WordPress build
    define: {
      'import.meta.env.WORDPRESS_BUILD': true,
    },
    build: {
      outDir: 'dist-wordpress',
      lib: {
        entry: ENTRY,
        name: 'index',
        fileName: () => 'index.js',
      },
      rollupOptions: {
        onwarn: withBundledUseClientFilter(BaseViteConfig.build?.rollupOptions?.onwarn),
        output: {
          preserveModules: false,
          entryFileNames: 'index.js',
        },
      },
    },
    plugins: [
      // Plugin to exclude all dynamic assets from WordPress build since they are not used
      {
        name: 'exclude-unused-assets',
        load(id) {
          if (id.includes('assets/index.ts')) {
            // Return empty module for WordPress build
            return 'export {};';
          }
        }
      },
      dts({
        entryRoot: 'src',
        include: includedFiles, // only imported files from entry
        outDir: 'dist-wordpress/types',
        insertTypesEntry: true,
        tsconfigPath: resolve(__dirname, './tsconfig.lib.json'),
        compilerOptions: { declarationMap: false },
        rollupTypes: false, // preserve folder structure
        beforeWriteFile: (filePath, content) => {
          if (filePath.endsWith('index-wordpress.d.ts')) {
            filePath = filePath.replace('index-wordpress.d.ts', 'index.d.ts');
          }
          return { filePath, content };
        },
      }),
    ],
  }),
);
