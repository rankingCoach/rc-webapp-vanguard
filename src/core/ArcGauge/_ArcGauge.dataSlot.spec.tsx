import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ArcGauge } from './ArcGauge';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('ArcGauge data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<ArcGauge value={50} text={'Score'} />);
    expect(slot(container, 'arc-gauge').tagName).toBe('DIV');
    expect(slot(container, 'arc-gauge-track').tagName).toBe('svg');
    expect(slot(container, 'arc-gauge-fill').tagName).toBe('DIV');
    expect(slot(container, 'arc-gauge-mask').tagName).toBe('IMG');
    expect(slot(container, 'arc-gauge-text').tagName).toBe('DIV');
  });
});
