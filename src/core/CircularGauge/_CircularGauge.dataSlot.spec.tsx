import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { CircularGauge } from './CircularGauge';

describe('CircularGauge data-slot contract', () => {
  it('slots the consumer container, ring, track, value arc and center', () => {
    const { container, rerender } = render(<CircularGauge value={50} className={'mine'}>50</CircularGauge>);
    for (const [slot, tag] of [['circular-gauge', 'DIV'], ['circular-gauge-ring', 'svg'], ['circular-gauge-track', 'circle'], ['circular-gauge-value', 'circle'], ['circular-gauge-center', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelector('[data-slot="circular-gauge"]')?.classList.contains('mine')).toBe(true);
    expect(container.querySelector('[data-slot="circular-gauge"]')?.hasAttribute('data-loading')).toBe(false);
    rerender(<CircularGauge value={50} loading />);
    expect(container.querySelector('[data-slot="circular-gauge"]')?.getAttribute('data-loading')).toBe('');
    rerender(<CircularGauge value={50} loading={false} />);
    expect(container.querySelector('[data-slot="circular-gauge"]')?.hasAttribute('data-loading')).toBe(false);
  });
});
