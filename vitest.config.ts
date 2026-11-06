import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config';
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
    // Evidence copies are never product code or tests, regardless of .gitignore.
    coverage: { exclude: [...coverageConfigDefaults.exclude, 'out/**', 'agentic-plans/**'] },
    projects: [
      {
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/_*.spec.ts'],
        },
      },
      {
        extends: true,
        // Prebundle the dev JSX runtime before tests: discovering it mid-run reloads the browser runner.
        optimizeDeps: {
          include: [
            'react/jsx-dev-runtime',
            '@mui/x-date-pickers/PickersLayout',
            '@mui/x-date-pickers/DateField',
            '@mui/x-date-pickers/dateViewRenderers',
          ],
        },
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          exclude: [...configDefaults.exclude, 'out/**', 'agentic-plans/**'],
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
          exclude: [...configDefaults.exclude, 'scripts/**', 'out/**', 'agentic-plans/**'],
          setupFiles: ['src/test-utils/vitest.setup.tsx'],
        },
      },
    ],
  },
});
