import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const StaticColorRegression: Story = {
  name: 'Rank coloring — static marker.color unchanged (regression)',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 30, label: 'Alpha', color: '#D946EF' },
      { id: 'b', value: 70, label: 'Beta', color: '#0EA5E9' },
    ],
  },
  play: async ({ canvasElement }) => {
    // Both markers render — static color does not break positioning or rendering
    await expect(getMarkers(canvasElement)).toHaveLength(2);
    // Pins carry the explicit inline background style set by marker.color.
    // Browsers normalize hex colors to rgb() when reading back el.style.background.
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const hasPurple = pins.some((el) => (el as HTMLElement).style.background === 'rgb(217, 70, 239)');
    const hasBlue = pins.some((el) => (el as HTMLElement).style.background === 'rgb(14, 165, 233)');
    await expect(hasPurple).toBe(true);
    await expect(hasBlue).toBe(true);
  },
};