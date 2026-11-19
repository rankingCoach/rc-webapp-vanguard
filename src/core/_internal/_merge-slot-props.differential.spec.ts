import { readFileSync } from 'node:fs';
import path from 'node:path';
import { mergeSlotProps as muiMergeSlotProps } from '@mui/material';
import { describe, expect, it } from 'vitest';
import { mergeSlotProps } from './merge-slot-props';

/** Own mergeSlotProps equals MUI's: objects, functions, classNames, style, sx, composed handlers (call order). */
type Impl = (external: never, defaults: never) => unknown;

const run = (impl: Impl, external: unknown, defaults: unknown) => {
  const calls: string[] = [];
  const ext =
    typeof external === 'object' && external ? { ...external, onClick: () => calls.push('external') } : external;
  const def =
    typeof defaults === 'object' && defaults ? { ...defaults, onClick: () => calls.push('default') } : defaults;
  let out = impl(ext as never, def as never);
  if (typeof out === 'function') out = (out as (o: object) => unknown)({ className: 'owner' });
  const result = out as Record<string, unknown> | undefined;
  (result?.onClick as (() => void) | undefined)?.();
  const { onClick: _o, ...rest } = result ?? {};
  return { rest, calls };
};

describe('mergeSlotProps equals MUI', () => {
  const cases: [string, unknown, unknown][] = [
    ['no external', undefined, { invisible: true }],
    [
      'objects',
      { a: 1, className: 'x', style: { color: 'red' }, sx: { p: 1 } },
      { b: 2, className: 'y', style: { top: 0 }, sx: [{ m: 1 }] },
    ],
    [
      'external function',
      (s: object) => ({ seen: Object.keys(s).sort(), className: 'f' }),
      { invisible: true, className: 'd' },
    ],
    ['default function', { invisible: false }, () => ({ invisible: true, className: 'd' })],
    ['both empty classNames', { className: '' }, { className: '' }],
  ];
  for (const [name, external, defaults] of cases) {
    it(name, () => {
      expect(run(mergeSlotProps as Impl, external, defaults)).toEqual(
        run(muiMergeSlotProps as unknown as Impl, external, defaults),
      );
    });
  }
  it('imports nothing from @mui', () => {
    expect(readFileSync(path.join(__dirname, 'merge-slot-props.ts'), 'utf8')).not.toMatch(/from '@mui/);
  });
});
