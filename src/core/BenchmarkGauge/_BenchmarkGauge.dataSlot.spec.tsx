import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { BenchmarkGauge } from './BenchmarkGauge';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('BenchmarkGauge data-slot contract', () => {
  it('slots root, legend, track, markers, pins and content; tracks orientation', () => {
    const markers = [{
      id: 'one', value: 50, label: 'One',
      renderLegend: () => <span>Legend</span>,
      renderContent: () => <span>Content</span>,
      renderHighlightedContent: () => <span>Highlighted</span>,
    }];
    const { container, rerender } = render(<BenchmarkGauge min={0} max={100} markers={markers} className={'mine'} />);
    for (const name of ['benchmark-gauge', 'benchmark-gauge-legend', 'benchmark-gauge-legend-item',
      'benchmark-gauge-track-wrapper', 'benchmark-gauge-track', 'benchmark-gauge-ghost', 'benchmark-gauge-fill',
      'benchmark-gauge-marker', 'benchmark-gauge-marker-content', 'benchmark-gauge-pin',
      'benchmark-gauge-pin-default', 'benchmark-gauge-pin-highlighted-content']) {
      expect(slot(container, name).tagName).toBe('DIV');
    }
    expect(slot(container, 'benchmark-gauge').classList.contains('mine')).toBe(true);
    for (const name of ['benchmark-gauge', 'benchmark-gauge-marker']) {
      expect(slot(container, name).getAttribute('data-orientation')).toBe('horizontal');
    }
    rerender(<BenchmarkGauge min={0} max={100} markers={markers} orientation={'vertical'} />);
    for (const name of ['benchmark-gauge', 'benchmark-gauge-marker']) {
      expect(slot(container, name).getAttribute('data-orientation')).toBe('vertical');
    }
  });
});
