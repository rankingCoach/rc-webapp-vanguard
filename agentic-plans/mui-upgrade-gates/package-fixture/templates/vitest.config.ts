// Consumer vitest config. No aliases: '@rankingcoach/vanguard' resolves from node_modules via package.json exports.
// SMOKE_FILE is set by run.sh (default.smoke.test.tsx or wp.smoke.test.tsx).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: [`smoke/${process.env.SMOKE_FILE ?? '*.test.tsx'}`],
    setupFiles: ['./smoke/setup.ts'],
    testTimeout: 30_000,
    pool: 'forks',
    fileParallelism: false,
  },
});
