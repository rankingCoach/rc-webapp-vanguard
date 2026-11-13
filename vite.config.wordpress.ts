import { withBundledUseClientFilter } from './config/rollup-onwarn';
import { resolve, sep } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import ts from 'typescript5';

import { BaseViteConfig } from './vite.config.lib';

/**
 * Source files reachable from the WordPress entry, resolved by the TypeScript compiler itself (path aliases,
 * explicit `.tsx` extensions and index files included), so every module index.d.ts re-exports gets a declaration.
 */
export function collectDeclarationSources(entryFile: string, tsconfigPath: string): string[] {
  const parsed = ts.getParsedCommandLineOfConfigFile(tsconfigPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  const program = ts.createProgram([entryFile], { ...parsed!.options, noEmit: true });
  const sourceRoot = resolve(__dirname, 'src') + sep;
  return program
    .getSourceFiles()
    .map((file) => resolve(file.fileName))
    .filter((file) => file.startsWith(sourceRoot) && !file.endsWith('.d.ts'));
}

const ENTRY = resolve(__dirname, 'src/index-wordpress.ts');
const TSCONFIG = resolve(__dirname, './tsconfig.dts.json');
const includedFiles = collectDeclarationSources(ENTRY, TSCONFIG);

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
        tsconfigPath: TSCONFIG,
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
