import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

// Agent worktrees and evidence copies under .claude/ hold stale duplicates of the suites; never collect them.
const staleCopies = ['.claude/**', '.kilocode/**', 'out/**', 'agentic-plans/**', 'storybook-static/**', 'dist/**', 'dist-wordpress/**'];

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
    coverage: { exclude: [...coverageConfigDefaults.exclude, ...staleCopies] },
    projects: [
      {
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/_*.spec.ts'],
          exclude: [...configDefaults.exclude, ...staleCopies],
        },
      },
      {
        extends: true,
        // Prebundle these dependencies before the first story: mid-run discovery reloads the browser runner.
        optimizeDeps: {
          include: [
            'react/jsx-dev-runtime',
            '@emotion/react',
            '@mui/material/ButtonBase',
            '@mui/material/FormControl',
            '@mui/material/InputAdornment',
            '@mui/material/Modal',
            '@mui/material/Popper',
            '@mui/material/useAutocomplete',
            '@mui/system/RtlProvider',
            '@mui/x-date-pickers/DateCalendar',
            '@mui/x-date-pickers/LocalizationProvider',
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
          exclude: [...configDefaults.exclude, ...staleCopies],
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
          // Own-core components paint with plain SCSS (no runtime CSS-in-JS), so jsdom must see those sheets for
          // the computed-style characterization tests. Scoped to migrated code; grow it per migrated component.
          css: { include: [/src\/styles\/mui-compat\.scss/, /src\/primitives\//, /src\/core\/ToggleButton(Group)?\//, /src\/core\/_internal\/InputBase\//] },
          include: ['**/_*.spec.{ts,tsx}'],
          exclude: [...configDefaults.exclude, 'scripts/**', ...staleCopies],
          setupFiles: ['src/test-utils/vitest.setup.tsx'],
        },
      },
    ],
  },
});
