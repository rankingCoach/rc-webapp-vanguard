import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ProgressBar, ProgressBarProps } from './ProgressBar';
import { ProgressBarMui } from './ProgressBarMui';

/**
 * Track g: ProgressBar's own determinate/indeterminate markup vs the former MUI LinearProgress path, same props.
 * Elements, Mui* classes (emotion `css-*` dropped), attributes (own-core markers dropped)
 * and the bar's inline transform must match.
 */
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-variant', 'style']);
const walk = (el: Element): unknown => ({
  tag: el.tagName,
  classes: (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c)),
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  transform: (el as HTMLElement).style?.transform ?? '',
  children: Array.from(el.children).map(walk),
});

const cases: Record<string, ProgressBarProps> = {
  'default (determinate, no value)': {},
  'value 30': { progressValue: 30 },
  'value 0': { progressValue: 0 },
  'value 100': { progressValue: 100 },
  'fractional 33.3': { progressValue: 33.3 },
  'explicit determinate + className': { variant: 'determinate', progressValue: 50, className: 'mine' },
  indeterminate: { variant: 'indeterminate' },
  'indeterminate with value (ignored)': { variant: 'indeterminate', progressValue: 40 },
  blurred: { progressValue: 30, isBlurred: true },
  'colors and size': { progressValue: 60, color: '--s500', bgColor: '--n100', height: '8px', width: '50%' },
};

describe('ProgressBar parity: own vs MUI path', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(name, () => {
      const own = render(<ProgressBar {...props} />);
      const mui = render(<ProgressBarMui {...props} />);
      expect(walk(own.container.firstElementChild as Element)).toEqual(walk(mui.container.firstElementChild as Element));
      own.unmount();
      mui.unmount();
    });
  }
});
