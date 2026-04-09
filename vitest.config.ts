import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@storybook/jest': 'vitest',
      // More specific aliases should come first
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
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          testTimeout: 30000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'spec',
          environment: 'jsdom',
          include: ['**/_*.spec.{ts,tsx}'],
          setupFiles: ['src/test-utils/vitest.setup.tsx'],
        },
      },
    ],
  },
});
