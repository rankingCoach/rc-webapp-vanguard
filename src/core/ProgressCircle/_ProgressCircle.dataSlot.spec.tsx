import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ProgressCircle } from './ProgressCircle';

describe('ProgressCircle data-slot contract', () => {
  it('slots the consumer root and the SVG, track, value and label parts', () => {
    const { container } = render(<ProgressCircle size={80} progress={50} className={'mine'} />);
    const root = container.querySelector('[data-slot="progress-circle"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('mine')).toBe(true);
    for (const [slot, tag] of [['svg', 'svg'], ['track', 'circle'], ['value', 'circle'], ['label', 'DIV']]) {
      expect(root?.querySelector(`[data-slot="progress-circle-${slot}"]`)?.tagName).toBe(tag);
    }
  });
});
