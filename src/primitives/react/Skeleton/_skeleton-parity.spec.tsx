import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Skeleton as MuiSkeleton } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

/**
 * Own Skeleton equals MUI's for what Vanguard renders (InputBase loading rows: text variant, pulse, width + height):
 * element, class list (emotion class aside), inline style, children.
 */
const shape = (el: Element) => ({
  tag: el.tagName,
  classes: Array.from(el.classList).filter((c) => !/^css-/.test(c)),
  style: el.getAttribute('style'),
  html: el.innerHTML,
});

describe('Skeleton own core equals MUI', () => {
  const cases: [string, Record<string, unknown>][] = [
    ['16px, 100%', { height: 16, width: '100%' }],
    ['16px, 80%', { height: 16, width: '80%' }],
    ['42px, 100%', { height: 42, width: '100%' }],
    ['no size', {}],
  ];
  for (const [name, props] of cases) {
    it(name, () => {
      const own = render(<Skeleton {...props} />).container.firstElementChild as Element;
      const mui = render(<MuiSkeleton {...props} />).container.firstElementChild as Element;
      expect({ ...shape(own), classes: shape(own).classes }).toEqual(shape(mui));
    });
  }
  it('InputBase renders the own Skeleton (no @mui import left in InputBase.tsx)', () => {
    const src = readFileSync(path.join(__dirname, '../../../core/_internal/InputBase/InputBase.tsx'), 'utf8');
    expect(src).not.toMatch(/from '@mui\//);
  });
});
