import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Standalone perf config. NOT included in default `npm test`.
// Run via `npm run test:perf`. Generates PERF_RANKING.md at repo root.
export default defineConfig({
  resolve: {
    alias: {
      '@test-utils/get-storybook-decorator': path.resolve(dirname, 'src/test-utils/get-storybook-decorator.tsx'),
      '@test-utils/test-utils': path.resolve(dirname, 'test-utils/test-utils.tsx'),
      '@test-utils': path.resolve(dirname, 'src/test-utils'),
      '@common': path.resolve(dirname, 'src/common'),
      '@models': path.resolve(dirname, 'src/models'),
      '@services': path.resolve(dirname, 'src/services'),
      '@stores': path.resolve(dirname, 'src/stores'),
      '@redux-stores': path.resolve(dirname, 'src/stores'),
      '@helpers': path.resolve(dirname, 'src/helpers'),
      '@vanguard': path.resolve(dirname, 'src/core'),
      '@config': path.resolve(dirname, 'config'),
      '@custom-hooks': path.resolve(dirname, 'src/custom-hooks'),
      '@styles': path.resolve(dirname, 'src/styles'),
      '@globalStyles.module.scss': path.resolve(dirname, 'src/styles/general.module.scss'),
      '@globalStyles': path.resolve(dirname, 'src/styles/general.module.tsx'),
    },
  },
  test: {
    name: 'perf',
    environment: 'jsdom',
    include: ['**/*.perf.spec.{ts,tsx}'],
    setupFiles: ['src/test-utils/perf-setup.ts', 'src/test-utils/vitest.setup.tsx'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    isolate: false,
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
