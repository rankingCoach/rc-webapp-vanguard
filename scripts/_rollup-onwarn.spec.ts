import { resolve } from 'node:path';
import type { RollupLog } from 'rollup';
import { expect, test, vi } from 'vitest';
import { withBundledUseClientFilter } from '../config/rollup-onwarn';

const dependencyWarning: RollupLog = {
  code: 'MODULE_LEVEL_DIRECTIVE',
  message: 'Module level directives cause errors when bundled, "use client" was ignored.',
  id: resolve('node_modules/@mui/material/Button/Button.mjs'),
};

test('drops only dependency use-client module directives', () => {
  const warn = vi.fn();
  withBundledUseClientFilter()(dependencyWarning, warn);
  expect(warn).not.toHaveBeenCalled();
});

test('resolves a relative node_modules module id before filtering', () => {
  const warn = vi.fn();
  withBundledUseClientFilter()({ ...dependencyWarning, id: 'node_modules/@mui/example.mjs' }, warn);
  expect(warn).not.toHaveBeenCalled();
});

for (const [name, override] of [
  ['source use-client directive', { id: resolve('src/example.tsx') }],
  ['dependency use-server directive', { message: '"use server" was ignored.' }],
  ['dependency use-strict directive', { message: '"use strict" was ignored.' }],
  ['different warning code', { code: 'OTHER_WARNING' }],
  ['warning without a module id', { id: undefined }],
  ['virtual module id', { id: '\0virtual/node_modules/example.mjs' }],
] satisfies [string, Partial<RollupLog>][]) {
  test(`forwards ${name} unchanged`, () => {
    const warn = vi.fn();
    const warning = { ...dependencyWarning, ...override };
    withBundledUseClientFilter()(warning, warn);
    expect(warn).toHaveBeenCalledExactlyOnceWith(warning);
    expect(warn.mock.calls[0][0]).toBe(warning);
  });
}

test('composes with an existing handler without forwarding suppressed warnings', () => {
  const warn = vi.fn();
  const previous = vi.fn((warning: RollupLog, next: (warning: RollupLog) => void) => {
    if (!warning.message.includes('use-dynamic-import')) next(warning);
  });
  const handler = withBundledUseClientFilter(previous);
  handler(dependencyWarning, warn);
  expect(previous).not.toHaveBeenCalled();
  const existingSuppression = { ...dependencyWarning, code: 'OTHER', message: 'use-dynamic-import' };
  handler(existingSuppression, warn);
  expect(previous).toHaveBeenCalledExactlyOnceWith(existingSuppression, warn);
  expect(warn).not.toHaveBeenCalled();
  const ordinary = { ...dependencyWarning, id: resolve('src/component.tsx') };
  handler(ordinary, warn);
  expect(previous).toHaveBeenLastCalledWith(ordinary, warn);
  expect(warn).toHaveBeenCalledExactlyOnceWith(ordinary);
});

for (const [name, id, dropped] of [
  ['MUI dependency', resolve('node_modules/@mui/material/Tabs/Tabs.mjs'), true],
  ['source module', resolve('src/component.tsx'), false],
  ['another dependency', resolve('node_modules/another-package/index.mjs'), false],
] satisfies [string, string, boolean][]) {
  test(`filters invalid annotations only for a ${name}`, () => {
    const warn = vi.fn();
    const warning: RollupLog = { code: 'INVALID_ANNOTATION', id, message: 'A comment contains an annotation that Rollup cannot interpret.' };
    withBundledUseClientFilter()(warning, warn);
    if (dropped) expect(warn).not.toHaveBeenCalled();
    else {
      expect(warn).toHaveBeenCalledExactlyOnceWith(warning);
      expect(warn.mock.calls[0][0]).toBe(warning);
    }
  });
}
